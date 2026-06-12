import prisma from '../config/prismaClient.js';
import cloudinary from '../config/cloudinary.js';
import { Prisma } from '@prisma/client';

const uploadImageToCloudinary = async (file) => {
    const b64 = Buffer.from(file.buffer).toString("base64");
    let dataURI = `data:${file.mimetype};base64,${b64}`;
    return cloudinary.uploader.upload(dataURI, { folder: "fastinfo_brands" });
};

// --- HELPER ORARI CSV (Lo stesso dei supermercati) ---
const parseDaySchedule = (timeString) => {
    if (!timeString || String(timeString).trim() === '') return { status: 'CLOSED', slots: [] };
    const cleanStr = String(timeString).trim().toUpperCase();
    if (cleanStr === '24H') return { status: '24H', slots: [] };
    const slots = [];
    cleanStr.split(',').forEach(part => {
        const times = part.trim().split('-');
        if (times.length === 2) slots.push({ from: times[0].trim(), to: times[1].trim() });
    });
    return slots.length > 0 ? { status: 'OPEN', slots: slots } : { status: 'CLOSED', slots: [] };
};

const cleanCsvField = (field) => {
    if (field === undefined || field === null) return '';
    let s = String(field).trim();
    if (s.startsWith('"') && s.endsWith('"')) s = s.slice(1, -1);
    return s.trim();
};

// Mappa dinamica per capire quale tabella usare in base al tipo
const getModelAndCategory = (type) => {
    switch (type) {
        case 'restaurant': return { model: prisma.restaurantBrand, poiField: 'restaurantBrandId', category: 'Restaurant' };
        case 'fuel': return { model: prisma.fuelBrand, poiField: 'fuelBrandId', category: 'FuelStation' };
        case 'medical': return { model: prisma.medicalBrand, poiField: 'medicalBrandId', category: 'EmergencyService' };
        default: throw new Error("Tipo catena non valido");
    }
};

// --- CRUD CATENE ---

export const createChain = async (req, res) => {
    const { type } = req.params; // 'restaurant', 'fuel', 'medical'
    const { name, website, description, defaultImageUrl } = req.body;
    try {
        const { model } = getModelAndCategory(type);
        const newBrand = await model.create({ data: { name, website, description, defaultImageUrl } });
        res.status(201).json(newBrand);
    } catch (error) { console.error(error); res.status(500).json({ message: 'Errore server' }); }
};

export const getAllChains = async (req, res) => {
    const { type } = req.params;
    try {
        const { model } = getModelAndCategory(type);
        const brands = await model.findMany({
            include: { _count: { select: { locations: true } } },
            orderBy: { name: 'asc' }
        });
        res.status(200).json(brands);
    } catch (error) { res.status(500).json({ message: 'Errore server' }); }
};

export const getChainDetails = async (req, res) => {
    const { type, id } = req.params;
    try {
        const { model } = getModelAndCategory(type);
        const brand = await model.findUnique({
            where: { id: parseInt(id) },
            include: {
                locations: {
                    include: { comune: { include: { province: true } } },
                    orderBy: { comune: { name: 'asc' } }
                }
            }
        });
        if (!brand) return res.status(404).json({ message: 'Brand non trovato' });
        res.status(200).json(brand);
    } catch (error) { res.status(500).json({ message: 'Errore server' }); }
};

export const updateChain = async (req, res) => {
    const { type, id } = req.params;
    // AGGIUNTO phoneNumber
    const { name, website, description, defaultImageUrl, phoneNumber } = req.body;
    try {
        const { model } = getModelAndCategory(type);
        let finalImageUrl = defaultImageUrl;
        if (req.file) {
            const result = await uploadImageToCloudinary(req.file);
            finalImageUrl = result.secure_url;
        }
        const updated = await model.update({
            where: { id: parseInt(id) },
            // AGGIUNTO phoneNumber
            data: { name, website, description, defaultImageUrl: finalImageUrl, phoneNumber }
        });
        res.status(200).json(updated);
    } catch (error) { res.status(500).json({ message: 'Errore server' }); }
};

// --- FUNZIONI POTENTI (Add, Propagate, CSV) ---

export const addLocationToChain = async (req, res) => {
    const { type, id } = req.params;
    const { name, comuneId, address, phoneNumber, openingHours } = req.body;

    try {
        const { model, poiField, category } = getModelAndCategory(type);
        const brand = await model.findUnique({ where: { id: parseInt(id) } });
        if (!brand) return res.status(404).json({ message: "Brand non trovato" });

        let openingHoursData = Prisma.JsonNull;
        if (openingHours) openingHoursData = typeof openingHours === 'string' ? JSON.parse(openingHours) : openingHours;

        const poiData = {
            name: name || brand.name,
            address,
            comuneId: parseInt(comuneId),
            phoneNumber: phoneNumber || null,
            openingHours: openingHoursData,
            category: category,
            description: brand.description,
            website: brand.website,
            [poiField]: parseInt(id) // Es: restaurantBrandId: 5
        };

        // Inizializza tabelle specifiche
        if (category === 'Restaurant') poiData.restaurant = { create: {} };
        if (category === 'FuelStation') poiData.fuelstation = { create: {} };
        if (category === 'EmergencyService') poiData.emergencyservice = { create: { serviceType: 'Altro' } };

        const newLocation = await prisma.pointofinterest.create({ data: poiData });

      /*  if (brand.defaultImageUrl) {
            await prisma.image.create({ data: { url: brand.defaultImageUrl, poiId: newLocation.id } });
        } */
        res.status(201).json(newLocation);
    } catch (error) { console.error(error); res.status(500).json({ message: 'Errore server' }); }
};

export const removeLocationFromChain = async (req, res) => {
    const { type, poiId } = req.params;
    try {
       
        await prisma.pointofinterest.delete({
            where: { id: parseInt(poiId) }
        });

        res.status(200).json({ message: 'Punto vendita eliminato definitivamente.' });
    } catch (error) {
        console.error("Errore eliminazione:", error);
        res.status(500).json({ message: 'Errore durante l\'eliminazione.' });
    }
};

export const importChainCsv = async (req, res) => {
    const { type, id } = req.params;
    if (!req.file) return res.status(400).json({ message: "No file." });

    try {
        const { model, poiField, category } = getModelAndCategory(type);
        const brand = await model.findUnique({ where: { id: parseInt(id) } });

        const fileContent = req.file.buffer.toString('utf-8');
        const rows = fileContent.split(/\r?\n/);
        let separator = rows[0] && rows[0].includes(';') ? ';' : ',';
        const startRow = rows[0].toLowerCase().includes('comune') ? 1 : 0;
        let successCount = 0;
        let errors = [];

        for (let i = startRow; i < rows.length; i++) {
            const row = rows[i].trim();
            if (!row) continue;

            let cols;
            if (separator === ',') {
                cols = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
                if(!cols) cols = row.split(',');
            } else {
                cols = row.split(';');
            }
            if (!cols) continue;
            cols = cols.map(c => cleanCsvField(c));

            // NUOVO FORMATO: Nome;Comune;Indirizzo;Telefono;Orari
            // Se la colonna 0 (Nome) è vuota, usiamo il nome del brand
            const customName = cols[0];
            const comuneName = cols[1];
            const address = cols[2];
            const phoneNumber = cols[3];

            const comune = await prisma.comune.findFirst({ where: { name: { equals: comuneName } } });
            if (!comune) { errors.push(`Riga ${i+1}: Comune '${comuneName}' non trovato`); continue; }

            const openingHoursJson = {
                'lunedì': parseDaySchedule(cols[4]), 'martedì': parseDaySchedule(cols[5]),
                'mercoledì': parseDaySchedule(cols[6]), 'giovedì': parseDaySchedule(cols[7]),
                'venerdì': parseDaySchedule(cols[8]), 'sabato': parseDaySchedule(cols[9]),
                'domenica': parseDaySchedule(cols[10])
            };

            const poiData = {
                // Se c'è un nome specifico usalo, altrimenti usa il nome della catena
                name: customName && customName.trim() !== '' ? customName : brand.name,
                address,
                comuneId: comune.id,
                phoneNumber: phoneNumber || null,
                category: category,
                description: brand.description,
                website: brand.website,
                openingHours: openingHoursJson,
                [poiField]: parseInt(id)
            };

            if (category === 'Restaurant') poiData.restaurant = { create: {} };
            if (category === 'FuelStation') poiData.fuelstation = { create: {} };
            if (category === 'EmergencyService') poiData.emergencyservice = { create: { serviceType: 'Altro' } };

            const newLocation = await prisma.pointofinterest.create({ data: poiData });
          /* if (brand.defaultImageUrl) await prisma.image.create({ data: { url: brand.defaultImageUrl, poiId: newLocation.id } }); */
            successCount++;
        }
        res.status(200).json({ message: `Importati: ${successCount}`, errors });
    } catch (error) { console.error(error); res.status(500).json({ message: 'Errore import.' }); }
};

export const propagateChainData = async (req, res) => {
    const { type, id } = req.params;
    try {
        const { model, poiField } = getModelAndCategory(type);
        const brand = await model.findUnique({ where: { id: parseInt(id) } });

        // 1. Aggiorna SOLO Dati Testuali (Descrizione, Sito, Telefono)
        // NON TOCCARE LE IMMAGINI!
        await prisma.pointofinterest.updateMany({
            where: { [poiField]: parseInt(id) },
            data: {
                description: brand.description,
                website: brand.website,
                phoneNumber: brand.phoneNumber
            }
        });

        // 2. PARTE IMMAGINI RIMOSSA COMPLETAENTE
        // Non serve più aggiungere o cancellare immagini, perché il frontend
        // ora è intelligente e mostra il logo del brand se non ci sono foto.

        res.status(200).json({ message: "Dati testuali aggiornati. Le foto specifiche non sono state toccate." });
    } catch (error) {
        console.error("Errore propagazione:", error);
        res.status(500).json({ message: 'Errore.' });
    }
};
// server/src/controllers/comuniController.js

import prisma from '../config/prismaClient.js';
import cloudinary from '../config/cloudinary.js';
import { Prisma } from '@prisma/client';

const uploadImageToCloudinary = async (file) => {
    const b64 = Buffer.from(file.buffer).toString("base64");
    let dataURI = `data:${file.mimetype};base64,${b64}`;
    return cloudinary.uploader.upload(dataURI, { folder: "fastinfo_comuni" });
};

const toNull = (value) => (value === '' || value === undefined ? null : value);

// Helper pulizia CSV
const cleanCsvField = (field) => {
    if (field === undefined || field === null) return '';
    let s = String(field).trim();
    if (s.startsWith('"') && s.endsWith('"')) s = s.slice(1, -1);
    return s.trim();
};

// Helper orari
const parseDaySchedule = (timeString) => {
    if (!timeString || String(timeString).trim() === '') return { status: 'CLOSED', slots: [] };

    const cleanStr = String(timeString).trim().toUpperCase();

    // NUOVO: Gestione Orari Non Disponibili
    if (cleanStr === 'ND' || cleanStr === '?' || cleanStr === 'UNKNOWN') {
        return { status: 'UNKNOWN', slots: [] };
    }

    if (cleanStr === '24H') return { status: '24H', slots: [] };

    const slots = [];
    cleanStr.split(',').forEach(part => {
        const times = part.trim().split('-');
        if (times.length === 2) slots.push({ from: times[0].trim(), to: times[1].trim() });
    });
    return slots.length > 0 ? { status: 'OPEN', slots: slots } : { status: 'CLOSED', slots: [] };
};

// --- ROTTE PUBBLICHE ---
const getComuneBySlug = async (req, res) => {
    try {
        const comune = await prisma.comune.findUnique({
            where: { slug: req.params.slug },
            include: {
                province: { include: { region: true } },
                images: { select: { id: true, url: true, attribution: true } },
                pointofinterest: {
                    orderBy: { name: 'asc' },
                    include: {
                        // 1. INCLUDE SUPERMERCATI (C'era già)
                        supermarketBrand: {
                            include: {
                                leaflets: { where: { validFrom: { lte: new Date() }, validUntil: { gte: new Date() } } }
                            }
                        },

                        // 2. INCLUDE SANITÀ (C'era già)
                        emergencyservice: true,

                        // ▼▼▼ 3. AGGIUNGI QUESTI CHE MANCAVANO! ▼▼▼
                        fuelBrand: true,        // Fondamentale per raggruppare ENI
                        restaurantBrand: true,  // Fondamentale per raggruppare McDonald's
                        medicalBrand: true,     // Fondamentale per raggruppare Gruppi Sanitari
                        // ▲▲▲ FINE AGGIUNTA ▲▲▲

                        // Dati specifici
                        restaurant: true,
                        fuelstation: true,
                        bar: true,
                        parking: true,
                        touristattraction: true,
                        accommodation: true,
                        carrepairshop: true
                    }
                }
            }
        });
        if (!comune) return res.status(404).json({ message: "Comune non trovato" });
        if (comune.province?.region?.id) {
            const regionId = comune.province.region.id;
            comune.pointofinterest.forEach(poi => {
                if (poi.supermarketBrand?.leaflets) poi.supermarketBrand.leaflets = poi.supermarketBrand.leaflets.filter(l => l.regionId === regionId);
            });
        }
        res.status(200).json(comune);
    } catch (error) { console.error(error); res.status(500).json({ message: "Errore server" }); }
};

// --- ROTTE ADMIN ---
const getAllComuniForAdmin = async (req, res) => {
    try {
        const { search = '', page = 1, limit = 25 } = req.query;
        const pageNum = parseInt(page); const limitNum = parseInt(limit); const skip = (pageNum - 1) * limitNum;
        const whereClause = { OR: [ { name: { contains: search } }, { province: { name: { contains: search } } }, { province: { sigla: { contains: search } } } ] };
        const [comuni, totalComuni] = await prisma.$transaction([
            prisma.comune.findMany({ where: whereClause, skip, take: limitNum, include: { province: { select: { name: true, sigla: true } } }, orderBy: { name: 'asc' } }),
            prisma.comune.count({ where: whereClause })
        ]);
        res.status(200).json({ data: comuni, pagination: { total: totalComuni, page: pageNum, limit: limitNum, totalPages: Math.ceil(totalComuni / limitNum) } });
    } catch (error) { console.error(error); res.status(500).json({ message: "Errore server." }); }
};

const getComuneByIdForAdmin = async (req, res) => {
    try {
        const comune = await prisma.comune.findUnique({ where: { id: parseInt(req.params.id) }, include: { province: true, images: true, pointofinterest: true } });
        if (!comune) return res.status(404).json({ message: "Comune non trovato" });
        res.status(200).json(comune);
    } catch (error) { res.status(500).json({ message: "Errore server" }); }
};

const updateComune = async (req, res) => {
    const id = parseInt(req.params.id);
    const { name, description } = req.body;
    try {
        const updatedComune = await prisma.$transaction(async (tx) => {
            await tx.comune.update({ where: { id }, data: { name, description: toNull(description) } });
            if (req.files && req.files.length > 0) {
                const uploadPromises = req.files.map(file => uploadImageToCloudinary(file));
                const uploadResults = await Promise.all(uploadPromises);
                await tx.comuneImage.createMany({ data: uploadResults.map(result => ({ url: result.secure_url, comuneId: id })) });
            }
            return tx.comune.findUnique({ where: { id }, include: { images: true, province: true, pointofinterest: true } });
        });
        res.status(200).json(updatedComune);
    } catch (error) { console.error(error); res.status(500).json({ message: "Errore update." }); }
};

const deleteComuneImage = async (req, res) => {
    const imageId = parseInt(req.params.imageId);
    try {
        await prisma.comuneImage.delete({ where: { id: imageId } });
        res.status(200).json({ message: "Eliminata" });
    } catch (error) { res.status(500).json({ message: "Errore delete." }); }
};

const updateComuneImage = async (req, res) => {
    const imageId = parseInt(req.params.imageId);
    try {
        const updated = await prisma.comuneImage.update({ where: { id: imageId }, data: { attribution: req.body.attribution } });
        res.status(200).json(updated);
    } catch (error) { res.status(500).json({ message: "Errore update img." }); }
};

// --- NUOVA FUNZIONE: IMPORT CSV MASSIVO NEL COMUNE ---
const importComunePoisFromCsv = async (req, res) => {
    const comuneId = parseInt(req.params.id);
    // Nota: "rawCategory" può essere "Supermarket" oppure "EmergencyService:Farmacia"
    let { category: rawCategory } = req.body;

    if (!req.file || !rawCategory) return res.status(400).json({ message: "File o categoria mancanti." });

    try {
        // --- 1. GESTIONE SOTTOCATEGORIE (Es. Farmacia) ---
        let category = rawCategory;
        let forcedServiceType = null;

        // Se la categoria contiene ":", significa che abbiamo specificato un tipo (es. EmergencyService:Farmacia)
        if (rawCategory.includes(':')) {
            const parts = rawCategory.split(':');
            category = parts[0];       // Diventa "EmergencyService"
            forcedServiceType = parts[1]; // Diventa "Farmacia", "Ospedale", ecc.
        }
        // ------------------------------------------------

        const fileContent = req.file.buffer.toString('utf-8');
        const rows = fileContent.split(/\r?\n/);
        let separator = rows[0] && rows[0].includes(';') ? ';' : ',';
        const startRow = rows[0].toLowerCase().includes('nome') ? 1 : 0;
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

            // Funzione di pulizia interna o esterna
            const clean = (s) => { let v = String(s || '').trim(); if(v.startsWith('"')&&v.endsWith('"')) return v.slice(1,-1).trim(); return v; };

            const poiName = clean(cols[0]);
            const address = clean(cols[1]);
            const phoneNumber = clean(cols[2]);

            if (!poiName || !address) { errors.push(`Riga ${i+1}: Dati mancanti`); continue; }

            const openingHoursJson = {
                'lunedì': parseDaySchedule(clean(cols[3])), 'martedì': parseDaySchedule(clean(cols[4])),
                'mercoledì': parseDaySchedule(clean(cols[5])), 'giovedì': parseDaySchedule(clean(cols[6])),
                'venerdì': parseDaySchedule(clean(cols[7])), 'sabato': parseDaySchedule(clean(cols[8])),
                'domenica': parseDaySchedule(clean(cols[9]))
            };

            let poiData = {
                name: poiName, category, address, comuneId, phoneNumber: phoneNumber || null,
                openingHours: openingHoursJson
            };

            // LOGICA BRAND
            let matchedBrand = null;
            if (category === 'Supermarket') matchedBrand = await prisma.supermarketBrand.findFirst({ where: { name: poiName } });
            if (category === 'Restaurant') matchedBrand = await prisma.restaurantBrand.findFirst({ where: { name: poiName } });
            if (category === 'FuelStation') matchedBrand = await prisma.fuelBrand.findFirst({ where: { name: poiName } });
            if (category === 'EmergencyService') matchedBrand = await prisma.medicalBrand.findFirst({ where: { name: poiName } });

            if (matchedBrand) {
                if(category==='Supermarket') poiData.supermarketBrandId = matchedBrand.id;
                if(category==='Restaurant') poiData.restaurantBrandId = matchedBrand.id;
                if(category==='FuelStation') poiData.fuelBrandId = matchedBrand.id;
                if(category==='EmergencyService') poiData.medicalBrandId = matchedBrand.id;
                poiData.description = matchedBrand.description;
                poiData.website = matchedBrand.website;
            }

            // --- INIZIALIZZAZIONE TABELLE ---
            if(category==='Supermarket') poiData.supermarket = { create: { hasLeaflet: false } };
            if(category==='Restaurant') poiData.restaurant = { create: {} };
            if(category==='FuelStation') poiData.fuelstation = { create: {} };

            // ▼▼▼ MODIFICA PER FARMACIE/OSPEDALI SPECIFICI ▼▼▼
            if(category==='EmergencyService') {
                let type = 'Altro';

                if (forcedServiceType) {
                    // Se l'utente ha scelto dal menu a tendina, usiamo quello!
                    type = forcedServiceType;
                } else {
                    // Altrimenti proviamo a indovinare dal nome (vecchia logica)
                    if (poiName.toLowerCase().includes('farmacia')) type = 'Farmacia';
                    else if (poiName.toLowerCase().includes('ospedale')) type = 'Ospedale';
                    else if (poiName.toLowerCase().includes('guardia')) type = 'Guardia Medica';
                    else if (poiName.toLowerCase().includes('ambulatorio')) type = 'Ambulatorio';
                }

                poiData.emergencyservice = { create: { serviceType: type } };
            }
            // ▲▲▲ FINE MODIFICA ▲▲▲

            if(category==='Bar') poiData.bar = { create: {} };
            if(category==='Accommodation') poiData.accommodation = { create: {} };
            if(category==='Parking') poiData.parking = { create: {} };
            if(category==='CarRepairShop') poiData.carrepairshop = { create: {} };

            const newPoi = await prisma.pointofinterest.create({ data: poiData });

            if (matchedBrand && matchedBrand.defaultImageUrl) {
                await prisma.image.create({ data: { url: matchedBrand.defaultImageUrl, poiId: newPoi.id } });
            }
            successCount++;
        }
        res.status(200).json({ message: `Importati: ${successCount}`, errors });
    } catch (error) { console.error(error); res.status(500).json({ message: "Errore import." }); }
};

export {
    getComuneBySlug, getAllComuniForAdmin, getComuneByIdForAdmin,
    updateComune, deleteComuneImage, updateComuneImage,
    importComunePoisFromCsv // <--- EXPORT NUOVA FUNZIONE
};
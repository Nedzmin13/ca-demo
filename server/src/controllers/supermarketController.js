// server/src/controllers/supermarketController.js

import prisma from '../config/prismaClient.js';
import { Prisma } from '@prisma/client';
import cloudinary from '../config/cloudinary.js';

// --- HELPER FUNCTIONS ---

const toNull = (value) => (value === '' || value === undefined || value === null ? null : value);

const uploadImageToCloudinary = async (file) => {
    const b64 = Buffer.from(file.buffer).toString("base64");
    let dataURI = `data:${file.mimetype};base64,${b64}`;
    return cloudinary.uploader.upload(dataURI, { folder: "fastinfo_brands" });
};

// Helper per parsare una singola cella orario
const parseDaySchedule = (timeString) => {
    // 1. SE LA CELLA È VUOTA -> CHIUSO
    if (!timeString || String(timeString).trim() === '') {
        return { status: 'CLOSED', slots: [] };
    }

    const cleanStr = String(timeString).trim().toUpperCase();

    // 2. GESTIONE "NON DISPONIBILE"
    if (cleanStr === 'ND' || cleanStr === '?' || cleanStr === 'UNKNOWN') {
        return { status: 'UNKNOWN', slots: [] };
    }

    // 3. GESTIONE "24 ORE" (Più robusta: accetta "24H", "24 H", "APERTO 24H")
    if (cleanStr.includes('24H') || cleanStr.includes('24 H')) {
        return { status: '24H', slots: [] };
    }

    // 4. PARSING ORARI CLASSICI (es. 08:00-20:00)
    const slots = [];
    const parts = cleanStr.split(',');

    parts.forEach(part => {
        const times = part.trim().split('-');
        if (times.length === 2) {
            slots.push({
                from: times[0].trim(),
                to: times[1].trim()
            });
        }
    });

    if (slots.length > 0) {
        return { status: 'OPEN', slots: slots };
    }

    // Fallback se scrive qualcosa di incomprensibile
    return { status: 'CLOSED', slots: [] };
};

// --- NUOVO HELPER PER PULIRE I CAMPI CSV (Gestisce Canva/Excel) ---
const cleanCsvField = (field) => {
    if (field === undefined || field === null) return '';
    let s = String(field).trim();
    // Se inizia e finisce con virgolette (es. "Abano Terme"), le togliamo
    if (s.startsWith('"') && s.endsWith('"')) {
        s = s.slice(1, -1);
    }
    return s.trim();
};

// --- CORE FUNCTIONS ---

const createSupermarketBrand = async (req, res) => {
    const { name, website, description, defaultImageUrl } = req.body;
    if (!name) return res.status(400).json({ message: 'Il nome del brand è obbligatorio.' });
    try {
        const newBrand = await prisma.supermarketBrand.create({
            data: { name, website, description, defaultImageUrl },
        });
        res.status(201).json(newBrand);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Errore del server.' });
    }
};

const updateSupermarketBrand = async (req, res) => {
    const { brandId } = req.params;
    const { name, website, description, defaultImageUrl } = req.body;

    try {
        let finalImageUrl = defaultImageUrl;
        if (req.file) {
            const result = await uploadImageToCloudinary(req.file);
            finalImageUrl = result.secure_url;
        }

        const updatedBrand = await prisma.supermarketBrand.update({
            where: { id: parseInt(brandId) },
            data: { name, website, description, defaultImageUrl: finalImageUrl },
        });
        res.status(200).json(updatedBrand);
    } catch (error) {
        console.error("Errore aggiornamento brand:", error);
        res.status(500).json({ message: 'Errore del server.' });
    }
};

const getAllSupermarketBrands = async (req, res) => {
    try {
        const brands = await prisma.supermarketBrand.findMany({
            include: { _count: { select: { locations: true } } },
            orderBy: { name: 'asc' },
        });
        res.status(200).json(brands);
    } catch (error) { res.status(500).json({ message: 'Errore.' }); }
};

const getBrandDetails = async (req, res) => {
    const { brandId } = req.params;
    try {
        const brand = await prisma.supermarketBrand.findUnique({
            where: { id: parseInt(brandId) },
            include: {
                locations: {
                    include: { comune: { include: { province: true } } },
                    orderBy: { comune: { name: 'asc' } },
                },
            },
        });
        if (!brand) return res.status(404).json({ message: 'Brand non trovato.' });
        res.status(200).json(brand);
    } catch (error) { res.status(500).json({ message: 'Errore.' }); }
};

const addLocationToBrand = async (req, res) => {
    const { brandId } = req.params;
    const { name, comuneId, address, phoneNumber, openingHours } = req.body;

    if (!comuneId || !address) return res.status(400).json({ message: 'Comune e indirizzo sono obbligatori.' });

    try {
        const brand = await prisma.supermarketBrand.findUnique({ where: { id: parseInt(brandId) } });
        if (!brand) return res.status(404).json({ message: "Brand non trovato" });

        let openingHoursData = Prisma.JsonNull;
        if (openingHours) {
            openingHoursData = typeof openingHours === 'string' ? JSON.parse(openingHours) : openingHours;
        }

        const newLocation = await prisma.pointofinterest.create({
            data: {
                name: (name && name.trim() !== '') ? name : brand.name,
                address,
                comuneId: parseInt(comuneId),
                phoneNumber: toNull(phoneNumber),
                openingHours: openingHoursData,
                category: 'Supermarket',
                supermarketBrandId: parseInt(brandId),
                description: brand.description,
                website: brand.website,
                supermarket: { create: { hasLeaflet: false } }
            }
        });

        if (brand.defaultImageUrl && brand.defaultImageUrl.length > 5) {
            await prisma.image.create({
                data: { url: brand.defaultImageUrl, poiId: newLocation.id }
            });
        }

        res.status(201).json(newLocation);
    } catch (error) {
        console.error("Errore aggiunta punto vendita:", error);
        res.status(500).json({ message: 'Errore del server.' });
    }
};

const removeLocationFromBrand = async (req, res) => {
    const { poiId } = req.params;
    try {
        // MODIFICA: delete al posto di update
        await prisma.pointofinterest.delete({
            where: { id: parseInt(poiId) }
        });
        res.status(200).json({ message: 'Punto vendita eliminato definitivamente.' });
    } catch (error) {
        console.error("Errore eliminazione:", error);
        res.status(500).json({ message: 'Errore.' });
    }
};

const getLeafletsForBrand = async (req, res) => {
    const { brandId } = req.params;
    try {
        const leaflets = await prisma.leaflet.findMany({
            where: { supermarketBrandId: parseInt(brandId) },
            include: { region: { select: { id: true, name: true } } },
        });
        res.status(200).json(leaflets);
    } catch (error) { res.status(500).json({ message: 'Errore.' }); }
};

const upsertLeaflet = async (req, res) => {
    const { supermarketBrandId, regionId, title, pdfUrl, validFrom, validUntil } = req.body;
    if (!supermarketBrandId || !regionId || !title || !pdfUrl || !validFrom || !validUntil) {
        return res.status(400).json({ message: 'Dati incompleti.' });
    }
    try {
        const leaflet = await prisma.leaflet.upsert({
            where: {
                supermarketBrandId_regionId: {
                    supermarketBrandId: parseInt(supermarketBrandId),
                    regionId: parseInt(regionId),
                },
            },
            update: { title, pdfUrl, validFrom: new Date(validFrom), validUntil: new Date(validUntil) },
            create: {
                title, pdfUrl, validFrom: new Date(validFrom), validUntil: new Date(validUntil),
                supermarketBrandId: parseInt(supermarketBrandId), regionId: parseInt(regionId),
            },
        });
        res.status(201).json(leaflet);
    } catch (error) { res.status(500).json({ message: 'Errore.' }); }
};

const propagateBrandDetails = async (req, res) => {
    const { brandId } = req.params;
    try {
        const brand = await prisma.supermarketBrand.findUnique({ where: { id: parseInt(brandId) } });
        if (!brand) return res.status(404).json({ message: "Brand non trovato" });

        // 1. Aggiorna Dati Testuali
        await prisma.pointofinterest.updateMany({
            where: { supermarketBrandId: parseInt(brandId) },
            data: {
                description: brand.description,
                website: brand.website
                // Aggiungi phoneNumber qui se hai aggiunto la colonna anche ai Supermercati
            }
        });

        // 2. SOSTITUZIONE FORZATA IMMAGINE
        if (brand.defaultImageUrl) {
            // Trova tutti i supermercati della catena
            const allPois = await prisma.pointofinterest.findMany({
                where: { supermarketBrandId: parseInt(brandId) },
                select: { id: true }
            });

            const poiIds = allPois.map(p => p.id);

            // A. Cancella le vecchie immagini
            await prisma.image.deleteMany({
                where: { poiId: { in: poiIds } }
            });

            // B. Inserisci la nuova immagine default per tutti
            const newImagesData = poiIds.map(poiId => ({
                url: brand.defaultImageUrl,
                poiId: poiId
            }));

            if (newImagesData.length > 0) {
                await prisma.image.createMany({ data: newImagesData });
            }
        }

        res.status(200).json({ message: "Dati e Immagini propagati con successo a tutti i punti vendita." });
    } catch (error) {
        console.error("Errore propagazione:", error);
        res.status(500).json({ message: 'Errore.' });
    }
};


// --- FUNZIONE IMPORT CSV INTELLIGENTE (Gestisce Canva/Excel/Notepad) ---
const importLocationsFromCsv = async (req, res) => {
    const { brandId } = req.params;
    if (!req.file) return res.status(400).json({ message: "Nessun file CSV caricato." });

    try {
        const fileContent = req.file.buffer.toString('utf-8');
        const rows = fileContent.split(/\r?\n/);

        let successCount = 0;
        let errors = [];

        const brand = await prisma.supermarketBrand.findUnique({ where: { id: parseInt(brandId) } });

        // Determina il separatore leggendo la prima riga
        // Se la prima riga contiene ';', usiamo ';', altrimenti ','
        let separator = ',';
        if (rows[0] && rows[0].includes(';')) {
            separator = ';';
        }

        const startRow = rows[0].toLowerCase().includes('comune') ? 1 : 0;

        for (let i = startRow; i < rows.length; i++) {
            const row = rows[i].trim();
            if (!row) continue;

            // 1. Divide la riga in base al separatore rilevato
            // Nota: Questo split è semplice. Se un indirizzo contiene una virgola e il file usa virgole,
            // potrebbe rompersi. Canva/Excel di solito mettono le virgolette.
            // Per gestire perfettamente Canva:
            let cols;
            if (separator === ',') {
                // Regex complessa per splittare solo le virgole FUORI dalle virgolette
                // Corrisponde a una virgola solo se seguita da un numero pari di virgolette fino alla fine
                cols = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
                // Fallback se la regex fallisce (es. formato strano)
                if (!cols) cols = row.split(',');
            } else {
                cols = row.split(';');
            }

            // Se cols è null o vuoto dopo il match
            if (!cols) continue;

            // Rimuoviamo eventuali virgole residue dalla regex alla fine delle stringhe matchate
            cols = cols.map(c => c.replace(/,$/, ''));

            // 2. Pulizia dati (Rimuove virgolette di Canva)
            const comuneName = cleanCsvField(cols[0]);
            const address = cleanCsvField(cols[1]);
            const phoneNumber = cleanCsvField(cols[2]);

            if (!comuneName || !address) {
                errors.push(`Riga ${i + 1}: Dati base mancanti`);
                continue;
            }

            const comune = await prisma.comune.findFirst({
                where: { name: { equals: comuneName } }
            });

            if (!comune) {
                errors.push(`Riga ${i + 1}: Comune '${comuneName}' non trovato.`);
                continue;
            }

            // 3. Parsing Orari (Colonne 3-9)
            const openingHoursJson = {
                'lunedì':    parseDaySchedule(cleanCsvField(cols[3])),
                'martedì':   parseDaySchedule(cleanCsvField(cols[4])),
                'mercoledì': parseDaySchedule(cleanCsvField(cols[5])),
                'giovedì':   parseDaySchedule(cleanCsvField(cols[6])),
                'venerdì':   parseDaySchedule(cleanCsvField(cols[7])),
                'sabato':    parseDaySchedule(cleanCsvField(cols[8])),
                'domenica':  parseDaySchedule(cleanCsvField(cols[9]))
            };

            const newLocation = await prisma.pointofinterest.create({
                data: {
                    name: brand.name,
                    address: address,
                    comuneId: comune.id,
                    phoneNumber: phoneNumber || null,
                    category: 'Supermarket',
                    supermarketBrandId: parseInt(brandId),
                    description: brand.description,
                    website: brand.website,
                    openingHours: openingHoursJson,
                    supermarket: { create: { hasLeaflet: false } }
                }
            });

            if (brand.defaultImageUrl) {
                await prisma.image.create({ data: { url: brand.defaultImageUrl, poiId: newLocation.id } });
            }
            successCount++;
        }

        res.status(200).json({
            message: `Importati: ${successCount}. Errori: ${errors.length}`,
            errors: errors
        });

    } catch (error) {
        console.error("Errore import CSV:", error);
        res.status(500).json({ message: 'Errore durante l\'importazione.' });
    }
};

export {
    createSupermarketBrand,
    updateSupermarketBrand,
    getAllSupermarketBrands,
    getBrandDetails,
    addLocationToBrand,
    removeLocationFromBrand,
    getLeafletsForBrand,
    upsertLeaflet,
    propagateBrandDetails,
    importLocationsFromCsv
};
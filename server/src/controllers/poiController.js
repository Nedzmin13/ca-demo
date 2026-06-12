// server/src/controllers/poiController.js (Versione Completa 100%)

import prisma from '../config/prismaClient.js';
import cloudinary from '../config/cloudinary.js';
import { Prisma } from "@prisma/client";

// --- HELPER FUNCTIONS ---

const toNull = (value) => (value === '' || value === undefined || value === null ? null : value);
const toFloatOrNull = (value) => (toNull(value) !== null ? parseFloat(String(value).replace(',', '.')) : null);
const toIntOrNull = (value) => (toNull(value) !== null ? parseInt(String(value), 10) : null);
const toBoolean = (value) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.toLowerCase() === 'true';
    return !!value;
};

const uploadImageToCloudinary = async (file) => {
    const b64 = Buffer.from(file.buffer).toString("base64");
    let dataURI = `data:${file.mimetype};base64,${b64}`;
    return cloudinary.uploader.upload(dataURI, { folder: "fastinfo_pois" });
};

// Helper Parsing Orari (usato sia in create/update che in import CSV)
const parseDaySchedule = (timeString) => {
    if (!timeString || String(timeString).trim() === '') {
        return { status: 'CLOSED', slots: [] };
    }

    const cleanStr = String(timeString).trim().toUpperCase();

    if (cleanStr === 'ND' || cleanStr === '?' || cleanStr === 'UNKNOWN') {
        return { status: 'UNKNOWN', slots: [] };
    }

    if (cleanStr.includes('24H')) {
        return { status: '24H', slots: [] };
    }

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

    return { status: 'CLOSED', slots: [] };
};

// --- PUBLIC FUNCTIONS ---

const getFeaturedPoisByProvince = async (req, res) => {
    const { provinceId } = req.params;
    const { type } = req.query;
    if (!type || (type !== 'essential' && type !== 'attraction')) {
        return res.status(400).json({ message: "Tipo non valido. Usare 'essential' o 'attraction'." });
    }
    const whereClause = {
        comune: { provinceId: parseInt(provinceId, 10) },
        ...(type === 'essential' ? { isEssentialService: true } : { isFeaturedAttraction: true })
    };
    try {
        const pois = await prisma.pointofinterest.findMany({ where: whereClause, include: { comune: true }, orderBy: { name: 'asc' } });
        res.status(200).json(pois);
    } catch (error) { res.status(500).json({ message: 'Errore del server.' }); }
};

const getPoiDetailsById = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const poi = await prisma.pointofinterest.findUnique({
            where: { id },
            include: {
                comune: { include: { province: { include: { region: true } } } },
                image: true,
                restaurant: true,
                fuelstation: true,
                supermarket: true,
                bar: true,
                parking: true,
                touristattraction: true,
                emergencyservice: true,
                accommodation: true,
                carrepairshop: true,

                // ▼▼▼ AGGIUNGI QUESTI INCLUDE PER AVERE I LOGHI DEI BRAND ▼▼▼
                supermarketBrand: { include: { leaflets: { where: { validFrom: { lte: new Date() }, validUntil: { gte: new Date() } } } } },
                restaurantBrand: true,
                fuelBrand: true,
                medicalBrand: true
                // ▲▲▲ FINE AGGIUNTA ▲▲▲
            }
        });

        if (!poi) return res.status(404).json({ message: "Non trovato" });

        // Filtro volantini (invariato)
        if (poi.supermarketBrand && poi.comune?.province?.region?.id) {
            const regionId = poi.comune.province.region.id;
            poi.supermarketBrand.leaflets = poi.supermarketBrand.leaflets.filter(l => l.regionId === regionId);
        }

        res.json(poi);
    } catch (error) {
        console.error("Errore dettaglio POI:", error);
        res.status(500).json({ message: "Errore server" });
    }
};

// --- ADMIN FUNCTIONS ---

const createPoi = async (req, res) => {
    const { name, category, address, comuneId, description, website, phoneNumber, openingHours, isEssentialService, isFeaturedAttraction,
        dieselPrice, petrolPrice, gasPrice, type, stars, services, bookingUrl, cuisineType, priceRange, hasLeaflet,
        specialty, hasOutdoorSpace, parkingType, servicesOffered, brandsTreated,
        entryFee, attractionType, serviceType
    } = req.body;

    try {
        const poi = await prisma.$transaction(async (tx) => {
            let openingHoursData = Prisma.JsonNull;
            if (openingHours) {
                openingHoursData = typeof openingHours === 'string' ? JSON.parse(openingHours) : openingHours;
            }

            const poiData = {
                name, category, address, comuneId: parseInt(comuneId),
                description: toNull(description), website: toNull(website), phoneNumber: toNull(phoneNumber),
                openingHours: openingHoursData,
                dieselPrice: toFloatOrNull(dieselPrice), petrolPrice: toFloatOrNull(petrolPrice), gasPrice: toFloatOrNull(gasPrice),
                type: toNull(type), stars: toIntOrNull(stars), services: toNull(services), bookingUrl: toNull(bookingUrl),
                isEssentialService: toBoolean(isEssentialService), isFeaturedAttraction: toBoolean(isFeaturedAttraction),
            };

            // LOGICA AUTOMATICA BRAND
            let matchedBrand = null;
            const cleanName = name.trim();

            if (category === 'Supermarket') {
                matchedBrand = await tx.supermarketBrand.findFirst({ where: { name: cleanName } });
                if (matchedBrand) poiData.supermarketBrandId = matchedBrand.id;
            } else if (category === 'Restaurant') {
                matchedBrand = await tx.restaurantBrand.findFirst({ where: { name: cleanName } });
                if (matchedBrand) poiData.restaurantBrandId = matchedBrand.id;
            } else if (category === 'FuelStation') {
                matchedBrand = await tx.fuelBrand.findFirst({ where: { name: cleanName } });
                if (matchedBrand) poiData.fuelBrandId = matchedBrand.id;
            } else if (category === 'EmergencyService') {
                matchedBrand = await tx.medicalBrand.findFirst({ where: { name: cleanName } });
                if (matchedBrand) poiData.medicalBrandId = matchedBrand.id;
            }

            if (matchedBrand) {
                if (!poiData.description) poiData.description = matchedBrand.description;
                if (!poiData.website) poiData.website = matchedBrand.website;
            }

            // CREAZIONE TABELLE SPECIFICHE
            if (category === 'Restaurant') {
                poiData.restaurant = { create: { cuisineType: toNull(cuisineType), priceRange: toNull(priceRange) } };
            } else if (category === 'FuelStation') {
                poiData.fuelstation = { create: { website: toNull(website) } };
            } else if (category === 'Supermarket') {
                poiData.supermarket = { create: { hasLeaflet: toBoolean(hasLeaflet) } };
            } else if (category === 'Bar') {
                poiData.bar = { create: { specialty: toNull(specialty), hasOutdoorSpace: toBoolean(hasOutdoorSpace) } };
            } else if (category === 'Accommodation') {
                poiData.accommodation = { create: {} };
            } else if (category === 'CarRepairShop') {
                poiData.carrepairshop = { create: { servicesOffered: toNull(servicesOffered), brandsTreated: toNull(brandsTreated) } };
            } else if (category === 'Parking') {
                poiData.parking = { create: { parkingType: toNull(parkingType) } };
            } else if (category === 'TouristAttraction') {
                poiData.touristattraction = { create: { entryFee: toNull(entryFee), attractionType: toNull(attractionType) } };
            } else if (category === 'EmergencyService') {
                poiData.emergencyservice = { create: { serviceType: serviceType || 'Altro', phoneNumber: toNull(phoneNumber) } };
            }

            const createdPoi = await tx.pointofinterest.create({ data: poiData });

            if (req.files && req.files.length > 0) {
                const uploadPromises = req.files.map(file => uploadImageToCloudinary(file));
                const uploadResults = await Promise.all(uploadPromises);
                await tx.image.createMany({ data: uploadResults.map(r => ({ url: r.secure_url, poiId: createdPoi.id })) });
            }

          /*  else if (matchedBrand && matchedBrand.defaultImageUrl) {
                await tx.image.create({
                    data: { url: matchedBrand.defaultImageUrl, poiId: createdPoi.id }
                });
            } */

            return createdPoi;
        });
        res.status(201).json(poi);
    } catch (error) { console.error("Errore creazione POI:", error); res.status(500).json({ message: "Errore durante la creazione del POI." }); }
};

const updatePoi = async (req, res) => {
    const poiId = parseInt(req.params.id);
    const { name, category, address, description, website, phoneNumber, openingHours, isEssentialService, isFeaturedAttraction,
        dieselPrice, petrolPrice, gasPrice, type, stars, services, bookingUrl, cuisineType, priceRange, hasLeaflet,
        specialty, hasOutdoorSpace, parkingType, servicesOffered, brandsTreated,
        entryFee, attractionType, serviceType
    } = req.body;
    try {
        await prisma.$transaction(async (tx) => {
            let openingHoursData = Prisma.JsonNull;
            if (openingHours) {
                openingHoursData = typeof openingHours === 'string' ? JSON.parse(openingHours) : openingHours;
            }

            await tx.pointofinterest.update({
                where: { id: poiId }, data: {
                    name, address,
                    description: toNull(description), website: toNull(website), phoneNumber: toNull(phoneNumber),
                    openingHours: openingHoursData,
                    dieselPrice: toFloatOrNull(dieselPrice), petrolPrice: toFloatOrNull(petrolPrice), gasPrice: toFloatOrNull(gasPrice),
                    type: toNull(type), stars: toIntOrNull(stars), services: toNull(services), bookingUrl: toNull(bookingUrl),
                    isEssentialService: toBoolean(isEssentialService), isFeaturedAttraction: toBoolean(isFeaturedAttraction),
                }
            });
            if (category === 'Restaurant') await tx.restaurant.upsert({ where: { poiId }, update: { cuisineType: toNull(cuisineType), priceRange: toNull(priceRange) }, create: { poiId, cuisineType: toNull(cuisineType), priceRange: toNull(priceRange) } });
            else if (category === 'FuelStation') await tx.fuelstation.upsert({ where: { poiId }, update: { website: toNull(website) }, create: { poiId, website: toNull(website) } });
            else if (category === 'Supermarket') await tx.supermarket.upsert({ where: { poiId }, update: { hasLeaflet: toBoolean(hasLeaflet) }, create: { poiId, hasLeaflet: toBoolean(hasLeaflet) } });
            else if (category === 'Bar') await tx.bar.upsert({ where: { poiId }, update: { specialty: toNull(specialty), hasOutdoorSpace: toBoolean(hasOutdoorSpace) }, create: { poiId, specialty: toNull(specialty), hasOutdoorSpace: toBoolean(hasOutdoorSpace) } });
            else if (category === 'Accommodation') await tx.accommodation.upsert({ where: { poiId }, update: {}, create: { poiId } });
            else if (category === 'CarRepairShop') await tx.carRepairShop.upsert({ where: { poiId }, update: { servicesOffered: toNull(servicesOffered), brandsTreated: toNull(brandsTreated) }, create: { poiId, servicesOffered: toNull(servicesOffered), brandsTreated: toNull(brandsTreated) } });
            else if (category === 'Parking') await tx.parking.upsert({ where: { poiId }, update: { parkingType: toNull(parkingType) }, create: { poiId, parkingType: toNull(parkingType) } });
            else if (category === 'TouristAttraction') await tx.touristattraction.upsert({ where: { poiId }, update: { entryFee: toNull(entryFee), attractionType: toNull(attractionType) }, create: { poiId, entryFee: toNull(entryFee), attractionType: toNull(attractionType) } });
            else if (category === 'EmergencyService') await tx.emergencyservice.upsert({ where: { poiId }, update: { serviceType: toNull(serviceType), phoneNumber: toNull(phoneNumber) }, create: { poiId, serviceType: toNull(serviceType), phoneNumber: toNull(phoneNumber) } });
        });
        const updatedPoi = await prisma.pointofinterest.findUnique({
            where: { id: poiId },
            include: {
                image: true, restaurant: true, fuelstation: true, supermarket: true, bar: true, parking: true, touristattraction: true, emergencyservice: true, accommodation: true,
                carrepairshop: true, supermarketBrand: true
            }
        });
        res.status(200).json(updatedPoi);
    } catch (error) { console.error("Errore aggiornamento POI:", error); res.status(500).json({ message: "Errore durante l'aggiornamento del POI." }); }
};

const deletePoi = async (req, res) => {
    const poiId = parseInt(req.params.id);
    try {
        await prisma.pointofinterest.delete({ where: { id: poiId } });
        res.status(200).json({ message: 'POI eliminato con successo.' });
    } catch (error) { res.status(500).json({ message: "Errore del server" }); }
};

const addImagesToPoi = async (req, res) => {
    const poiId = parseInt(req.params.id);
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'Nessun file fornito.' });
    }
    try {
        for (const file of req.files) {
            const result = await uploadImageToCloudinary(file);
            await prisma.image.create({ data: { url: result.secure_url, poiId: poiId } });
        }
        res.status(201).json({ message: 'Immagini aggiunte.' });
    } catch (error) { res.status(500).json({ message: "Errore del server" }); }
};

const deleteImage = async (req, res) => {
    const imageId = parseInt(req.params.imageId);
    try {
        await prisma.image.delete({ where: { id: imageId } });
        res.status(200).json({ message: 'Immagine eliminata.' });
    } catch (error) { res.status(500).json({ message: "Errore del server" }); }
};

const importGlobalPois = async (req, res) => {
    let { category: rawCategory } = req.body;
    if (!req.file || !rawCategory) return res.status(400).json({ message: "File o categoria mancanti." });

    try {
        // Gestione sottocategorie (es. EmergencyService:Farmacia)
        let category = rawCategory;
        let forcedServiceType = null;
        if (rawCategory.includes(':')) {
            const parts = rawCategory.split(':');
            category = parts[0];
            forcedServiceType = parts[1];
        }

        const fileContent = req.file.buffer.toString('utf-8');
        const rows = fileContent.split(/\r?\n/);
        let separator = rows[0] && rows[0].includes(';') ? ';' : ',';
        const startRow = rows[0].toLowerCase().includes('nome') ? 1 : 0;

        let successCount = 0;
        let errors = [];

        for (let i = startRow; i < rows.length; i++) {
            const row = rows[i].trim();
            if (!row) continue;

            // Parsing CSV
            let cols;
            if (separator === ',') {
                cols = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
                if(!cols) cols = row.split(',');
            } else {
                cols = row.split(';');
            }
            if (!cols) continue;

            const clean = (s) => { let v = String(s || '').trim(); if(v.startsWith('"')&&v.endsWith('"')) return v.slice(1,-1).trim(); return v; };
            cols = cols.map(c => clean(c));

            const poiName = cols[0];
            const comuneName = cols[1];
            const address = cols[2];
            const phoneNumber = cols[3];

            if (!poiName || !comuneName || !address) {
                errors.push(`Riga ${i+1}: Dati mancanti`);
                continue;
            }

            // 1. Trova Comune
            const comune = await prisma.comune.findFirst({
                where: { name: { equals: comuneName } }
            });

            if (!comune) {
                errors.push(`Riga ${i+1}: Comune '${comuneName}' non trovato.`);
                continue;
            }

            // 2. Parsing Orari
            const openingHoursJson = {
                'lunedì': parseDaySchedule(cols[4]), 'martedì': parseDaySchedule(cols[5]),
                'mercoledì': parseDaySchedule(cols[6]), 'giovedì': parseDaySchedule(cols[7]),
                'venerdì': parseDaySchedule(cols[8]), 'sabato': parseDaySchedule(cols[9]),
                'domenica': parseDaySchedule(cols[10])
            };

            // 3. Prepara Dati Base
            let poiData = {
                name: poiName, category, address, comuneId: comune.id, phoneNumber: phoneNumber || null,
                openingHours: openingHoursJson
            };

            // 4. CHECK CATENA INTELLIGENTE (Contains invece di Equals)
            let matchedBrand = null;
            const lowerName = poiName.toLowerCase();

            if (category === 'FuelStation') {
                const allBrands = await prisma.fuelBrand.findMany();
                matchedBrand = allBrands.find(b => lowerName.includes(b.name.toLowerCase()));
            }
            else if (category === 'Restaurant') {
                const allBrands = await prisma.restaurantBrand.findMany();
                matchedBrand = allBrands.find(b => lowerName.includes(b.name.toLowerCase()));
            }
            else if (category === 'Supermarket') {
                const allBrands = await prisma.supermarketBrand.findMany();
                matchedBrand = allBrands.find(b => lowerName.includes(b.name.toLowerCase()));
            }
            else if (category === 'EmergencyService') {
                const allBrands = await prisma.medicalBrand.findMany();
                matchedBrand = allBrands.find(b => lowerName.includes(b.name.toLowerCase()));
            }

            if (matchedBrand) {
                if(category==='Supermarket') poiData.supermarketBrandId = matchedBrand.id;
                if(category==='Restaurant') poiData.restaurantBrandId = matchedBrand.id;
                if(category==='FuelStation') poiData.fuelBrandId = matchedBrand.id;
                if(category==='EmergencyService') poiData.medicalBrandId = matchedBrand.id;

                // Copia dati solo se non presenti nel CSV (qui il CSV non li ha, quindi copia sempre)
                poiData.description = matchedBrand.description;
                poiData.website = matchedBrand.website;
            }

            // 5. Tabelle Specifiche
            if(category==='Restaurant') poiData.restaurant = { create: {} };
            if(category==='FuelStation') poiData.fuelstation = { create: {} };
            if(category==='Supermarket') poiData.supermarket = { create: { hasLeaflet: false } };
            if(category==='EmergencyService') {
                let type = forcedServiceType || 'Altro';
                poiData.emergencyservice = { create: { serviceType: type } };
            }
            if(category==='Bar') poiData.bar = { create: {} };
            if(category==='Accommodation') poiData.accommodation = { create: {} };
            if(category==='Parking') poiData.parking = { create: {} };
            if(category==='CarRepairShop') poiData.carrepairshop = { create: {} };

            // 6. Creazione
            const newPoi = await prisma.pointofinterest.create({ data: poiData });

           /* if (matchedBrand && matchedBrand.defaultImageUrl) {
                await prisma.image.create({ data: { url: matchedBrand.defaultImageUrl, poiId: newPoi.id } });
            } */
            successCount++;
        }

        res.status(200).json({ message: `Importati: ${successCount}`, errors });

    } catch (error) { console.error("Errore import globale:", error); res.status(500).json({ message: "Errore import." }); }
};

const getPoisByCategoryAdmin = async (req, res) => {
    const { category, serviceType, search = '', page = 1 } = req.query;
    const limit = 20;
    const skip = (parseInt(page) - 1) * limit;

    try {
        const whereClause = {
            category: category,
            OR: [
                { name: { contains: search } },
                { address: { contains: search } },
                { comune: { name: { contains: search } } }
            ]
        };

        if (category === 'EmergencyService' && serviceType) {
            whereClause.emergencyservice = {
                serviceType: serviceType
            };
        }

        const [pois, total] = await prisma.$transaction([
            prisma.pointofinterest.findMany({
                where: whereClause,
                skip,
                take: limit,
                include: { comune: { select: { name: true, province: { select: { sigla: true } } } }, emergencyservice: true },
                orderBy: { name: 'asc' }
            }),
            prisma.pointofinterest.count({ where: whereClause })
        ]);

        res.status(200).json({
            data: pois,
            pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) }
        });
    } catch (error) { res.status(500).json({ message: 'Errore server' }); }
};

export {
    getFeaturedPoisByProvince,
    getPoiDetailsById,
    createPoi,
    updatePoi,
    deletePoi,
    addImagesToPoi,
    deleteImage,
    importGlobalPois,
    getPoisByCategoryAdmin,
    parseDaySchedule
};
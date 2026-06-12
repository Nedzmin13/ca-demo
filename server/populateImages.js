import mysql from 'mysql2/promise';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// --- CONFIGURAZIONE ---
const dbConfig = {
    host: '127.0.0.1',
    user: 'root',
    password: '1341992necko', // La tua password
    database: 'fastinfo'
};

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY;
const prisma = new PrismaClient();
// --------------------

// Pausa lunga per rispettare il limite di Unsplash (50 richieste/ora)
// 3600 secondi / 50 richieste = 72 secondi per richiesta. Usiamo 75 per sicurezza.
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const SHORT_DELAY = 1000; // 1 secondo
const LONG_PAUSE = 3600000; // 1 ora in millisecondi

async function populateImages() {
    console.log('🚀 Inizio processo di ricerca immagini...');

    try {
        console.log('🔎 Cerco comuni senza immagini...');
        const comuniToUpdate = await prisma.comune.findMany({
            where: { images: { none: {} } },
            select: { id: true, name: true, province: { select: { name: true } } }
        });

        if (comuniToUpdate.length === 0) {
            console.log('🎉 Tutti i comuni hanno già immagini. Lavoro terminato!');
            return;
        }

        console.log(`✅ Trovati ${comuniToUpdate.length} comuni da aggiornare.`);

        let requestCount = 0;

        for (let i = 0; i < comuniToUpdate.length; i++) {
            // Controlla se abbiamo raggiunto il limite di richieste
            if (requestCount >= 49) { // Ci fermiamo a 49 per sicurezza
                console.log(`\n--- Limite API raggiunto. Inizio pausa di 1 ora... ---`);
                console.log(`--- Prossimo aggiornamento alle: ${new Date(Date.now() + LONG_PAUSE).toLocaleTimeString('it-IT')} ---`);
                await sleep(LONG_PAUSE);
                requestCount = 0; // Resetta il contatore
            }

            const comune = comuniToUpdate[i];
            const searchTerm = `${comune.name}, ${comune.province.name}, Italia`;
            const UNSPLASH_API_URL = `https://api.unsplash.com/search/photos?page=1&per_page=3&query=${encodeURIComponent(searchTerm)}&client_id=${UNSPLASH_KEY}`;

            console.log(`\n(${i + 1}/${comuniToUpdate.length}) 📸 Cerco immagini per: ${comune.name}...`);
            requestCount++; // Incrementa il contatore per questa richiesta

            try {
                const response = await axios.get(UNSPLASH_API_URL);
                const photos = response.data.results;

                if (photos && photos.length > 0) {
                    console.log(`  -> Trovate ${photos.length} foto. Le carico...`);
                    for (const photo of photos) {
                        const imageUrl = photo.urls.regular;
                        const result = await cloudinary.uploader.upload(imageUrl, { folder: "fastinfo_comuni" });
                        await prisma.comuneImage.create({
                            data: { url: result.secure_url, comuneId: comune.id }
                        });
                    }
                    console.log(`  -> ✅ Immagini per ${comune.name} salvate.`);
                } else {
                    console.log(`  -> ⚠️ Nessuna immagine trovata per ${comune.name}.`);
                }
            } catch (error) {
                console.error(`  -> 🔥 Errore durante la ricerca per ${comune.name}:`, error.response?.statusText || error.message);
                if (error.response?.status === 403) { // Errore di rate limit
                    console.log(`--- Limite API superato. Inizio pausa forzata di 1 ora... ---`);
                    await sleep(LONG_PAUSE);
                    requestCount = 0;
                }
            }

            await sleep(SHORT_DELAY); // Piccola pausa tra ogni comune
        }

        console.log('\n\n🎉 Processo di popolamento immagini completato!');

    } catch (error) {
        console.error('\n\n🔥🔥 ERRORE CRITICO:', error);
    } finally {
        await prisma.$disconnect();
    }
}

populateImages();
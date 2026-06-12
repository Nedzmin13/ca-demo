import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// --- CONFIGURAZIONE ---
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
const prisma = new PrismaClient();
const WIKIMEDIA_API_URL = "https://it.wikipedia.org/w/api.php";
// --------------------

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const SHORT_DELAY = 250; // Pausa di 0.25 secondi tra le richieste, molto veloce ma sicuro

async function populateAllComuni() {
    console.log('🚀 Inizio processo di popolamento immagini per TUTTA ITALIA da Wikipedia...');

    try {
        console.log('🔎 Cerco tutti i comuni senza immagini...');
        const comuniToUpdate = await prisma.comune.findMany({
            where: {
                images: { none: {} }
            },
            select: { id: true, name: true }
        });

        if (comuniToUpdate.length === 0) {
            console.log('🎉 Tutti i comuni hanno già almeno un\'immagine. Lavoro terminato!');
            return;
        }

        console.log(`✅ Trovati ${comuniToUpdate.length} comuni da aggiornare. Inizio il processo...`);

        for (let i = 0; i < comuniToUpdate.length; i++) {
            const comune = comuniToUpdate[i];

            // Usiamo solo il nome del comune, Wikipedia è abbastanza intelligente
            const searchTerm = comune.name;

            const params = {
                action: "query",
                prop: "pageimages",
                titles: searchTerm,
                pithumbsize: 1200, // Immagine di buona qualità
                format: "json",
                redirects: 1, // Segue i redirect (es. da "San Benedetto Del Tronto" a "San Benedetto del Tronto")
            };

            // Usiamo process.stdout.write per scrivere sulla stessa riga
            process.stdout.write(`(${i + 1}/${comuniToUpdate.length}) 📸 Cerco per: ${comune.name}... `);

            try {
                const response = await axios.get(WIKIMEDIA_API_URL, { params });
                const pages = response.data.query.pages;
                const pageId = Object.keys(pages)[0];

                if (pageId !== '-1' && pages[pageId].thumbnail) {
                    const imageUrl = pages[pageId].thumbnail.source;

                    // Carica su Cloudinary e salva nel DB
                    const result = await cloudinary.uploader.upload(imageUrl, { folder: "fastinfo_comuni" });
                    await prisma.comuneImage.create({
                        data: {
                            url: result.secure_url,
                            comuneId: comune.id
                        }
                    });
                    process.stdout.write('✅ Fatto!\n');
                } else {
                    process.stdout.write('❌ Non trovato.\n');
                }

            } catch (error) {
                process.stdout.write(`🔥 Errore API.\n`);
                console.error(`  -> Errore per ${comune.name}:`, error.message);
            }

            // Pausa per non sovraccaricare l'API
            await sleep(SHORT_DELAY);
        }

        console.log('\n\n🎉 Processo di popolamento immagini completato per tutti i comuni!');

    } catch (error) {
        console.error('\n\n🔥🔥 ERRORE CRITICO:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Avvia lo script
populateAllComuni();
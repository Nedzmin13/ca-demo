import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

cloudinary.config({ /* ... */ });
const prisma = new PrismaClient();
const WIKIMEDIA_API_URL = "https://it.wikipedia.org/w/api.php";
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function populateMissingImagesWithAttribution() {
    console.log('🚀 Inizio processo di popolamento per le immagini MANCANTI...');
    const comuniToUpdate = await prisma.comune.findMany({ where: { images: { none: {} } } });

    if (comuniToUpdate.length === 0) {
        console.log('🎉 Tutti i comuni hanno già un\'immagine. Lavoro terminato!');
        return;
    }

    console.log(`✅ Trovati ${comuniToUpdate.length} comuni senza immagini. Inizio il processo...`);

    for (let i = 0; i < comuniToUpdate.length; i++) {
        let comune = comuniToUpdate[i];
        process.stdout.write(`(${i + 1}/${comuniToUpdate.length}) Cerco per: "${comune.name}"... `);

        try {
            // --- INIZIO LOGICA MIGLIORATA ---
            let searchTerm = comune.name;

            // Step 1: Prima ricerca, veloce e diretta
            let pageInfoParams = { action: "query", titles: searchTerm, prop: "pageimages", pithumbsize: 1200, format: "json", redirects: 1 };
            let pageInfoResponse = await axios.get(WIKIMEDIA_API_URL, { params: pageInfoParams });
            let pages = pageInfoResponse.data.query.pages;
            let pageId = Object.keys(pages)[0];

            // Step 2: Se fallisce, prova la ricerca "aperta"
            if (pageId === '-1') {
                process.stdout.write('...ricerca estesa... ');
                const searchParams = { action: 'opensearch', search: searchTerm, limit: 1, format: 'json' };
                const searchResponse = await axios.get(WIKIMEDIA_API_URL, { params: searchParams });

                if (searchResponse.data[1] && searchResponse.data[1].length > 0) {
                    searchTerm = searchResponse.data[1][0]; // Usa il titolo del primo risultato
                    // Ripeti la ricerca con il nuovo titolo
                    pageInfoParams.titles = searchTerm;
                    pageInfoResponse = await axios.get(WIKIMEDIA_API_URL, { params: pageInfoParams });
                    pages = pageInfoResponse.data.query.pages;
                    pageId = Object.keys(pages)[0];
                }
            }
            // --- FINE LOGICA MIGLIORATA ---

            if (pageId === '-1' || !pages[pageId].pageimage) {
                process.stdout.write('❌ Non trovato.\n');
                await sleep(250);
                continue;
            }

            const imageName = pages[pageId].pageimage;
            const imageUrl = pages[pageId].thumbnail.source;

            // Il resto dello script (metadati, upload, salvataggio) rimane identico...
            const imageMetaParams = { action: "query", titles: `File:${imageName}`, prop: "imageinfo", iiprop: "extmetadata", format: "json" };
            const imageMetaResponse = await axios.get(WIKIMEDIA_API_URL, { params: imageMetaParams });
            const imageInfo = imageMetaResponse.data.query.pages['-1']?.imageinfo?.[0]?.extmetadata;

            let attributionText = 'Fonte: Wikipedia / Wikimedia Commons';
            if (imageInfo) { /* ... */ }

            const result = await cloudinary.uploader.upload(imageUrl, { folder: "fastinfo_comuni" });

            await prisma.comuneImage.create({
                data: {
                    url: result.secure_url,
                    comuneId: comune.id,
                    attribution: attributionText
                }
            });

            process.stdout.write('✅ Fatto!\n');
        } catch (error) {
            process.stdout.write(`🔥 Errore API.\n`);
        }
        await sleep(500);
    }
    console.log('\n\n🎉 Processo completato!');
}

populateMissingImagesWithAttribution().finally(async () => await prisma.$disconnect());
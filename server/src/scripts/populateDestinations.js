import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';
import { createApi } from 'unsplash-js';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

// --- CONFIGURAZIONE ---
const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const unsplash = createApi({ accessKey: process.env.UNSPLASH_ACCESS_KEY });
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const destinations = {
    "Inverno": ["Courmayeur", "Madonna di Campiglio", "Cortina d'Ampezzo", "Bolzano", "Livigno", "Bormio", "Matera", "Gubbio", "Ortisei", "Asiago", "Canazei", "Breuil-Cervinia", "Sestriere", "Roccaraso", "Merano", "Torino (per le Luci d'Artista)", "Trento", "Vipiteno", "Auronzo di Cadore"],
    "Estate": ["Positano", "Amalfi", "Gallipoli", "Otranto", "Favignana", "Porto Cervo", "Capri", "Isola d'Elba", "Sirolo", "Riomaggiore", "San Vito Lo Capo", "Tropea", "Rimini", "Sperlonga", "Sirmione", "Bellagio", "Cogne", "Cefalù", "Vieste", "Polignano a Mare", "Portofino", "Taormina", "Scalea", "Ischia", "Ponza", "Jesolo", "Caorle"],
    "Autunno": ["Alba, Piemonte", "Val d'Orcia, Toscana", "Perugia", "Firenze", "Montalcino", "Greve in Chianti", "Parma", "Bologna", "Modena", "Verona", "Siena", "Orvieto", "Spoleto", "Norcia", "Castel del Monte, Puglia", "Langhe (zona vinicola)", "Urbino", "San Gimignano", "Volterra", "Assisi"],
    "Primavera": ["Roma", "Venezia", "Napoli", "Lecce", "Palermo", "Costiera Triestina", "Valle dei Templi, Agrigento", "Alberobello", "Castelluccio di Norcia (per la fiorita)", "Giardini di Ninfa, Lazio", "Parco Giardino Sigurtà, Veneto"]
};

async function populateDestinations() {
    console.log('🚀 Inizio processo di creazione destinazioni stagionali...');

    try {
        const allDestinationNames = [ ...destinations.Inverno, ...destinations.Estate, ...destinations.Autunno, ...destinations.Primavera ];
        console.log(`✅ Trovate ${allDestinationNames.length} destinazioni da processare.`);

        let unsplashRequestCount = 0;

        for (let i = 0; i < allDestinationNames.length; i++) {
            const destName = allDestinationNames[i];
            process.stdout.write(`\n(${i + 1}/${allDestinationNames.length}) Lavoro su: "${destName}"\n`);

            const existing = await prisma.destination.findFirst({ where: { name: { contains: destName.split(',')[0] } } });
            if (existing) {
                console.log(`  -> ⏭️ Destinazione già esistente. Salto.`);
                continue;
            }

            process.stdout.write(`  -> ✍️  Scrivo la guida... `);
            const contentPrompt = `Sei un esperto travel writer per il sito "InfoSubito". Scrivi una guida di viaggio dettagliata e accattivante per "${destName}, Italia". L'articolo deve essere lungo (almeno 1500 caratteri) e utile. La tua risposta DEVE essere un oggetto JSON valido con queste chiavi: "name", "region", "description", "tags", "season", "rating". Per la chiave "description", formatta il testo in HTML con <h2>, <p>, <ul>, <li>, <strong>. Per "season", usa una sola parola tra "Primavera", "Estate", "Autunno", "Inverno". Per "rating", un numero da 4.0 a 5.0.`;
            const contentResponse = await openai.chat.completions.create({ model: "gpt-4o", messages: [{ role: "user", content: contentPrompt }], response_format: { type: "json_object" } });
            const destData = JSON.parse(contentResponse.choices[0].message.content);
            process.stdout.write('✅\n');

            process.stdout.write(`  -> 🖼️  Cerco immagini su Unsplash... `);
            if (unsplashRequestCount >= 49) {
                console.log('\n⚠️ Limite API Unsplash quasi raggiunto. Pausa di un\'ora e 5 minuti...');
                await sleep(3900000);
                unsplashRequestCount = 0;
                console.log('✅ Pausa terminata. Riprendo il lavoro.');
            }

            let imageUrls = [];
            try {
                const photoResponse = await unsplash.search.getPhotos({ query: `${destName} Italy`, perPage: 6, orientation: 'landscape' });
                unsplashRequestCount++;
                if (photoResponse.errors) { throw new Error(photoResponse.errors[0]); }
                imageUrls = photoResponse.response.results.map(photo => photo.urls.regular);
            } catch (unsplashError) {
                console.error(`\n🔥 Errore API Unsplash per "${destName}": ${unsplashError.message}`);
                process.stdout.write('❌ Errore Unsplash. Salto questa destinazione.\n');
                await sleep(5000);
                continue;
            }

            if (imageUrls.length < 3) {
                process.stdout.write('⚠️ Trovate meno di 3 immagini. Salto.\n');
                continue;
            }
            process.stdout.write(`✅ Trovate ${imageUrls.length} immagini.\n`);

            process.stdout.write(`  -> ☁️  Carico su Cloudinary... `);
            const cloudinaryPromises = imageUrls.map(url => cloudinary.uploader.upload(url, { folder: "fastinfo_destinations" }));
            const cloudinaryResults = await Promise.all(cloudinaryPromises);
            const cloudinaryUrls = cloudinaryResults.map(result => ({ url: result.secure_url }));
            process.stdout.write('✅\n');

            process.stdout.write(`  -> 💾  Salvo nel database... `);
            await prisma.destination.create({
                data: {
                    name: destData.name, region: destData.region, description: destData.description,
                    tags: Array.isArray(destData.tags) ? destData.tags.join(', ') : destData.tags,
                    season: destData.season, rating: parseFloat(destData.rating),
                    images: { create: cloudinaryUrls }
                }
            });
            process.stdout.write('✅\n');

            await sleep(5000);
        }
        console.log('\n\n🎉 Processo di creazione destinazioni completato!');
    } catch (error) {
        console.error('\n\n🔥🔥 ERRORE CRITICO:', error);
    } finally {
        await prisma.$disconnect();
    }
}
populateDestinations();
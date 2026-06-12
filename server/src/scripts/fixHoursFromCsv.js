import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper per i percorsi
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

// Funzione di parsing che capisce anche gli orari senza virgola
const parseLenientHours = (timeString) => {
    if (!timeString || String(timeString).trim() === '') return { status: 'CLOSED', slots: [] };

    const cleanStr = String(timeString).trim().toUpperCase();
    if (cleanStr === 'ND' || cleanStr === '?') return { status: 'UNKNOWN', slots: [] };
    if (cleanStr.includes('24H')) return { status: '24H', slots: [] };

    // Logica "magica": cerca pattern HH:MM-HH:MM ovunque nella stringa
    const regex = /(\d{2}:\d{2})-(\d{2}:\d{2})/g;
    let match;
    const slots = [];
    while ((match = regex.exec(cleanStr)) !== null) {
        slots.push({ from: match[1], to: match[2] });
    }

    return slots.length > 0 ? { status: 'OPEN', slots: slots } : { status: 'CLOSED', slots: [] };
};

async function fixHours() {
    console.log('--- Avvio script correzione orari da CSV ---');

    // Metti qui il percorso del tuo file CSV ORIGINALE
    const csvPath = path.join(__dirname, 'data', 'ristoranti_sbagliati.csv');

    if (!fs.existsSync(csvPath)) {
        console.error(`ERRORE: File non trovato in ${csvPath}. Metti il file lì e riprova.`);
        return;
    }

    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    const rows = fileContent.split(/\r?\n/);

    let updatedCount = 0;
    let notFoundCount = 0;

    for (let i = 1; i < rows.length; i++) { // Salta la riga header
        const row = rows[i].trim();
        if (!row) continue;

        // Assumiamo separatore ; e ordine NOME;COMUNE;INDIRIZZO;...
        const cols = row.split(';');
        const poiName = cols[0].trim();
        const comuneName = cols[1].trim();
        const address = cols[2].trim();

        if (!poiName || !comuneName || !address) continue;

        // Cerca il POI esatto nel DB
        const poiInDb = await prisma.pointofinterest.findFirst({
            where: {
                name: poiName,
                address: address,
                comune: { name: comuneName }
            }
        });

        if (poiInDb) {
            const newOpeningHours = {
                'lunedì': parseLenientHours(cols[4]),
                'martedì': parseLenientHours(cols[5]),
                'mercoledì': parseLenientHours(cols[6]),
                'giovedì': parseLenientHours(cols[7]),
                'venerdì': parseLenientHours(cols[8]),
                'sabato': parseLenientHours(cols[9]),
                'domenica': parseLenientHours(cols[10])
            };

            await prisma.pointofinterest.update({
                where: { id: poiInDb.id },
                data: { openingHours: newOpeningHours }
            });
            updatedCount++;
            console.log(`✅ Corretto: ${poiName} a ${comuneName}`);
        } else {
            notFoundCount++;
            console.log(`⚠️  Non Trovato: ${poiName} a ${comuneName}`);
        }
    }

    console.log(`\n--- FINE ---`);
    console.log(`Corretti: ${updatedCount}`);
    console.log(`Non Trovati: ${notFoundCount}`);
}

fixHours()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
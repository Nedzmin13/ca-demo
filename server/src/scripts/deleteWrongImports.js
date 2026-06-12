import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const prisma = new PrismaClient();

const cleanCsvField = (field) => {
    if (field === undefined || field === null) return '';
    let s = String(field).trim();
    if (s.startsWith('"') && s.endsWith('"')) s = s.slice(1, -1);
    return s.trim();
};

async function main() {
    console.log('--- Avvio script ELIMINAZIONE ERRORI da CSV ---');

    const csvPath = path.join(__dirname, 'data', 'da_cancellare.csv');
    if (!fs.existsSync(csvPath)) {
        console.error(`❌ ERRORE: File non trovato in: ${csvPath}`);
        return;
    }

    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    const rows = fileContent.split(/\r?\n/);
    let separator = rows[0] && rows[0].includes(';') ? ';' : ',';
    const startRow = rows[0].toLowerCase().includes('nome') ? 1 : 0;

    let deletedCount = 0;
    let notFoundCount = 0;

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

        const poiName = cols[0];
        const address = cols[2]; // Assumendo che l'indirizzo sia la terza colonna, come da tuo formato standard

        if (!poiName || !address) continue;

        try {
            // CERCA IL RECORD SBAGLIATO
            // Cerca un POI con quel nome, quell'indirizzo, ma che ha category = 'Restaurant'
            const wrongPoi = await prisma.pointofinterest.findFirst({
                where: {
                    name: poiName,
                    address: address,
                    category: 'Restaurant' // <-- FONDAMENTALE: Cerca solo i falsi ristoranti
                }
            });

            if (wrongPoi) {
                // ELIMINA IL RECORD
                await prisma.pointofinterest.delete({
                    where: { id: wrongPoi.id }
                });
                console.log(`🗑️  Eliminato: ${poiName} (${address})`);
                deletedCount++;
            } else {
                notFoundCount++;
            }
        } catch (error) {
            console.error(`❌ Errore durante l'eliminazione di ${poiName}:`, error.message);
        }
    }

    console.log(`\n--- RIEPILOGO FINALE ---`);
    console.log(`✅ Falsi Ristoranti eliminati: ${deletedCount}`);
    console.log(`⚠️ Record non trovati (già eliminati o mai creati): ${notFoundCount}`);
}

main()
    .catch((e) => {
        console.error("Errore fatale:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
    console.log('--- Avvio script di popolamento (Versione Prisma) ---');

    // Percorso del file .txt (assicurati che esista server/scripts/data/descrizioni.txt)
    const dataPath = path.join(__dirname, 'data', 'descrizioni.txt');

    if (!fs.existsSync(dataPath)) {
        console.error(`❌ ERRORE: Il file non esiste in: ${dataPath}`);
        return;
    }

    const fileContent = fs.readFileSync(dataPath, 'utf-8');

    const regex = /===\s*(.*?)\s*===\s*([\s\S]*?)(?====|$)/g;
    let updatedCount = 0;
    let errorCount = 0;

    const matches = [...fileContent.matchAll(regex)];
    console.log(`Trovati ${matches.length} comuni da elaborare.\n`);

    for (const match of matches) {
        const comuneName = match[1].trim();
        const description = match[2].trim();

        if (!comuneName || !description) continue;

        try {
            const comune = await prisma.comune.findFirst({
                where: { name: { equals: comuneName } }
            });

            if (comune) {
                await prisma.comune.update({
                    where: { id: comune.id },
                    data: { description: description }
                });
                console.log(`✅ [${comuneName}] Aggiornato con successo.`);
                updatedCount++;
            } else {
                console.warn(`⚠️  [${comuneName}] NON trovato nel database.`);
                errorCount++;
            }
        } catch (error) {
            console.error(`❌ Errore durante l'aggiornamento di ${comuneName}:`, error.message);
            errorCount++;
        }
    }

    console.log(`\n--- RIEPILOGO FINALE ---`);
    console.log(`Comuni aggiornati: ${updatedCount}`);
    console.log(`Comuni falliti: ${errorCount}`);
}

main()
    .catch((e) => {
        console.error("Errore fatale nello script:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
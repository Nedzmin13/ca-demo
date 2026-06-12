import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
    console.log('--- Avvio script di popolamento (Versione Pro) ---');

    // Percorso del file .txt
    const dataPath = path.join(__dirname, 'data', 'descrizioni.txt');

    if (!fs.existsSync(dataPath)) {
        console.error(`❌ ERRORE: Il file non esiste in: ${dataPath}`);
        return;
    }

    const fileContent = fs.readFileSync(dataPath, 'utf-8');

    /**
     * REGEX SPIEGAZIONE:
     * Cerca tutto ciò che è compreso tra === Nome ===
     * Cattura il nome e tutto il testo fino al prossimo ===
     */
    const regex = /===\s*(.*?)\s*===\s*([\s\S]*?)(?====|$)/g;
    let match;
    let updatedCount = 0;
    let errorCount = 0;

    const matches = [...fileContent.matchAll(regex)];
    console.log(`Trovati ${matches.length} comuni da elaborare.\n`);

    for (const match of matches) {
        const comuneName = match[1].trim();
        const description = match[2].trim();

        if (!comuneName || !description) continue;

        try {
            // Cerchiamo il comune nel database
            const comune = await prisma.comune.findFirst({
                where: {
                    name: {
                        equals: comuneName
                    }
                }
            });

            if (comune) {
                await prisma.comune.update({
                    where: { id: comune.id },
                    data: { description: description }
                });
                console.log(`✅ [${comuneName}] Aggiornato con successo.`);
                updatedCount++;
            } else {
                console.warn(`⚠️  [${comuneName}] NON trovato nel database. Controlla se il nome è scritto bene.`);
                errorCount++;
            }
        } catch (error) {
            console.error(`❌ Errore durante l'aggiornamento di ${comuneName}:`, error.message);
            errorCount++;
        }
    }

    console.log(`\n--- RIEPILOGO FINALE ---`);
    console.log(`Comuni aggiornati correttamente: ${updatedCount}`);
    console.log(`Comuni falliti o non trovati: ${errorCount}`);
}

main()
    .catch((e) => {
        console.error("Errore fatale nello script:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
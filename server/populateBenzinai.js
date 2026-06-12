import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { stdin as input, stdout as output } from 'node:process';
import * as readline from 'node:readline/promises';
dotenv.config();

// --- CONFIGURAZIONE ---
const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
// --------------------

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const DELAY_BETWEEN_COMUNI = 3000; // 3 secondi
const MAX_RETRIES = 3; // Numero massimo di tentativi per comune

async function populateBenzinaiByRegion() {
    const rl = readline.createInterface({ input, output });

    try {
        const nomeRegioneInput = await rl.question('Inserisci il NOME della regione (es. Veneto): ');
        const nomeRegione = nomeRegioneInput.charAt(0).toUpperCase() + nomeRegioneInput.slice(1).toLowerCase();

        console.log(`🔎 Cerco comuni in ${nomeRegione} che non hanno ancora distributori...`);
        // Query migliorata: cerca solo i comuni che non hanno NESSUN POI di categoria 'FuelStation'
        const comuni = await prisma.comune.findMany({
            where: {
                province: { region: { name: { equals: nomeRegione } } },
                pointofinterest: { none: { category: 'FuelStation' } }
            },
            select: { id: true, name: true, province: { select: { name: true } } },
            orderBy: { name: 'asc' }
        });

        if (comuni.length === 0) {
            console.log("🎉 Tutti i comuni in questa regione sono già stati processati per i distributori.");
            return;
        }

        console.log(`✅ Trovati ${comuni.length} comuni. Inizio la ricerca...`);

        for (let i = 0; i < comuni.length; i++) {
            const comune = comuni[i];
            let retries = 0;
            let success = false;

            while (retries < MAX_RETRIES && !success) {
                try {
                    process.stdout.write(`(${i + 1}/${comuni.length}) ⛽ ${comune.name}... `);

                    const prompt = `Sei un assistente per il sito "InfoSubito". Rispondi con un singolo oggetto JSON. Trova un massimo di 3 distributori di carburante nel comune di "${comune.name}", provincia di "${comune.province.name}", Italia. Se non ne trovi, l'array "distributori" deve essere vuoto. L'oggetto JSON deve avere una chiave "distributori", un array di oggetti. Ogni oggetto deve avere le chiavi: "name", "address", "phoneNumber", "website", "openingHours", "dieselPrice", "petrolPrice", "gasPrice". I prezzi devono essere numeri, gli altri campi stringhe o null.`;

                    const response = await openai.chat.completions.create({
                        model: "gpt-4o",
                        messages: [{ role: "user", content: prompt }],
                        response_format: { type: "json_object" },
                        timeout: 60000, // Aggiunto timeout di 60 secondi
                    });

                    const result = JSON.parse(response.choices[0].message.content);
                    const distributori = result.distributori || [];

                    if (distributori.length > 0) {
                        process.stdout.write(`Trovati ${distributori.length}. Salvo... `);
                        for (const d of distributori) {
                            await prisma.pointofinterest.create({ /* ... (logica di create) ... */ });
                        }
                        process.stdout.write('✅\n');
                    } else {
                        process.stdout.write('⚠️ Nessuno trovato.\n');
                    }
                    success = true; // L'operazione è riuscita, esci dal ciclo while

                } catch (error) {
                    retries++;
                    process.stdout.write(`🔥 Errore (tentativo ${retries}/${MAX_RETRIES})... `);
                    if (retries >= MAX_RETRIES) {
                        process.stdout.write(`❌ Fallito dopo ${MAX_RETRIES} tentativi.\n`);
                        console.error(`  -> Errore finale per ${comune.name}:`, error.message);
                    } else {
                        await sleep(5000); // Attendi 5 secondi prima di riprovare
                    }
                }
            }
            await sleep(DELAY_BETWEEN_COMUNI);
        }
        console.log(`\n\n🎉 Processo completato per la regione ${nomeRegione}!`);
    } catch (error) {
        console.error('\n\n🔥🔥 ERRORE CRITICO:', error);
    } finally {
        await prisma.$disconnect();
        rl.close();
    }
}

populateBenzinaiByRegion();
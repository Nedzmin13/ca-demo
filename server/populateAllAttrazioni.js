import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const DELAY = 2000; // 2 secondi di pausa

async function populateAllAttrazioni() {
    console.log('🚀 Inizio processo di ARRICCHIMENTO attrazioni per TUTTA ITALIA...');

    try {
        console.log('🔎 Cerco tutti i comuni in ordine...');
        const comuni = await prisma.comune.findMany({
            select: { id: true, name: true, province: { select: { name: true } } },
            orderBy: { id: 'asc' }
        });

        console.log(`✅ Trovati ${comuni.length} comuni. Inizio il processo...`);

        for (let i = 0; i < comuni.length; i++) {
            const comune = comuni[i];
            process.stdout.write(`(${i + 1}/${comuni.length}) 🏛️  ${comune.name} (${comune.province.name})... `);

            try {
                const prompt = `
                    Sei un assistente per il sito "InfoSubito". Rispondi con un singolo oggetto JSON.
                    Elenca un massimo di 20 attrazioni turistiche (chiese, monumenti, piazze, musei, castelli, siti naturali) nel comune di "${comune.name}", provincia di "${comune.province.name}", Italia.
                    Se non trovi attrazioni rilevanti, l'array "attrazioni" deve essere vuoto.

                    L'oggetto JSON deve avere una sola chiave, "attrazioni", che è un array di oggetti.
                    Ogni oggetto deve avere queste chiavi:
                    "name": il nome dell'attrazione.
                    "address": l'indirizzo, se applicabile, altrimenti null.
                    "description": una breve descrizione di 1-20 frasi.
                    "entryFee": il costo di ingresso approssimativo (es. "Gratuito", "€ 15"), altrimenti null.
                    "openingHours": gli orari di apertura approssimativi, altrimenti null.
                `;

                const response = await openai.chat.completions.create({
                    model: "gpt-4o",
                    messages: [{ role: "user", content: prompt }],
                    response_format: { type: "json_object" },
                });

                const result = JSON.parse(response.choices[0].message.content);
                const attrazioni = result.attrazioni || [];

                if (attrazioni.length > 0) {
                    let newEntriesCount = 0;
                    for (const a of attrazioni) {
                        if (!a.name) continue; // Salta se manca il nome

                        const existing = await prisma.pointofinterest.findFirst({
                            where: {
                                name: a.name,
                                comuneId: comune.id,
                                category: 'TouristAttraction'
                            }
                        });

                        if (!existing) {
                            await prisma.$transaction(async (tx) => {
                                const newPoi = await tx.pointofinterest.create({
                                    data: {
                                        name: a.name,
                                        category: 'TouristAttraction',
                                        address: a.address,
                                        comuneId: comune.id,
                                        description: a.description,
                                        openingHours: a.openingHours
                                    }
                                });
                                await tx.touristattraction.create({
                                    data: {
                                        poiId: newPoi.id,
                                        entryFee: a.entryFee,
                                        attractionType: 'Monumento' // Valore di default
                                    }
                                });
                            });
                            newEntriesCount++;
                        }
                    }
                    if (newEntriesCount > 0) {
                        process.stdout.write(`Salvate ${newEntriesCount} nuove attrazioni. ✅\n`);
                    } else {
                        process.stdout.write('Nessuna nuova attrazione da aggiungere. ✅\n');
                    }
                } else {
                    process.stdout.write('⚠️ Nessuna trovata.\n');
                }
            } catch (error) {
                process.stdout.write(`🔥 Errore API. Passo al prossimo.\n`);
                console.error(`  -> Errore per ${comune.name}:`, error.message);
            }
            await sleep(DELAY);
        }
        console.log('\n\n🎉 Processo completato!');
    } catch (error) {
        console.error('\n\n🔥🔥 ERRORE CRITICO:', error);
    }
    finally { await prisma.$disconnect(); }
}

populateAllAttrazioni();
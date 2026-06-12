import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

// --- CONFIGURAZIONE ---
const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const DELAY = 2000; // 2 secondi di pausa

const REGIONS_OF_ITALY = [
    "Toscana", "Trentino-Alto Adige", "Umbria", "Valle d'Aosta", "Veneto"
];

async function populateItineraries() {
    console.log('🚀 Inizio processo di creazione itinerari (solo testo)...');

    try {
        for (const region of REGIONS_OF_ITALY) {
            console.log(`\n--- Lavoro sulla regione: ${region} ---`);
            const durations = ["2 giorni", "3 giorni", "weekend", "5 giorni", "una settimana"];

            for (let i = 0; i < durations.length; i++) {
                const duration = durations[i];
                process.stdout.write(`(${i + 1}/${durations.length}) 🧠 Genero contenuto per un itinerario di ${duration} in ${region}... `);

                try {
                    const prompt = `
                        Sei un esperto travel blogger per il sito "InfoSubito".
                        Crea un itinerario di viaggio dettagliato e affascinante in "${region}", Italia, della durata di "${duration}".
                        
                        La tua risposta DEVE essere un singolo oggetto JSON valido con queste chiavi:
                        "title": Un titolo creativo e unico (es. "Cuore della Toscana: da Firenze a Siena").
                        "description": Una descrizione generale dell'itinerario (2-3 paragrafi) in HTML (<p>, <strong>).
                        "isPopular": Un booleano (true se è una meta molto famosa, altrimenti false).
                        "steps": Un array di oggetti tappa. Ogni tappa DEVE avere:
                                 - "day": Il numero del giorno (DEVE ESSERE UN NUMERO INTERO: 1, 2, 3...).
                                 - "title": Un titolo breve per la tappa.
                                 - "description": Una descrizione dettagliata della tappa in HTML.
                    `;

                    const response = await openai.chat.completions.create({
                        model: "gpt-4o",
                        messages: [{ role: "user", content: prompt }],
                        response_format: { type: "json_object" },
                    });

                    const itineraryData = JSON.parse(response.choices[0].message.content);

                    const existing = await prisma.itinerary.findFirst({ where: { title: itineraryData.title } });
                    if (existing) {
                        process.stdout.write('⏭️  Esistente. Salto.\n');
                        continue;
                    }

                    // Assicura che ogni 'day' sia un numero
                    const sanitizedSteps = itineraryData.steps.map((step, index) => ({
                        title: step.title,
                        description: step.description,
                        day: parseInt(step.day) || (index + 1)
                    }));

                    process.stdout.write(`💾  Salvo nel database... `);
                    await prisma.itinerary.create({
                        data: {
                            title: itineraryData.title,
                            duration: duration,
                            region: region,
                            description: itineraryData.description,
                            isPopular: itineraryData.isPopular,
                            steps: { create: sanitizedSteps },
                        }
                    });
                    process.stdout.write('✅ Fatto!\n');

                } catch (error) {
                    process.stdout.write(`🔥 Errore API o di processo.\n`);
                    console.error(`\n  -> Errore:`, error.message);
                }
                await sleep(DELAY);
            }
        }
        console.log('\n\n🎉 Processo completato!');
    } catch (error) {
        console.error('\n\n🔥🔥 ERRORE CRITICO:', error);
    } finally {
        await prisma.$disconnect();
    }
}

populateItineraries();
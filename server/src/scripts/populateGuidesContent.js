import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const DELAY = 5000; // Aumentiamo la pausa a 5 secondi, le risposte lunghe richiedono più tempo

async function populateContent() {
    console.log('🚀 Inizio processo di popolamento contenuti di alta qualità...');

    try {
        const guidesToUpdate = await prisma.Guide.findMany({ where: { content: 'Contenuto in preparazione...' } }).then(i => i.map(item => ({...item, modelName: 'Guide'})));
        const articlesToUpdate = await prisma.HowToArticle.findMany({ where: { content: 'Contenuto in preparazione...' } }).then(i => i.map(item => ({...item, modelName: 'HowToArticle'})));
        const allItems = [...guidesToUpdate, ...articlesToUpdate];

        if (allItems.length === 0) {
            console.log('🎉 Tutti gli articoli hanno già un contenuto. Lavoro terminato!');
            return;
        }

        console.log(`✅ Trovati ${allItems.length} articoli da popolare. Inizio il processo...`);

        for (let i = 0; i < allItems.length; i++) {
            const item = allItems[i];

            // --- IL NUOVO PROMPT PROFESSIONALE ---
            const prompt = `
                Sei un esperto redattore e consulente per "FastInfo", un portale italiano di riferimento che offre guide pratiche e definitive.
                Il tuo obiettivo è creare il miglior contenuto possibile su internet per l'argomento: "${item.title}".
                Il contenuto deve essere estremamente pratico, dettagliato e orientato all'azione. L'utente deve finire di leggere e sapere esattamente cosa fare.

                La tua risposta DEVE essere un oggetto JSON valido, e nient'altro, con due chiavi: "excerpt" e "content".

                1.  **"excerpt"**: Scrivi un riassunto di 2-3 frasi (circa 150 caratteri) che evidenzia il problema risolto e il valore pratico della guida.

                2.  **"content"**: Scrivi un articolo molto lungo, esaustivo e approfondito (almeno 800-1000 parole).
                    Struttura l'articolo in sezioni chiare usando questi tag HTML:
                    - Usa <h2>Titolo Sezione</h2> per ogni sezione principale.
                    - Usa <p>Paragrafo di testo.</p> per i paragrafi.
                    - Usa <ul><li>Elemento lista</li></ul> per le liste puntate.
                    - Usa <ol><li>Elemento lista numerata</li></ol> per le procedure passo-passo.
                    - Usa <strong>testo in grassetto</strong> per evidenziare i termini importanti.
                    - NON includere tag come <html>, <body>, o <h1>. Inizia direttamente con il primo <h2>.
            `;

            process.stdout.write(`(${i + 1}/${allItems.length}) 🧠 Genero contenuto approfondito per: "${item.title}"... `);

            try {
                const response = await openai.chat.completions.create({
                    model: "gpt-4-turbo", // Usiamo il modello migliore per contenuti lunghi e di qualità
                    messages: [{ role: "user", content: prompt }],
                    response_format: { type: "json_object" },
                });

                const contentJson = JSON.parse(response.choices[0].message.content);

                if (contentJson.excerpt && contentJson.content) {
                    const modelToUpdate = item.modelName === 'Guide' ? prisma.Guide : prisma.HowToArticle;
                    await modelToUpdate.update({
                        where: { id: item.id },
                        data: {
                            excerpt: contentJson.excerpt,
                            content: contentJson.content,
                        }
                    });
                    process.stdout.write('✅ Fatto!\n');
                } else {
                    process.stdout.write('❌ Risposta AI non valida.\n');
                }
            } catch (error) {
                process.stdout.write(`🔥 Errore API.\n`);
                console.error(`  -> Errore per ${item.title}:`, error.message);
            }
            await sleep(DELAY);
        }
        console.log('\n\n🎉 Processo di popolamento contenuti completato!');
    } catch (error) {
        console.error('\n\n🔥🔥 ERRORE CRITICO:', error);
    } finally {
        await prisma.$disconnect();
    }
}
populateContent();
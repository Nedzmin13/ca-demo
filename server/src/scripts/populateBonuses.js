import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const DELAY = 2000;

// Lista dei bonus da cercare e creare
const bonusTopics = [
    "Bonus bollette luce e gas per disagio economico (Bonus Sociale)",
    "Contributo per l'affitto a studenti fuori sede",

    // === Aggiunte a Casa e Immobili ===
    "Bonus Sicurezza (per installazione di allarmi e videosorveglianza)",
    "Superbonus (con le nuove aliquote ridotte)",

    // === Aggiunte a Lavoro e Impresa ===
    "Trattamento integrativo (ex Bonus Renzi) per lavoratori dipendenti",
    "Indennità di disoccupazione NASpI",
    "Indennità di disoccupazione DIS-COLL per collaboratori",
    "Legge Nuova Sabatini (per acquisto di macchinari e attrezzature)",
    "Credito d'imposta Transizione 5.0 per la digitalizzazione e sostenibilità",

    // === Aggiunte a Mobilità ===
    "Bonus Bici e Monopattini elettrici (quando rifinanziato)",

    // === Aggiunte a Cultura, Formazione e Salute ===
    "Bonus Libri di Testo (regionale)",
    "Bonus Terme (quando attivo)",
    "Contributo per l'acquisto di apparecchi acustici"
];

async function enrichAndCreateBonuses() {
    console.log('🚀 Inizio processo di arricchimento e creazione bonus con AI...');

    for (let i = 0; i < bonusTopics.length; i++) {
        const topic = bonusTopics[i];

        // Controlla se un bonus con un titolo simile esiste già
        const existingBonus = await prisma.bonus.findFirst({
            where: { title: { contains: topic.split(' ')[0] } } // Cerca per la prima parola
        });

        if (existingBonus && existingBonus.description.length > 50) {
            console.log(`✅ Bonus "${topic}" già esistente e arricchito. Salto.`);
            continue;
        }

        const prompt = `
            Sei un esperto di fiscalità e incentivi italiani per il sito "FastInfo".
            Fornisci informazioni dettagliate e aggiornate per il seguente bonus in Italia: "${topic}".

            La tua risposta DEVE essere un singolo oggetto JSON valido con queste chiavi esatte:
            - "title": Il nome ufficiale e corretto del bonus.
            - "description": Una descrizione dettagliata di 2-3 paragrafi che spiega cos'è e come funziona.
            - "category": La categoria più appropriata tra "Famiglia", "Lavoro", "Casa", "Mobilità", "Fiscale".
            - "amount": L'importo massimo o il tipo di incentivo (es. "fino a €500", "Detrazione 50%").
            - "target": Una breve frase che descrive a chi è rivolto (es. "Giovani under 36", "Famiglie con ISEE basso").
            - "expiresAt": La data di scadenza del bonus nel formato YYYY-MM-DD. Se non ha una scadenza fissa o è strutturale, metti "2025-12-31".
            - "howToApply": Una descrizione pratica su come fare domanda (es. "Tramite il portale INPS con SPID", "Direttamente in fattura dal rivenditore").
        `;

        process.stdout.write(`(${i + 1}/${bonusTopics.length}) 🧠 Genero dati per: "${topic}"... `);

        try {
            const response = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [{ role: "user", content: prompt }],
                response_format: { type: "json_object" },
            });

            const bonusData = JSON.parse(response.choices[0].message.content);

            // Se il bonus esiste ma non è arricchito, lo aggiorniamo. Altrimenti lo creiamo.
            if (existingBonus) {
                await prisma.bonus.update({
                    where: { id: existingBonus.id },
                    data: { ...bonusData, expiresAt: new Date(bonusData.expiresAt) }
                });
                process.stdout.write('🔄 Aggiornato!\n');
            } else {
                await prisma.bonus.create({
                    data: { ...bonusData, expiresAt: new Date(bonusData.expiresAt) }
                });
                process.stdout.write('✅ Creato!\n');
            }
        } catch (error) {
            process.stdout.write(`🔥 Errore API.\n`);
            console.error(`  -> Errore per ${topic}:`, error.message);
        }
        await sleep(DELAY);
    }
    console.log('\n\n🎉 Processo bonus completato!');
}

enrichAndCreateBonuses().finally(async () => await prisma.$disconnect());
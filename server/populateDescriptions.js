// server/populateDescriptions.js

import mysql from 'mysql2/promise';
import axios from 'axios';

// --- CONFIGURAZIONE ---
// Modifica queste righe se il tuo utente o password del database sono diversi
const dbConfig = {
    host: '127.0.0.1',
    user: 'root',
    password: '1341992necko', // La tua password
    database: 'fastinfo'
};
// --------------------

// Funzione per fare una pausa tra una richiesta e l'altra (per non sovraccaricare l'API di Wikipedia)
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Funzione per pulire il testo ricevuto da Wikipedia
const cleanWikipediaText = (text) => {
    if (!text) return 'Descrizione non disponibile.';
    // Rimuove le parentesi con contenuto (es. " (ascolta[?·info])")
    let cleanedText = text.replace(/\s*\(.*?\)\s*/g, ' ');
    // Rimuove i riferimenti numerici (es. "[1]")
    cleanedText = cleanedText.replace(/\[\d+\]/g, '');
    // Rimuove i tag HTML
    cleanedText = cleanedText.replace(/<\/?[^>]+(>|$)/g, "");
    // Rimuove spazi multipli
    cleanedText = cleanedText.replace(/\s\s+/g, ' ').trim();
    return cleanedText;
};

async function populateDescriptions() {
    let connection;
    try {
        console.log('🔌 Connessione al database...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connesso!');

        console.log('🔎 Cerco i comuni con descrizione mancante o standard...');

        // --- QUERY MIGLIORATA ---
        // Ora cerca i comuni dove la descrizione è:
        // 1. NULL (non è mai stata toccata)
        // 2. Vuota ('')
        // 3. Contiene la nostra frase di default
        const [comuniToUpdate] = await connection.execute(
            "SELECT id, name FROM comune WHERE description IS NULL OR description = '' OR description = 'Descrizione non disponibile.'"
        );

        if (comuniToUpdate.length === 0) {
            console.log('🎉 Tutti i comuni sembrano avere una descrizione valida. Lavoro terminato!');
            return;
        }

        console.log(` trovati ${comuniToUpdate.length} comuni da ri-controllare. Inizio il processo...`);

        for (let i = 0; i < comuniToUpdate.length; i++) {
            const comune = comuniToUpdate[i];
            const WIKIPEDIA_API_URL = `https://it.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&format=json&redirects=1&titles=${encodeURIComponent(comune.name)}`;

            try {
                const response = await axios.get(WIKIPEDIA_API_URL);
                const pages = response.data.query.pages;
                const pageId = Object.keys(pages)[0];

                let descriptionToSave = 'Descrizione non disponibile.'; // Valore di default

                if (pageId && pageId !== '-1' && pages[pageId].extract) {
                    const extract = pages[pageId].extract;
                    descriptionToSave = cleanWikipediaText(extract);
                } else {
                    process.stdout.write(`❌ Non trovato su Wikipedia: ${comune.name}\n`);
                }

                // Aggiorna comunque, anche se non trova, per evitare di ricontrollarlo
                await connection.execute(
                    'UPDATE comune SET description = ? WHERE id = ?',
                    [descriptionToSave, comune.id]
                );

                if (descriptionToSave !== 'Descrizione non disponibile.') {
                    process.stdout.write(`✅ Aggiornato: ${comune.name}\n`);
                }

            } catch (error) {
                console.error(`\n🔥 Errore durante l'aggiornamento di ${comune.name}:`, error.message);
            }

            await sleep(200);
        }

        console.log('\n\n🎉 Processo di popolamento completato con successo!');

    } catch (error) {
        console.error('\n\n🔥🔥 ERRORE CRITICO:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Connessione al database chiusa.');
        }
    }
}

populateDescriptions();
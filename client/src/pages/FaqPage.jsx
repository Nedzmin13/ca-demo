import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react'; // <-- Importa l'icona per il box contatti
import Accordion from '../components/Accordion';

const faqData = [
    {
        question: 'Siete un ente governativo o ufficiale?',
        answer: 'No. <strong>ComuniAmo</strong> è un portale web privato e indipendente. Il nostro obiettivo è semplificare la burocrazia e fornire informazioni utili ai cittadini. Non siamo in alcun modo collegati a Ministeri, INPS, Agenzia delle Entrate o altri enti pubblici statali.'
    },
    {
        question: 'Le vostre guide sostituiscono il parere di un professionista?',
        answer: 'Assolutamente no. Le nostre guide (in particolare quelle su fisco, tasse e bonus) hanno scopo puramente divulgativo. Facciamo il massimo sforzo per mantenerle accurate e aggiornate, ma le normative cambiano frequentemente. Ti consigliamo sempre di verificare i requisiti sui siti ufficiali o di consultare un CAF/Commercialista prima di prendere decisioni definitive.'
    },
    {
        question: 'Posso trovare informazioni su tutti i comuni d\'Italia?',
        answer: 'Sì, il nostro obiettivo è coprire tutti i quasi 8000 comuni italiani. Puoi navigare attraverso la sezione <a href="/viaggio" class="text-sky-600 hover:text-sky-800 underline">Viaggio</a>, partendo dalla tua regione di interesse, oppure usare la barra di ricerca in alto a destra per trovare direttamente il comune che cerchi.'
    },
    {
        question: 'Le informazioni sui bonus sono aggiornate?',
        answer: 'Assolutamente. Lavoriamo costantemente per verificare le scadenze, i requisiti e le modalità di richiesta di tutti i bonus presenti sul sito. La data di ultimo aggiornamento è spesso indicata nella pagina, ma puoi fare affidamento sul fatto che le informazioni sono tra le più recenti disponibili.'
    },
    {
        question: 'Come trovo una guida specifica in "Pratiche Utili" o "Come Fare"?',
        answer: 'Puoi navigare nelle due sezioni direttamente dal menu principale. Ogni sezione è divisa in macro-categorie (es. "Fisco e Tasse", "Tecnologia & Informatica") per aiutarti a trovare rapidamente l\'argomento che ti interessa. In alternativa, la barra di ricerca globale è il modo più veloce per trovare una guida specifica.'
    },
    {
        question: 'Cosa devo fare se trovo un orario, un indirizzo o un\'informazione inesatta?',
        answer: 'Gestiamo e aggiorniamo decine di migliaia di Punti di Interesse in tutta Italia. Se noti un\'inesattezza (ad esempio un negozio che ha cambiato orario o si è trasferito), ti chiediamo la cortesia di segnalarcelo scrivendo a <strong>info@comuniamo.it</strong>. Il nostro team verificherà e correggerà il dato il prima possibile.'
    },
    {
        question: 'Posso suggerire un nuovo articolo o una guida?',
        answer: 'Certamente! I suggerimenti dei nostri lettori sono preziosi. Se c\'è un argomento che vorresti veder trattato, scrivici una mail a <strong>info@comuniamo.it</strong> con la tua idea. La prenderemo in seria considerazione.'
    },
    {
        question: 'Utilizzate link di affiliazione?',
        answer: 'Sì, in alcune sezioni come "Affari & Sconti" o in alcune guide, potremmo utilizzare link di affiliazione. Questo significa che se acquisti un prodotto o servizio tramite i nostri link, potremmo ricevere una piccola commissione senza alcun costo aggiuntivo per te. Questo ci aiuta a sostenere i costi del sito e a mantenere i contenuti gratuiti. Per maggiori dettagli, consulta i nostri <a href="/termini-e-condizioni" class="text-sky-600 hover:text-sky-800 underline">Termini e Condizioni</a>.'
    },
    {
        question: 'Come posso contattarvi per collaborazioni o affiliate marketing?',
        answer: 'Siamo sempre aperti a nuove collaborazioni! Per proposte di affiliate marketing, partnership o altre sinergie, ti invitiamo a scriverci direttamente all\'indirizzo email <strong>info@infosubito.it</strong>. Analizzeremo la tua proposta e ti risponderemo il prima possibile.'
    }
];

function FaqPage() {
    return (
        <>
            <Helmet>
                <title>FAQ - Domande Frequenti | InfoSubito.it</title>
                <meta name="description" content="Trova le risposte alle domande più comuni su InfoSubito: come funziona il sito, trasparenza, affiliazioni e segnalazione errori." />
            </Helmet>
            <div className="bg-gray-50 py-12 min-h-screen">
                <div className="container mx-auto px-4 max-w-4xl">

                    {/* Intestazione */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">Domande Frequenti (FAQ)</h1>
                        <p className="mt-4 text-lg text-gray-600">Trova qui le risposte alle domande più comuni sul nostro sito e sui nostri servizi.</p>
                    </div>

                    {/* Lista FAQ con il tuo componente Accordion */}
                    <div className="max-w-3xl mx-auto bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 mb-12">
                        {faqData.map((item, index) => (
                            <Accordion key={index} title={item.question}>
                                <div className="text-gray-600 leading-relaxed py-2" dangerouslySetInnerHTML={{ __html: item.answer }} />
                            </Accordion>
                        ))}
                    </div>

                    {/* BOX CONTATTO FINALE */}
                    <div className="max-w-3xl mx-auto bg-sky-50 rounded-2xl border border-sky-100 p-8 text-center flex flex-col items-center shadow-sm">
                        <div className="bg-sky-100 p-4 rounded-full text-sky-600 mb-4">
                            <Mail size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Non hai trovato la risposta che cercavi?</h3>
                        <p className="text-gray-600 mb-6 max-w-lg mx-auto">
                            Il nostro team è sempre a disposizione per aiutarti, ascoltare suggerimenti o valutare proposte di collaborazione.
                        </p>
                        <a
                            href="mailto:info@infosubito.it"
                            className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-8 rounded-full shadow-md transition-transform hover:-translate-y-1 inline-block"
                        >
                            Scrivici un'email
                        </a>
                    </div>

                </div>
            </div>
        </>
    );
}

export default FaqPage;
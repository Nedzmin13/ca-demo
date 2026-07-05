import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Target, Eye, Rocket } from 'lucide-react';

function ChiSiamoPage() {
    return (
        <>
            <Helmet>
                <title>Chi Siamo - La Missione di ComuniAmo.it</title>
                <meta name="description" content="Scopri la storia e la missione di ComuniAmo.it: il portale nato per semplificare la vita degli italiani con guide chiare, notizie utili e informazioni verificate." />
            </Helmet>

            <div className="bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-sky-600">La Nostra Missione</h1>
                        <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                            Semplificare la complessità della vita in Italia, fornendo a tutti uno strumento chiaro, affidabile e immediato.
                        </p>
                    </div>

                    <div className="mt-16 prose max-w-4xl mx-auto text-lg text-gray-700">
                        <h2>Chi Siamo</h2>
                        <p>
                            <strong>ComuniAmo.it</strong> nasce da un'idea semplice ma potente: creare un unico punto di riferimento per chiunque cerchi informazioni pratiche e verificate per vivere, viaggiare e gestire la quotidianità in Italia. In un mondo pieno di dati frammentati e burocrazia complessa, il nostro obiettivo è offrire risposte chiare e soluzioni a portata di click.
                        </p>
                        <p>
                            Il progetto è portato avanti da professionisti del settore digitale e appassionati del territorio italiano. Lavoriamo ogni giorno per organizzare dati, scrivere guide passo-passo e mappare i servizi essenziali da Nord a Sud, mettendo sempre l'utente al centro.
                        </p>

                        <h2>Cosa Facciamo</h2>
                        <p>Ogni giorno, lavoriamo per:</p>
                        <ul>
                            <li><strong>Ricercare e Verificare</strong>: Analizziamo costantemente normative, offerte, agevolazioni e dati locali per fornirti solo contenuti accurati e aggiornati.</li>
                            <li><strong>Semplificare</strong>: Traduciamo il "burocratese" in guide pratiche facili da seguire, che ti accompagnano dalla A alla Z.</li>
                            <li><strong>Ispirare</strong>: Ti guidiamo alla scoperta delle bellezze d'Italia con itinerari e destinazioni pensate per ogni tipo di viaggiatore.</li>
                        </ul>

                        <h2>La Nostra Visione</h2>
                        <p>
                            Sogniamo un'Italia in cui ogni cittadino, residente o visitatore possa accedere alle informazioni di cui ha bisogno in modo rapido e senza stress. Vogliamo essere la tua "bussola" digitale, il compagno di viaggio affidabile che ti aiuta a risolvere problemi pratici e a goderti al meglio tutto ciò che l'Italia ha da offrire.
                        </p>
                    </div>

                    <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        <div className="border border-gray-100 shadow-sm p-8 rounded-xl bg-gray-50 hover:shadow-md transition">
                            <Target size={40} className="mx-auto text-sky-500 mb-4"/>
                            <h3 className="text-2xl font-bold text-gray-800">Affidabilità</h3>
                            <p className="text-gray-600 mt-2 text-sm">Verifichiamo ogni informazione per darti solo contenuti sicuri e aggiornati.</p>
                        </div>
                        <div className="border border-gray-100 shadow-sm p-8 rounded-xl bg-gray-50 hover:shadow-md transition">
                            <Eye size={40} className="mx-auto text-sky-500 mb-4"/>
                            <h3 className="text-2xl font-bold text-gray-800">Chiarezza</h3>
                            <p className="text-gray-600 mt-2 text-sm">Trasformiamo procedure complesse in guide semplici e comprensibili per tutti.</p>
                        </div>
                        <div className="border border-gray-100 shadow-sm p-8 rounded-xl bg-gray-50 hover:shadow-md transition">
                            <Rocket size={40} className="mx-auto text-sky-500 mb-4"/>
                            <h3 className="text-2xl font-bold text-gray-800">Immediatezza</h3>
                            <p className="text-gray-600 mt-2 text-sm">Il nostro obiettivo è darti le risposte che cerchi nel modo più veloce e diretto possibile.</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ChiSiamoPage;
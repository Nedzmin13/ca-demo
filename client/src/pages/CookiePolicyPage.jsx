import React from 'react';
import { Helmet } from 'react-helmet-async';

function CookiePolicyPage() {
    return (
        <>
            <Helmet>
                <title>Cookie Policy - ComuniAmo.it</title>
            </Helmet>
            <div className="bg-white py-12">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="prose max-w-none text-gray-700">
                        <h1 className="text-3xl font-extrabold text-gray-900 mb-4">Cookie Policy di ComuniAmo.it</h1>
                        <p className="text-sm text-gray-500 mb-8">Ultimo aggiornamento: 10 Giugno 2026</p>

                        <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Cosa sono i cookie?</h2>
                        <p>I cookie sono piccoli file di testo che i siti web salvano nel dispositivo dell’utente durante la navigazione. Servono per riconoscere il dispositivo, ricordare le preferenze dell’utente e offrire funzionalità avanzate o contenuti personalizzati.</p>

                        <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Tipologie di Cookie Utilizzate</h2>
                        <p>Questo Sito utilizza le seguenti categorie di cookie:</p>
                        <ul>
                            <li>
                                <strong>Cookie Tecnici (Necessari):</strong> consentono il corretto funzionamento del sito e la memorizzazione delle preferenze espresse dall’utente (es. scelta della lingua, consenso ai cookie). Non richiedono consenso.
                            </li>
                            <li>
                                <strong>Cookie Analitici (di Terze Parti):</strong> in futuro potremmo utilizzare strumenti come Google Analytics per raccogliere dati anonimi sull’uso del sito. Questi cookie saranno attivati solo previo tuo consenso.
                            </li>
                            <li>
                                <strong>Cookie di Profilazione (di Terze Parti):</strong> potremmo integrare elementi multimediali (es. video YouTube), mappe interattive, pulsanti social o link affiliati. Tali servizi possono installare cookie per il tracciamento e la pubblicità personalizzata. Questi saranno attivati solo se accetti esplicitamente.
                            </li>
                        </ul>

                        {/* ▼▼▼ SEZIONE AGGIUNTA PER GOOGLE ADSENSE ▼▼▼ */}
                        <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Cookie Pubblicitari di Google (Google AdSense)</h2>
                        <p>Questo sito utilizza Google AdSense per mostrare annunci pubblicitari. Google utilizza i cookie per mostrare annunci pertinenti in base alle tue visite precedenti su questo sito o su altri siti web.</p>
                        <ul>
                            <li>L'uso dei cookie pubblicitari consente a Google e ai suoi partner di mostrarti annunci basati sulla tua navigazione su Internet.</li>
                            <li>Puoi scegliere di disattivare la pubblicità personalizzata visitando la pagina <a href="https://myadcenter.google.com/" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline">Impostazioni annunci di Google</a>.</li>
                        </ul>
                        {/* ▲▲▲ FINE SEZIONE ADSENSE ▲▲▲ */}

                        <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Gestione del Consenso</h2>
                        <p>Alla tua prima visita, viene mostrato un banner per la gestione dei cookie. Puoi:</p>
                        <ul>
                            <li>Accettare tutti i cookie</li>
                            <li>Rifiutare quelli non necessari</li>
                            <li>Personalizzare le preferenze</li>
                        </ul>
                        <p>Puoi modificare le tue preferenze o revocare il consenso in qualsiasi momento cancellando i cookie dal tuo browser per far riapparire il banner.</p>

                        <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Come Disabilitare i Cookie dal Browser</h2>
                        <p>Puoi gestire o disabilitare i cookie direttamente dalle impostazioni del tuo browser. Di seguito trovi i link alle istruzioni per i principali browser:</p>
                        <ul>
                            <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline">Google Chrome</a></li>
                            <li><a href="https://support.mozilla.org/it/kb/Gestione%20dei%20cookie" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline">Mozilla Firefox</a></li>
                            <li><a href="https://support.apple.com/it-it/HT201265" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline">Safari</a></li>
                            <li><a href="https://support.microsoft.com/it-it/help/17442" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline">Microsoft Edge</a></li>
                        </ul>

                        <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Titolare del Trattamento</h2>
                        <p className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            Il titolare del trattamento dei dati è: <br />
                            <strong>Nedzmin Cancar</strong><br />
                            P.IVA: <strong>04581990241</strong><br /> {/* Assicurati che sia giusta! */}
                            Email: <strong>info@infosubito.it</strong><br />
                        </p>

                        <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Modifiche a questa Policy</h2>
                        <p>Ci riserviamo il diritto di aggiornare questa Cookie Policy in caso di modifiche tecniche o normative. Ti invitiamo a consultarla periodicamente.</p>
                    </div>
                </div>
            </div>
        </>
    );
}

export default CookiePolicyPage;
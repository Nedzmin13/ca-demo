import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

function PrivacyPolicyPage() {
    return (
        <>
            <Helmet>
                <title>Privacy Policy - ComuniAmo.it</title>
            </Helmet>
            <div className="bg-white py-12">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="prose max-w-none text-gray-700">
                        <h1 className="text-3xl font-extrabold text-gray-900 mb-4">Privacy Policy di ComuniAmo.it</h1>
                        <p className="text-sm text-gray-500 mb-8">Ultimo aggiornamento: 10 Giugno 2026</p>

                        <p>La presente informativa descrive le modalità di raccolta, utilizzo e condivisione dei tuoi dati personali quando visiti o interagisci con il sito web <strong>https://comuniamo.it</strong> (di seguito, il "Sito").</p>

                        <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Titolare del Trattamento</h2>
                        <p>Il titolare del trattamento dei dati personali è il gestore di ComuniAmo.it. Puoi contattarci via email all'indirizzo: <strong>info@comuniamo.it</strong>.</p>

                        <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Dati Personali Raccolti</h2>
                        <p>Quando visiti il Sito, raccogliamo automaticamente alcune informazioni relative al tuo dispositivo, come:</p>
                        <ul>
                            <li>Indirizzo IP</li>
                            <li>Tipo di browser e dispositivo</li>
                            <li>Fuso orario</li>
                            <li>Pagine visitate e durata della visita</li>
                            <li>Cookie installati</li>
                        </ul>
                        <p>Inoltre, quando ti iscrivi alla nostra newsletter o ci contatti, raccogliamo dati come il tuo indirizzo email.</p>
                        <p>Con il tuo consenso, possiamo raccogliere anche dati sulla tua posizione approssimativa (es. comune o città) per personalizzare i contenuti visualizzati.</p>

                        <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Finalità del Trattamento</h2>
                        <p>Utilizziamo i tuoi Dati Personali per:</p>
                        <ul>
                            <li>Inviarti la newsletter, aggiornamenti e comunicazioni informative</li>
                            <li>Personalizzare i contenuti sulla base della tua posizione</li>
                            <li>Analizzare l’utilizzo del sito per migliorarne l’esperienza</li>
                            <li>Mostrare annunci pubblicitari pertinenti</li>
                        </ul>

                        <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Cookie e Tecnologie di Tracciamento</h2>
                        <p>Utilizziamo cookie tecnici, statistici e, previo consenso, cookie di profilazione. Per maggiori dettagli, consulta la nostra <Link to="/cookie-policy" className="text-sky-600 hover:underline">Cookie Policy</Link>.</p>

                        {/* ▼▼▼ SEZIONE AGGIUNTA PER GOOGLE ADSENSE ▼▼▼ */}
                        <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Pubblicità (Google AdSense)</h2>
                        <p>Utilizziamo Google AdSense come fornitore di terze parti per pubblicare annunci sul nostro Sito. Questo ci permette di mantenere il servizio gratuito per gli utenti.</p>
                        <ul>
                            <li>Fornitori di terze parti, tra cui Google, utilizzano cookie per pubblicare annunci in base alle precedenti visite dell'utente al nostro sito web o ad altri siti web.</li>
                            <li>L'utilizzo dei cookie per la pubblicità consente a Google e ai suoi partner di pubblicare annunci per i nostri utenti in base alla loro navigazione sui nostri siti e/o su altri siti Internet.</li>
                            <li>Gli utenti possono scegliere di disattivare la pubblicità personalizzata visitando la pagina <a href="https://myadcenter.google.com/" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline">Impostazioni annunci</a>. In alternativa, puoi disattivare l'uso di cookie di terze parti per la pubblicità personalizzata visitando il sito <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline">www.aboutads.info</a>.</li>
                        </ul>
                        <p>Per maggiori informazioni su come Google raccoglie e utilizza i dati, ti invitiamo a consultare le <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline">Norme sulla privacy e sui termini di Google</a>.</p>
                        {/* ▲▲▲ FINE SEZIONE ADSENSE ▲▲▲ */}

                        <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Servizi di Terze Parti</h2>
                        <p>Il sito utilizza servizi di terze parti che possono raccogliere dati personali, come Google Analytics (analisi del traffico) o plugin per mappe e meteo. Questi fornitori operano come responsabili esterni e sono vincolati a rispettare le normative vigenti in materia di privacy.</p>

                        <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Marketing e Programmi di Affiliazione</h2>
                        <p>Alcuni contenuti (es. nella sezione "Affari e Sconti") possono contenere link affiliati o sponsorizzati. Se clicchi su tali link o effettui un acquisto, potremmo ricevere una commissione, senza costi aggiuntivi per te.</p>

                        <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Attribuzione delle Immagini</h2>
                        <p>Le immagini dei comuni d’Italia sono tratte da <strong>Wikipedia (Wikimedia Commons)</strong> e usate secondo le licenze <em>Creative Commons</em>. Le attribuzioni sono indicate nelle gallerie fotografiche sotto l'icona "Info". Altre immagini provengono da servizi liberi da royalty o sono state fornite dagli autori.</p>

                        <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">I Tuoi Diritti</h2>
                        <p>In base al GDPR, hai il diritto di accedere ai tuoi dati personali, chiederne la rettifica o la cancellazione, opporti al trattamento o richiederne la portabilità. Per esercitare i tuoi diritti, puoi scrivere a <strong>info@infosubito.it</strong>.</p>
                    </div>
                </div>
            </div>
        </>
    );
}

export default PrivacyPolicyPage;
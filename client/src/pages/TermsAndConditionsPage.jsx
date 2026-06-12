


import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

function TermsAndConditionsPage() {
    return (
        <>
            <Helmet>
                <title>Termini e Condizioni - InfoSubito.it</title>
            </Helmet>
            <div className="bg-white py-12">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="prose max-w-none">
                        <h1>Termini e Condizioni d'Uso di ComuniAmo.it</h1>
                        <p>Ultimo aggiornamento: 10 Giugno 2026</p>

                        <h2>1. Introduzione</h2>
                        <p>Benvenuto su <strong>ComuniAmo.it</strong>. Accedendo o utilizzando questo sito web, accetti di essere vincolato dai presenti Termini e Condizioni d’Uso. Se non accetti integralmente tali termini, ti invitiamo a non utilizzare il sito.</p>

                        <h2>2. Finalità del Sito</h2>
                        <p>InfoSubito.it è un portale informativo che fornisce guide, notizie, aggiornamenti locali e contenuti utili riguardanti la vita quotidiana in Italia. Le informazioni sono fornite a scopo puramente informativo e non costituiscono consulenza professionale, legale o fiscale.</p>

                        <h2>3. Proprietà Intellettuale</h2>
                        <p>Salvo diversa indicazione, tutti i contenuti presenti su InfoSubito.it (testi, loghi, grafica, layout) sono di proprietà del titolare del sito e sono protetti dalle leggi italiane e internazionali sul diritto d'autore.</p>
                        <p>È vietata la copia, riproduzione o distribuzione, totale o parziale, dei contenuti senza autorizzazione scritta. Le immagini provenienti da fonti esterne (come Wikipedia) sono utilizzate nel rispetto delle relative licenze Creative Commons, con attribuzione dove necessario.</p>

                        <h2>4. Collegamenti Esterni e Link di Affiliazione</h2>
                        <p>Alcune sezioni del sito possono contenere link a siti esterni, inclusi link di affiliazione. In questi casi, potremmo ricevere una commissione in caso di acquisti effettuati tramite i link, senza alcun costo aggiuntivo per te. Non siamo responsabili dei contenuti, prodotti o servizi offerti da terze parti.</p>

                        <h2>5. Limitazione di Responsabilità</h2>
                        <p>Pur impegnandoci a mantenere aggiornate e accurate le informazioni presenti sul sito, InfoSubito.it non garantisce l’assenza di errori, omissioni o interruzioni. L’uso dei contenuti è sotto la tua piena responsabilità. Decliniamo ogni responsabilità per eventuali danni diretti o indiretti derivanti dall’uso del sito.</p>

                        <h2>6. Modifiche ai Termini</h2>
                        <p>Ci riserviamo il diritto di modificare i presenti Termini e Condizioni in qualsiasi momento, pubblicando la versione aggiornata su questa pagina. L’uso continuato del sito dopo tali modifiche implica l’accettazione delle nuove condizioni.</p>

                        <h2>7. Legge Applicabile</h2>
                        <p>Questi Termini e Condizioni sono disciplinati dalla legge italiana. In caso di controversie, il foro competente sarà quello del luogo di residenza del titolare, salvo diversa disposizione di legge.</p>

                        <h2>8. Titolare del Sito</h2>
                        <p>
                            Questo sito è gestito da:<br />
                            <strong>Nedzmin Cancar</strong><br />
                            P.IVA: <strong>04581990241</strong><br />
                            Email: <strong>info@comuniamo.it</strong><br />
                        </p>

                        <h2>9. Contatti</h2>
                        <p>Per domande o richieste relative ai presenti termini, puoi scrivere a <strong>info@comuniamo.it</strong>.</p>

                        <p>Consulta anche la nostra <Link to="/privacy-policy">Privacy Policy</Link> e la <Link to="/cookie-policy">Cookie Policy</Link>.</p>
                    </div>
                </div>
            </div>
        </>
    );
}

export default TermsAndConditionsPage;

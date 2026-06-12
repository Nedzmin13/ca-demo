import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function CookieBanner() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Controlla se l'utente ha già accettato
        const consent = localStorage.getItem('cookie_consent');
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        // Salva la scelta dell'utente per 1 anno
        localStorage.setItem('cookie_consent', 'true');
        setIsVisible(false);
    };

    if (!isVisible) {
        return null;
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 z-50 shadow-lg">
            <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
                <p className="text-sm text-center sm:text-left">
                    Questo sito utilizza cookie tecnici per funzionare. Continuando la navigazione, accetti il loro utilizzo. Per maggiori informazioni, consulta la nostra
                    <Link to="/privacy-policy" className="underline hover:text-sky-400 mx-1">Privacy Policy</Link> e
                    <Link to="/cookie-policy" className="underline hover:text-sky-400 ml-1">Cookie Policy</Link>.
                </p>
                <button
                    onClick={handleAccept}
                    className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-6 rounded-lg flex-shrink-0"
                >
                    Ho Capito
                </button>
            </div>
        </div>
    );
}
export default CookieBanner;
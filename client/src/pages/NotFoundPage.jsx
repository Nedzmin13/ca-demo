import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { SearchX } from 'lucide-react'; // Un'icona adatta per "non trovato"

function NotFoundPage() {
    return (
        <>
            <Helmet>
                <title>404 - Pagina Non Trovata | ComuniAmo.it</title>
            </Helmet>
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="bg-white p-10 rounded-xl shadow-md border">
                    <SearchX size={64} className="mx-auto text-sky-500" strokeWidth={1.5} />
                    <h1 className="mt-6 text-4xl font-extrabold text-gray-800 tracking-tight">
                        404 - Pagina Non Trovata
                    </h1>
                    <p className="mt-4 text-lg text-gray-600">
                        Oops! Sembra che la pagina che stai cercando non esista o sia stata spostata.
                    </p>
                    <Link
                        to="/"
                        className="mt-8 inline-block bg-sky-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-sky-700 transition-colors"
                    >
                        Torna alla Homepage
                    </Link>
                </div>
            </div>
        </>
    );
}

export default NotFoundPage;
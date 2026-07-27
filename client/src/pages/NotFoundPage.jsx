import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Home } from 'lucide-react';

function NotFoundPage() {
    return (
        <>
            <Helmet>
                <title>Pagina Non Trovata | ComuniAmo</title>
                {/* ▼▼▼ LA MAGIA È QUI: DICE A GOOGLE DI SCARTARE QUESTA PAGINA ▼▼▼ */}
                <meta name="robots" content="noindex, nofollow" />
                {/* ▲▲▲ ▲▲▲ ▲▲▲ ▲▲▲ ▲▲▲ ▲▲▲ ▲▲▲ ▲▲▲ ▲▲▲ */}
            </Helmet>
            <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center bg-gray-50">
                <h1 className="text-9xl font-extrabold text-sky-600 tracking-tight">404</h1>
                <h2 className="text-3xl font-bold text-gray-900 mt-4 mb-2">Ops! Pagina non trovata</h2>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    Sembra che la pagina che stai cercando non esista o sia stata spostata.
                </p>
                <Link
                    to="/"
                    className="flex items-center gap-2 px-6 py-3 bg-sky-600 text-white rounded-full font-bold hover:bg-sky-700 transition shadow-md"
                >
                    <Home size={20} />
                    Torna alla Homepage
                </Link>
            </div>
        </>
    );
}

export default NotFoundPage;
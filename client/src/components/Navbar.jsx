import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom'; // <-- Aggiunto useLocation
import { Menu, X } from 'lucide-react';
import { GlobalSearchBar } from './GlobalSearchBar';
import logo from '../assets/logo.png';

function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Inizializza l'ascoltatore della posizione (l'URL attuale)
    const location = useLocation();

    // ▼▼▼ LA SOLUZIONE DEFINITIVA ▼▼▼
    // Questo useEffect si attiva OGNI VOLTA che cambi pagina.
    // Appena la pagina cambia, chiude forzatamente il menu a tendina!
    useEffect(() => {
        setIsMenuOpen(false);
    }, [location]);
    // ▲▲▲ ▲▲▲ ▲▲▲ ▲▲▲ ▲▲▲ ▲▲▲

    const navLinkClass = ({ isActive }) =>
        isActive
            ? 'text-sky-600 font-semibold py-1'
            : 'text-gray-700 hover:text-sky-600 py-1';

    const mobileNavLinkClass = ({ isActive }) =>
        isActive
            ? 'bg-sky-50 text-sky-600 block px-3 py-2 rounded-md text-base font-semibold'
            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium';

    return (
        <header className="bg-white shadow-sm sticky top-0 z-50">
            <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex-shrink-0">
                        <Link to="/" className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-sky-600">ComuniAmo</span>
                            <img src={logo} alt="Logo ComuniAmo" className="h-10 w-10" />
                        </Link>
                    </div>

                    <div className="hidden md:flex md:items-center md:space-x-8">
                        <NavLink to="/" className={navLinkClass} end>Home</NavLink>
                        <NavLink to="/viaggio" className={navLinkClass}>Viaggio</NavLink>
                        <NavLink to="/affari-sconti" className={navLinkClass}>Affari & Sconti</NavLink>
                        <NavLink to="/bonus" className={navLinkClass}>Bonus</NavLink>
                        <NavLink to="/top-destinazioni" className={navLinkClass}>Top Destinazioni</NavLink>
                        <NavLink to="/pratiche-utili" className={navLinkClass}>Pratiche Utili</NavLink>
                        <NavLink to="/come-fare" className={navLinkClass}>Come Fare</NavLink>
                        {/* Nota: Ho aggiornato il nome da "Notizie Utili" a "Servizi Utili" per coerenza col resto */}
                        <NavLink to="/notizie-utili" className={navLinkClass}>Servizi Utili</NavLink>
                    </div>

                    <div className="hidden sm:block w-64">
                        {/* Qui usiamo la barra normale */}
                        <GlobalSearchBar />
                    </div>

                    <div className="md:hidden flex items-center">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Apri menu">
                            {isMenuOpen ? <X size={28}/> : <Menu size={28}/>}
                        </button>
                    </div>
                </div>
            </nav>

            {isMenuOpen && (
                <div className="md:hidden border-t bg-white absolute w-full left-0 shadow-lg z-40">
                    <div className="px-4 pt-4 pb-6 space-y-4 h-screen overflow-y-auto">
                        <div className="mb-4">
                            {/* Ora non serve più impazzire con funzioni strane, la barra è quella pulita! */}
                            <GlobalSearchBar />
                        </div>

                        {/* Ho tolto tutti i vecchi onClick={() => setIsMenuOpen(false)} perché ora ci pensa useEffect! */}
                        <NavLink to="/" className={mobileNavLinkClass}>Home</NavLink>
                        <NavLink to="/viaggio" className={mobileNavLinkClass}>Viaggio</NavLink>
                        <NavLink to="/affari-sconti" className={mobileNavLinkClass}>Affari & Sconti</NavLink>
                        <NavLink to="/bonus" className={mobileNavLinkClass}>Bonus</NavLink>
                        <NavLink to="/top-destinazioni" className={mobileNavLinkClass}>Top Destinazioni</NavLink>
                        <NavLink to="/pratiche-utili" className={mobileNavLinkClass}>Pratiche Utili</NavLink>
                        <NavLink to="/come-fare" className={mobileNavLinkClass}>Come Fare</NavLink>
                        <NavLink to="/notizie-utili" className={mobileNavLinkClass}>Servizi Utili</NavLink>
                    </div>
                </div>
            )}
        </header>
    );
}

export default Navbar;
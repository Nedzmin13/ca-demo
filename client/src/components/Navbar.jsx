import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { GlobalSearchBar } from './GlobalSearchBar';
import logo from '../assets/logo.png';

function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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
                        {/* --- 2. MODIFICA IL LINK PRINCIPALE --- */}
                        <Link to="/" className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-sky-600">ComuniAmo</span>
                            <img src={logo} alt="Logo InfoSubito" className="h-10 w-10" />
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
                        <NavLink to="/notizie-utili" className={navLinkClass}>Servizi Utili</NavLink>
                    </div>

                    <div className="hidden sm:block w-64">
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
                <div className="md:hidden border-t bg-white">
                    <div className="px-4 pt-4 pb-6 space-y-4">
                        {/* ▼ AGGIUNTA LA FUNZIONE PER CHIUDERE IL MENU ▼ */}
                        <div className="mb-4">
                            <GlobalSearchBar onSearchComplete={() => setIsMenuOpen(false)} />
                        </div>
                        <NavLink to="/" className={mobileNavLinkClass} onClick={() => setIsMenuOpen(false)}>Home</NavLink>
                        <NavLink to="/viaggio" className={mobileNavLinkClass} onClick={() => setIsMenuOpen(false)}>Viaggio</NavLink>
                        <NavLink to="/affari-sconti" className={mobileNavLinkClass} onClick={() => setIsMenuOpen(false)}>Affari & Sconti</NavLink>
                        <NavLink to="/bonus" className={mobileNavLinkClass} onClick={() => setIsMenuOpen(false)}>Bonus</NavLink>
                        <NavLink to="/top-destinazioni" className={mobileNavLinkClass} onClick={() => setIsMenuOpen(false)}>Top Destinazioni</NavLink>
                        <NavLink to="/pratiche-utili" className={mobileNavLinkClass} onClick={() => setIsMenuOpen(false)}>Pratiche Utili</NavLink>
                        <NavLink to="/come-fare" className={mobileNavLinkClass} onClick={() => setIsMenuOpen(false)}>Come Fare</NavLink>
                        <NavLink to="/notizie-utili" className={mobileNavLinkClass} onClick={() => setIsMenuOpen(false)}>Notizie Utili</NavLink>
                    </div>
                </div>
            )}
        </header>
    );
}

export default Navbar;
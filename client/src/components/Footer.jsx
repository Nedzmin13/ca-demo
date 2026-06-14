import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram } from 'lucide-react';
import logo from '../assets/logo.png';

const TikTokIcon = ({ size = 20, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
);

function Footer() {
    return (
        <footer className="bg-slate-900 text-gray-300 py-12 mt-auto border-t border-slate-800">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">

                    {/* 1. SEZIONE BRAND E SOCIAL */}
                    <div className="md:col-span-2 lg:pr-12">
                        <div className="flex items-center gap-3 mb-6">
                            <img src={logo} alt="InfoSubito Logo" className="w-10 h-10 object-contain" />
                            <span className="text-3xl font-extrabold text-white tracking-tight">ComuniAmo</span>
                        </div>
                        <p className="text-sm text-gray-400 mb-8 leading-relaxed max-w-md">
                            Il portale che ti tiene aggiornato su viaggi, offerte, bonus, pratiche utili e servizi per l'Italia.
                        </p>

                        <div className="flex items-center gap-5">
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-sky-500 transition-colors">
                                <Facebook size={22} />
                            </a>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-500 transition-colors">
                                <Instagram size={22} />
                            </a>
                            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                                <TikTokIcon size={22} />
                            </a>
                        </div>
                    </div>

                    {/* 2. LINK UTILI */}
                    <div className="md:col-span-1 lg:pl-8">
                        <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Link Utili</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link to="/chi-siamo" className="hover:text-sky-400 transition-colors">Chi Siamo</Link></li>
                            <li><a href="mailto:info@comuniamo.it" className="hover:text-sky-400 transition-colors">Contatti</a></li>
                            <li><Link to="/faq" className="hover:text-sky-400 transition-colors">FAQ e Assistenza</Link></li>
                        </ul>
                    </div>

                    {/* 3. SEZIONE LEGALE */}
                    <div className="md:col-span-1">
                        <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Legale</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link to="/privacy-policy" className="hover:text-sky-400 transition-colors">Privacy Policy</Link></li>
                            <li><Link to="/cookie-policy" className="hover:text-sky-400 transition-colors">Cookie Policy</Link></li>
                            <li><Link to="/termini-e-condizioni" className="hover:text-sky-400 transition-colors">Termini e Condizioni</Link></li>
                        </ul>
                    </div>

                </div>

                {/* BARRA INFERIORE: Copyright e Testo Marchi impilati */}
                <div className="border-t border-slate-800 mt-16 pt-8 flex flex-col text-sm text-gray-500">
                    <p className="text-center md:text-center">
                        © {new Date().getFullYear()} ComuniAmo.it. Tutti i diritti riservati.
                    </p>
                    <p className="mt-2 text-xs text-center md:text-center text-gray-500">
                        I marchi e i loghi presenti sul sito appartengono ai legittimi proprietari e sono usati a solo scopo informativo.
                    </p>
                </div>

            </div>
        </footer>
    );
}

export default Footer;
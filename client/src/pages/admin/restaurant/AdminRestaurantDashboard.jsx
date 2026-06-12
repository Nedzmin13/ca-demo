import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Utensils, Coffee, Link as LinkIcon } from 'lucide-react';

function AdminRestaurantDashboard() {
    return (
        <>
            <Helmet><title>Gestione Ristorazione - Admin</title></Helmet>

            <h1 className="text-3xl font-bold text-gray-800 mb-8">Gestione Ristorazione & Bar</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* CARD 1: CATENE (Quella che avevi già) */}
                <Link to="/admin/brands/restaurant" className="block bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow border border-gray-100 group">
                    <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center text-orange-600 mb-4 group-hover:scale-110 transition-transform">
                        <LinkIcon size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Catene & Franchising</h2>
                    <p className="text-gray-500 mt-2 text-sm">Gestisci McDonald's, Burger King, Old Wild West e altre catene con più sedi.</p>
                </Link>

                {/* CARD 2: RISTORANTI SINGOLI (Nuova) */}
                <Link to="/admin/ristoranti-list" className="block bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow border border-gray-100 group">
                    <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center text-red-600 mb-4 group-hover:scale-110 transition-transform">
                        <Utensils size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Ristoranti Singoli</h2>
                    <p className="text-gray-500 mt-2 text-sm">Lista completa di tutti i ristoranti indipendenti, pizzerie e trattorie.</p>
                </Link>

                {/* CARD 3: BAR (Nuova) */}
                <Link to="/admin/bar-list" className="block bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow border border-gray-100 group">
                    <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                        <Coffee size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Bar & Caffetterie</h2>
                    <p className="text-gray-500 mt-2 text-sm">Gestisci l'elenco di tutti i bar, pub e caffetterie.</p>
                </Link>

            </div>
        </>
    );
}

export default AdminRestaurantDashboard;
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { fetchOffers } from '../api';
import { Tag, Search, Home, Shirt, ShoppingBasket, Tv, Baby, Heart, Car, Dumbbell, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
};

const categories = [
    { id: 'Elettronica', label: 'Elettronica', icon: <Tv size={16} /> },
    { id: 'Casa', label: 'Casa', icon: <Home size={16} /> },
    { id: 'Abbigliamento', label: 'Abbigliamento', icon: <Shirt size={16} /> },
    { id: 'Alimentari', label: 'Alimentari', icon: <ShoppingBasket size={16} /> },
    { id: 'Bambini', label: 'Bambini', icon: <Baby size={16} /> },
    { id: 'Cosmetici', label: 'Cosmetici', icon: <Heart size={16} /> },
    { id: 'Auto & Moto', label: 'Auto & Moto', icon: <Car size={16} /> },
    { id: 'Sport e Tempo Libero', label: 'Sport e Tempo Libero', icon: <Dumbbell size={16} /> },
];

const OfferCard = ({ offer }) => {
    const getImageUrl = (offer) => {
        if (offer.images && offer.images.length > 0 && offer.images[0].url) {
            return offer.images[0].url;
        }
        return `https://ui-avatars.com/api/?name=${offer.title.replace(/\s/g, '+')}&size=400&background=e0f2fe&color=0891b2`;
    };

    // Calcolo Scadenza
    const getExpiryText = (dateString) => {
        if (!dateString) return null;
        const expiryDate = new Date(dateString);
        const today = new Date();
        const diffTime = expiryDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { text: "Scaduta", color: "bg-gray-100 text-gray-500" };
        if (diffDays === 0) return { text: "Scade OGGI", color: "bg-red-100 text-red-700 animate-pulse" };
        if (diffDays <= 3) return { text: `Scade tra ${diffDays} giorni`, color: "bg-orange-100 text-orange-700" };
        return { text: `Fino al ${expiryDate.toLocaleDateString('it-IT')}`, color: "bg-green-100 text-green-700" };
    };

    const expiryBadge = getExpiryText(offer.expiresAt);

    return (
        <motion.div variants={cardVariants} className="h-full">
            <Link to={`/offerte/${offer.id}`} className="block bg-white rounded-lg shadow-md border overflow-hidden flex flex-col group h-full relative">

                {/* BADGE SCADENZA */}
                {expiryBadge && (
                    <div className={`absolute top-2 right-2 z-10 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm ${expiryBadge.color}`}>
                        <Clock size={12}/> {expiryBadge.text}
                    </div>
                )}

                <div className="overflow-hidden aspect-[4/3] bg-gray-100 p-4 flex items-center justify-center">
                    <img src={getImageUrl(offer)} alt={offer.title} className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105 mix-blend-multiply"/>
                </div>
                <div className="p-4 flex-grow flex flex-col">
                    <h3 className="text-lg font-bold text-gray-800 group-hover:text-sky-600 transition-colors line-clamp-2" title={offer.title}>{offer.title}</h3>
                    <p className="text-sm text-gray-500 mb-2 font-semibold">Venduto da {offer.store}</p>

                    <div
                        className="text-gray-600 flex-grow text-sm min-h-[60px] line-clamp-3 prose prose-sm"
                        dangerouslySetInnerHTML={{ __html: offer.description }}
                    />

                    <div className="mt-4 flex justify-between items-center pt-4 border-t">
                        <span className="text-2xl font-extrabold text-red-600">{offer.discount}</span>
                        <div className="bg-sky-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-sky-700 transition">Vedi Dettagli</div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

function OffersPage() {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ category: null, search: '' });

    useEffect(() => {
        const loadOffers = async () => {
            setLoading(true);
            try {
                const params = {};
                if (filters.category) params.category = filters.category;
                if (filters.search) params.search = filters.search;
                const response = await fetchOffers(params);
                setOffers(response.data);
            } catch (error) { console.error("Errore nel caricare le offerte:", error); }
            finally { setLoading(false); }
        };
        loadOffers();
    }, [filters]);

    const handleCategoryChange = (categoryId) => { setFilters(prev => ({ ...prev, search: '', category: prev.category === categoryId ? null : categoryId })); };
    const handleSearchChange = (e) => { setFilters(prev => ({ ...prev, category: null, search: e.target.value })); };

    return (
        <>
            <Helmet>
                <title>Affari & Sconti - Offerte Aggiornate in Italia | ComuniAmo</title>
                <meta name="description" content="Scopri le migliori offerte e sconti dai principali negozi italiani. Categorie: Elettronica, Casa, Abbigliamento e altro. Aggiornamenti in tempo reale." />
            </Helmet>
            <div className="bg-gray-50 py-12 min-h-screen">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">

                    <div className="text-center mb-8">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">Affari & Sconti</h1>
                        <p className="mt-4 text-lg text-gray-600">Le migliori offerte dal web selezionate per te, aggiornate in tempo reale.</p>
                    </div>

                    {/* ▼▼▼ DISCLAIMER AFFILIAZIONE (Fondamentale per Legge/Amazon) ▼▼▼ */}
                    <div className="max-w-3xl mx-auto bg-sky-50 border border-sky-100 rounded-lg p-3 text-center mb-10">
                        <p className="text-xs text-sky-700">
                            <strong>Trasparenza:</strong> ComuniAmo partecipa a programmi di affiliazione. Se acquisti tramite i nostri link, potremmo ricevere una piccola commissione che ci aiuta a mantenere il sito gratuito, senza alcun costo aggiuntivo per te.
                        </p>
                    </div>
                    {/* ▲▲▲ FINE DISCLAIMER ▲▲▲ */}

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-10">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                            <div>
                                <h3 className="font-semibold text-gray-700 mb-3 uppercase text-sm tracking-wider">Filtra per Categoria</h3>
                                <div className="flex flex-wrap gap-2">
                                    <button onClick={() => handleCategoryChange(null)} className={`flex items-center gap-2 px-4 py-2 text-sm rounded-full font-medium transition-colors border ${!filters.category ? 'bg-sky-600 text-white border-sky-600 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
                                        <Tag size={16} /> Tutte
                                    </button>
                                    {categories.map(cat => (
                                        <button key={cat.id} onClick={() => handleCategoryChange(cat.id)} className={`flex items-center gap-2 px-4 py-2 text-sm rounded-full font-medium transition-colors border ${filters.category === cat.id ? 'bg-sky-600 text-white border-sky-600 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
                                            {cat.icon} {cat.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="lg:pl-8 lg:border-l border-gray-100">
                                <h3 className="font-semibold text-gray-700 mb-3 uppercase text-sm tracking-wider">Ricerca Libera</h3>
                                <div className="relative">
                                    <input type="text" placeholder="Cerca un prodotto (es. iPhone, Friggitrice)..." onChange={handleSearchChange} value={filters.search} className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-sky-500 bg-gray-50 focus:bg-white transition-colors" />
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Search className="h-5 w-5 text-gray-400" /></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-end mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">
                                Offerte Attive <span className="text-gray-500 text-lg font-normal">({loading ? '...' : offers.length})</span>
                            </h2>
                        </div>

                        {loading ? (
                            <div className="text-center py-20 text-gray-500">Ricerca delle migliori offerte in corso...</div>
                        ) : offers.length > 0 ? (
                            <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" variants={containerVariants} initial="hidden" animate="visible">
                                {offers.map(offer => <OfferCard key={offer.id} offer={offer}/>)}
                            </motion.div>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                                <Tag size={48} className="mx-auto text-gray-300 mb-4" />
                                <p className="text-lg font-medium text-gray-600">Nessuna offerta trovata in questa categoria.</p>
                                <p className="text-gray-400 mt-1">Prova a cambiare i filtri o la ricerca.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default OffersPage;
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { fetchDestinationsBySeason } from '../api';
import { Sun, Leaf, Snowflake, Flower2, Star } from 'lucide-react';

const seasons = [
    { id: 'Primavera', label: 'Primavera', icon: <Flower2 size={18} /> },
    { id: 'Estate', label: 'Estate', icon: <Sun size={18} /> },
    { id: 'Autunno', label: 'Autunno', icon: <Leaf size={18} /> },
    { id: 'Inverno', label: 'Inverno', icon: <Snowflake size={18} /> },
];

const DestinationCard = ({ dest }) => {
    // ▼▼▼ STESSA PULIZIA TESTO DELLA HOMEPAGE ▼▼▼
    let cleanDescription = dest.description ? dest.description.replace(/<[^>]+>/g, ' ') : '';
    cleanDescription = cleanDescription
        .trim()
        .replace(/^(In breve|In sintesi)[\s\-:]*/i, '')
        .trim();
    // ▲▲▲ ▲▲▲ ▲▲▲

    return (
        <Link to={`/destinazioni/${dest.id}`} className="block bg-white rounded-xl shadow-md overflow-hidden group border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="overflow-hidden">
                <img
                    src={dest.images && dest.images[0] ? dest.images[0].url : 'https://via.placeholder.com/400x225'}
                    alt={dest.name}
                    className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-105"
                />
            </div>
            <div className="p-5 flex flex-col h-full">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="text-xl font-extrabold text-gray-900 group-hover:text-purple-600 transition-colors">{dest.name}</h3>
                        <p className="text-sm text-gray-500 font-medium">{dest.region}</p>
                    </div>
                    <div className="flex items-center gap-1 bg-amber-400 text-white font-bold px-2.5 py-1 rounded-full text-sm shadow-sm">
                        <Star size={14} className="fill-white"/> {dest.rating.toFixed(1)}
                    </div>
                </div>
                {/* Usiamo il testo pulito invece dell'HTML */}
                <p className="text-gray-600 mt-2 text-sm line-clamp-3">
                    {cleanDescription}
                </p>
            </div>
        </Link>
    );
};

function TopDestinationsPage() {
    const [activeSeason, setActiveSeason] = useState('Primavera');
    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const response = await fetchDestinationsBySeason(activeSeason);
                setDestinations(response.data);
            } catch (error) {
                console.error("Errore caricamento destinazioni:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [activeSeason]);

    return (
        <>
            <Helmet>
                <title>Top Destinazioni in Italia per Stagione | ComuniAmo</title>
                <meta name="description" content="Scopri le migliori destinazioni italiane per ogni stagione. Trova idee e ispirazione per il tuo prossimo viaggio in primavera, estate, autunno o inverno." />
                <meta property="og:title" content="Top Destinazioni in Italia per Stagione" />
            </Helmet>
            <div className="bg-gray-50 min-h-screen py-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-purple-700 tracking-tight">Top Destinazioni</h1>
                        <p className="mt-4 text-lg text-gray-600">Le destinazioni più belle d'Italia per ogni stagione dell'anno</p>
                    </div>

                    {/* --- NAVIGAZIONE DESKTOP --- */}
                    <div className="hidden sm:flex justify-center border-b border-gray-200 mb-10">
                        {seasons.map(season => (
                            <button
                                key={season.id}
                                onClick={() => setActiveSeason(season.id)}
                                className={`flex items-center gap-2 px-8 py-4 font-semibold text-sm uppercase tracking-wider transition-colors ${
                                    activeSeason === season.id
                                        ? 'border-b-2 border-purple-600 text-purple-700 bg-purple-50 rounded-t-lg'
                                        : 'border-b-2 border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-t-lg'
                                }`}
                            >
                                {season.icon} {season.label}
                            </button>
                        ))}
                    </div>

                    {/* --- NAVIGAZIONE MOBILE (Griglia 2x2 Perfetta) --- */}
                    <div className="sm:hidden grid grid-cols-2 gap-3 mb-10">
                        {seasons.map(season => (
                            <button
                                key={season.id}
                                onClick={() => setActiveSeason(season.id)}
                                className={`w-full py-3 text-sm font-bold rounded-xl transition-all duration-200 flex justify-center items-center gap-2 border ${
                                    activeSeason === season.id
                                        ? 'bg-purple-600 text-white border-purple-600 shadow-md scale-[1.02]'
                                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 shadow-sm'
                                }`}
                            >
                                {season.icon} {season.label}
                            </button>
                        ))}
                    </div>
                    {/* --- FINE NAVIGAZIONE --- */}

                    {/* Risultati */}
                    <div>
                        {loading ? (
                            <div className="text-center py-20 text-gray-500">Caricamento...</div>
                        ) : destinations.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {destinations.map(dest => <DestinationCard key={dest.id} dest={dest} />)}
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
                                <p className="text-gray-500 text-lg">Nessuna destinazione trovata per questa stagione.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
export default TopDestinationsPage;
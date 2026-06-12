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

const DestinationCard = ({ dest }) => (
    <Link to={`/destinazioni/${dest.id}`} className="block bg-white rounded-lg shadow-md overflow-hidden group">
        <div className="overflow-hidden">
            <img
                src={dest.images && dest.images[0] ? dest.images[0].url : 'https://via.placeholder.com/400x225'}
                alt={dest.name}
                className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-105"
            />
        </div>
        <div className="p-4">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-xl font-bold group-hover:text-purple-600">{dest.name}</h3>
                    <p className="text-sm text-gray-500">{dest.region}</p>
                </div>
                <div className="flex items-center gap-1 bg-yellow-400 text-white font-bold px-2 py-1 rounded-full text-sm">
                    <Star size={14} className="fill-white"/> {dest.rating.toFixed(1)}
                </div>
            </div>
            <div
                className="text-gray-600 mt-2 text-sm line-clamp-3"
                dangerouslySetInnerHTML={{__html: dest.description}}
            />
        </div>
    </Link>
);

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
            <div className="bg-white py-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-purple-600">Top Destinazioni</h1>
                        <p className="mt-3 text-lg text-gray-600">Le destinazioni più belle d'Italia per ogni stagione dell'anno</p>
                    </div>

                    {/* --- NAVIGAZIONE RESPONSIVE IBRIDA --- */}

                    {/* Tabs per Desktop (visibili da 'sm' in su) */}
                    <div className="hidden sm:flex justify-center border-b mb-10">
                        {seasons.map(season => (
                            <button
                                key={season.id}
                                onClick={() => setActiveSeason(season.id)}
                                className={`flex items-center gap-2 px-6 py-3 font-semibold text-gray-500 border-b-2 transition-colors ${
                                    activeSeason === season.id
                                        ? 'border-purple-600 text-purple-600'
                                        : 'border-transparent hover:border-gray-300 hover:text-gray-700'
                                }`}
                            >
                                {season.icon} {season.label}
                            </button>
                        ))}
                    </div>

                    {/* Bottoni per Mobile (nascosti da 'sm' in su) */}
                    <div className="sm:hidden flex justify-center items-center flex-wrap gap-3 mb-12">
                        {seasons.map(season => (
                            <button
                                key={season.id}
                                onClick={() => setActiveSeason(season.id)}
                                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 flex items-center gap-2 ${
                                    activeSeason === season.id
                                        ? 'bg-purple-600 text-white shadow-md'
                                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
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
                            <div className="text-center">Caricamento...</div>
                        ) : destinations.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {destinations.map(dest => <DestinationCard key={dest.id} dest={dest} />)}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 py-10">Nessuna destinazione trovata per questa stagione.</p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
export default TopDestinationsPage;
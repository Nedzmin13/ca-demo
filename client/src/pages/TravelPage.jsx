import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Map, Star } from 'lucide-react'; // Rimossa l'icona Route
import { fetchDestinationsBySeason, fetchTopDestinationsTravel } from '../api';

const TravelCard = ({ title, description, icon, link, colorClass }) => (
    <Link to={link} className={`bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-t-4 ${colorClass} group flex flex-col items-center text-center h-full`}>
        <div className={`p-4 rounded-full mb-6 ${colorClass.replace('border-', 'bg-').replace('500', '100')} ${colorClass.replace('border-', 'text-')}`}>
            {React.cloneElement(icon, { size: 32 })}
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
    </Link>
);

function TravelPage() {
    const [popularDestinations, setPopularDestinations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPopular = async () => {
            try {
                const res = await fetchTopDestinationsTravel();
                setPopularDestinations(res.data?.slice(0, 3) || []);
            } catch (error) {
                console.error("Errore caricamento destinazioni popolari:", error);
            } finally {
                setLoading(false);
            }
        };
        loadPopular();
    }, []);

    return (
        <>
            <Helmet>
                <title>Viaggio in Italia - Regioni, Comuni e Destinazioni | ComuniAmo</title>
                <meta name="description" content="Esplora l'Italia con ComuniAmo. Trova informazioni turistiche, elenchi di comuni e le migliori destinazioni per le tue vacanze." />
            </Helmet>

            <div className="bg-gray-50 min-h-screen py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">

                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-sky-700 tracking-tight mb-4">
                            Scopri l'Italia
                        </h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Esplora il nostro paese attraverso le sue regioni, scopri i comuni e lasciati ispirare dalle destinazioni più belle.
                        </p>
                    </div>

                    {/* ▼▼▼ MODIFICA DESIGN: Flexbox centrato con larghezza 1/3 ▼▼▼ */}
                    <div className="flex flex-col md:flex-row justify-center gap-8 mb-20">
                        <div className="w-full md:w-1/3">
                            <TravelCard
                                title="Esplora per Regione"
                                description="Naviga tra tutte le regioni e province italiane."
                                icon={<Map />}
                                link="/viaggio/regioni"
                                colorClass="border-sky-500"
                            />
                        </div>
                        <div className="w-full md:w-1/3">
                            <TravelCard
                                title="Top Destinazioni"
                                description="Le mete turistiche più consigliate del momento."
                                icon={<Star />}
                                link="/top-destinazioni"
                                colorClass="border-amber-500"
                            />
                        </div>
                    </div>
                    {/* ▲▲▲ FINE MODIFICA DESIGN ▲▲▲ */}

                    {/* Sezione Destinazioni Popolari */}
                    <div className="mb-16 text-center">
                        <h2 className="text-3xl font-bold text-gray-800 mb-8">Destinazioni Popolari</h2>

                        {loading ? (
                            <p className="text-gray-500">Caricamento...</p>
                        ) : popularDestinations.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {popularDestinations.map(dest => (
                                    <Link key={dest.id} to={`/destinazioni/${dest.id}`} className="block relative h-64 rounded-xl overflow-hidden group shadow-md">
                                        <img
                                            src={dest.images?.[0]?.url || 'https://via.placeholder.com/400'}
                                            alt={dest.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6 text-left">
                                            <span className="text-sky-300 text-sm font-bold uppercase tracking-wider mb-1">{dest.region}</span>
                                            <h3 className="text-white text-xl font-bold">{dest.name}</h3>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 italic">Nessuna destinazione trovata.</p>
                        )}

                        {popularDestinations.length > 0 && (
                            <div className="mt-8">
                                <Link to="/top-destinazioni" className="inline-block px-6 py-3 bg-white border border-gray-300 rounded-full font-semibold text-gray-700 hover:bg-gray-50 hover:text-sky-600 transition shadow-sm">
                                    Vedi tutte le destinazioni
                                </Link>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </>
    );
}

export default TravelPage;
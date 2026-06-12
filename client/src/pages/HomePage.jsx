import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import HomeCard from '../components/HomeCard';
import { Briefcase, Tag, Gift, Zap, Plane, MapPin, ArrowRight, Star } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { fetchTopDestinationsHome } from '../api'; // Assicurati di aver aggiunto questa funzione in api/index.js

// --- Mini Componente Card Destinazione ---
const DestinationHomeCard = ({ destination }) => {
    const imageUrl = destination.images?.[0]?.url || 'https://via.placeholder.com/600x400?text=Destinazione';


    let cleanDescription = destination.description ? destination.description.replace(/<[^>]+>/g, ' ') : '';

    cleanDescription = cleanDescription
        .trim()
        .replace(/^(In breve|In sintesi)[\s\-:]*/i, '')
        .trim();

    return (
        <Link to={`/destinazioni/${destination.id}`} className="group block h-full">
            <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full flex flex-col">
                <div className="relative h-48 overflow-hidden">
                    <img
                        src={imageUrl}
                        alt={destination.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-800 flex items-center gap-1 shadow-sm">
                        <MapPin size={12} className="text-red-500" />
                        {destination.region}
                    </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-sky-600 transition-colors">
                        {destination.name}
                    </h3>

                    <p className="text-sm text-gray-500 mt-2 line-clamp-3 flex-grow">
                        {cleanDescription}
                    </p>

                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                        <span className="flex items-center gap-1 text-sm font-semibold text-amber-500">
                            <Star size={16} fill="currentColor" /> {destination.rating}
                        </span>
                        <span className="text-sky-600 font-semibold text-sm flex items-center gap-1">
                            Scopri <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

function HomePage() {
    const cardIconClass = "h-10 w-10 text-sky-500";

    // Stato per le Destinazioni
    const [topDestinations, setTopDestinations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDestinations = async () => {
            try {
                // Recupera le destinazioni. Se l'API supporta 'limit', ne prenderà 3.
                const response = await fetchTopDestinationsHome();
                // Per sicurezza, se ne arrivano di più, ne teniamo solo 3 per la griglia
                setTopDestinations(response.data.slice(0, 3));
            } catch (error) {
                console.error("Errore nel caricare le destinazioni:", error);
            } finally {
                setLoading(false);
            }
        };
        loadDestinations();
    }, []);

    return (
        <>
            <Helmet>
                <title>ComuniAmo - Guide, Viaggi, Bonus e Notizie per l'Italia</title>
                <meta name="description" content="Il portale N°1 in Italia per trovare informazioni utili, guide pratiche, bonus aggiornati, offerte e destinazioni di viaggio. Tutto in un unico posto." />
                <meta property="og:title" content="InfoSubito - Guide, Viaggi, Bonus e Notizie per l'Italia" />
                <meta property="og:description" content="Il portale N°1 in Italia per trovare informazioni utili, guide pratiche e bonus aggiornati." />
                <meta property="og:type" content="website" />
            </Helmet>
            <Hero />

            {/* Sezione Cards sotto l'Hero */}
            <div className="bg-gray-100">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <HomeCard icon={<Plane className={cardIconClass} />} title="Viaggio" description="Scopri l'Italia" linkTo="/viaggio" />
                        <HomeCard icon={<Tag className={cardIconClass} />} title="Affari & Sconti" description="Migliori offerte" linkTo="/affari-sconti" />
                        <HomeCard icon={<Gift className={cardIconClass} />} title="Bonus" description="Incentivi disponibili" linkTo="/bonus" />
                        <HomeCard icon={<Zap className={cardIconClass} />} title="Servizi Utili" description="Info in tempo reale" linkTo="/notizie-utili" />
                    </div>
                </div>
            </div>

            {/* NUOVA SEZIONE: Destinazioni del Momento */}
            <div className="bg-gray-100 pt-20 pb-24">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-10">
                        <div>
                            <h2 className="text-3xl font-extrabold text-gray-900">
                                Mete Consigliate
                            </h2>
                            <p className="text-gray-500 mt-2">Le destinazioni italiane più amate di questa stagione.</p>
                        </div>
                        <Link to="/top-destinazioni" className="mt-4 md:mt-0 flex items-center gap-2 text-sky-600 font-bold hover:text-sky-800 transition">
                            Esplora tutte <ArrowRight size={20} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {loading ? (
                            <p className="col-span-full text-center text-gray-500 py-10">Caricamento destinazioni...</p>
                        ) : topDestinations.length > 0 ? (
                            topDestinations.map(dest => (
                                <DestinationHomeCard key={dest.id} destination={dest} />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-10 border-2 border-dashed border-gray-300 rounded-xl">
                                <p className="text-gray-500">Nessuna destinazione disponibile al momento.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default HomePage;
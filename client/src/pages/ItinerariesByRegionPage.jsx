import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { fetchItineraries } from '../api';
import { Map, Clock, ChevronRight } from 'lucide-react';
import WorkInProgress from '../components/WorkInProgress'; // <-- IMPORTA IL NUOVO COMPONENTE

const ItineraryCard = ({ itinerary }) => (
    <Link to={`/itinerari/${itinerary.id}`} className="block bg-white rounded-lg shadow-md overflow-hidden group">
        <div className="relative overflow-hidden aspect-video">
            <img
                src={itinerary.images[0]?.url || `https://ui-avatars.com/api/?name=${itinerary.title.replace(/\s/g, '+')}&size=400`}
                alt={itinerary.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
        </div>
        <div className="p-4">
            <h3 className="text-xl font-bold text-gray-800 group-hover:text-sky-600 transition-colors">{itinerary.title}</h3>
            <div className="flex items-center text-sm text-gray-500 mt-2 gap-4">
                <span className="flex items-center gap-1.5"><Map size={14} /> {itinerary.region}</span>
                <span className="flex items-center gap-1.5"><Clock size={14} /> {itinerary.duration}</span>
            </div>
        </div>
    </Link>
);

function ItinerariesByRegionPage() {
    const { regionSlug } = useParams();
    const [itineraries, setItineraries] = useState([]);
    const [loading, setLoading] = useState(true);

    // ▼▼▼ INTERRUTTORE MANUTENZIONE ▼▼▼
    // Cambia questo in "false" quando vorrai riattivare la pagina!
    const isUnderConstruction = true;
    // ▲▲▲ ▲▲▲ ▲▲▲ ▲▲▲ ▲▲▲ ▲▲▲ ▲▲▲ ▲▲▲

    const regionName = regionSlug
        .replace(/-/g, ' ')
        .replace(/\b(d'|di|del)\b/g, match => match.toLowerCase())
        .replace(/\b\w/g, l => l.toUpperCase());

    useEffect(() => {
        // Se è in costruzione, non fare la chiamata API (risparmiamo risorse)
        if (!regionSlug || isUnderConstruction) {
            setLoading(false);
            return;
        }

        const loadData = async () => {
            setLoading(true);
            try {
                const response = await fetchItineraries({ region: regionName });
                setItineraries(response.data);
            } catch (error) {
                console.error("Errore nel caricare gli itinerari:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [regionSlug, regionName, isUnderConstruction]);

    return (
        <>
            <Helmet><title>Itinerari in {regionName} - ComuniAmo</title></Helmet>
            <div className="bg-gray-50 min-h-screen py-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
                    <nav className="text-sm text-gray-500 mb-6 flex items-center">
                        <Link to="/itinerari" className="hover:text-sky-600 hover:underline">Itinerari</Link>
                        <ChevronRight size={16} className="mx-2" />
                        <span className="font-semibold text-gray-700">{regionName}</span>
                    </nav>

                    <h1 className="text-4xl font-extrabold text-gray-900 mb-8 border-b pb-4">
                        Itinerari in: {regionName}
                    </h1>

                    {/* MOSTRA COMPONENTE LAVORI IN CORSO OPPURE IL CONTENUTO */}
                    {isUnderConstruction ? (
                        <WorkInProgress
                            title="Stiamo tracciando i percorsi!"
                            message={`I nostri esperti stanno preparando i migliori itinerari e viaggi consigliati per esplorare ${regionName}. Torna a visitarci nelle prossime settimane!`}
                        />
                    ) : loading ? (
                        <div className="text-center py-20 text-gray-500">Caricamento itinerari...</div>
                    ) : itineraries.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {itineraries.map(it => <ItineraryCard key={it.id} itinerary={it} />)}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
                            <Map size={48} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-lg text-gray-600 font-medium">Nessun itinerario trovato per questa regione.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
export default ItinerariesByRegionPage;
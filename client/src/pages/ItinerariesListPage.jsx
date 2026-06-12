import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { fetchRegions } from '../api';
import { MapPin } from 'lucide-react';

const RegionCard = ({ region }) => (
    <Link
        to={`/itinerari/regione/${region.name.toLowerCase().replace(/\s+/g, '-')}`}
        className="block p-8 bg-white rounded-xl shadow-md border border-transparent hover:border-sky-500 hover:shadow-lg transition-all text-center group"
    >
        <MapPin className="mx-auto text-sky-500 mb-3 transition-transform group-hover:scale-110" size={32} />
        <h3 className="font-bold text-xl text-gray-800 group-hover:text-sky-600">{region.name}</h3>
    </Link>
);

function ItinerariesListPage() {
    const [regions, setRegions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadRegions = async () => {
            setLoading(true);
            try {
                const response = await fetchRegions();
                setRegions(response.data);
            } catch (error) { console.error("Errore caricamento regioni:", error); }
            finally { setLoading(false); }
        };
        loadRegions();
    }, []);

    return (
        <>
            <Helmet><title>Itinerari in Italia per Regione - ComuniAmo</title></Helmet>
            <div className="bg-gray-50 py-16">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-extrabold text-gray-800">Scopri gli Itinerari per Regione</h1>
                        <p className="mt-3 text-lg text-gray-600">Seleziona una regione per visualizzare i percorsi e i viaggi consigliati.</p>
                    </div>
                    {loading ? (
                        <p className="text-center text-gray-500">Caricamento regioni...</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {regions.map(region => (
                                <RegionCard key={region.id} region={region} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
export default ItinerariesListPage;
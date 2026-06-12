import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { fetchRegionByName } from '../api';
import { Users, MapPin, Building, Star, ChevronRight, List } from 'lucide-react';

function RegionDetailPage() {
    const { regionName } = useParams();
    const [regionData, setRegionData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getRegion = async () => {
            try {
                const response = await fetchRegionByName(regionName);
                setRegionData(response.data);
            } catch (error) {
                console.error("Errore nel recuperare i dati della regione:", error);
            } finally {
                setLoading(false);
            }
        };
        getRegion();
    }, [regionName]);

    if (loading) return <div className="text-center py-20 text-gray-500">Caricamento...</div>;
    if (!regionData) return <div className="text-center py-20 text-red-500 font-bold">Regione non trovata.</div>;

    return (
        <>
            <Helmet>
                <title>{regionData.name} - Comuni e Province | ComuniAmo</title>
                <meta name="description" content={`Scopri tutti i comuni e le informazioni utili della regione ${regionData.name}.`} />
            </Helmet>

            {/* Aggiunto overflow-hidden al wrapper principale per evitare scroll orizzontali su mobile */}
            <div className="bg-gray-50 min-h-screen py-8 md:py-12 overflow-hidden w-full">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl w-full">

                    {/* BREADCRUMB - Reso scrollabile su mobile se troppo lungo */}
                    <nav className="flex items-center text-xs md:text-sm text-gray-500 mb-8 overflow-x-auto whitespace-nowrap pb-2">
                        <Link to="/viaggio" className="hover:text-sky-600 transition flex-shrink-0">Viaggio</Link>
                        <ChevronRight size={16} className="mx-1 md:mx-2 flex-shrink-0" />
                        <Link to="/viaggio/regioni" className="hover:text-sky-600 transition flex-shrink-0">Regioni</Link>
                        <ChevronRight size={16} className="mx-1 md:mx-2 flex-shrink-0" />
                        <span className="font-semibold text-gray-800 flex-shrink-0">{regionData.name}</span>
                    </nav>

                    {/* STATISTICHE RAPIDE */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-12">
                        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                            <MapPin className="text-sky-500 mb-2" size={24} strokeWidth={2.5}/>
                            <span className="text-xl md:text-2xl font-bold text-gray-800">{regionData.province.length}</span>
                            <span className="text-xs md:text-sm text-gray-500">Province</span>
                        </div>
                        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                            <Building className="text-sky-500 mb-2" size={24} strokeWidth={2.5}/>
                            <span className="text-xl md:text-2xl font-bold text-gray-800">{regionData.comuni}</span>
                            <span className="text-xs md:text-sm text-gray-500">Comuni</span>
                        </div>
                        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                            <Users className="text-sky-500 mb-2" size={24} strokeWidth={2.5}/>
                            <span className="text-xl md:text-2xl font-bold text-gray-800">{regionData.population || "N/D"}</span>
                            <span className="text-xs md:text-sm text-gray-500">Abitanti</span>
                        </div>
                        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                            <Star className="text-sky-500 mb-2" size={24} strokeWidth={2.5}/>
                            <span className="text-xl md:text-2xl font-bold text-gray-800">Top</span>
                            <span className="text-xs md:text-sm text-gray-500">Destinazioni</span>
                        </div>
                    </div>

                    {/* TITOLO CENTRATO */}
                    <div className="text-center mb-8">
                        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 inline-block border-b-2 border-sky-200 pb-2 px-4">
                            Province in {regionData.name}
                        </h2>
                    </div>

                    {/* GRIGLIA PROVINCE (Compatta e Responsive) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 w-full max-w-full">
                        {regionData.province.map(prov => (
                            <div key={prov.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-sky-300 transition-all p-5 flex flex-col h-full w-full">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="min-w-0 pr-2"> {/* min-w-0 previene che il testo lungo rompa il flexbox su mobile */}
                                        <h3 className="text-lg md:text-xl font-bold text-gray-900 truncate">{prov.name}</h3>
                                        <span className="text-xs md:text-sm font-semibold text-gray-400">{prov.sigla}</span>
                                    </div>
                                    <div className="w-10 h-10 flex-shrink-0 bg-sky-50 text-sky-600 rounded-full flex items-center justify-center font-bold text-sm border border-sky-100">
                                        {prov.sigla}
                                    </div>
                                </div>

                                <p className="text-sm text-gray-500 line-clamp-2 flex-grow mb-6">
                                    {prov.description || `Scopri tutti i comuni e le informazioni della provincia di ${prov.name}.`}
                                </p>

                                {/* PULSANTE */}
                                <Link
                                    to={`/viaggio/${regionData.name.toLowerCase()}/${prov.sigla.toLowerCase()}`}
                                    className="w-full bg-gray-50 hover:bg-sky-50 text-gray-700 hover:text-sky-700 border border-gray-200 hover:border-sky-300 py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors text-sm"
                                >
                                    <List size={16} />
                                    Elenco Comuni
                                </Link>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </>
    );
}

export default RegionDetailPage;
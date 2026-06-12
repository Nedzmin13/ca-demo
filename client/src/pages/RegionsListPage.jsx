import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { fetchRegions, geoSearch } from '../api';
import { MapPin, Search } from 'lucide-react';
import useDebounce from '../hooks/useDebounce';
import { motion, AnimatePresence } from 'framer-motion';

// --- COMPONENTI INTERNI ---

const RegionCard = ({ region }) => (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 flex flex-col transition-shadow hover:shadow-lg">
        <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-gray-800">{region.name}</h3>
            <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
        </div>
        <p className="text-sm text-gray-500 mb-4">{region.comuni} comuni</p>
        <div className="text-sm text-gray-600 flex-grow">
            <span className="font-semibold">Città principali:</span>
            <p>{region.main_cities}</p>
        </div>
        <Link
            to={`/viaggio/${region.name.toLowerCase().replace(/\s+/g, '-')}`}
            className="mt-6 block w-full bg-sky-600 text-white text-center font-semibold py-2.5 rounded-lg hover:bg-sky-700 transition-colors"
        >
            Esplora {region.name}
        </Link>
    </div>
);

const SearchResultItem = ({ type, data }) => {
    let link, title, subtitle;
    switch(type) {
        case 'Regione':
            link = `/viaggio/${data.name.toLowerCase().replace(/\s+/g, '-')}`;
            title = data.name;
            subtitle = "Regione";
            break;
        case 'Provincia':
            link = `/viaggio/${data.region.name.toLowerCase().replace(/\s+/g, '-')}/${data.sigla.toLowerCase()}`;
            title = data.name;
            subtitle = `Provincia in ${data.region.name}`;
            break;
        case 'Comune':
            link = `/comune/${data.slug}`;
            title = data.name;
            subtitle = `Comune in ${data.province.name} (${data.province.sigla})`;
            break;
        default: return null;
    }
    return (
        <Link to={link} className="block p-3 hover:bg-sky-50 rounded-md transition-colors">
            <p className="font-semibold text-gray-800">{title}</p>
            <p className="text-sm text-gray-500">{subtitle}</p>
        </Link>
    );
};

// --- PAGINA PRINCIPALE ---

function RegionsListPage() {
    const [allRegions, setAllRegions] = useState([]);
    const [searchResults, setSearchResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm.trim(), 300);

    useEffect(() => {
        const getRegions = async () => {
            setLoading(true);
            try {
                const response = await fetchRegions();
                setAllRegions(response.data);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        getRegions();
    }, []);

    useEffect(() => {
        if (debouncedSearchTerm.length < 3) {
            setSearchResults(null);
            return;
        }
        const performSearch = async () => {
            const response = await geoSearch(debouncedSearchTerm);
            setSearchResults(response.data);
        };
        performSearch();
    }, [debouncedSearchTerm]);

    const hasSearchResults = searchResults && (searchResults.regions.length > 0 || searchResults.provinces.length > 0 || searchResults.comuni.length > 0);

    return (
        <>
            <Helmet>
                <title>Esplora l'Italia per Regione | ComuniAmo</title>
                <meta name="description" content="Seleziona una regione d'Italia e scopri tutte le informazioni utili su comuni, province, servizi e attrazioni turistiche." />
            </Helmet>
            <div className="bg-gray-50 py-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-gray-900">Esplora l'Italia</h1>
                        <p className="mt-3 text-lg text-gray-600">
                            Seleziona una regione per scoprire informazioni utili su città, servizi e attrazioni
                        </p>
                    </div>

                    <div className="mb-12 max-w-lg mx-auto relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Cerca una regione, provincia o comune..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-full text-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />

                        <AnimatePresence>
                            {debouncedSearchTerm.length >= 3 && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute mt-2 w-full bg-white rounded-lg shadow-xl border z-10 p-2"
                                >
                                    {searchResults && hasSearchResults ? (
                                        <>
                                            {searchResults.regions.length > 0 && <div className="px-3 pt-2 pb-1 text-xs font-bold text-gray-400 uppercase tracking-wider">Regioni</div>}
                                            {searchResults.regions.map(r => <SearchResultItem key={`reg-${r.id}`} type="Regione" data={r} />)}
                                            {searchResults.provinces.length > 0 && <div className="px-3 pt-2 pb-1 text-xs font-bold text-gray-400 uppercase tracking-wider">Province</div>}
                                            {searchResults.provinces.map(p => <SearchResultItem key={`prov-${p.id}`} type="Provincia" data={p} />)}
                                            {searchResults.comuni.length > 0 && <div className="px-3 pt-2 pb-1 text-xs font-bold text-gray-400 uppercase tracking-wider">Comuni</div>}
                                            {searchResults.comuni.map(c => <SearchResultItem key={`com-${c.id}`} type="Comune" data={c} />)}
                                        </>
                                    ) : (
                                        <div className="p-3 text-sm text-gray-500">Nessun risultato trovato per "{debouncedSearchTerm}".</div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {!debouncedSearchTerm && (
                        loading ? <div>Caricamento...</div> :
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {allRegions.map((region) => <RegionCard key={region.id} region={region} />)}
                            </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default RegionsListPage;
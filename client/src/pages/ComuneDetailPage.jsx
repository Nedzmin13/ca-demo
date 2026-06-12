// client/src/pages/ComuneDetailPage.jsx (Versione Definitiva: Paginazione + Nomi Reali)

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { fetchComuneBySlug } from '../api';
import { ChevronRight, HeartHandshake, Utensils, Eye, AlertTriangle, BedDouble, FileText, X, MapPin, ShoppingCart, Search, Pill, Building2, HeartPulse, Stethoscope, Fuel } from 'lucide-react';
import { ImageGallery } from '../components/ImageGallery';

// --- ICONE PER SANITÀ ---
const getHealthIcon = (type) => {
    const t = type.toLowerCase();
    if (t.includes('farmacia')) return <Pill size={24} className="text-green-600" />;
    if (t.includes('ospedale')) return <Building2 size={24} className="text-red-600" />;
    if (t.includes('guardia')) return <HeartPulse size={24} className="text-blue-600" />;
    return <Stethoscope size={24} className="text-indigo-600" />;
};

// --- MODALE CON PAGINAZIONE CLASSICA ---
const CategoryListModal = ({ title, pois, onClose }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    const filteredList = useMemo(() => {
        if (!searchTerm) return pois;
        const lowerTerm = searchTerm.toLowerCase();
        return pois.filter(p =>
            p.name.toLowerCase().includes(lowerTerm) ||
            p.address.toLowerCase().includes(lowerTerm)
        );
    }, [pois, searchTerm]);

    // Calcolo Paginazione
    const totalPages = Math.ceil(filteredList.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentList = filteredList.slice(startIndex, startIndex + itemsPerPage);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-5 border-b flex justify-between items-center bg-gray-50 rounded-t-xl flex-shrink-0">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
                        <p className="text-sm text-gray-500">{filteredList.length} strutture trovate</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition"><X size={24}/></button>
                </div>

                {/* Barra di Ricerca */}
                <div className="p-4 border-b bg-white flex-shrink-0">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Cerca per nome o indirizzo..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-sky-500 outline-none text-gray-700 shadow-sm"
                        />
                        <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
                    </div>
                </div>

                {/* Lista Paginata (Mostra Nomi Reali) */}
                <div className="p-4 overflow-y-auto bg-gray-50 flex-grow">
                    {currentList.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {currentList.map(poi => (
                                <Link key={poi.id} to={`/poi/${poi.id}`} className="block bg-white p-4 rounded-lg border hover:border-sky-400 hover:shadow-md transition group h-full">
                                    {/* QUI MOSTRA IL NOME SPECIFICO (es. ENI 1234) */}
                                    <h4 className="font-bold text-gray-900 group-hover:text-sky-700 text-sm line-clamp-2">{poi.name}</h4>
                                    <p className="text-xs text-gray-500 mt-2 flex items-start gap-1">
                                        <MapPin size={12} className="mt-0.5 flex-shrink-0"/> <span className="line-clamp-1">{poi.address}</span>
                                    </p>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-gray-500">
                            <p>Nessun risultato trovato per "{searchTerm}"</p>
                        </div>
                    )}
                </div>

                {/* Footer Paginazione */}
                {totalPages > 1 && (
                    <div className="p-4 border-t bg-white flex justify-between items-center flex-shrink-0">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Precedente
                        </button>

                        <span className="text-sm text-gray-600 font-medium">
                            Pagina {currentPage} di {totalPages}
                        </span>

                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Successiva
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- PoiSection ---
// --- PoiSection con "Carica Altri" ---
const PoiSection = ({ title, pois, category }) => {
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [visibleCount, setVisibleCount] = useState(9); // Quanti mostrarne all'inizio

    const filteredPois = pois ? pois.filter(poi => poi.category === category) : [];

    if (filteredPois.length === 0) return null;

    // --- LOGICA SANITÀ (Raggruppata) ---
    if (category === 'EmergencyService') {
        // ... (MANTENERE IL CODICE SANITÀ UGUALE A PRIMA) ...
        const groupedByService = {};
        filteredPois.forEach(poi => {
            const type = poi.emergencyservice?.serviceType || 'Altro';
            if (!groupedByService[type]) groupedByService[type] = [];
            groupedByService[type].push(poi);
        });
        return (
            <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(groupedByService).map(([type, list]) => (
                        <div key={type} onClick={() => setSelectedGroup({ name: type, pois: list })} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-lg hover:border-sky-300 transition-all flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-gray-50 rounded-full group-hover:bg-sky-50 transition-colors">{getHealthIcon(type)}</div>
                                <div><h3 className="font-bold text-lg text-gray-900">{type}</h3><span className="text-sm text-gray-500 font-medium">{list.length} strutture</span></div>
                            </div>
                            <ChevronRight className="text-gray-300 group-hover:text-sky-600" />
                        </div>
                    ))}
                </div>
                {selectedGroup && <CategoryListModal title={selectedGroup.name} pois={selectedGroup.pois} onClose={() => setSelectedGroup(null)} />}
            </div>
        );
    }

    // --- LOGICA STANDARD (Distributori, Ristoranti, ecc.) ---
    let displayItems = [];
    const groupedMap = {};

    if (['Supermarket', 'Restaurant', 'FuelStation'].includes(category)) {
        filteredPois.forEach(poi => {
            // ... (LOGICA RAGGRUPPAMENTO BRAND IDENTICA A PRIMA) ...
            let groupKey = null; let groupNameDisplay = null; let logo = null;
            if (poi.brand?.name) { groupKey = poi.brand.name.toUpperCase(); groupNameDisplay = poi.brand.name; logo = poi.brand.defaultImageUrl; }
            else if (poi.supermarketBrand?.name) { groupKey = poi.supermarketBrand.name.toUpperCase(); groupNameDisplay = poi.supermarketBrand.name; logo = poi.supermarketBrand.defaultImageUrl; }
            else if (poi.fuelBrand?.name) { groupKey = poi.fuelBrand.name.toUpperCase(); groupNameDisplay = poi.fuelBrand.name; logo = poi.fuelBrand.defaultImageUrl; }
            else if (poi.restaurantBrand?.name) { groupKey = poi.restaurantBrand.name.toUpperCase(); groupNameDisplay = poi.restaurantBrand.name; logo = poi.restaurantBrand.defaultImageUrl; }
            else if (poi.name) { groupKey = poi.name.trim().toUpperCase(); groupNameDisplay = poi.name.trim(); }

            if (!logo && poi.image?.[0]?.url) logo = poi.image[0].url;
            poi.tempLogo = logo;

            if (groupKey) {
                if (!groupedMap[groupKey]) groupedMap[groupKey] = { brandName: groupNameDisplay, pois: [], image: logo };
                groupedMap[groupKey].pois.push(poi);
            } else {
                displayItems.push({ type: 'single', data: poi });
            }
        });

        Object.keys(groupedMap).forEach(key => {
            const group = groupedMap[key];
            if (group.pois.length > 2) {
                displayItems.push({ type: 'group', brandName: group.brandName, pois: group.pois, count: group.pois.length, image: group.image });
            } else {
                group.pois.forEach(p => displayItems.push({ type: 'single', data: p }));
            }
        });
    } else {
        displayItems = filteredPois.map(p => ({ type: 'single', data: p }));
    }

    displayItems.sort((a, b) => {
        const nameA = a.type === 'group' ? a.brandName : a.data.name;
        const nameB = b.type === 'group' ? b.brandName : b.data.name;
        return nameA.localeCompare(nameB);
    });

    // --- NUOVO: LOGICA VISIBILITÀ ---
    const visibleItems = displayItems.slice(0, visibleCount);
    const hasMore = visibleCount < displayItems.length;

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + 9); // Ne carica altri 9
    };

    return (
        <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {visibleItems.map((item, index) => {
                    // ... (RENDERING CARD GRUPPO E SINGOLE IDENTICO A PRIMA) ...
                    if (item.type === 'group') {
                        const leaflet = item.pois.find(p => p.supermarketBrand?.leaflets?.length > 0)?.supermarketBrand.leaflets[0];
                        return (
                            <div key={`group-${index}`} className="bg-white rounded-lg shadow-md border border-sky-200 flex flex-col overflow-hidden hover:shadow-lg transition-all h-full">
                                <div onClick={() => setSelectedGroup({ name: item.brandName, pois: item.pois })} className="block p-5 cursor-pointer flex-grow bg-gradient-to-br from-white to-sky-50">
                                    <div className="flex justify-between items-start gap-3">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-extrabold text-xl text-gray-900 line-clamp-2 leading-tight" title={item.brandName}>{item.brandName}</h3>
                                            <span className="inline-flex items-center gap-1 bg-sky-600 text-white text-xs font-bold px-2 py-1 rounded-full mt-2 shadow-sm whitespace-nowrap"><ShoppingCart size={12} /> {item.count} Punti</span>
                                        </div>
                                        <div className="flex-shrink-0">
                                            {item.image ? <img src={item.image} className="h-12 w-12 object-cover rounded-lg border bg-white shadow-sm" alt={item.brandName}/> : <div className="h-12 w-12 bg-sky-100 rounded-lg flex items-center justify-center text-sky-600 font-bold text-lg border border-sky-200">{item.brandName.charAt(0)}</div>}
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-4 flex items-center justify-end gap-1 font-medium text-sky-700">Vedi elenco <ChevronRight size={14}/></p>
                                </div>
                                {leaflet && <div className="border-t p-3 bg-white"><a href={leaflet.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-sky-600 font-bold hover:underline flex items-center justify-center gap-2"><FileText size={16} /> Sfoglia Volantino</a></div>}
                            </div>
                        );
                    }
                    const poi = item.data;
                    const leaflet = poi.category === 'Supermarket' ? poi.supermarketBrand?.leaflets?.[0] : null;
                    return (
                        <div key={poi.id} className="bg-white rounded-lg shadow-sm border flex flex-col transition-shadow hover:shadow-md h-full">
                            <Link to={`/poi/${poi.id}`} className="block p-5 hover:bg-gray-50 flex-grow rounded-t-lg">
                                <div className="flex justify-between items-start gap-3">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-gray-900 truncate pr-1" title={poi.name}>{poi.name}</h3>
                                        <p className="text-sm text-gray-500 truncate mt-1">{poi.address}</p>
                                    </div>
                                    {poi.tempLogo && <img src={poi.tempLogo} className="h-10 w-10 object-cover rounded-md border bg-white flex-shrink-0" alt={poi.name}/>}
                                </div>
                            </Link>
                            {leaflet && <div className="border-t p-3 bg-gray-50 rounded-b-lg"><a href={leaflet.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-sky-600 font-semibold hover:underline flex items-center gap-2"><FileText size={16} /> Visualizza volantino</a></div>}
                        </div>
                    );
                })}
            </div>

            {/* --- BOTTONE CARICA ALTRI --- */}
            {hasMore && (
                <div className="mt-8 flex justify-center">
                    <button
                        onClick={handleLoadMore}
                        className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-full font-semibold hover:bg-gray-100 hover:shadow transition"
                    >
                        Carica altri... ({displayItems.length - visibleCount} rimanenti)
                    </button>
                </div>
            )}

            {selectedGroup && <CategoryListModal title={selectedGroup.name} pois={selectedGroup.pois} onClose={() => setSelectedGroup(null)} />}
        </div>
    );
};

// --- Componente Principale (Invariato) ---
function ComuneDetailPage() {
    const { regionName, provinceSigla, comuneSlug } = useParams();
    const [comune, setComune] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('servizi');

    useEffect(() => {
        const getComuneData = async () => {
            if (!comuneSlug) return;
            setLoading(true);
            try {
                const response = await fetchComuneBySlug(comuneSlug);
                setComune(response.data);
                setError(null);
            } catch (err) { setError('Errore caricamento.'); console.error(err); } finally { setLoading(false); }
        };
        getComuneData();
    }, [comuneSlug]);

    const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
    const TabButton = ({ id, label, icon }) => (
        <button onClick={() => setActiveTab(id)} className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${activeTab === id ? 'bg-sky-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>{icon}<span>{label}</span></button>
    );

    if (loading) return <div className="text-center py-20">Caricamento...</div>;
    if (!comune) return <div className="text-center py-20">Comune non trovato.</div>;

    return (
        <>
            <Helmet><title>{comune.name} | InfoSubito</title></Helmet>
            <div className="bg-gray-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-5xl">
                    <div className="mb-8"><ImageGallery images={comune.images || []} /></div>
                    <div className="bg-white p-8 rounded-lg shadow-lg">
                        <div className="mb-8"><h1 className="text-5xl font-extrabold text-gray-900">{comune.name}</h1></div>
                        <div className="prose max-w-none text-gray-700" dangerouslySetInnerHTML={{__html: comune.description}} />
                        <hr className="my-10"/>
                        <h2 className="text-3xl font-bold text-gray-800 mb-6">Informazioni e Servizi</h2>
                        <div className="flex space-x-2 sm:space-x-4 border-b pb-4 mb-8 overflow-x-auto">
                            <TabButton id="servizi" label="Servizi Essenziali" icon={<HeartHandshake size={20}/>}/>
                            <TabButton id="ristorazione" label="Ristorazione" icon={<Utensils size={20}/>}/>
                            <TabButton id="alloggiare" label="Alloggiare" icon={<BedDouble size={20}/>}/>
                            <TabButton id="emergenze" label="Emergenze" icon={<AlertTriangle size={20}/>}/>
                        </div>
                        <div>
                            {activeTab === 'servizi' && (
                                <div>
                                    <PoiSection title="Distributori di Carburante" pois={comune.pointofinterest} category="FuelStation"/>
                                    <PoiSection title="Supermercati" pois={comune.pointofinterest} category="Supermarket"/>
                                    <PoiSection title="Parcheggi" pois={comune.pointofinterest} category="Parking"/>
                                    <PoiSection title="Officine" pois={comune.pointofinterest} category="CarRepairShop"/>
                                </div>
                            )}
                            {activeTab === 'ristorazione' && (
                                <div>
                                    <PoiSection title="Ristoranti & Fast Food" pois={comune.pointofinterest} category="Restaurant"/>
                                    <PoiSection title="Bar" pois={comune.pointofinterest} category="Bar"/>
                                </div>
                            )}
                            {activeTab === 'alloggiare' && (
                                <div>
                                    <PoiSection title="Hotel, B&B e Alloggi" pois={comune.pointofinterest} category="Accommodation"/>
                                </div>
                            )}
                            {activeTab === 'vedere' && (
                                <div>
                                    <PoiSection title="Attrazioni Turistiche" pois={comune.pointofinterest} category="TouristAttraction"/>
                                </div>
                            )}
                            {activeTab === 'emergenze' && (
                                <div>
                                    <PoiSection title="Servizi di Emergenza" pois={comune.pointofinterest} category="EmergencyService"/>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ComuneDetailPage;
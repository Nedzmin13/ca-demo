import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm, Controller } from 'react-hook-form';
import { ArrowLeft, PlusCircle, Trash2, X, Edit, ExternalLink, UploadCloud, ChevronLeft, ChevronRight, RefreshCw, FileSpreadsheet, Search } from 'lucide-react';
import Select from 'react-select';
import OpeningHoursInput from '../../components/admin/forms/OpeningHoursInput';
import EditPoiModal from '../../components/admin/EditPoiModal';

import {
    fetchSupermarketBrandDetails,
    addLocationToBrand,
    removeLocationFromBrand,
    fetchAllComuniForAdmin,
    fetchRegions,
    fetchLeafletsForBrand,
    upsertLeaflet,
    updateSupermarketBrand,
    propagateBrandData,
    importCsvLocations
} from '../../api';

// --- Sottocomponente Volantini ---
function LeafletManager({ brandId, regions, onUpdate }) {
    const [selectedRegionId, setSelectedRegionId] = useState('');
    const [leaflets, setLeaflets] = useState([]);
    const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

    const loadLeaflets = useCallback(async () => {
        if (!brandId) return;
        try {
            const res = await fetchLeafletsForBrand(brandId);
            setLeaflets(res.data);
        } catch (error) { console.error(error); }
    }, [brandId]);

    useEffect(() => { loadLeaflets(); }, [loadLeaflets]);

    useEffect(() => {
        const currentLeaflet = leaflets.find(l => l.regionId === parseInt(selectedRegionId));
        if (currentLeaflet) {
            reset({
                title: currentLeaflet.title,
                pdfUrl: currentLeaflet.pdfUrl,
                validFrom: currentLeaflet.validFrom.split('T')[0],
                validUntil: currentLeaflet.validUntil.split('T')[0],
            });
        } else {
            reset({ title: '', pdfUrl: '', validFrom: '', validUntil: '' });
        }
    }, [selectedRegionId, leaflets, reset]);

    const onSubmit = async (data) => {
        try {
            await upsertLeaflet({ ...data, supermarketBrandId: brandId, regionId: selectedRegionId });
            alert('Volantino salvato!');
            loadLeaflets();
            if (onUpdate) onUpdate();
        } catch (error) { alert('Errore salvataggio volantino.'); }
    };

    return (
        <div>
            <label htmlFor="region-select" className="block text-sm font-medium text-gray-700">Seleziona Regione per Volantino</label>
            <select
                id="region-select"
                value={selectedRegionId}
                onChange={e => setSelectedRegionId(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            >
                <option value="">-- Seleziona --</option>
                {regions.sort((a, b) => a.name.localeCompare(b.name)).map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>

            {selectedRegionId && (
                <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-3 bg-gray-50 p-4 rounded border">
                    <h3 className="font-bold text-sm text-gray-700">Dati Volantino: {regions.find(r => r.id == selectedRegionId)?.name}</h3>
                    <div><label className="text-xs font-bold">Titolo</label><input {...register('title', { required: true })} className="w-full border p-1 rounded"/></div>
                    <div><label className="text-xs font-bold">URL PDF</label><input type="url" {...register('pdfUrl', { required: true })} className="w-full border p-1 rounded"/></div>
                    <div className="grid grid-cols-2 gap-2">
                        <div><label className="text-xs font-bold">Valido Dal</label><input type="date" {...register('validFrom', { required: true })} className="w-full border p-1 rounded"/></div>
                        <div><label className="text-xs font-bold">Valido Fino Al</label><input type="date" {...register('validUntil', { required: true })} className="w-full border p-1 rounded"/></div>
                    </div>
                    <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white text-sm py-2 rounded mt-2 font-bold">Salva Volantino</button>
                </form>
            )}
        </div>
    );
}

function AdminSupermarketDetailPage() {
    const { brandId } = useParams();
    const [brand, setBrand] = useState(null);
    const [loading, setLoading] = useState(true);

    // Modali
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
    const [poiToEdit, setPoiToEdit] = useState(null);

    // Dati
    const [comuni, setComuni] = useState([]);
    const [regions, setRegions] = useState([]);

    // Paginazione e Ricerca
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const itemsPerPage = 20;

    const { register: registerAdd, handleSubmit: handleSubmitAdd, control: controlAdd, reset: resetAdd, formState: { isSubmitting: isAdding } } = useForm();
    const { register: registerBrand, handleSubmit: handleSubmitBrand, reset: resetBrandForm } = useForm();
    const { register: registerCsv, handleSubmit: handleSubmitCsv, formState: { isSubmitting: isCsvUploading } } = useForm();

    const comuniOptions = useMemo(() => comuni.map(c => ({ value: c.id, label: `${c.name} (${c.province.sigla})` })), [comuni]);

    const loadBrandData = useCallback(async () => {
        try {
            const response = await fetchSupermarketBrandDetails(brandId);
            setBrand(response.data);
            resetBrandForm({
                name: response.data.name,
                website: response.data.website,
                description: response.data.description,
                defaultImageUrl: response.data.defaultImageUrl
            });
        } catch (error) { console.error("Errore fetch brand:", error); } finally { setLoading(false); }
    }, [brandId, resetBrandForm]);

    useEffect(() => { setLoading(true); loadBrandData(); }, [loadBrandData]);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [comuniRes, regionsRes] = await Promise.all([fetchAllComuniForAdmin({ limit: 8000 }), fetchRegions()]);
                setComuni(comuniRes.data.data);
                setRegions(regionsRes.data);
            } catch (error) { console.error(error); }
        };
        loadInitialData();
    }, []);

    const onBrandDetailsSubmit = async (data) => {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('website', data.website || '');
        formData.append('description', data.description || '');
        if (data.imageFile && data.imageFile.length > 0) formData.append('image', data.imageFile[0]);
        formData.append('defaultImageUrl', data.defaultImageUrl || '');

        try {
            await updateSupermarketBrand(brandId, formData);
            alert('Dettagli Brand aggiornati con successo!');
            loadBrandData();
        } catch (error) { alert('Errore aggiornamento brand.'); }
    };

    const handlePropagate = async () => {
        if(window.confirm("ATTENZIONE: Questo aggiornerà Descrizione, Sito Web e Immagine (se mancante) per TUTTI i punti vendita esistenti di questa catena. Continuare?")) {
            try {
                await propagateBrandData(brandId);
                alert("Dati propagati con successo!");
                loadBrandData();
            } catch (error) { alert("Errore durante la propagazione."); }
        }
    };

    const handleCsvUpload = async (data) => {
        if (!data.file || data.file.length === 0) return alert("Seleziona un file CSV.");
        const formData = new FormData();
        formData.append('file', data.file[0]);

        try {
            const res = await importCsvLocations(brandId, formData);
            alert(res.data.message);
            if(res.data.errors && res.data.errors.length > 0) {
                console.log("Errori CSV:", res.data.errors);
                alert("Alcuni record non sono stati importati. Controlla la console per i dettagli.");
            }
            setIsCsvModalOpen(false);
            loadBrandData();
        } catch (error) { alert("Errore importazione CSV."); }
    };

    const handleAddLocation = async (data) => {
        try {
            await addLocationToBrand(brandId, data);
            setIsAddModalOpen(false);
            loadBrandData();
        } catch (error) { alert("Errore aggiunta punto vendita."); }
    };

    const handleRemoveLocation = async (poiId) => { if (window.confirm("Scollegare?")) { try { await removeLocationFromBrand(poiId); loadBrandData(); } catch (error) { alert("Errore rimozione."); } } };
    const handlePoiUpdated = () => { setPoiToEdit(null); loadBrandData(); };

    // FILTRO E PAGINAZIONE
    const filteredLocations = useMemo(() => {
        if (!brand || !brand.locations) return [];
        let locs = [...brand.locations];
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            locs = locs.filter(l => l.comune.name.toLowerCase().includes(lowerTerm) || l.address.toLowerCase().includes(lowerTerm));
        }
        return locs.sort((a, b) => a.comune.name.localeCompare(b.comune.name));
    }, [brand, searchTerm]);

    const totalPages = Math.ceil(filteredLocations.length / itemsPerPage);
    const currentLocations = filteredLocations.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    if (loading) return <div className="p-8 text-center">Caricamento...</div>;
    if (!brand) return <div className="p-8 text-center">Brand non trovato.</div>;

    return (
        <>
            <Helmet><title>Admin: {brand.name}</title></Helmet>
            <Link to="/admin/supermercati" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6">
                <ArrowLeft size={16} /> Torna alla lista
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* COLONNA SINISTRA: Punti Vendita */}
                <div className="lg:col-span-2">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex flex-col md:flex-row justify-between items-center mb-6 border-b pb-4 gap-4">
                            <h1 className="text-2xl font-bold text-gray-800">
                                Punti Vendita <span className="text-gray-500 text-lg font-normal">({filteredLocations.length})</span>
                            </h1>
                            <div className="flex gap-2">
                                <button onClick={() => setIsCsvModalOpen(true)} className="bg-blue-500 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600 text-sm">
                                    <FileSpreadsheet size={16} /> Importa CSV
                                </button>
                                <button onClick={() => { resetAdd({ name: brand?.name || '', address: '', comuneId: null, phoneNumber: '', openingHours: '{}' }); setIsAddModalOpen(true); }} className="bg-green-500 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-green-600 text-sm">
                                    <PlusCircle size={16} /> Aggiungi
                                </button>
                            </div>
                        </div>

                        {/* BARRA RICERCA */}
                        <div className="mb-4 relative">
                            <input type="text" placeholder="Cerca punto vendita (Comune o Indirizzo)..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full border p-2 pl-10 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        </div>

                        <div className="space-y-3 min-h-[400px]">
                            {currentLocations.length > 0 ? (
                                currentLocations.map(poi => (
                                    <div key={poi.id} className="border p-3 rounded-lg flex justify-between items-center hover:bg-gray-50 transition">
                                        <div>
                                            <p className="font-bold text-gray-900">{poi.comune.name} <span className="text-xs font-normal text-gray-500">({poi.comune.province?.sigla})</span></p>
                                            <p className="text-sm text-gray-600">{poi.address}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => setPoiToEdit(poi)} className="text-blue-600 hover:text-blue-800 bg-blue-50 p-2 rounded-full"><Edit size={18} /></button>
                                            <Link to={`/poi/${poi.id}`} target="_blank" className="text-gray-400 hover:text-gray-600 p-2"><ExternalLink size={18} /></Link>
                                            <button onClick={() => handleRemoveLocation(poi.id)} className="text-red-600 hover:text-red-800 bg-red-50 p-2 rounded-full"><Trash2 size={18} /></button>
                                        </div>
                                    </div>
                                ))
                            ) : ( <p className="text-center text-gray-400 italic py-10">Nessun punto vendita trovato.</p> )}
                        </div>

                        {/* PAGINAZIONE */}
                        {filteredLocations.length > itemsPerPage && (
                            <div className="flex justify-between items-center mt-6 pt-4 border-t text-sm text-gray-600">
                                <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="flex items-center gap-1 text-blue-600 disabled:text-gray-300"><ChevronLeft size={16} /> Prev</button>
                                <span>Pagina <strong>{currentPage}</strong> di <strong>{totalPages}</strong></span>
                                <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="flex items-center gap-1 text-blue-600 disabled:text-gray-300">Next <ChevronRight size={16} /></button>
                            </div>
                        )}
                    </div>
                </div>

                {/* COLONNA DESTRA */}
                <div className="lg:col-span-1 space-y-6 self-start">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Gestione Volantini</h2>
                        {regions.length > 0 ? ( <LeafletManager brandId={brandId} regions={regions} onUpdate={loadBrandData} /> ) : <p>Caricamento...</p>}
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-indigo-500">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Dati Generali Catena</h2>
                        <form onSubmit={handleSubmitBrand(onBrandDetailsSubmit)} className="space-y-4" encType="multipart/form-data">
                            <div><label className="text-xs font-bold">Nome Brand</label><input {...registerBrand('name')} className="w-full border p-2 rounded mt-1"/></div>
                            <div><label className="text-xs font-bold">Sito Web</label><input {...registerBrand('website')} className="w-full border p-2 rounded mt-1"/></div>
                            <div>
                                <label className="text-xs font-bold block mb-1">Logo Default</label>
                                <div className="flex flex-col gap-2">
                                    {brand.defaultImageUrl && ( <img src={brand.defaultImageUrl} alt="Attuale" className="h-12 object-contain self-start border rounded p-1" /> )}
                                    <input type="file" accept="image/*" {...registerBrand('imageFile')} className="w-full text-xs text-gray-500" />
                                </div>
                                <input type="hidden" {...registerBrand('defaultImageUrl')} />
                            </div>
                            <div><label className="text-xs font-bold">Descrizione Default</label><textarea {...registerBrand('description')} rows="4" className="w-full border p-2 rounded mt-1 text-sm"></textarea></div>
                            <div className="flex justify-end">
                                <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 flex justify-center items-center gap-2 text-sm font-bold">
                                    <UploadCloud size={16} /> Salva Dati
                                </button>
                            </div>
                        </form>

                        <div className="mt-6 pt-4 border-t">
                            <p className="text-xs text-gray-500 mb-2">Aggiorna la descrizione e il sito di TUTTI i punti vendita esistenti.</p>
                            <button onClick={handlePropagate} className="w-full border border-orange-500 text-orange-600 hover:bg-orange-50 py-2 rounded flex justify-center items-center gap-2 text-sm font-bold">
                                <RefreshCw size={16} /> Applica a tutti i PV
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODALE CSV */}
            {isCsvModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
                        <div className="p-4 border-b flex justify-between items-center"><h2 className="text-xl font-bold">Importa CSV</h2><button onClick={() => setIsCsvModalOpen(false)}><X /></button></div>
                        <form onSubmit={handleSubmitCsv(handleCsvUpload)} className="p-6">
                            <div className="mb-4 text-sm text-gray-600 space-y-3">
                                <p>Carica un file <strong>.csv</strong> con colonne separate da <strong>punto e virgola (;)</strong>.</p>
                                <div className="bg-gray-100 p-3 rounded border font-mono text-xs overflow-x-auto whitespace-nowrap">Comune;Indirizzo;Telefono;Lun;Mar;Mer;Gio;Ven;Sab;Dom</div>
                                <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                                    <div><strong>Regole Orari:</strong><ul className="list-disc pl-4 mt-1 space-y-1"><li><code>08:00-20:00</code></li><li><code>08:30-12:30, 15:30-19:30</code></li><li>Vuoto per <strong>Chiuso</strong></li></ul></div>
                                </div>
                            </div>
                            <input type="file" accept=".csv" {...registerCsv('file', { required: true })} className="w-full mb-4 border p-2 rounded" />
                            <div className="flex justify-end gap-3"><button type="button" onClick={() => setIsCsvModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded">Annulla</button><button type="submit" disabled={isCsvUploading} className="px-4 py-2 bg-blue-600 text-white rounded">{isCsvUploading ? 'Importazione...' : 'Carica'}</button></div>
                        </form>
                    </div>
                </div>
            )}

            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                        <div className="p-4 border-b flex justify-between items-center"><h2 className="text-xl font-bold">Nuovo Punto Vendita</h2><button onClick={() => setIsAddModalOpen(false)}><X /></button></div>
                        <form onSubmit={handleSubmitAdd(handleAddLocation)} className="p-6 space-y-4 overflow-y-auto">
                            <div><label>Comune *</label><Controller name="comuneId" control={controlAdd} rules={{ required: true }} render={({ field }) => ( <Select value={comuniOptions.find(c => c.value === field.value)} onChange={option => field.onChange(option ? option.value : null)} options={comuniOptions} placeholder="Cerca comune..." /> )} /></div>
                            <div><label>Indirizzo *</label><input {...registerAdd('address', { required: true })} className="w-full border p-2 rounded mt-1"/></div>
                            <div><label>Nome (Opzionale)</label><input {...registerAdd('name')} placeholder={brand.name} className="w-full border p-2 rounded mt-1"/></div>
                            <div><label>Telefono</label><input {...registerAdd('phoneNumber')} className="w-full border p-2 rounded mt-1"/></div>
                            <div><label className="font-semibold block mb-2">Orari</label><Controller name="openingHours" control={controlAdd} render={({field}) => <OpeningHoursInput value={field.value} onChange={field.onChange}/>} /></div>
                            <div className="pt-4 border-t flex justify-end gap-4"><button type="button" onClick={() => setIsAddModalOpen(false)} className="bg-gray-200 px-4 py-2 rounded-lg">Annulla</button><button type="submit" disabled={isAdding} className="bg-green-500 text-white px-4 py-2 rounded-lg">{isAdding ? '...' : 'Aggiungi'}</button></div>
                        </form>
                    </div>
                </div>
            )}
            {poiToEdit && <EditPoiModal poiToEdit={poiToEdit} onClose={() => setPoiToEdit(null)} onPoiUpdated={handlePoiUpdated} />}
        </>
    );
}

export default AdminSupermarketDetailPage;
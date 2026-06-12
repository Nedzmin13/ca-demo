import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm, Controller } from 'react-hook-form';
import { ArrowLeft, PlusCircle, Trash2, X, Edit, ExternalLink, UploadCloud, ChevronLeft, ChevronRight, RefreshCw, FileSpreadsheet, Search } from 'lucide-react';
import Select from 'react-select';
import OpeningHoursInput from '../../components/admin/forms/OpeningHoursInput';
import EditPoiModal from '../../components/admin/EditPoiModal';
import RichTextEditor from '../../components/admin/forms/RichTextEditor';
import {
    fetchChainDetails, addLocationToChain, removeLocationFromChain, updateChain,
    propagateChainData, importChainCsv, fetchAllComuniForAdmin
} from '../../api';

const PAGE_CONFIG = {
    restaurant: { title: "Catena Ristorazione", backLink: "/admin/ristorazione" }, // Corretto link dashboard
    fuel: { title: "Compagnia Petrolifera", backLink: "/admin/brands/fuel" }, // Mettiamo ristorazione o una dashboard generale
    medical: { title: "Gruppo Sanitario", backLink: "/admin/sanita" }
};

function AdminChainDetailPage() {
    const { type, id } = useParams();
    const config = PAGE_CONFIG[type] || PAGE_CONFIG.restaurant;

    const [brand, setBrand] = useState(null);
    const [loading, setLoading] = useState(true);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
    const [poiToEdit, setPoiToEdit] = useState(null);
    const [comuni, setComuni] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const itemsPerPage = 20;

    const { register: registerAdd, handleSubmit: handleSubmitAdd, control: controlAdd, reset: resetAdd, formState: { isSubmitting: isAdding } } = useForm();
    const { register: registerBrand, handleSubmit: handleSubmitBrand, reset: resetBrandForm, control: controlBrand } = useForm();
    const { register: registerCsv, handleSubmit: handleSubmitCsv, formState: { isSubmitting: isCsvUploading } } = useForm();

    const comuniOptions = useMemo(() => comuni.map(c => ({ value: c.id, label: `${c.name} (${c.province.sigla})` })), [comuni]);

    const loadBrandData = useCallback(async () => {
        try {
            const res = await fetchChainDetails(type, id);
            setBrand(res.data);
            resetBrandForm({
                name: res.data.name,
                website: res.data.website,
                description: res.data.description,
                defaultImageUrl: res.data.defaultImageUrl,
                phoneNumber: res.data.phoneNumber // <--- CARICA TELEFONO
            });
        } catch (error) { console.error(error); } finally { setLoading(false); }
    }, [type, id, resetBrandForm]);

    useEffect(() => { setLoading(true); loadBrandData(); }, [loadBrandData]);

    useEffect(() => {
        const loadInitial = async () => {
            try {
                const res = await fetchAllComuniForAdmin({ limit: 8000 });
                setComuni(res.data.data);
            } catch (e) { console.error(e); }
        };
        loadInitial();
    }, []);

    const onBrandSubmit = async (data) => {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('website', data.website || '');
        formData.append('description', data.description || '');
        formData.append('phoneNumber', data.phoneNumber || ''); // <--- INVIA TELEFONO
        if (data.imageFile?.[0]) formData.append('image', data.imageFile[0]);
        formData.append('defaultImageUrl', data.defaultImageUrl || '');

        try {
            await updateChain(type, id, formData);
            alert('Aggiornato!');
            loadBrandData();
        } catch (e) { alert('Errore update.'); }
    };

    const handleAddLocation = async (data) => {
        try {
            await addLocationToChain(type, id, data);
            setIsAddModalOpen(false);
            loadBrandData();
        } catch (e) { alert("Errore aggiunta."); }
    };

    const handleCsvUpload = async (data) => {
        const formData = new FormData();
        formData.append('file', data.file[0]);
        try {
            const res = await importChainCsv(type, id, formData);
            alert(res.data.message);
            setIsCsvModalOpen(false);
            loadBrandData();
        } catch (e) { alert("Errore CSV."); }
    };

    const handlePropagate = async () => {
        if(window.confirm("Aggiornare DESCRIZIONE, SITO e TELEFONO di tutti i punti vendita esistenti?")) {
            try {
                await propagateChainData(type, id);
                alert("Fatto!");
                loadBrandData();
            } catch (e) { alert("Errore."); }
        }
    };

    const handleRemove = async (poiId) => {
        if (window.confirm("Eliminare definitivamente?")) {
            try { await removeLocationFromChain(type, poiId); loadBrandData(); } catch (e) { alert("Errore."); }
        }
    };

    const handlePoiUpdated = () => { setPoiToEdit(null); loadBrandData(); };

    const filteredLocations = useMemo(() => {
        if (!brand?.locations) return [];
        let locs = [...brand.locations];
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            locs = locs.filter(l => l.comune.name.toLowerCase().includes(term) || l.address.toLowerCase().includes(term));
        }
        return locs.sort((a, b) => a.comune.name.localeCompare(b.comune.name));
    }, [brand, searchTerm]);

    const totalPages = Math.ceil(filteredLocations.length / itemsPerPage);
    const currentLocations = filteredLocations.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    if (loading) return <div className="p-8 text-center">Caricamento...</div>;
    if (!brand) return <div className="p-8 text-center">Non trovato.</div>;

    return (
        <>
            <Helmet><title>Admin: {brand.name}</title></Helmet>
            <div className="bg-gray-100 p-4">
                <Link to={config.backLink} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4">
                    <ArrowLeft size={16} /> Torna alla lista
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* COLONNA SINISTRA: LISTA POI */}
                <div className="lg:col-span-2">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex justify-between items-center mb-6 border-b pb-4">
                            <h1 className="text-2xl font-bold text-gray-800">{brand.name} <span className="text-gray-500 text-lg">({filteredLocations.length})</span></h1>
                            <div className="flex gap-2">
                                <button onClick={() => setIsCsvModalOpen(true)} className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 text-sm flex gap-2 items-center"><FileSpreadsheet size={16}/> CSV</button>
                                <button onClick={() => { resetAdd({ name: brand?.name, address: '', comuneId: null, phoneNumber: '', openingHours: '{}' }); setIsAddModalOpen(true); }} className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 text-sm flex gap-2 items-center"><PlusCircle size={16}/> Aggiungi</button>
                            </div>
                        </div>

                        <div className="mb-4 relative">
                            <input type="text" placeholder="Cerca..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full border p-2 pl-10 rounded" />
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        </div>

                        <div className="space-y-3 min-h-[400px]">
                            {currentLocations.map(poi => (
                                <div key={poi.id} className="border p-3 rounded flex justify-between items-center hover:bg-gray-50">
                                    <div>
                                        <p className="font-bold">{poi.name} <span className="font-normal text-xs text-gray-500">({poi.comune.name})</span></p>
                                        <p className="text-sm text-gray-600">{poi.address}</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <button onClick={() => setPoiToEdit(poi)} className="text-blue-600"><Edit size={18}/></button>
                                        <button onClick={() => handleRemove(poi.id)} className="text-red-600"><Trash2 size={18}/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-4 pt-4 border-t">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="text-blue-600 disabled:text-gray-300">Prev</button>
                            <span>{currentPage} / {totalPages}</span>
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="text-blue-600 disabled:text-gray-300">Next</button>
                        </div>
                    </div>
                </div>

                {/* COLONNA DESTRA: DATI GENERALI */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-indigo-500 sticky top-6">
                        <h2 className="text-xl font-bold mb-4">Dati Generali</h2>
                        <form onSubmit={handleSubmitBrand(onBrandSubmit)} className="space-y-4">
                            <div><label className="text-xs font-bold">Nome</label><input {...registerBrand('name')} className="w-full border p-2 rounded mt-1"/></div>
                            <div><label className="text-xs font-bold">Sito Web</label><input {...registerBrand('website')} className="w-full border p-2 rounded mt-1"/></div>

                            {/* ▼▼▼ NUOVO CAMPO TELEFONO ▼▼▼ */}
                            <div><label className="text-xs font-bold">Telefono / Numero Verde</label><input {...registerBrand('phoneNumber')} className="w-full border p-2 rounded mt-1"/></div>
                            {/* ▲▲▲ FINE NUOVO CAMPO ▲▲▲ */}

                            <div>
                                <label className="text-xs font-bold block mb-1">Logo</label>
                                {brand.defaultImageUrl && <img src={brand.defaultImageUrl} className="h-12 object-contain border p-1 mb-2 rounded" />}
                                <input type="file" {...registerBrand('imageFile')} className="text-xs"/>
                            </div>
                            <div>
                                <label className="text-xs font-bold block mb-1">Descrizione</label>
                                <Controller
                                    name="description"
                                    control={controlBrand}
                                    defaultValue=""
                                    render={({field}) => (
                                        <RichTextEditor
                                            value={field.value || ''}
                                            onChange={field.onChange}
                                        />
                                    )}
                                />
                            </div>
                            <button type="submit"
                                    className="w-full bg-indigo-600 text-white py-2 rounded font-bold flex justify-center gap-2">
                                <UploadCloud size={16}/> Salva
                            </button>
                        </form>
                        <div className="mt-6 pt-4 border-t">
                            <button onClick={handlePropagate}
                                    className="w-full border border-orange-500 text-orange-600 py-2 rounded text-sm font-bold flex justify-center gap-2 hover:bg-orange-50">
                                <RefreshCw size={16}/> Applica a tutti
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODALI (Invariati) */}
            {isCsvModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded shadow-xl max-w-md w-full">
                        <h2 className="text-xl font-bold mb-4">Importa CSV</h2>
                        <div className="mb-4 text-sm text-gray-600 space-y-2">
                            <p>Formato: <strong>Nome;Comune;Indirizzo;Telefono;Lun..Dom</strong></p>
                            <p className="text-xs text-gray-500">Se lasci il Nome vuoto, usa "{brand.name}".</p>
                        </div>
                        <form onSubmit={handleSubmitCsv(handleCsvUpload)}>
                            <input type="file" accept=".csv" {...registerCsv('file')} className="mb-4 w-full border p-2"/>
                            <div className="flex justify-end gap-2"><button type="button" onClick={() => setIsCsvModalOpen(false)} className="bg-gray-200 px-4 py-2 rounded">Annulla</button><button type="submit" disabled={isCsvUploading} className="bg-blue-600 text-white px-4 py-2 rounded">Carica</button></div>
                        </form>
                    </div>
                </div>
            )}

            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
                        <div className="p-4 border-b flex justify-between"><h2 className="font-bold">Nuovo Punto</h2><button onClick={()=>setIsAddModalOpen(false)}><X/></button></div>
                        <form onSubmit={handleSubmitAdd(handleAddLocation)} className="p-6 space-y-4 overflow-y-auto">
                            <Controller name="comuneId" control={controlAdd} render={({field})=><Select options={comuniOptions} onChange={opt=>field.onChange(opt?.value)} placeholder="Comune..."/>}/>

                            {/* CAMPO NOME EDITABILE PER DISTRIBUTORI/RISTORANTI */}
                            <div className="flex flex-col">
                                <label className="text-xs font-bold mb-1">Nome Insegna</label>
                                <input {...registerAdd('name')} placeholder={brand.name} className="w-full border p-2 rounded"/>
                            </div>

                            <input {...registerAdd('address')} placeholder="Indirizzo" className="w-full border p-2 rounded"/>
                            <input {...registerAdd('phoneNumber')} placeholder="Telefono" className="w-full border p-2 rounded"/>
                            <Controller name="openingHours" control={controlAdd} render={({field})=><OpeningHoursInput value={field.value} onChange={field.onChange}/>}/>
                            <button type="submit" disabled={isAdding} className="w-full bg-green-500 text-white py-2 rounded font-bold">Salva</button>
                        </form>
                    </div>
                </div>
            )}

            {poiToEdit && <EditPoiModal poiToEdit={poiToEdit} onClose={() => setPoiToEdit(null)} onPoiUpdated={handlePoiUpdated} />}
        </>
    );
}

export default AdminChainDetailPage;
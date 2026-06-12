import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { Helmet } from 'react-helmet-async';
import {
    fetchComuneByIdForAdmin,
    updateComune,
    deleteComuneImage,
    updateComuneImage,
    deletePoi,
    importComuneCsv // <--- IMPORT NUOVO
} from '../../api';
import { ArrowLeft, Plus, Edit, Trash2, X, Save, Search, Filter, FileSpreadsheet } from 'lucide-react';
import AddPoiModal from '../../components/admin/AddPoiModal';
import EditPoiModal from '../../components/admin/EditPoiModal';
import RichTextEditor from '../../components/admin/forms/RichTextEditor';

const categoryLabels = {
    Supermarket: 'Supermercati', Restaurant: 'Ristoranti', FuelStation: 'Benzina',
    EmergencyService: 'Sanità / Farmacie', Accommodation: 'Alloggi', TouristAttraction: 'Turismo',
    Parking: 'Parcheggi', CarRepairShop: 'Officine', Bar: 'Bar'
};

function AdminComuneDetailPage() {
    const { id } = useParams();
    const [comune, setComune] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAddPoiModalOpen, setIsAddPoiModalOpen] = useState(false);
    const [isCsvModalOpen, setIsCsvModalOpen] = useState(false); // <--- STATO MODALE CSV
    const [poiToEdit, setPoiToEdit] = useState(null);
    const [editingImageId, setEditingImageId] = useState(null);
    const [attributionText, setAttributionText] = useState('');
    const [poiSearch, setPoiSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('ALL');

    const { register, handleSubmit, control, formState: { isSubmitting }, reset } = useForm();
    const { register: registerCsv, handleSubmit: handleSubmitCsv, formState: { isSubmitting: isCsvUploading } } = useForm();

    const loadData = useCallback(async () => {
        try {
            const response = await fetchComuneByIdForAdmin(id);
            setComune(response.data);
            reset({ name: response.data.name, description: response.data.description });
        } catch (error) { console.error(error); } finally { setLoading(false); }
    }, [id, reset]);

    useEffect(() => { setLoading(true); loadData(); }, [loadData]);

    const onComuneSubmit = async (data) => {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('description', data.description);
        if (data.images?.length > 0) { for (let i = 0; i < data.images.length; i++) formData.append('images', data.images[i]); }
        try { await updateComune(id, formData); alert("Dati aggiornati!"); loadData(); } catch (error) { alert("Errore update."); }
    };

    const handleCsvUpload = async (data) => {
        if (!data.file || !data.category) return alert("Compila tutti i campi.");
        const formData = new FormData();
        formData.append('file', data.file[0]);
        formData.append('category', data.category);

        try {
            const res = await importComuneCsv(id, formData);
            alert(res.data.message);
            if(res.data.errors?.length > 0) console.log("Errori:", res.data.errors);
            setIsCsvModalOpen(false);
            loadData();
        } catch (e) { alert("Errore import."); }
    };

    const handleDeleteImage = async (imageId) => { if (window.confirm("Eliminare?")) { try { await deleteComuneImage(imageId); loadData(); } catch (e) { alert("Errore."); } } };
    const handleEditAttribution = (image) => { setEditingImageId(image.id); setAttributionText(image.attribution || ''); };
    const handleSaveAttribution = async (imageId) => { try { await updateComuneImage(imageId, { attribution: attributionText }); setEditingImageId(null); loadData(); } catch (e) { alert("Errore."); } };
    const handleDeletePoi = async (poiId) => { if (window.confirm("Eliminare?")) { try { await deletePoi(poiId); loadData(); } catch (e) { alert("Errore."); } } };
    const handlePoiActionCompletion = () => { setIsAddPoiModalOpen(false); setPoiToEdit(null); loadData(); };

    const filteredPois = useMemo(() => {
        if (!comune?.pointofinterest) return [];
        return comune.pointofinterest.filter(poi => {
            const matchesSearch = poi.name.toLowerCase().includes(poiSearch.toLowerCase()) || (poi.address && poi.address.toLowerCase().includes(poiSearch.toLowerCase()));
            const matchesCategory = activeCategory === 'ALL' || poi.category === activeCategory;
            return matchesSearch && matchesCategory;
        });
    }, [comune, poiSearch, activeCategory]);

    const availableCategories = useMemo(() => {
        if (!comune?.pointofinterest) return [];
        const counts = {};
        comune.pointofinterest.forEach(poi => { counts[poi.category] = (counts[poi.category] || 0) + 1; });
        return Object.entries(counts).sort((a, b) => b[1] - a[1]);
    }, [comune]);

    if (loading) return <div className="p-8 text-center">Caricamento...</div>;
    if (!comune) return <div className="p-8 text-center">Comune non trovato.</div>;

    return (
        <>
            <Helmet><title>Admin: {comune.name}</title></Helmet>
            <Link to="/admin/comuni" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6">
                <ArrowLeft size={16} /> Torna a tutti i comuni
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-8">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h1 className="text-2xl font-bold text-gray-800 mb-4">Dettagli: {comune.name}</h1>
                        <form onSubmit={handleSubmit(onComuneSubmit)} className="space-y-4">
                            <div><label className="font-semibold">Nome</label><input {...register('name')} className="w-full border p-2 rounded bg-gray-50" readOnly /></div>
                            <div><label className="font-semibold block mb-2">Descrizione</label><Controller name="description" control={control} defaultValue={comune.description || ''} render={({field}) => <RichTextEditor value={field.value} onChange={field.onChange}/>} /></div>
                            <div><label className="text-sm">Nuove Immagini</label><input type="file" {...register('images')} multiple className="w-full text-sm mt-1 p-2 border rounded" /></div>
                            <div className="flex justify-end pt-2"><button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white px-5 py-2 rounded font-semibold">{isSubmitting ? '...' : 'Salva'}</button></div>
                        </form>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-gray-800">Punti di Interesse</h2>
                            <div className="flex gap-2">
                                <button onClick={() => setIsCsvModalOpen(true)} className="bg-blue-500 text-white px-3 py-2 rounded flex items-center gap-2 text-sm font-bold hover:bg-blue-600">
                                    <FileSpreadsheet size={16} /> CSV
                                </button>
                                <button onClick={() => setIsAddPoiModalOpen(true)} className="bg-green-500 text-white px-3 py-2 rounded flex items-center gap-2 text-sm font-bold hover:bg-green-600">
                                    <Plus size={16} /> Aggiungi
                                </button>
                            </div>
                        </div>

                        <div className="mb-4 relative">
                            <input type="text" placeholder="Cerca nome, indirizzo..." value={poiSearch} onChange={(e) => setPoiSearch(e.target.value)} className="w-full pl-9 p-2 border rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none" />
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        </div>

                        {availableCategories.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4 pb-2 border-b">
                                <button onClick={() => setActiveCategory('ALL')} className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${activeCategory === 'ALL' ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>Tutti ({comune.pointofinterest.length})</button>
                                {availableCategories.map(([cat, count]) => (
                                    <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${activeCategory === cat ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>{categoryLabels[cat] || cat} ({count})</button>
                                ))}
                            </div>
                        )}

                        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                            {filteredPois.length > 0 ? (
                                filteredPois.map(poi => (
                                    <div key={poi.id} className="border p-3 rounded-lg flex justify-between items-center hover:bg-gray-50 transition">
                                        <div className="overflow-hidden">
                                            <p className="font-bold text-gray-900 truncate">{poi.name}</p>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <span className="bg-gray-200 px-1.5 py-0.5 rounded">{categoryLabels[poi.category] || poi.category}</span>
                                                <span className="truncate">{poi.address}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <button onClick={() => setPoiToEdit(poi)} className="text-blue-600 bg-blue-50 p-2 rounded hover:bg-blue-100"><Edit size={16} /></button>
                                            <button onClick={() => handleDeletePoi(poi.id)} className="text-red-600 bg-red-50 p-2 rounded hover:bg-red-100"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                ))
                            ) : ( <div className="text-center text-gray-500 py-10 border-2 border-dashed rounded-lg"><Filter size={32} className="mx-auto mb-2 text-gray-300" /><p>Nessun POI trovato.</p></div> )}
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md self-start">
                    <h2 className="text-2xl font-bold mb-4">Immagini Comune</h2>
                    <div className="space-y-4 max-h-[800px] overflow-y-auto pr-1">
                        {comune.images && comune.images.length > 0 ? (
                            comune.images.map(img => (
                                <div key={img.id} className="border-b pb-4 last:border-b-0">
                                    <div className="flex gap-4">
                                        <img src={img.url} alt="Comune" className="w-24 h-24 object-cover rounded border flex-shrink-0"/>
                                        <div className="flex-grow">
                                            {editingImageId === img.id ? ( <textarea value={attributionText} onChange={(e) => setAttributionText(e.target.value)} className="w-full border p-2 rounded text-xs" rows="3"/> ) : ( <p className="text-xs text-gray-600 italic">{img.attribution || "No attribuzione"}</p> )}
                                        </div>
                                    </div>
                                    <div className="flex justify-end items-center gap-2 mt-2">
                                        {editingImageId === img.id ? ( <> <button onClick={() => setEditingImageId(null)} className="text-gray-500 p-1 hover:bg-gray-100 rounded"><X size={16}/></button> <button onClick={() => handleSaveAttribution(img.id)} className="text-green-600 p-1 hover:bg-green-100 rounded"><Save size={16}/></button> </> ) : ( <button onClick={() => handleEditAttribution(img)} className="text-blue-600 p-1 hover:bg-blue-100 rounded"><Edit size={16}/></button> )}
                                        <button onClick={() => handleDeleteImage(img.id)} className="text-red-600 p-1 hover:bg-red-100 rounded"><Trash2 size={16}/></button>
                                    </div>
                                </div>
                            ))
                        ) : <p className="text-sm text-gray-500 py-4">Nessuna immagine.</p>}
                    </div>
                </div>
            </div>

            {/* MODALE IMPORT CSV */}
            {isCsvModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="p-4 border-b flex justify-between items-center"><h2 className="text-xl font-bold">Importa CSV</h2><button onClick={() => setIsCsvModalOpen(false)}><X /></button></div>
                        <form onSubmit={handleSubmitCsv(handleCsvUpload)} className="p-6">
                            <div className="mb-4">
                                <label className="block text-sm font-semibold mb-1">Categoria (Obbligatorio)</label>
                                <select {...registerCsv('category', { required: true })} className="w-full border p-2 rounded">
                                    <option value="">Seleziona...</option>

                                    <optgroup label="Principali">
                                        <option value="Supermarket">Supermercati</option>
                                        <option value="Restaurant">Ristoranti</option>
                                        <option value="FuelStation">Benzina</option>
                                        <option value="Bar">Bar</option>
                                    </optgroup>

                                    <optgroup label="Sanità & Emergenza">
                                        {/* Il backend leggerà quello che c'è dopo i due punti */}
                                        <option value="EmergencyService:Farmacia">Farmacia</option>
                                        <option value="EmergencyService:Ospedale">Ospedale</option>
                                        <option value="EmergencyService:Guardia Medica">Guardia Medica</option>
                                        <option value="EmergencyService:Ambulatorio">Ambulatorio</option>
                                        <option value="EmergencyService:Altro">Altro Sanità</option>
                                    </optgroup>

                                    <optgroup label="Altro">
                                        <option value="Accommodation">Alloggi</option>
                                        <option value="TouristAttraction">Turismo</option>
                                        <option value="Parking">Parcheggi</option>
                                        <option value="CarRepairShop">Officine</option>
                                    </optgroup>
                                </select>
                            </div>

                            <div className="mb-4 text-sm text-gray-600">
                                <p>Formato CSV: <strong>Nome;Indirizzo;Telefono;Lun..Dom</strong></p>
                                <p className="text-xs text-gray-500 mt-1">Usa <code>ND</code> per orari non disponibili.</p>
                            </div>

                            <input type="file" accept=".csv" {...registerCsv('file', { required: true })} className="w-full mb-4 border p-2 rounded" />
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setIsCsvModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded">Annulla</button>
                                <button type="submit" disabled={isCsvUploading} className="px-4 py-2 bg-blue-600 text-white rounded">{isCsvUploading ? 'Carica' : 'Carica'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {isAddPoiModalOpen && <AddPoiModal comuneId={comune.id} onClose={() => setIsAddPoiModalOpen(false)} onPoiAdded={handlePoiActionCompletion} />}
            {poiToEdit && <EditPoiModal poiToEdit={poiToEdit} onClose={() => setPoiToEdit(null)} onPoiUpdated={handlePoiActionCompletion} />}
        </>
    );
}

export default AdminComuneDetailPage;
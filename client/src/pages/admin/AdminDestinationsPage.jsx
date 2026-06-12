import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { fetchDestinationsForAdmin, createDestination, updateDestination, deleteDestination, deleteDestinationImage, updateDestinationImage } from '../../api';
import { PlusCircle, Edit, Trash2, X, Save, ChevronLeft, ChevronRight } from 'lucide-react';
import RichTextEditor from '../../components/admin/forms/RichTextEditor';

function AdminDestinationsPage() {
    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDest, setEditingDest] = useState(null);

    // Stati per Paginazione
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Stati per Attribuzione Immagini
    const [editingImageId, setEditingImageId] = useState(null);
    const [attributionText, setAttributionText] = useState('');

    const [formData, setFormData] = useState({
        name: '', region: '', description: '', tags: '', season: 'Estate', rating: '5.0', images: [],
        isFeaturedHome: false,
        isFeaturedTravel: false
    });

    const loadDestinations = async (pageToLoad = 1) => {
        setLoading(true);
        try {
            const response = await fetchDestinationsForAdmin({ page: pageToLoad, limit: 15 });
            setDestinations(response.data.data);
            setCurrentPage(response.data.pagination.page);
            setTotalPages(response.data.pagination.totalPages);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    useEffect(() => { loadDestinations(currentPage); }, [currentPage]);

    const handleChange = (e) => {
        if (e.target.name === 'images') {
            setFormData({ ...formData, images: e.target.files });
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };

    const handleDescriptionChange = (content) => {
        setFormData({ ...formData, description: content });
    };

    const openModal = (dest = null) => {
        if (dest) {
            setEditingDest(dest);
            setFormData({
                name: dest.name, region: dest.region, description: dest.description || '',
                tags: dest.tags || '', season: dest.season, rating: dest.rating, images: [],
                isFeaturedHome: dest.isFeaturedHome || false,
                isFeaturedTravel: dest.isFeaturedTravel || false
            });
        } else {
            setEditingDest(null);
            setFormData({ name: '', region: '', description: '', tags: '', season: 'Estate', rating: '5.0', images: [], isFeaturedHome: false });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (key === 'images') {
                for (let i = 0; i < formData.images.length; i++) data.append('images', formData.images[i]);
            } else {
                data.append(key, formData[key]);
            }
        });

        try {
            if (editingDest) await updateDestination(editingDest.id, data);
            else await createDestination(data);
            setIsModalOpen(false);
            loadDestinations(currentPage);
        } catch (error) { alert("Errore durante il salvataggio."); }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Eliminare questa destinazione?")) {
            try { await deleteDestination(id); loadDestinations(currentPage); } catch (error) { alert("Errore."); }
        }
    };

    const handleDeleteImage = async (imageId) => {
        if (window.confirm("Eliminare l'immagine?")) {
            try {
                await deleteDestinationImage(imageId);
                setEditingDest(prev => ({...prev, images: prev.images.filter(img => img.id !== imageId)}));
                loadDestinations(currentPage);
            } catch (error) { alert("Errore."); }
        }
    };

    const handleEditAttribution = (image) => {
        setEditingImageId(image.id);
        setAttributionText(image.attribution || '');
    };

    const handleSaveAttribution = async (imageId) => {
        try {
            await updateDestinationImage(imageId, { attribution: attributionText });
            setEditingDest(prev => ({
                ...prev,
                images: prev.images.map(img => img.id === imageId ? { ...img, attribution: attributionText } : img)
            }));
            setEditingImageId(null);
            loadDestinations(currentPage);
        } catch (error) { alert("Errore salvataggio attribuzione."); }
    };

    return (
        <>
            <Helmet><title>Gestione Destinazioni</title></Helmet>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Destinazioni</h1>
                    <button onClick={() => openModal()} className="bg-green-500 text-white px-4 py-2 rounded flex items-center gap-2">
                        <PlusCircle size={18} /> Aggiungi
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-xs uppercase">
                        <tr>
                            <th className="px-6 py-3">Nome</th>
                            <th className="px-6 py-3">Regione</th>
                            <th className="px-6 py-3">Stagione</th>
                            <th className="px-6 py-3">Rating</th>
                            <th className="px-6 py-3">Azioni</th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? <tr><td colSpan="5" className="p-4 text-center">Caricamento...</td></tr> :
                            destinations.map(dest => (
                                <tr key={dest.id} className="border-b">
                                    <td className="px-6 py-4 font-bold">
                                        {dest.name}
                                        {dest.isFeaturedHome && <span className="ml-2 text-xs bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full">IN HOME</span>}
                                    </td>
                                    <td className="px-6 py-4">{dest.region}</td>
                                    <td className="px-6 py-4">{dest.season}</td>
                                    <td className="px-6 py-4">{dest.rating}</td>
                                    <td className="px-6 py-4 flex gap-2">
                                        <button onClick={() => openModal(dest)} className="text-blue-600"><Edit size={18}/></button>
                                        <button onClick={() => handleDelete(dest.id)} className="text-red-600"><Trash2 size={18}/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-6 flex justify-between items-center border-t pt-4 text-sm text-gray-600">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="flex items-center gap-1 text-blue-600 hover:bg-blue-50 px-3 py-1 rounded disabled:text-gray-300 disabled:hover:bg-transparent"
                    >
                        <ChevronLeft size={16} /> Precedente
                    </button>

                    <span>Pagina <strong>{currentPage}</strong> di <strong>{totalPages}</strong></span>

                    <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-1 text-blue-600 hover:bg-blue-50 px-3 py-1 rounded disabled:text-gray-300 disabled:hover:bg-transparent"
                    >
                        Successiva <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            {/* MODALE AGGIUNTA/MODIFICA */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                        <div className="p-4 border-b flex justify-between">
                            <h2 className="text-xl font-bold">{editingDest ? 'Modifica' : 'Nuova'} Destinazione</h2>
                            <button onClick={() => setIsModalOpen(false)}><X /></button>
                        </div>

                        <div className="p-6 overflow-y-auto flex flex-col lg:flex-row gap-8">

                            {/* FORM DATI */}
                            <form id="destForm" onSubmit={handleSubmit} className="flex-1 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label>Nome *</label><input name="name" value={formData.name}
                                                                     onChange={handleChange} required
                                                                     className="w-full border p-2 rounded"/></div>
                                    <div><label>Regione *</label><input name="region" value={formData.region}
                                                                        onChange={handleChange} required
                                                                        className="w-full border p-2 rounded"/></div>
                                    <div>
                                        <label>Stagione *</label>
                                        <select name="season" value={formData.season} onChange={handleChange}
                                                className="w-full border p-2 rounded">
                                            <option value="Primavera">Primavera</option>
                                            <option value="Estate">Estate</option>
                                            <option value="Autunno">Autunno</option>
                                            <option value="Inverno">Inverno</option>
                                            <option value="Tutto l'anno">Tutto l'anno</option>
                                        </select>
                                    </div>
                                    <div><label>Voto (1-5) *</label><input type="number" step="0.1" name="rating"
                                                                           value={formData.rating}
                                                                           onChange={handleChange} required
                                                                           className="w-full border p-2 rounded"/></div>
                                </div>
                                <div><label>Tags</label><input name="tags" value={formData.tags} onChange={handleChange}
                                                               className="w-full border p-2 rounded"
                                                               placeholder="Es. Mare, Natura..."/></div>

                                {/* ▼▼▼ CHECKBOX INSERITO QUI ▼▼▼ */}
                                <div>
                                    <label
                                        className="flex items-center gap-2 cursor-pointer bg-sky-50 p-3 rounded-lg border border-sky-100">
                                        <input
                                            type="checkbox"
                                            name="isFeaturedHome"
                                            checked={formData.isFeaturedHome}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                isFeaturedHome: e.target.checked
                                            })}
                                            className="w-5 h-5 text-sky-600 rounded focus:ring-sky-500"
                                        />
                                        <span
                                            className="font-bold text-sky-800">Mostra in Homepage (Top Destinazioni)</span>
                                    </label>
                                </div>

                                <div>
                                    <label
                                        className="flex items-center gap-2 cursor-pointer bg-emerald-50 p-3 rounded-lg border border-emerald-100 mt-2">
                                        <input
                                            type="checkbox"
                                            name="isFeaturedTravel"
                                            checked={formData.isFeaturedTravel}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                isFeaturedTravel: e.target.checked
                                            })}
                                            className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                                        />
                                        <span className="font-bold text-emerald-800">Mostra in Pagina Viaggi</span>
                                    </label>
                                </div>
                                {/* ▲▲▲ FINE INSERIMENTO ▲▲▲ */}

                                <div>
                                    <label className="font-semibold block mb-2">Descrizione</label>
                                    <RichTextEditor value={formData.description} onChange={handleDescriptionChange}/>
                                </div>

                                <div>
                                    <label className="font-semibold block mb-2">Carica Immagini (Nuove)</label>
                                    <input type="file" name="images" multiple onChange={handleChange}
                                           className="w-full border p-2 rounded"/>
                                </div>
                            </form>

                            {/* GESTIONE IMMAGINI CON ATTRIBUZIONE */}
                            {editingDest && (
                                <div
                                    className="w-full lg:w-1/3 border-t lg:border-t-0 lg:border-l pt-6 lg:pt-0 lg:pl-6">
                                    <h3 className="font-bold mb-4">Immagini Caricate</h3>
                                    <div className="space-y-4">
                                        {editingDest.images?.map(img => (
                                            <div key={img.id}
                                                 className="border p-2 rounded bg-gray-50 flex flex-col gap-2">
                                                <img src={img.url} className="w-full h-32 object-cover rounded"/>

                                                {editingImageId === img.id ? (
                                                    <div className="flex flex-col gap-2 mt-2">
                                                    <textarea value={attributionText} onChange={(e) => setAttributionText(e.target.value)} className="w-full border p-1 rounded text-xs" rows="2" placeholder="Es. Autore: Mario | Unsplash" />
                                                        <div className="flex justify-end gap-2">
                                                            <button onClick={() => setEditingImageId(null)} className="text-gray-500 hover:bg-gray-200 p-1 rounded"><X size={14}/></button>
                                                            <button onClick={() => handleSaveAttribution(img.id)} className="text-green-600 hover:bg-green-200 p-1 rounded"><Save size={14}/></button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex justify-between items-start mt-2">
                                                        <p className="text-xs text-gray-500 italic truncate" title={img.attribution}>{img.attribution || 'Nessuna attribuzione'}</p>
                                                        <div className="flex gap-1 flex-shrink-0">
                                                            <button onClick={() => handleEditAttribution(img)} className="text-blue-600 p-1 hover:bg-blue-100 rounded"><Edit size={14}/></button>
                                                            <button onClick={() => handleDeleteImage(img.id)} className="text-red-600 p-1 hover:bg-red-100 rounded"><Trash2 size={14}/></button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t flex justify-end gap-4 bg-gray-50 rounded-b-lg flex-shrink-0">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-200 px-4 py-2 rounded font-semibold text-gray-700">Annulla</button>
                            <button type="submit" form="destForm" className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700">Salva Destinazione</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default AdminDestinationsPage;
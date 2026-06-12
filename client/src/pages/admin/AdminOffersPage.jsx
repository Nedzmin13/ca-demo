import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm, Controller } from 'react-hook-form';
import {
    fetchOffersForAdmin, createOffer, updateOffer, deleteOffer, deleteOfferImage
} from '../../api';
import { Edit, Trash2, X } from 'lucide-react';
import RichTextEditor from '../../components/admin/forms/RichTextEditor';

const categories = [
    "Elettronica", "Casa", "Abbigliamento", "Alimentari", "Bambini",
    "Cosmetici", "Auto & Moto", "Sport e Tempo Libero", "Altro"
];

function AdminOffersPage() {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingOffer, setEditingOffer] = useState(null);
    const { register, handleSubmit, reset, control, formState: { isSubmitting } } = useForm();

    const loadOffers = async () => {
        setLoading(true);
        try {
            const response = await fetchOffersForAdmin();
            setOffers(response.data);
        } catch (error) {
            console.error("Errore caricamento offerte:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadOffers(); }, []);

    useEffect(() => {
        if (editingOffer) {

            const formattedOffer = { ...editingOffer };
            if (formattedOffer.expiresAt) {
                formattedOffer.expiresAt = formattedOffer.expiresAt.split('T')[0];
            }
            reset(formattedOffer);
        } else {
            reset({ title: '', store: '', discount: '', link: '', category: '', description: '', expiresAt: '', images: null });
        }
    }, [editingOffer, reset]);

    const onSubmit = async (data) => {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (key === 'images') {
                if (data.images && data.images.length > 0) {
                    for (let i = 0; i < data.images.length; i++) formData.append('images', data.images[i]);
                }
            } else {

                formData.append(key, data[key] || '');
            }
        });
        try {
            if (editingOffer) {
                await updateOffer(editingOffer.id, formData);
            } else {
                await createOffer(formData);
            }
            setEditingOffer(null);
            loadOffers();
        } catch (error) {
            console.error("Errore salvataggio:", error);
            alert("Errore durante il salvataggio.");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Sei sicuro di voler eliminare questa offerta?")) {
            try {
                await deleteOffer(id);
                loadOffers();
            } catch (error) { alert("Errore durante l'eliminazione."); }
        }
    };

    const handleDeleteImage = async (imageId) => {
        if (window.confirm("Sei sicuro di voler eliminare questa immagine?")) {
            try {
                await deleteOfferImage(imageId);
                setEditingOffer(prev => ({
                    ...prev,
                    images: prev.images.filter(img => img.id !== imageId)
                }));
            } catch (error) { alert("Errore eliminazione immagine."); }
        }
    };

    const getImageUrl = (offer) => {
        if (offer.images && offer.images.length > 0 && offer.images[0].url) {
            return offer.images[0].url;
        }
        return `https://ui-avatars.com/api/?name=${offer.title.charAt(0)}&background=e0e7ff&color=4f46e5&size=128`;
    };

    return (
        <>
            <Helmet><title>Gestione Offerte - Admin</title></Helmet>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-lg shadow-md sticky top-8">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">{editingOffer ? 'Modifica Offerta' : 'Aggiungi Nuova Offerta'}</h2>
                            {editingOffer && <button onClick={() => setEditingOffer(null)} className="text-sm flex items-center gap-1 text-gray-600 hover:text-gray-900"><X size={14}/> Annulla</button>}
                        </div>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div><label>Titolo *</label><input {...register('title', { required: true })} className="w-full border p-2 rounded mt-1"/></div>
                            <div><label>Store *</label><input {...register('store', { required: true })} className="w-full border p-2 rounded mt-1"/></div>

                            <div className="grid grid-cols-2 gap-2">
                                <div><label>Sconto *</label><input {...register('discount', { required: true })} placeholder="-50% o -20€" className="w-full border p-2 rounded mt-1"/></div>
                                {/* ▼▼▼ AGGIUNTO CAMPO DATA DI SCADENZA ▼▼▼ */}
                                <div><label>Scade il (opz.)</label><input type="date" {...register('expiresAt')} className="w-full border p-2 rounded mt-1"/></div>
                            </div>

                            <div><label>Link all'offerta *</label><input type="url" {...register('link', { required: true })} className="w-full border p-2 rounded mt-1"/></div>
                            <div><label>Categoria *</label>
                                <select {...register('category', { required: true })} className="w-full border p-2 rounded mt-1">
                                    <option value="">Seleziona...</option>
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="font-semibold block mb-2">Descrizione</label>
                                <Controller
                                    name="description"
                                    control={control}
                                    defaultValue=""
                                    render={({ field }) => <RichTextEditor value={field.value} onChange={field.onChange} />}
                                />
                            </div>
                            <hr />
                            <h3 className="font-semibold">Immagini</h3>
                            {editingOffer && editingOffer.images && editingOffer.images.length > 0 && (
                                <div className="grid grid-cols-3 gap-2">
                                    {editingOffer.images.map(img => (
                                        <div key={img.id} className="relative group">
                                            <img src={img.url} alt="Anteprima" className="w-full h-16 object-cover rounded"/>
                                            <button type="button" onClick={() => handleDeleteImage(img.id)} className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100"><X size={12}/></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div>
                                <label className="text-sm">{editingOffer ? 'Aggiungi Nuove Immagini' : 'Carica Immagini'}</label>
                                <input type="file" {...register('images')} multiple className="w-full text-sm mt-1 p-2 border rounded"/>
                            </div>
                            <button type="submit" disabled={isSubmitting} className={`w-full text-white py-2.5 rounded-lg font-semibold transition-colors ${editingOffer ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-500 hover:bg-green-600'} disabled:bg-gray-400`}>
                                {isSubmitting ? 'Salvataggio...' : (editingOffer ? 'Salva Modifiche' : 'Aggiungi Offerta')}
                            </button>
                        </form>
                    </div>
                </div>

                {/* LISTA OFFERTE A DESTRA */}
                <div className="lg:col-span-2">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold mb-4">Offerte Esistenti ({offers.length})</h2>
                        <div className="space-y-4">
                            {loading ? <p>Caricamento...</p> : offers.map(offer => (
                                <div key={offer.id} className="border p-4 rounded-lg flex justify-between items-center">
                                    <div className="flex items-center gap-4 flex-grow">
                                        <img src={getImageUrl(offer)} alt={offer.title} className="w-16 h-16 object-cover rounded-md bg-indigo-100"/>
                                        <div>
                                            <p className="font-bold">{offer.title}</p>
                                            <div className="flex gap-2 text-sm text-gray-500">
                                                <span>{offer.store}</span>
                                                {/* Mostriamo un pallino rosso se scade presto, verde altrimenti */}
                                                {offer.expiresAt && (
                                                    <span className={new Date(offer.expiresAt) < new Date() ? 'text-red-500' : 'text-green-600'}>
                                                        | Scadenza: {new Date(offer.expiresAt).toLocaleDateString('it-IT')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                                        <button onClick={() => setEditingOffer(offer)} className="text-blue-500 hover:text-blue-700"><Edit size={18}/></button>
                                        <button onClick={() => handleDelete(offer.id)} className="text-red-500 hover:text-red-700"><Trash2 size={18}/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
export default AdminOffersPage;
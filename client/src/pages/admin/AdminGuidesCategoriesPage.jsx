import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { fetchCategoriesForAdmin, createCategory, updateCategory, deleteCategory } from '../../api';
import { ChevronRight, Plus, Edit, Trash2, X } from 'lucide-react';

function AdminGuidesCategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingCategory, setEditingCategory] = useState(null); // Per gestire la modifica
    const { register, handleSubmit, reset, setValue, formState: { isSubmitting } } = useForm();

    const loadCategories = async () => {
        setLoading(true);
        try {
            const response = await fetchCategoriesForAdmin();
            setCategories(response.data);
        } catch (error) {
            console.error("Errore nel caricare le categorie:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    // Popola il form quando si clicca su "Modifica"
    useEffect(() => {
        if (editingCategory) {
            setValue('name', editingCategory.name);
            setValue('description', editingCategory.description);
            setValue('iconName', editingCategory.iconName);
        } else {
            reset({ name: '', description: '', iconName: '' });
        }
    }, [editingCategory, setValue, reset]);

    const onSubmit = async (data) => {
        try {
            if (editingCategory) {
                await updateCategory(editingCategory.id, data);
            } else {
                await createCategory(data);
            }
            reset();
            setEditingCategory(null);
            loadCategories(); // Ricarica la lista
        } catch (error) {
            alert("Errore durante il salvataggio della categoria.");
        }
    };

    const handleDelete = async (categoryId) => {
        if (window.confirm("Sei sicuro di voler eliminare questa categoria? TUTTE le guide al suo interno verranno cancellate.")) {
            try {
                await deleteCategory(categoryId);
                loadCategories();
            } catch (error) {
                alert("Errore durante l'eliminazione.");
            }
        }
    };

    return (
        <>
            <Helmet><title>Gestione Categorie Guide - Admin</title></Helmet>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Colonna Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-lg shadow-md sticky top-8">
                        <h2 className="text-2xl font-bold mb-4">
                            {editingCategory ? 'Modifica Categoria' : 'Crea Nuova Categoria'}
                        </h2>
                        {editingCategory && (
                            <button onClick={() => setEditingCategory(null)} className="text-sm text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-1">
                                <X size={14} /> Annulla Modifica
                            </button>
                        )}
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div><label>Nome Categoria *</label><input {...register('name', { required: true })} className="w-full border p-2 rounded mt-1" /></div>
                            <div><label>Descrizione</label><textarea {...register('description')} rows="3" className="w-full border p-2 rounded mt-1"></textarea></div>
                            <div><label>Nome Icona (da Lucide)</label><input {...register('iconName')} className="w-full border p-2 rounded mt-1" placeholder="Es. FileText" /></div>
                            <button type="submit" disabled={isSubmitting} className={`w-full text-white py-2.5 rounded-lg font-semibold ${editingCategory ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-500 hover:bg-green-600'}`}>
                                {isSubmitting ? 'Salvataggio...' : (editingCategory ? 'Salva Modifiche' : 'Crea Categoria')}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Colonna Lista Categorie */}
                <div className="lg:col-span-2">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold mb-4">Categorie Esistenti ({categories.length})</h2>
                        <div className="space-y-3">
                            {loading ? <p>Caricamento...</p> : categories.map(category => (
                                <div key={category.id} className="border p-4 rounded-lg flex justify-between items-center group">
                                    <Link
                                        key={category.id}
                                        // Passiamo il nome della categoria tramite lo 'state' del link
                                        to={`/admin/guide/category/${category.id}`}
                                        state={{ categoryName: category.name }}
                                        className="block p-6 bg-gray-50 rounded-lg border hover:border-sky-500 hover:bg-white transition-all group"
                                    >
                                        <div className="flex justify-between items-center">
                                            <h3 className="font-bold text-lg group-hover:text-sky-600">{category.name} ({category._count.guides})</h3>
                                            <ChevronRight className="text-gray-400 group-hover:text-sky-600" />
                                        </div>
                                    </Link>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => setEditingCategory(category)} className="text-blue-500 hover:text-blue-700" title="Modifica Categoria">
                                            <Edit size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(category.id)} className="text-red-500 hover:text-red-700" title="Elimina Categoria">
                                            <Trash2 size={18} />
                                        </button>
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

export default AdminGuidesCategoriesPage;
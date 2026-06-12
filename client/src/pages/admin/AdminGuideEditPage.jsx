import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
// 1. IMPORTA CONTROLLER
import { useForm, Controller } from 'react-hook-form';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    createGuide,
    updateGuide,
    fetchGuideByIdAdmin,
    addGuideImages,
    deleteGuideImage
} from '../../api';
import { ArrowLeft, X } from 'lucide-react';

// 2. IMPORTA L'EDITOR
import RichTextEditor from '../../components/admin/forms/RichTextEditor';

function AdminGuideEditPage() {
    const { categoryId, guideId } = useParams();
    const navigate = useNavigate();
    const isCreating = !guideId;

    // 3. ESTRAGGI 'control'
    const { register, handleSubmit, reset, control, formState: { isSubmitting, errors } } = useForm();

    const [guide, setGuide] = useState(null);
    const [loading, setLoading] = useState(!isCreating);

    const loadGuide = useCallback(async () => {
        if (isCreating) return;
        setLoading(true);
        try {
            const response = await fetchGuideByIdAdmin(guideId);
            setGuide(response.data);
            reset(response.data);
        } catch (error) {
            console.error("Errore nel caricare la guida:", error);
            navigate('/admin/guide');
        } finally {
            setLoading(false);
        }
    }, [guideId, isCreating, reset, navigate]);

    useEffect(() => {
        loadGuide();
    }, [loadGuide]);

    const onSubmit = async (data) => {
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('excerpt', data.excerpt);
        formData.append('content', data.content);

        if (data.image && data.image.length > 0) {
            formData.append('image', data.image[0]);
        }

        try {
            if (isCreating) {
                formData.append('categoryId', categoryId);
                await createGuide(formData);
            } else {
                formData.append('existingImageUrl', guide.imageUrl || '');
                await updateGuide(guideId, formData);

                if (data.additionalImages && data.additionalImages.length > 0) {
                    const imageFormData = new FormData();
                    for(let i=0; i < data.additionalImages.length; i++) {
                        imageFormData.append('images', data.additionalImages[i]);
                    }
                    await addGuideImages(guideId, imageFormData);
                }
            }
            const targetCategoryId = isCreating ? categoryId : guide.categoryId;
            navigate(`/admin/guide/category/${targetCategoryId}`);
        } catch (error) {
            alert(error.response?.data?.message || "Errore.");
        }
    };

    const handleDeleteImage = async (imageId) => {
        if (window.confirm("Sei sicuro di voler eliminare questa immagine?")) {
            await deleteGuideImage(imageId);
            loadGuide();
        }
    };

    if (loading) return <div className="p-8 text-center">Caricamento...</div>;

    return (
        <>
            <Helmet><title>{isCreating ? 'Crea Nuova Guida' : `Modifica: ${guide?.title || ''}`}</title></Helmet>
            <Link to={isCreating ? `/admin/guide/category/${categoryId}` : `/admin/guide/category/${guide?.categoryId}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6">
                <ArrowLeft size={16} /> Annulla e torna alla lista
            </Link>

            <div className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">{isCreating ? 'Aggiungi Nuova Guida' : 'Modifica Guida'}</h1>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                    {!isCreating && guide && (
                        <div>
                            <label className="text-sm font-semibold text-gray-500 uppercase">Categoria</label>
                            <div className="text-lg font-medium text-gray-800">{guide.category?.name}</div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="font-semibold block mb-1">Titolo Guida *</label>
                            <input {...register('title', { required: "Il titolo è obbligatorio." })} className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Es. Come richiedere il passaporto"/>
                            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
                        </div>

                        <div className="col-span-2">
                            <label className="font-semibold block mb-1">Estratto (breve descrizione per anteprima)</label>
                            <textarea {...register('excerpt')} rows="3" className="w-full border p-2 rounded-lg" placeholder="Breve riassunto che appare nella lista..."></textarea>
                        </div>
                    </div>

                    {/* 4. SOSTITUZIONE CON EDITOR */}
                    <div className="col-span-2">
                        <label className="font-semibold block mb-2">Contenuto Completo</label>
                        <Controller
                            name="content"
                            control={control}
                            defaultValue=""
                            render={({ field }) => (
                                <RichTextEditor
                                    value={field.value || ''}
                                    onChange={field.onChange}
                                />
                            )}
                        />
                    </div>

                    <hr className="border-gray-200"/>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Immagine Copertina */}
                        <div>
                            <h3 className="font-semibold mb-2">Immagine di Copertina</h3>
                            {!isCreating && guide?.imageUrl && <img src={guide.imageUrl} alt="Copertina" className="w-full h-48 object-cover rounded-lg mb-3 border"/>}
                            <input type="file" {...register('image')} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                        </div>

                        {/* Galleria Aggiuntiva (Solo in modifica) */}
                        {!isCreating && (
                            <div>
                                <h3 className="font-semibold mb-2">Galleria Immagini</h3>
                                <div className="grid grid-cols-3 gap-2 mb-3">
                                    {guide?.images?.map(img => (
                                        <div key={img.id} className="relative group">
                                            <img src={img.url} alt="Galleria" className="w-full h-20 object-cover rounded border"/>
                                            <button type="button" onClick={() => handleDeleteImage(img.id)} className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"><X size={12}/></button>
                                        </div>
                                    ))}
                                </div>
                                <label className="text-sm block mb-1">Aggiungi altre foto:</label>
                                <input type="file" {...register('additionalImages')} multiple className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"/>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end pt-6">
                        <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400 transition shadow-lg">
                            {isSubmitting ? 'Salvataggio in corso...' : 'Salva Guida'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

export default AdminGuideEditPage;
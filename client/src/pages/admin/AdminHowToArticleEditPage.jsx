import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm, Controller } from 'react-hook-form';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    createHowToArticle,
    updateHowToArticle,
    fetchHowToArticleByIdAdmin,
    addHowToArticleImages,
    deleteHowToArticleImage
} from '../../api';
import { ArrowLeft, X } from 'lucide-react';
import RichTextEditor from '../../components/admin/forms/RichTextEditor';

function AdminHowToArticleEditPage() {
    const { categoryId, articleId } = useParams();
    const navigate = useNavigate();
    const isCreating = !articleId;
    const { register, handleSubmit, reset, control, formState: { isSubmitting } } = useForm();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(!isCreating);

    const loadArticle = useCallback(async () => {
        if (isCreating) return;
        setLoading(true);
        try {
            const response = await fetchHowToArticleByIdAdmin(articleId);
            setArticle(response.data);
            reset(response.data);
        } catch (error) { navigate('/admin/howto'); }
        finally { setLoading(false); }
    }, [articleId, isCreating, reset, navigate]);

    useEffect(() => { loadArticle(); }, [loadArticle]);

    const onSubmit = async (data) => {
        const { images, ...textData } = data;
        try {
            let savedArticle;
            if (isCreating) {
                // 1. Invia solo i dati di testo (incluso il 'content' con l'immagine Base64)
                const response = await createHowToArticle({ ...textData, categoryId });
                savedArticle = response.data;
            } else {
                // 1. Invia solo i dati di testo per l'aggiornamento
                await updateHowToArticle(articleId, textData);
                savedArticle = { id: articleId };
            }

            // 2. DOPO aver salvato il testo, se ci sono immagini per la GALLERIA, le carichiamo
            if (images && images.length > 0) {
                const imageFormData = new FormData();
                for (let i = 0; i < images.length; i++) {
                    imageFormData.append('images', images[i]);
                }
                await addHowToArticleImages(savedArticle.id, imageFormData);
            }

            const targetCategoryId = isCreating ? categoryId : article.categoryId;
            navigate(`/admin/howto/category/${targetCategoryId}`);
        } catch (error) {
            alert(error.response?.data?.message || "Errore durante il salvataggio.");
        }
    };
    const handleDeleteImage = async (imageId) => {
        if (window.confirm("Sei sicuro?")) {
            // --- USA NOME CORRETTO ---
            await deleteHowToArticleImage(imageId);
            loadArticle();
        }
    };

    if (loading) return <div className="p-8 text-center">Caricamento...</div>;

    return (
        <>
            <Helmet><title>{isCreating ? 'Crea Articolo' : `Modifica: ${article?.title || ''}`}</title></Helmet>
            <Link to={isCreating ? `/admin/howto/category/${categoryId}` : `/admin/howto/category/${article?.categoryId}`} className="flex items-center gap-2 text-sm mb-6">
                <ArrowLeft size={16} /> Annulla
            </Link>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold mb-6">{isCreating ? 'Aggiungi Nuovo Articolo' : 'Modifica Articolo'}</h1>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="font-semibold">Titolo Articolo *</label>
                        <input {...register('title', { required: true })} className="w-full border p-2 rounded mt-1" />
                    </div>
                    <div>
                        <label className="font-semibold">Estratto (breve descrizione)</label>
                        <textarea {...register('excerpt')} rows="3" className="w-full border p-2 rounded mt-1"></textarea>
                    </div>
                    <div>
                        <label className="font-semibold block mb-2">Contenuto Completo</label>
                        <Controller name="content" control={control} defaultValue="" render={({ field }) => (<RichTextEditor value={field.value} onChange={field.onChange} />)}/>
                    </div>
                    <hr />
                    <div>
                        <h3 className="font-semibold mb-2">Galleria Immagini (in cima all'articolo)</h3>
                        {!isCreating && article?.images?.length > 0 && (
                            <div className="grid grid-cols-4 gap-4 mb-4">
                                {article.images.map(img => (
                                    <div key={img.id} className="relative group">
                                        <img src={img.url} alt="Anteprima" className="w-full h-24 object-cover rounded-md border"/>
                                        <button type="button" onClick={() => handleDeleteImage(img.id)} className="absolute -top-1 -right-1 bg-red-600 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100"><X size={12}/></button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <label className="text-sm">Aggiungi Immagini alla Galleria</label>
                        <input type="file" {...register('images')} multiple className="w-full text-sm mt-1 p-2 border rounded-md"/>
                    </div>
                    <div className="flex justify-end pt-4">
                        <button type="submit" disabled={isSubmitting} className="bg-green-500 text-white px-6 py-2 rounded-lg font-semibold">
                            {isSubmitting ? 'Salvataggio...' : 'Salva Articolo'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

export default AdminHowToArticleEditPage;
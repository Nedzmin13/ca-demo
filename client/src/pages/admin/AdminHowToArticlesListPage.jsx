import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams, useLocation } from 'react-router-dom';
import { fetchHowToArticlesByCategoryIdAdmin, deleteHowToArticle } from '../../api';
import { Edit, Trash2, ArrowLeft, Plus } from 'lucide-react';

function AdminHowToArticlesListPage() {
    const { categoryId } = useParams();
    const location = useLocation();
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const categoryName = location.state?.categoryName || 'Categoria';

    useEffect(() => {
        if (!categoryId) return;
        setLoading(true);
        const loadArticles = async () => {
            try {
                const response = await fetchHowToArticlesByCategoryIdAdmin(categoryId);
                setArticles(response.data);
            } catch (error) { console.error(error); }
            finally { setLoading(false); }
        };
        loadArticles();
    }, [categoryId]);

    const handleDelete = async (articleId) => {
        if (window.confirm("Sei sicuro di voler eliminare questo articolo?")) {
            await deleteHowToArticle(articleId);
            setArticles(prev => prev.filter(a => a.id !== articleId));
        }
    };

    return (
        <>
            <Helmet><title>Articoli per {categoryName} - Admin</title></Helmet>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <Link to="/admin/howto" className="flex items-center gap-2 text-sm text-gray-600 mb-6">
                    <ArrowLeft size={16} /> Torna alle categorie
                </Link>
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Articoli per: {categoryName}</h1>
                    <Link to={`/admin/howto/category/${categoryId}/nuovo`} className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                        <Plus /> Aggiungi Articolo
                    </Link>
                </div>
                <div className="space-y-3">
                    {loading ? <p>Caricamento...</p> : articles.map(article => (
                        <div key={article.id} className="border p-4 rounded-lg flex justify-between">
                            <p className="font-bold">{article.title}</p>
                            <div className="flex gap-3">
                                <Link to={`/admin/howto/modifica/${article.id}`} className="text-blue-500"><Edit/></Link>
                                <button onClick={() => handleDelete(article.id)} className="text-red-500"><Trash2/></button>
                            </div>
                        </div>
                    ))}
                    {!loading && articles.length === 0 && <p className="text-center py-8">Nessun articolo per questa categoria.</p>}
                </div>
            </div>
        </>
    );
}

export default AdminHowToArticlesListPage;
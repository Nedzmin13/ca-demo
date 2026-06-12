import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { fetchHowToArticlesByCategory } from '../api';
import { ChevronRight } from 'lucide-react';

function HowToCategoryPage() {
    const { categorySlug } = useParams();
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    // Trasforma lo slug in un titolo leggibile (es. "tecnologia-e-informatica" -> "Tecnologia & Informatica")
    const [categoryTitle, setCategoryTitle] = useState('');


    useEffect(() => {
        if (!categorySlug) return;
        const loadArticles = async () => {
            setLoading(true);
            try {
                const response = await fetchHowToArticlesByCategory(categorySlug);
                setArticles(response.data);
                // Se ci sono articoli, prendiamo il nome della categoria dal primo articolo
                if (response.data.length > 0) {
                    setCategoryTitle(response.data[0].category.name);
                } else {
                    // Altrimenti, lo ricostruiamo dallo slug in modo più sicuro
                    const fallbackTitle = categorySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    setCategoryTitle(fallbackTitle);
                }
            } catch (error) {
                console.error(`Errore nel caricare gli articoli per ${categorySlug}:`, error);
            } finally {
                setLoading(false);
            }
        };
        loadArticles();
    }, [categorySlug]);

    return (
        <>
            <Helmet><title>{categoryTitle} - Guide e Tutorial | ComuniAmo</title></Helmet>
            <div className="bg-white py-12">
                <div className="container mx-auto px-4 max-w-5xl">
                    <nav className="text-sm text-gray-500 mb-4 flex items-center">
                        <Link to="/come-fare" className="hover:underline">Come Fare</Link>
                        <ChevronRight size={16} className="mx-1" />
                        <span className="font-semibold text-gray-700">{categoryTitle}</span>
                    </nav>

                    <h1 className="text-4xl font-extrabold text-gray-800 mb-8 border-b pb-4">{categoryTitle}</h1>

                    {loading ? (
                        <p>Caricamento articoli...</p>
                    ) : articles.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {articles.map(article => (
                                <Link
                                    key={article.id}
                                    to={`/come-fare/${article.slug}`}
                                    className="block p-6 bg-gray-50 rounded-lg border border-transparent hover:border-sky-500 hover:bg-white hover:shadow-lg transition-all"
                                >
                                    <h3 className="font-bold text-lg text-sky-700">{article.title}</h3>
                                    <p className="text-sm text-gray-600 mt-2">{article.excerpt}</p>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center py-12">Nessun articolo trovato in questa categoria.</p>
                    )}
                </div>
            </div>
        </>
    );
}

export default HowToCategoryPage;
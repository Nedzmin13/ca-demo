import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { fetchHowToArticleBySlug } from '../api';
import { ImageGallery } from '../components/ImageGallery';
import { ChevronRight } from 'lucide-react';
import SocialShareButtons from '../components/SocialShareButtons';


function HowToArticlePage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!slug) return;
        const loadArticle = async () => {
            setLoading(true);
            try {
                const response = await fetchHowToArticleBySlug(slug);
                setArticle(response.data);
            } catch (error) {
                console.error("Errore nel caricare l'articolo:", error);
                setArticle(null); // In caso di errore, l'articolo non viene trovato
            } finally {
                setLoading(false);
            }
        };
        loadArticle();
    }, [slug]);

    if (loading) {
        return <div className="text-center py-20">Caricamento articolo...</div>;
    }

    if (!article) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold">Articolo non Trovato</h2>
                <p className="mt-2 text-gray-600">L'articolo che stai cercando potrebbe non esistere o essere stato spostato.</p>
                <button
                    onClick={() => navigate('/come-fare')}
                    className="mt-6 bg-sky-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-sky-700"
                >
                    Torna alla sezione "Come Fare"
                </button>
            </div>
        );
    }

    const currentPageUrl = window.location.href;


    const pageTitle = `${article.title} - Come Fare | ComuniAmo`;
    const metaDescription = article.excerpt || `Guida passo-passo su come ${article.title.toLowerCase()}. Scopri gli strumenti necessari, la procedura e i consigli utili.`;

    return (
        <>
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={metaDescription} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={metaDescription} />
                <meta property="og:type" content="article" />
                {article.images && article.images.length > 0 && (
                    <meta property="og:image" content={article.images[0].url} />
                )}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "HowTo",
                        "name": article.title,
                        "description": metaDescription,
                        "step": [{
                            "@type": "HowToSection",
                            "name": "Procedura",
                            "itemListElement": [{
                                "@type": "HowToStep",
                                "text": "Leggi la guida completa su FastInfo."
                            }]
                        }]
                    })}
                </script>
            </Helmet>
            <div className="bg-gray-50">
                <div className="container mx-auto py-12 px-4 max-w-4xl">
                    <nav className="text-sm text-gray-500 mb-4 flex items-center flex-wrap">
                        <Link to="/come-fare" className="hover:underline">Come Fare</Link>
                        <ChevronRight size={16} className="mx-1"/>
                        <Link to={`/come-fare/category/${article.category.slug}`} className="hover:underline">
                            {article.category.name}
                        </Link>
                    </nav>

                    {/* Galleria Immagini (se presenti) */}
                    <ImageGallery images={article.images || []}/>

                    {/* Contenuto dell'articolo in stile blog */}
                    <div className="bg-white p-6 md:p-10 rounded-b-lg shadow-lg -mt-2 relative">
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
                            {article.title}
                        </h1>
                        <p className="mt-3 text-lg text-gray-600 border-b pb-6">
                            {article.excerpt}
                        </p>

                        {/* Render del contenuto HTML dall'editor */}
                        <div
                            className="prose max-w-none"
                            dangerouslySetInnerHTML={{__html: article.content}}
                        ></div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <h3 className="font-semibold text-lg text-gray-800"></h3>
                        <SocialShareButtons url={currentPageUrl} title={pageTitle}/>
                    </div>
                </div>
            </div>
        </>
    );
}

export default HowToArticlePage;
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { fetchGuideBySlug } from '../api';
import { ImageGallery } from '../components/ImageGallery';
import { ChevronRight } from 'lucide-react';
import SocialShareButtons from '../components/SocialShareButtons';

function GuideDetailPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [guide, setGuide] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadGuide = async () => {
            if (!slug) return;
            setLoading(true);
            try {
                const response = await fetchGuideBySlug(slug);
                setGuide(response.data);
            } catch (error) {
                console.error("Errore nel caricare la guida:", error);
                setGuide(null);
            } finally {
                setLoading(false);
            }
        };
        loadGuide();
    }, [slug]);

    if (loading) {
        return <div className="text-center py-20">Caricamento guida...</div>;
    }

    if (!guide) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold">Guida non trovata</h2>
                <button onClick={() => navigate('/pratiche-utili')} className="mt-4 bg-sky-600 text-white px-4 py-2 rounded-lg">
                    Torna alle Pratiche Utili
                </button>
            </div>
        );
    }

    const currentPageUrl = window.location.href;


    const pageTitle = `${guide.title} - Guida Pratica | FastInfo`;
    const metaDescription = guide.excerpt || `La guida completa su ${guide.title}. Scopri la procedura, i costi e i consigli utili per risolvere questa pratica.`;

    return (
        <>
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={metaDescription}/>
                <meta property="og:title" content={pageTitle}/>
                <meta property="og:description" content={metaDescription}/>
                <meta property="og:type" content="article"/>
                {guide.imageUrl && <meta property="og:image" content={guide.imageUrl}/>}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "HowTo",
                        "name": guide.title,
                        "description": metaDescription,
                        "step": [{
                            "@type": "HowToSection",
                            "name": "Procedura Principale",
                            "itemListElement": [{
                                "@type": "HowToStep",
                                "text": "Leggi la guida completa su FastInfo per tutti i dettagli."
                            }]
                        }]
                    })}
                </script>
            </Helmet>



            <div className="bg-gray-50">
                <div className="container mx-auto py-12 px-4 max-w-5xl">
                    <nav className="text-sm text-gray-500 mb-4 flex items-center flex-wrap">
                        <Link to="/pratiche-utili" className="hover:underline">Pratiche Utili</Link>
                        <ChevronRight size={16} className="mx-1"/>
                        <Link to={`/pratiche-utili/category/${guide.category.slug}`}
                              className="hover:underline">{guide.category.name}</Link>
                    </nav>

                    {/* --- NUOVA SEZIONE IMMAGINI --- */}
                    <ImageGallery images={guide.images || []}/>

                    {/* --- NUOVO LAYOUT CONTENUTO --- */}
                    <div className="bg-white p-6 md:p-8 rounded-b-lg shadow-lg -mt-2 relative">
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">{guide.title}</h1>
                        <p className="mt-2 text-lg text-gray-600">{guide.excerpt}</p>
                        <hr className="my-6"/>
                        <div
                            className="prose prose-lg max-w-none text-gray-800 prose-h2:font-bold prose-h2:text-2xl prose-h2:mb-3 prose-h2:border-b prose-h2:pb-2"
                            dangerouslySetInnerHTML={{__html: guide.content}}
                        ></div>
                        <div
                            className="mt-10 pt-6 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <h3 className="font-semibold text-lg text-gray-800">
                            </h3>
                            <SocialShareButtons url={currentPageUrl} title={guide.title}/>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default GuideDetailPage;
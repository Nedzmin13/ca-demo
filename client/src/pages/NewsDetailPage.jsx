import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { fetchNewsById } from '../api';
import { ChevronRight, Calendar, MapPin } from 'lucide-react';

function NewsDetailPage() {
    const { id } = useParams();
    const [news, setNews] = useState(null);
    useEffect(() => {
        const loadNews = async () => {
            try {
                const res = await fetchNewsById(id);
                setNews(res.data);
            } catch (error) { console.error(error); }
        };
        if (id) loadNews();
    }, [id]);

    if (!news) return <div className="text-center p-10">Caricamento...</div>;

    const pageTitle = `${news.title} | Notizie Utili - InfoSubito`;
    const metaDescription = news.excerpt || `Leggi l'articolo completo su "${news.title}". Aggiornamenti e notizie dall'Italia su FastInfo.`;

    return (
        <>
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={metaDescription} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={metaDescription} />
                <meta property="og:type" content="article" />
                {news.imageUrl && <meta property="og:image" content={news.imageUrl} />}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "NewsArticle",
                        "headline": news.title,
                        "datePublished": news.publishedAt,
                        "image": [news.imageUrl],
                        "author": {
                            "@type": "Organization",
                            "name": "FastInfo"
                        }
                    })}
                </script>
            </Helmet>
            <div className="bg-white py-12">
                <div className="container mx-auto px-4 max-w-4xl">
                    <nav className="flex items-center text-sm text-gray-500 mb-8">
                        <Link to="/notizie-utili" className="hover:underline">Notizie Utili</Link>
                        <ChevronRight size={16} className="mx-2" />
                        <span className="font-semibold text-gray-700">{news.category}</span>
                    </nav>

                    {news.imageUrl && <img src={news.imageUrl} alt={news.title} className="w-full rounded-lg shadow-lg mb-8" />}

                    <h1 className="text-4xl font-extrabold text-gray-900">{news.title}</h1>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                        <span className="flex items-center gap-2"><Calendar size={16}/> {new Date(news.publishedAt).toLocaleDateString('it-IT')}</span>
                        <span className="flex items-center gap-2"><MapPin size={16}/> {news.location}</span>
                    </div>

                    <hr className="my-6" />

                    <div
                        className="prose max-w-none text-gray-800 prose-p:m-0"
                        dangerouslySetInnerHTML={{ __html: news.content }}
                    />
                </div>
            </div>
        </>
    );
}
export default NewsDetailPage;
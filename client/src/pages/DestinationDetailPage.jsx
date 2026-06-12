import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { fetchDestinationById } from '../api';
import { ImageGallery } from '../components/ImageGallery';
import { Star, MapPin } from 'lucide-react';

function DestinationDetailPage() {
    const { id } = useParams();
    const [destination, setDestination] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDestination = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const response = await fetchDestinationById(id);
                setDestination(response.data);
            } catch (error) {
                console.error("Errore nel caricare la destinazione:", error);
            } finally {
                setLoading(false);
            }
        };
        loadDestination();
    }, [id]);

    if (loading) return <div className="text-center p-10">Caricamento...</div>;
    if (!destination) return <div className="text-center p-10">Destinazione non trovata.</div>;

    const pageTitle = `${destination.name}, ${destination.region} - Guida | ComuniAmo`;
    const metaDescription = `Scopri ${destination.name}: cosa vedere, quando andare e consigli utili per la tua visita in ${destination.region}. La destinazione perfetta per la stagione: ${destination.season}.`;

    return (
        <>
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={metaDescription} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={metaDescription} />
                <meta property="og:type" content="article" />
                {destination.images && destination.images.length > 0 && (
                    <meta property="og:image" content={destination.images[0].url} />
                )}
            </Helmet>
            <div className="bg-gray-50">
                <div className="container mx-auto py-12 px-4 max-w-5xl">
                    <div className="mb-4">
                        <Link to="/top-destinazioni" className="text-sm text-purple-600 hover:underline">
                            ← Torna a Top Destinazioni
                        </Link>
                    </div>

                    <ImageGallery images={destination.images || []} />

                    <div className="bg-white p-6 md:p-8 rounded-b-lg shadow-lg -mt-2 relative">
                        <div className="flex justify-between items-center flex-wrap gap-4">
                            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">{destination.name}</h1>
                            <div className="flex items-center gap-1 bg-yellow-400 text-white font-bold px-3 py-1.5 rounded-full text-md">
                                <Star size={16} className="fill-white"/> {destination.rating.toFixed(1)}
                            </div>
                        </div>
                        <p className="text-md text-gray-500 flex items-center gap-2 mt-1">
                            <MapPin size={16}/> {destination.region}
                        </p>
                        <hr className="my-6"/>

                        {/* --- ECCO LA CORREZIONE --- */}
                        <div
                            className="prose max-w-none text-gray-700 prose-p:my-2"
                            dangerouslySetInnerHTML={{ __html: destination.description || 'Nessuna descrizione disponibile.' }}
                        />

                        {destination.tags && (
                            <div className="mt-8 border-t pt-6">
                                <h3 className="font-bold mb-2">Tags:</h3>
                                <div className="flex flex-wrap gap-2">
                                    {destination.tags.split(',').map(tag => (
                                        <span key={tag} className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-1 rounded-full">
                                            {tag.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default DestinationDetailPage;
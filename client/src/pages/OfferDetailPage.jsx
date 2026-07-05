import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { fetchOfferById } from '../api';
import { ImageGallery } from '../components/ImageGallery';
import { Tag, Store, ExternalLink } from 'lucide-react';
import SocialShareButtons from '../components/SocialShareButtons';


function OfferDetailPage() {
    const { id } = useParams();
    const [offer, setOffer] = useState(null);

    useEffect(() => {
        const loadOffer = async () => {
            try {
                const res = await fetchOfferById(id);
                setOffer(res.data);
            } catch (error) { console.error(error); }
        };
        if (id) loadOffer();
    }, [id]);

    if (!offer) return <div className="text-center p-10">Caricamento offerta...</div>;

    const currentPageUrl = window.location.href;


    const pageTitle = `${offer.title} - Sconto ${offer.discount} | ComuniAmo`;
    const metaDescription = `Approfitta dell'offerta su ${offer.title} da ${offer.store}. Dettagli, descrizione e link diretto per acquistare al miglior prezzo.`;

    return (
        <>
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={metaDescription} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={metaDescription} />
                <meta property="og:type" content="product" />
                {offer.images && offer.images.length > 0 && (
                    <meta property="og:image" content={offer.images[0].url} />
                )}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Offer",
                        "name": offer.title,
                        "description": offer.description,
                        "priceSpecification": {
                            "@type": "PriceSpecification",
                            "price": offer.discount // Potresti dover estrarre il numero qui
                        },
                        "seller": {
                            "@type": "Organization",
                            "name": offer.store
                        }
                    })}
                </script>
            </Helmet>
            <div className="bg-gray-50">
                <div className="container mx-auto py-12 px-4 max-w-5xl">
                    <ImageGallery images={offer.images}/>
                    <div className="bg-white p-8 rounded-b-lg shadow-lg -mt-2 relative">
                        <div className="flex justify-between items-center flex-wrap gap-4">
                            <span
                                className="bg-sky-100 text-sky-700 font-semibold px-3 py-1 rounded-full text-sm flex items-center gap-2">
                                <Tag size={16}/> {offer.category}
                            </span>
                            <span className="text-3xl font-extrabold text-red-600">{offer.discount}</span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mt-4">{offer.title}</h1>
                        <p className="text-md text-gray-500 flex items-center gap-2 mt-1">
                            <Store size={16}/> Disponibile da <strong>{offer.store}</strong>
                        </p>
                        <hr className="my-6"/>

                        {/* --- ECCO LA CORREZIONE --- */}
                        <div
                            className="prose max-w-none text-gray-700 leading-relaxed prose-p:my-2"
                            dangerouslySetInnerHTML={{__html: offer.description}}
                        />

                        <a href={offer.link} target="_blank" rel="noopener noreferrer"
                           className="mt-8 inline-flex items-center gap-2 bg-sky-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-sky-700 transition-colors">
                            Vai all'Offerta <ExternalLink size={18}/>
                        </a>
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

export default OfferDetailPage;
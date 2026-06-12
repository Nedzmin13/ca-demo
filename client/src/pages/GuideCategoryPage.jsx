import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { fetchGuidesByCategory } from '../api';
import { ChevronRight } from 'lucide-react';

function GuideCategoryPage() {
    const { categorySlug } = useParams();
    const [guides, setGuides] = useState([]);
    const [loading, setLoading] = useState(true);
    const categoryTitle = categorySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    useEffect(() => {
        const loadGuides = async () => {
            setLoading(true);
            try {
                const response = await fetchGuidesByCategory(categorySlug);
                setGuides(response.data);
            } catch (error) { console.error(error); } finally { setLoading(false); }
        };
        loadGuides();
    }, [categorySlug]);

    return (
        <>
            <Helmet><title>{categoryTitle} - Pratiche Utili | ComuniAmo</title></Helmet>
            <div className="bg-white py-12">
                <div className="container mx-auto px-4 max-w-5xl">
                    <nav className="text-sm text-gray-500 mb-4 flex items-center">
                        <Link to="/pratiche-utili" className="hover:underline">Pratiche Utili</Link>
                        <ChevronRight size={16} className="mx-1" />
                        <span className="font-semibold text-gray-700">{categoryTitle}</span>
                    </nav>
                    <h1 className="text-4xl font-extrabold text-gray-800 mb-8 border-b pb-4">{categoryTitle}</h1>
                    {loading ? <p>Caricamento...</p> : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {guides.map(guide => (
                                <Link
                                    key={guide.id}
                                    to={`/pratiche-utili/${guide.slug}`}
                                    className="block p-6 bg-gray-50 rounded-lg border border-transparent hover:border-sky-500 hover:bg-white hover:shadow-lg transition-all"
                                >
                                    {/* --- CORREZIONE: Mostra il TITOLO, non l'estratto --- */}
                                    <h3 className="font-bold text-lg text-sky-700">{guide.title}</h3>
                                    <p className="text-sm text-gray-600 mt-2">{guide.excerpt}</p>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default GuideCategoryPage;
// client/src/pages/BonusDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { fetchBonusById } from '../api';
import { Gift, Target, Calendar, ChevronRight, CheckCircle } from 'lucide-react';
import SocialShareButtons from '../components/SocialShareButtons';


function BonusDetailPage() {
    const { id } = useParams();
    const [bonus, setBonus] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadBonus = async () => {
            try {
                const res = await fetchBonusById(id);
                setBonus(res.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        loadBonus();
    }, [id]);

    if (loading) return <div className="text-center p-10">Caricamento...</div>;
    if (!bonus) return <div className="text-center p-10">Bonus non trovato.</div>;

    const currentPageUrl = window.location.href;


    const pageTitle = `${bonus.title} - Come Richiederlo | ComuniAmo`;
    const metaDescription = `Guida completa al ${bonus.title}: scopri a chi è rivolto, l'importo, la scadenza e la procedura esatta per richiederlo.`;

    return (
        <>
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={metaDescription} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={metaDescription} />
                <meta property="og:type" content="article" />
            </Helmet>
            <div className="bg-gray-50 py-12">
                <div className="container mx-auto px-4 max-w-4xl">
                    <nav className="flex items-center text-sm text-gray-500 mb-8">
                        <Link to="/bonus" className="hover:underline">Bonus</Link>
                        <ChevronRight size={16} className="mx-2"/>
                        <span className="font-semibold text-gray-700">{bonus.title}</span>
                    </nav>

                    <div className="bg-white p-8 rounded-lg shadow-lg">
                        <div className="flex justify-between items-start">
                            <div>
                                <span
                                    className="bg-orange-100 text-orange-800 text-sm font-medium px-3 py-1 rounded-full">{bonus.category}</span>
                                <h1 className="text-4xl font-extrabold text-gray-900 mt-2">{bonus.title}</h1>
                            </div>
                        </div>
                        <hr className="my-6"/>

                        <div
                            className="prose max-w-none text-gray-700"
                            dangerouslySetInnerHTML={{__html: bonus.description}}
                        />

                        <div className="mt-8 border-t pt-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <Target className="text-gray-500"/>
                                <div>
                                    <p className="font-semibold">A chi è rivolto</p>
                                    <p className="text-gray-600">{bonus.target}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Calendar className="text-gray-500"/>
                                <div>
                                    <p className="font-semibold">Scadenza</p>
                                    <p className="text-red-600 font-bold">{new Date(bonus.expiresAt).toLocaleDateString('it-IT')}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircle className="text-gray-500"/>
                                <div>
                                    <p className="font-semibold">Come richiederlo</p>
                                    <p className="text-gray-600">{bonus.howToApply}</p>
                                </div>
                            </div>
                        </div>
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

export default BonusDetailPage;
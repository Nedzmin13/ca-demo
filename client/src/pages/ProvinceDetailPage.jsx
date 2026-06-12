import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { fetchProvinceBySigla } from '../api';
import { ChevronRight } from 'lucide-react';

function ProvinceDetailPage() {
    const { regionName, provinceSigla } = useParams();
    const [province, setProvince] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getProvinceData = async () => {
            setLoading(true);
            try {
                const response = await fetchProvinceBySigla(provinceSigla);
                setProvince(response.data);
                setError(null);
            } catch (err) {
                setError('Impossibile caricare i dati della provincia.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        getProvinceData();
    }, [provinceSigla]);

    const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

    if (loading) {
        return <div className="text-center py-20">Caricamento...</div>;
    }
    if (error) {
        return <div className="text-center text-red-500 py-20">{error}</div>;
    }
    if (!province) {
        return <div className="text-center text-gray-500 py-20">Provincia non trovata.</div>;
    }

    const pageTitle = `Guida alla Provincia di ${province.name} (${province.sigla}) | ComuniAmo`;
    const metaDescription = `Esplora i comuni e le attrazioni della provincia di ${province.name}. Informazioni utili, cosa vedere e servizi per organizzare la tua visita.`;

    return (
        <>
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={metaDescription} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={metaDescription} />
            </Helmet>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <nav className="flex items-center text-sm text-gray-500 mb-8">
                    <Link to="/viaggio" className="hover:underline">Viaggio</Link>
                    <ChevronRight size={16} className="mx-2" />
                    <Link to="/viaggio/regioni" className="hover:underline">Italia</Link>
                    <ChevronRight size={16} className="mx-2" />
                    <Link to={`/viaggio/${regionName}`} className="hover:underline">{capitalize(regionName)}</Link>
                    <ChevronRight size={16} className="mx-2" />
                    <span className="font-semibold text-gray-700">{province.name}</span>
                </nav>

                <h1 className="text-4xl font-bold text-gray-900">
                    Comuni della provincia di {province.name} ({province.sigla})
                </h1>
                <p className="mt-2 mb-8 text-gray-600 max-w-3xl">{province.description}</p>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {province.comune.map(comune => (
                        <Link
                            key={comune.id}
                            to={`/viaggio/${regionName}/${provinceSigla}/${comune.slug}`}
                            className="block bg-white p-3 text-center rounded-lg shadow-sm hover:bg-sky-50 hover:shadow-md transition-all border border-gray-200"
                        >
                            <span className="font-medium text-gray-800">{comune.name}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </>
    );
}

export default ProvinceDetailPage;
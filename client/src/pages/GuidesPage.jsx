import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { fetchAllCategoriesWithGuides } from '../api';
import {
    FileText,
    Briefcase,
    Globe,
    Home,
    FileBadge,
    Car,
    Heart,
    ArrowRight,
    Stethoscope,
    GraduationCap,
    Dog,
    Key,
    ReceiptIcon
} from 'lucide-react'; // <--- Ho aggiunto Dog qui

// Mappa per icone e colori (AGGIORNATA)
const CATEGORIES_CONFIG = {
    'Fisco e Tasse': { icon: <FileText />, color: 'blue' },
    'Lavoro': { icon: <Briefcase />, color: 'green' },
    'P.IVA': { icon: <ReceiptIcon />, color: 'teal' },
    'Cittadini Stranieri': { icon: <Globe />, color: 'purple' },
    'Casa e Immobili': { icon: <Home />, color: 'orange' },
    'Documenti e Anagrafe': { icon: <FileBadge />, color: 'red' },
    'Veicoli e Trasporti': { icon: <Car />, color: 'indigo' },
    'Famiglia e Sociale': { icon: <Heart />, color: 'pink' },
    'Salute e Sanità': { icon: <Stethoscope />, color: 'teal' },
    'Istruzione e Formazione': { icon: <GraduationCap />, color: 'amber' },
    // ▼▼▼ AGGIUNTA NUOVA CATEGORIA ▼▼▼
    'Animali Domestici': { icon: <Dog />, color: 'brown' },
'Affitti e Locazioni': { icon: <Key />, color: 'emerald' },
    // ▲▲▲ FINE AGGIUNTA ▲▲▲
};

// Componente per la singola card di categoria
const CategoryCard = ({ category }) => {
    // Se la categoria non è nella mappa, usa default grigio
    const config = CATEGORIES_CONFIG[category.name] || { icon: <FileText />, color: 'gray' };

    const colors = {
        blue: 'text-blue-600 bg-blue-100',
        green: 'text-green-600 bg-green-100',
        purple: 'text-purple-600 bg-purple-100',
        orange: 'text-orange-600 bg-orange-100',
        red: 'text-red-600 bg-red-100',
        indigo: 'text-indigo-600 bg-indigo-100',
        pink: 'text-pink-600 bg-pink-100',
        teal: 'text-teal-600 bg-teal-100',
        amber: 'text-amber-600 bg-amber-100',
        gray: 'text-gray-600 bg-gray-100',
        // ▼▼▼ AGGIUNTO COLORE MARRONE ▼▼▼
        brown: 'text-amber-800 bg-amber-100',
        emerald: 'text-emerald-600 bg-emerald-100',

    };

    return (
        <div className="bg-white p-6 rounded-xl border shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colors[config.color]}`}>
                {React.cloneElement(config.icon, { size: 24 })}
            </div>
            <h3 className="text-xl font-bold mt-4 text-gray-800">{category.name}</h3>
            <p className="text-gray-500 text-sm mt-1 flex-grow">{category.description}</p>

            {category.guides && category.guides.length > 0 && (
                <ul className="space-y-2 mt-4 text-sm">
                    {category.guides.map(guide => (
                        <li key={guide.id} className="flex items-center gap-2">
                            <span className="text-gray-400">→</span>
                            <Link to={`/pratiche-utili/${guide.slug}`} className="text-gray-600 hover:text-sky-600 hover:underline line-clamp-1">
                                {guide.title}
                            </Link>
                        </li>
                    ))}
                </ul>
            )}

            <Link to={`/pratiche-utili/category/${category.slug}`} className="mt-6 font-semibold text-sky-600 flex items-center gap-2 group border-t pt-4">
                Scopri tutte le guide
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
            </Link>
        </div>
    );
};

// Componente pagina principale
function GuidesPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await fetchAllCategoriesWithGuides();
                setCategories(response.data);
            } catch (error) {
                console.error("Errore nel caricare le categorie e le guide:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    return (
        <>
            <Helmet>
                <title>Pratiche Utili - Guide Complete alla Burocrazia Italiana | ComuniAmo</title>
                <meta name="description" content="Risolvi ogni pratica burocratica con le nostre guide semplici e complete: 730, P.IVA, SPID, Passaporto, Casa, Famiglia e molto altro." />
                <meta property="og:title" content="Pratiche Utili - Guide Complete alla Burocrazia" />
            </Helmet>
            <div className="bg-gray-50 py-16">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-extrabold text-gray-800">Pratiche Utili</h1>
                        <p className="mt-3 text-lg text-gray-600">Guide complete per tutte le pratiche burocratiche e amministrative</p>
                        <span className="mt-4 inline-block bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">Guide aggiornate {new Date().getFullYear()}</span>
                    </div>

                    {loading ? <div className="text-center py-20">Caricamento...</div> : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {categories.map(category => (
                                <CategoryCard key={category.id} category={category} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default GuidesPage;
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { fetchHowToCategoriesWithArticles } from '../api';
import { HardDrive, Smartphone, ChefHat, Car, Globe, Wrench, BrainCircuit, FileText, ArrowRight, Briefcase } from 'lucide-react';

// Mappa per associare nomi di icone (dal DB) ai componenti icona reali
const ICONS = {
    HardDrive: <HardDrive />,
    Smartphone: <Smartphone />,
    ChefHat: <ChefHat />,
    Car: <Car />,
    Globe: <Globe />,
    Wrench: <Wrench />,
    BrainCircuit: <BrainCircuit />,
    Briefcase: <Briefcase />,
    Default: <FileText /> // Icona di fallback
};

// Componente per la singola card di categoria
const CategoryCard = ({ category }) => {
    const iconComponent = ICONS[category.iconName] || ICONS.Default;

    return (
        <div className="bg-white p-6 rounded-xl border shadow-sm flex flex-col h-full">
            <div>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-sky-100 text-sky-600">
                    {React.cloneElement(iconComponent, { size: 24 })}
                </div>
                <h3 className="text-xl font-bold mt-4 text-gray-800">{category.name}</h3>
                <p className="text-gray-500 text-sm mt-1 flex-grow">{category.description}</p>
            </div>

            <ul className="space-y-2 mt-4 text-sm flex-grow">
                {category.articles.map(article => (
                    <li key={article.id} className="flex items-start gap-2">
                        <span className="text-gray-400 mt-1">→</span>

                        {/* ▼▼▼ MODIFICA QUI: Aggiungi line-clamp-1 ▼▼▼ */}
                        <Link
                            to={`/come-fare/${article.slug}`}
                            className="text-gray-600 hover:text-sky-600 hover:underline line-clamp-1"
                            title={article.title} // Aggiunge tooltip
                        >
                            {article.title}
                        </Link>
                    </li>
                ))}
            </ul>

            <Link to={`/come-fare/category/${category.slug}`} className="mt-6 font-semibold text-sky-600 flex items-center gap-2 group border-t pt-4">
                Scopri tutti gli articoli
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
            </Link>
        </div>
    );
};
// Componente pagina principale "Come Fare"
function HowToPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await fetchHowToCategoriesWithArticles();
                setCategories(response.data);
            } catch (error) {
                console.error("Errore nel caricare le categorie 'Come Fare':", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    return (
        <>
            <Helmet>
                <title>Come Fare - Tutorial e Guide Fai-da-te | ComuniAmo</title>
                <meta name="description" content="Impara a risolvere i problemi di tutti i giorni con i nostri tutorial pratici: tecnologia, casa, auto, cucina e vita digitale. Guide passo-passo." />
                <meta property="og:title" content="Come Fare - Tutorial e Guide Fai-da-te" />
            </Helmet>
            <div className="bg-gray-50 py-16">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-extrabold text-gray-800">Come Fare</h1>
                        <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
                            Guide e tutorial semplici per risolvere i problemi di tutti i giorni.
                            Dalla tecnologia alla cucina, la soluzione è a portata di mano.
                        </p>
                    </div>

                    {loading ? (
                        <p className="text-center">Caricamento categorie...</p>
                    ) : (
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

export default HowToPage;
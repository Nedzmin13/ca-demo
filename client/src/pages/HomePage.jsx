// client/src/pages/HomePage.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import HomeCard from '../components/HomeCard';
import { Gift, BookOpen, Wrench } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

// --- NASCOSTO PER ADSENSE ---
// import { fetchTopDestinationsHome } from '../api';
// import { MapPin, ArrowRight, Star } from 'lucide-react';

// const DestinationHomeCard = ({ destination }) => {
//     const imageUrl = destination.images?.[0]?.url || 'https://via.placeholder.com/600x400?text=Destinazione';
//
//     let cleanDescription = destination.description ? destination.description.replace(/<[^>]+>/g, ' ') : '';
//     cleanDescription = cleanDescription.trim().replace(/^(In breve|In sintesi)[\s\-:]*/i, '').trim();
//
//     return (
//         <Link to={`/destinazioni/${destination.id}`} className="group block h-full">
//             <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full flex flex-col">
//                 <div className="relative h-48 overflow-hidden">
//                     <img src={imageUrl} alt={destination.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
//                     <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-800 flex items-center gap-1 shadow-sm">
//                         <MapPin size={12} className="text-red-500" /> {destination.region}
//                     </div>
//                 </div>
//                 <div className="p-6 flex flex-col flex-grow">
//                     <h3 className="text-xl font-bold text-gray-900 group-hover:text-sky-600 transition-colors">{destination.name}</h3>
//                     <p className="text-sm text-gray-500 mt-2 line-clamp-3 flex-grow">{cleanDescription}</p>
//                     <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
//                         <span className="flex items-center gap-1 text-sm font-semibold text-amber-500"><Star size={16} fill="currentColor" /> {destination.rating}</span>
//                         <span className="text-sky-600 font-semibold text-sm flex items-center gap-1">Scopri <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></span>
//                     </div>
//                 </div>
//             </div>
//         </Link>
//     );
// };
// --- FINE PARTE NASCOSTA ---


function HomePage() {
    const cardIconClass = "h-10 w-10 text-sky-500";

    return (
        <>
            <Helmet>
                <title>ComuniAmo - Guide, Pratiche, Bonus e Tutorial per l'Italia</title>
                <meta name="description" content="Il portale N°1 in Italia per trovare informazioni utili, guide pratiche, bonus aggiornati e tutorial fai-da-te. Tutto in un unico posto." />
                <meta property="og:title" content="ComuniAmo - Guide, Pratiche e Bonus" />
                <meta property="og:description" content="Il portale N°1 in Italia per trovare informazioni utili, guide pratiche e bonus aggiornati." />
                <meta property="og:type" content="website" />
            </Helmet>

            <Hero />

            {/* SEZIONE CARDS (Modificata con link "Sicuri" per Google AdSense) */}
            <div className="bg-gray-100 pb-24 min-h-[50vh]">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">

                    {/* Griglia a 3 colonne per centrare perfettamente i 3 argomenti principali */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        <HomeCard
                            icon={<BookOpen className={cardIconClass} />}
                            title="Pratiche Utili"
                            description="Guide alla burocrazia"
                            linkTo="/pratiche-utili"
                        />
                        <HomeCard
                            icon={<Wrench className={cardIconClass} />}
                            title="Come Fare"
                            description="Tutorial passo-passo"
                            linkTo="/come-fare"
                        />
                        <HomeCard
                            icon={<Gift className={cardIconClass} />}
                            title="Bonus"
                            description="Incentivi e agevolazioni"
                            linkTo="/bonus"
                        />
                    </div>
                </div>
            </div>

            {/* ▼▼▼ NASCOSTA SEZIONE DESTINAZIONI PER ADSENSE ▼▼▼ */}
            {/*
            <div className="bg-gray-100 pt-20 pb-24">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-10">
                        <div>
                            <h2 className="text-3xl font-extrabold text-gray-900">Mete Consigliate</h2>
                            <p className="text-gray-500 mt-2">Le destinazioni italiane più amate di questa stagione.</p>
                        </div>
                        <Link to="/top-destinazioni" className="mt-4 md:mt-0 flex items-center gap-2 text-sky-600 font-bold hover:text-sky-800 transition">
                            Esplora tutte <ArrowRight size={20} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        ...
                    </div>
                </div>
            </div>
            */}
            {/* ▲▲▲ FINE SEZIONE NASCOSTA ▲▲▲ */}
        </>
    );
}

export default HomePage;
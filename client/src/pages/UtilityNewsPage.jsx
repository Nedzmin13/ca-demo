// client/src/pages/UtilityNewsPage.jsx

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { fetchUtilityInfo } from '../api';
import { Train, Phone, Thermometer, Droplet } from 'lucide-react';
import axios from 'axios';

// --- Elenco Capoluoghi di Regione Italiani ---
const CAPOLUOGHI = [
    { name: "Aosta", q: "Aosta" },
    { name: "Torino", q: "Turin" },
    { name: "Genova", q: "Genoa" },
    { name: "Milano", q: "Milan" },
    { name: "Trento", q: "Trento" },
    { name: "Venezia", q: "Venice" },
    { name: "Trieste", q: "Trieste" },
    { name: "Bologna", q: "Bologna" },
    { name: "Firenze", q: "Florence" },
    { name: "Ancona", q: "Ancona" },
    { name: "Perugia", q: "Ancona" }, // Nota: A volte l'API vuole il nome in inglese, per Perugia va bene Perugia
    { name: "L'Aquila", q: "L'Aquila" },
    { name: "Roma", q: "Rome" },
    { name: "Campobasso", q: "Campobasso" },
    { name: "Napoli", q: "Naples" },
    { name: "Bari", q: "Bari" },
    { name: "Potenza", q: "Potenza" },
    { name: "Catanzaro", q: "Catanzaro" },
    { name: "Palermo", q: "Palermo" },
    { name: "Cagliari", q: "Catanzaro" }
];

// Correzione nomi API per sicurezza
const WEATHER_CITIES = [
    "Aosta", "Turin", "Genoa", "Milan", "Trento", "Venice", "Trieste", "Bologna",
    "Florence", "Ancona", "Perugia", "L'Aquila", "Rome", "Campobasso", "Naples",
    "Bari", "Potenza", "Catanzaro", "Palermo", "Cagliari"
];


// Componente Meteo Singolo (Compatto)
const WeatherWidget = ({ cityQuery, displayName }) => {
    const [weather, setWeather] = useState(null);
    const API_KEY = '6848c8465b7730a0fe14449285f7b515';

    useEffect(() => {
        const getWeather = async () => {
            try {
                const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${cityQuery},IT&appid=${API_KEY}&units=metric&lang=it`);
                setWeather(response.data);
            } catch (error) {
                console.error(`Errore meteo per ${cityQuery}:`, error);
            }
        };
        getWeather();
    }, [cityQuery]);

    if (!weather) return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center items-center h-32 animate-pulse">
            <div className="h-4 w-16 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 w-8 bg-gray-200 rounded-full my-1"></div>
            <div className="h-4 w-12 bg-gray-200 rounded"></div>
        </div>
    );

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
            <h3 className="font-bold text-gray-800 text-sm truncate" title={displayName || weather.name}>
                {displayName || weather.name}
            </h3>
            <div className="flex items-center justify-center gap-1 my-1">
                <Thermometer className="text-red-500" size={18}/>
                <span className="text-2xl font-bold text-gray-900">{Math.round(weather.main.temp)}°</span>
            </div>
            <p className="text-xs text-gray-500 capitalize truncate" title={weather.weather[0].description}>
                {weather.weather[0].description}
            </p>
        </div>
    );
};

// Componente Sciopero
const StrikeCard = ({ strike }) => (
    <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-orange-400 flex flex-col h-full hover:shadow-lg transition-shadow">
        <div className="mb-3">
            <span className="inline-block font-bold bg-orange-100 text-orange-800 px-2.5 py-1 rounded-md text-xs mb-2">
                {new Date(strike.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
            <h3 className="text-lg font-bold text-gray-800 leading-tight capitalize">{strike.type}</h3>
        </div>

        <div className="flex-grow space-y-1">
            <p className="text-sm"><strong className="text-gray-600">Zona:</strong> <span className="capitalize">{strike.zone}</span></p>
            <p className="text-sm"><strong className="text-gray-600">Durata:</strong> {strike.duration}</p>
        </div>

        <div className="mt-4 pt-3 border-t text-sm">
            <p className="text-gray-700"><strong className="text-gray-600">Coinvolge:</strong> {strike.services}</p>
        </div>
    </div>
);

// Componente Numero Emergenza
const EmergencyNumberCard = ({ num }) => (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 text-center">
        <h3 className="text-5xl font-extrabold text-red-600">{num.number}</h3>
        <p className="font-semibold text-gray-800 mt-2">{num.title}</p>
    </div>
);


// --- Pagina Principale ---
function UtilityNewsPage() {
    const [utilityData, setUtilityData] = useState({ strikes: [], emergency: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await fetchUtilityInfo();
                setUtilityData(response.data);
            } catch (error) {
                console.error("Errore caricamento servizi utili:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    return (
        <>
            <Helmet>
                <title>Servizi Utili in Tempo Reale | Meteo Italia, Emergenze e Scioperi | ComuniAmo</title>
                <meta name="description" content="Tutte le informazioni di servizio in un unico posto: meteo nazionale, numeri di emergenza e calendario scioperi dei trasporti in Italia." />
                <meta property="og:title" content="Servizi Utili | Meteo, Emergenze e Scioperi" />
            </Helmet>
            <div className="bg-gray-50 py-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

                    {/* SEZIONE METEO: 20 Città */}
                    <div>
                        <div className="text-center mb-8">
                            <h1 className="text-4xl font-extrabold text-gray-800">Meteo Italia</h1>
                            <p className="text-gray-600 mt-2">La situazione in tempo reale nei capoluoghi di regione</p>
                        </div>

                        {/* Griglia responsive: 2 colonne su mobile, 4 tablet, 5 desktop (20 capoluoghi = 4 righe da 5 perfette) */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {WEATHER_CITIES.map((cityQuery, index) => (
                                <WeatherWidget
                                    key={index}
                                    cityQuery={cityQuery}
                                    displayName={CAPOLUOGHI[index]?.name || cityQuery}
                                />
                            ))}
                        </div>
                    </div>

                    {/* SEZIONE NUMERI DI EMERGENZA */}
                    <div>
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold flex items-center justify-center gap-3">
                                <Phone className="text-red-600" size={32} /> Numeri di Emergenza Nazionali
                            </h2>
                        </div>
                        {loading ? <p className="text-center">Caricamento...</p> : utilityData.emergency?.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {utilityData.emergency.map(num => <EmergencyNumberCard key={num.id} num={num}/>)}
                            </div>
                        ) : (
                            <p className="bg-white p-6 rounded-xl shadow-sm text-gray-500 text-center">
                                Nessun numero di emergenza impostato.
                            </p>
                        )}
                    </div>

                    {/* SEZIONE SCIOPERI */}
                    <div>
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold flex items-center justify-center gap-3">
                                <Train className="text-orange-500" size={32} /> Allerta Scioperi
                            </h2>
                            <p className="text-gray-600 mt-2">Aggiornamenti sulle principali agitazioni sindacali</p>
                        </div>
                        {loading ? <p className="text-center">Caricamento...</p> : utilityData.strikes?.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {utilityData.strikes.map(strike => <StrikeCard key={strike.id} strike={strike}/>)}
                            </div>
                        ) : (
                            <div className="bg-white p-8 rounded-xl shadow-sm text-center border border-gray-100">
                                <p className="text-gray-500 text-lg">✅ Nessuno sciopero rilevante previsto a breve.</p>
                                <p className="text-sm text-gray-400 mt-2">Monitoriamo costantemente la situazione per tenerti aggiornato.</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </>
    );
}

export default UtilityNewsPage;
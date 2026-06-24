import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { fetchUtilityInfo } from '../api';
import { Phone, Thermometer } from 'lucide-react'; // Rimossi Train e Droplet non usati
import axios from 'axios';

// --- Elenco Capoluoghi di Regione Italiani ---
const CAPOLUOGHI = [
    { name: "Aosta", q: "Aosta" }, { name: "Torino", q: "Turin" }, { name: "Genova", q: "Genoa" },
    { name: "Milano", q: "Milan" }, { name: "Trento", q: "Trento" }, { name: "Venezia", q: "Venice" },
    { name: "Trieste", q: "Trieste" }, { name: "Bologna", q: "Bologna" }, { name: "Firenze", q: "Florence" },
    { name: "Ancona", q: "Ancona" }, { name: "Perugia", q: "Perugia" }, { name: "L'Aquila", q: "L'Aquila" },
    { name: "Roma", q: "Rome" }, { name: "Campobasso", q: "Campobasso" }, { name: "Napoli", q: "Naples" },
    { name: "Bari", q: "Bari" }, { name: "Potenza", q: "Potenza" }, { name: "Catanzaro", q: "Catanzaro" },
    { name: "Palermo", q: "Palermo" }, { name: "Cagliari", q: "Cagliari" }
];

const WEATHER_CITIES = CAPOLUOGHI.map(c => c.q);

// Componente Meteo Singolo (Compatto)
const WeatherWidget = ({ cityQuery, displayName }) => {
    const [weather, setWeather] = useState(null);
    const API_KEY = '6848c8465b7730a0fe14449285f7b515';

    useEffect(() => {
        const getWeather = async () => {
            try {
                const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${cityQuery},IT&appid=${API_KEY}&units=metric&lang=it`);
                setWeather(response.data);
            } catch (error) { console.error(`Errore meteo per ${cityQuery}:`, error); }
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

// Componente Numero Emergenza
const EmergencyNumberCard = ({ num }) => (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 text-center">
        <h3 className="text-5xl font-extrabold text-red-600">{num.number}</h3>
        <p className="font-semibold text-gray-800 mt-2">{num.title}</p>
    </div>
);

// --- Pagina Principale ---
function UtilityNewsPage() {
    const [utilityData, setUtilityData] = useState({ emergency: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await fetchUtilityInfo();
                setUtilityData(response.data);
            } catch (error) { console.error("Errore caricamento:", error); }
            finally { setLoading(false); }
        };
        loadData();
    }, []);

    return (
        <>
            <Helmet>
                <title>Servizi Utili in Tempo Reale | Meteo Italia ed Emergenze | ComuniAmo</title>
                <meta name="description" content="Tutte le informazioni di servizio in un unico posto: meteo nazionale aggiornato e numeri di emergenza per l'Italia." />
            </Helmet>
            <div className="bg-gray-50 py-12 min-h-screen">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

                    {/* SEZIONE METEO: 20 Città */}
                    <div>
                        <div className="text-center mb-8">
                            <h1 className="text-4xl font-extrabold text-gray-800">Meteo Italia</h1>
                            <p className="text-gray-600 mt-2">La situazione in tempo reale nei capoluoghi di regione</p>
                        </div>

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
                        {loading ? <p className="text-center text-gray-500">Caricamento...</p> : utilityData.emergency?.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {utilityData.emergency.map(num => <EmergencyNumberCard key={num.id} num={num}/>)}
                            </div>
                        ) : (
                            <p className="bg-white p-6 rounded-xl shadow-sm text-gray-500 text-center border border-gray-100">
                                Nessun numero di emergenza impostato.
                            </p>
                        )}
                    </div>

                    {/* LA SEZIONE SCIOPERI È STATA RIMOSSA TOTALMENTE */}

                </div>
            </div>
        </>
    );
}

export default UtilityNewsPage;
// client/src/components/WeatherMap.jsx

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

// Dati delle città con Coordinate GPS per posizionarle sulla mappa
const CITIES_DATA = [
    { name: "Aosta", q: "Aosta", lat: 45.7373, lng: 7.3201 },
    { name: "Torino", q: "Turin", lat: 45.0703, lng: 7.6869 },
    { name: "Genova", q: "Genoa", lat: 44.4056, lng: 8.9463 },
    { name: "Milano", q: "Milan", lat: 45.4642, lng: 9.1900 },
    { name: "Trento", q: "Trento", lat: 46.0679, lng: 11.1211 },
    { name: "Venezia", q: "Venice", lat: 45.4408, lng: 12.3155 },
    { name: "Trieste", q: "Trieste", lat: 45.6495, lng: 13.7768 },
    { name: "Bologna", q: "Bologna", lat: 44.4949, lng: 11.3426 },
    { name: "Firenze", q: "Florence", lat: 43.7696, lng: 11.2558 },
    { name: "Ancona", q: "Ancona", lat: 43.6158, lng: 13.5189 },
    { name: "Perugia", q: "Perugia", lat: 43.1107, lng: 12.3908 },
    { name: "L'Aquila", q: "L'Aquila", lat: 42.3498, lng: 13.3995 },
    { name: "Roma", q: "Rome", lat: 41.9028, lng: 12.4964 },
    { name: "Campobasso", q: "Campobasso", lat: 41.5603, lng: 14.6627 },
    { name: "Napoli", q: "Naples", lat: 40.8518, lng: 14.2681 },
    { name: "Bari", q: "Bari", lat: 41.1171, lng: 16.8719 },
    { name: "Potenza", q: "Potenza", lat: 40.6404, lng: 15.8056 },
    { name: "Catanzaro", q: "Catanzaro", lat: 38.9059, lng: 16.5944 },
    { name: "Palermo", q: "Palermo", lat: 38.1157, lng: 13.3615 },
    { name: "Cagliari", q: "Cagliari", lat: 39.2238, lng: 9.1217 }
];

const API_KEY = '6848c8465b7730a0fe14449285f7b515';

// Funzione per creare un "segnalino" HTML personalizzato (Il quadratino con i gradi)
const createCustomIcon = (temp, iconCode) => {
    return L.divIcon({
        className: 'custom-weather-icon',
        // Disegniamo un box bianco con l'icona del meteo presa da OpenWeather e la temperatura
        html: `
            <div style="background-color: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); padding: 4px 8px; display: flex; align-items: center; gap: 4px; border: 1px solid #e5e7eb; transform: translate(-50%, -50%);">
                <img src="https://openweathermap.org/img/wn/${iconCode}.png" style="width: 24px; height: 24px;" />
                <span style="font-weight: bold; font-size: 14px; color: #1f2937;">${Math.round(temp)}°</span>
            </div>
        `,
        iconSize: [0, 0], // L'ancoraggio è gestito dal CSS
    });
};

export default function WeatherMap() {
    const [weatherData, setWeatherData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllWeather = async () => {
            try {
                // Facciamo tutte e 20 le chiamate insieme per essere più veloci
                const promises = CITIES_DATA.map(city =>
                    axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city.q},IT&appid=${API_KEY}&units=metric&lang=it`)
                        .then(res => ({ ...city, weather: res.data }))
                );

                const results = await Promise.all(promises);
                setWeatherData(results);
            } catch (error) {
                console.error("Errore recupero meteo mappa:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllWeather();
    }, []);

    if (loading) {
        return <div className="h-[500px] w-full bg-sky-50 rounded-xl flex items-center justify-center animate-pulse text-sky-600 font-semibold">Caricamento Mappa Meteo...</div>;
    }

    return (
        <div className="h-[500px] md:h-[650px] w-full rounded-2xl overflow-hidden shadow-lg border border-gray-200">
            {/* Centrato sull'Italia (Lat 41.8, Lng 12.5), zoom 6 per vederla tutta */}
            <MapContainer center={[41.8719, 12.5674]} zoom={6} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>

                {/* Mappa base chiara e pulita (simile a Google Maps) */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />

                {/* Piazziamo le 20 città sulla mappa */}
                {weatherData.map((data, idx) => (
                    <Marker
                        key={idx}
                        position={[data.lat, data.lng]}
                        icon={createCustomIcon(data.weather.main.temp, data.weather.weather[0].icon)}
                    >
                        {/* Se ci clicchi sopra si apre una nuvoletta con i dettagli */}
                        <Popup className="rounded-lg">
                            <div className="text-center p-1">
                                <h3 className="font-bold text-lg">{data.name}</h3>
                                <p className="capitalize text-gray-600">{data.weather.weather[0].description}</p>
                                <p className="text-sm mt-1">Umidità: {data.weather.main.humidity}%</p>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
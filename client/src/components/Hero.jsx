

import React from 'react';


const backgroundImageUrl = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop';

function Hero() {
    return (
        <div
            className="relative bg-cover bg-center text-white"
            style={{ backgroundImage: `url(${backgroundImageUrl})` }}
        >
            {/* Overlay scuro per migliorare la leggibilità del testo */}
            <div className="absolute inset-0 bg-black opacity-40"></div>

            <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-48 text-center">
                <h1 className="text-6xl md:text-7xl font-bold drop-shadow-lg">
                    ComuniAmo
                </h1>
                <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto drop-shadow-md">
                    Il portale che ti tiene aggiornato su tutto ciò che serve: viaggi, offerte, bonus e notizie utili per l'Italia.
                </p>
            </div>
        </div>
    );
}

export default Hero;
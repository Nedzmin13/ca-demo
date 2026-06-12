import React from 'react';
import { Map, Wrench } from 'lucide-react';

const WorkInProgress = ({ title, message, icon }) => {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-2xl shadow-sm border border-gray-100">

            {/* ICONA ANIMATA O COMPOSITA */}
            <div className="relative mb-8 flex justify-center items-center w-24 h-24 bg-sky-50 rounded-full">
                {icon ? (
                    icon
                ) : (
                    <>
                        <Map size={48} className="text-sky-400" />
                        <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-sm">
                            <Wrench size={24} className="text-amber-500" />
                        </div>
                    </>
                )}
            </div>

            {/* TESTI */}
            <h2 className="text-3xl font-extrabold text-gray-800 mb-4">
                {title || "Lavori in corso"}
            </h2>
            <p className="text-lg text-gray-500 max-w-lg mx-auto leading-relaxed">
                {message || "Stiamo preparando fantastici contenuti per questa sezione. Torna a trovarci presto!"}
            </p>

            <div className="mt-8 inline-block px-4 py-1.5 bg-amber-100 text-amber-800 text-sm font-bold rounded-full uppercase tracking-wider">
                Prossimamente
            </div>
        </div>
    );
};

export default WorkInProgress;
import React from 'react';


const dayOrder = ['lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato', 'domenica'];


const todayIndex = (new Date().getDay() + 6) % 7;

const OpeningHoursDisplay = ({ hoursData }) => {
    if (!hoursData) return <span className="text-gray-500 italic">Non disponibili</span>;

    // Parsing sicuro del JSON
    let schedule = hoursData;
    if (typeof hoursData === 'string') {
        try { schedule = JSON.parse(hoursData); } catch (e) { return <span>{hoursData}</span>; }
    }

    // Se l'oggetto è vuoto
    if (!schedule || Object.keys(schedule).length === 0) return <span className="text-gray-500 italic">Non disponibili</span>;

    return (
        <div className="text-sm w-full">
            {/* Iteriamo sull'array ORDINATO dei giorni, non sulle chiavi dell'oggetto */}
            {dayOrder.map((day, index) => {
                const dayData = schedule[day];

                // Se manca il dato per quel giorno (strano, ma gestiamo), saltiamo
                if (!dayData) return null;

                const isToday = index === todayIndex;

                let statusOrTimes;

                switch (dayData.status) {
                    case '24H':
                        statusOrTimes = <span className="text-green-600 font-semibold">Aperto 24 ore</span>;
                        break;
                    case 'CLOSED':
                        statusOrTimes = <span className="text-red-600">Chiuso</span>;
                        break;
                    case 'UNKNOWN': // GESTIONE "ND"
                        statusOrTimes = <span className="text-gray-400 italic">Non disponibile</span>;
                        break;
                    case 'OPEN':
                        if (!dayData.slots || dayData.slots.length === 0) {
                            statusOrTimes = <span className="text-gray-500">N/D</span>;
                        } else {
                            statusOrTimes = (
                                <div>
                                    {dayData.slots.map((slot, i) => (
                                        <div key={i}>{`${slot.from} - ${slot.to}`}</div>
                                    ))}
                                </div>
                            );
                        }
                        break;
                    default:
                        statusOrTimes = <span className="text-gray-400">N/D</span>;
                }

                return (
                    <div
                        key={day}
                        className={`grid grid-cols-[90px_1fr] items-start py-1 border-b last:border-0 border-gray-100 ${isToday ? 'font-bold text-sky-700 bg-sky-50 -mx-2 px-2 rounded' : 'text-gray-600'}`}
                    >
                        {/* Colonna 1: Nome Giorno */}
                        <span className="capitalize">{day}</span>

                        {/* Colonna 2: Orari (Allineati a destra) */}
                        <div className="text-right">
                            {statusOrTimes}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default OpeningHoursDisplay;
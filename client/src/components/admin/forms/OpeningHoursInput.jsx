import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Copy } from 'lucide-react';

const daysOfWeek = ['lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato', 'domenica'];

const getDefaultSchedule = () => {
    const schedule = {};
    daysOfWeek.forEach(day => {
        schedule[day] = { status: 'CLOSED', slots: [] };
    });
    return schedule;
};

function OpeningHoursInput({ value, onChange }) {
    const [schedule, setSchedule] = useState(getDefaultSchedule());

    useEffect(() => {
        let initialValue = getDefaultSchedule();
        if (value) {
            try {
                initialValue = typeof value === 'string' ? JSON.parse(value) : value;
            } catch (e) { console.error("Failed to parse", e); }
        }
        const completeSchedule = { ...getDefaultSchedule(), ...initialValue };
        setSchedule(completeSchedule);
    }, [value]);

    const updateSchedule = (newSchedule) => {
        setSchedule(newSchedule);
        onChange(JSON.stringify(newSchedule));
    };

    const handleStatusChange = (day, status) => {
        const newSchedule = { ...schedule };
        newSchedule[day].status = status;
        if (status === 'OPEN' && newSchedule[day].slots.length === 0) {
            newSchedule[day].slots = [{ from: '09:00', to: '19:00' }];
        } else if (status !== 'OPEN') {
            newSchedule[day].slots = [];
        }
        updateSchedule(newSchedule);
    };

    const handleTimeChange = (day, slotIndex, field, time) => {
        const newSchedule = { ...schedule };
        newSchedule[day].slots[slotIndex][field] = time;
        updateSchedule(newSchedule);
    };

    const addSlot = (day) => {
        const newSchedule = { ...schedule };
        newSchedule[day].slots.push({ from: '', to: '' });
        updateSchedule(newSchedule);
    };

    const removeSlot = (day, slotIndex) => {
        const newSchedule = { ...schedule };
        newSchedule[day].slots.splice(slotIndex, 1);
        updateSchedule(newSchedule);
    };

    const copyToAll = (sourceDay) => {
        if (!window.confirm(`Copiare l'orario di ${sourceDay} a tutti gli altri giorni?`)) return;
        const newSchedule = { ...schedule };
        const sourceData = JSON.parse(JSON.stringify(newSchedule[sourceDay]));
        daysOfWeek.forEach(day => {
            if (day !== sourceDay) newSchedule[day] = JSON.parse(JSON.stringify(sourceData));
        });
        updateSchedule(newSchedule);
    };

    return (
        <div className="space-y-3 p-3 border rounded-md">
            {daysOfWeek.map((day) => (
                <div key={day} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-start border-b pb-3 last:border-b-0">
                    <div className="font-semibold capitalize md:col-span-1 pt-2 flex flex-col">
                        <span>{day}</span>
                        {/* ▼▼▼ PULSANTE COPIA SPOSTATO QUI PER ESSERE SEMPRE VISIBILE ▼▼▼ */}
                        {day === 'lunedì' && (
                            <button type="button" onClick={() => copyToAll('lunedì')} className="text-xs text-indigo-600 flex items-center gap-1 hover:underline mt-1">
                                <Copy size={12} /> Copia a tutti
                            </button>
                        )}
                    </div>

                    <div className="md:col-span-3 space-y-2">
                        <select
                            value={schedule[day]?.status || 'CLOSED'}
                            onChange={(e) => handleStatusChange(day, e.target.value)}
                            className="w-full p-2 border rounded"
                        >
                            <option value="OPEN">Aperto</option>
                            <option value="CLOSED">Chiuso</option>
                            <option value="24H">Aperto 24 ore</option>
                            {/* ▼▼▼ NUOVA OPZIONE ▼▼▼ */}
                            <option value="UNKNOWN">Orari non disponibili</option>
                        </select>

                        {schedule[day]?.status === 'OPEN' && (
                            <div className="space-y-2">
                                {schedule[day].slots.map((slot, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <input type="time" value={slot.from} onChange={(e) => handleTimeChange(day, index, 'from', e.target.value)} className="w-full p-1 border rounded" />
                                        <span>-</span>
                                        <input type="time" value={slot.to} onChange={(e) => handleTimeChange(day, index, 'to', e.target.value)} className="w-full p-1 border rounded" />
                                        <button type="button" onClick={() => removeSlot(day, index)} className="text-red-500 p-1 hover:bg-red-100 rounded-full"><Trash2 size={16} /></button>
                                    </div>
                                ))}
                                <button type="button" onClick={() => addSlot(day)} className="text-sm text-sky-600 flex items-center gap-1 hover:underline"><Plus size={14} /> Aggiungi orario</button>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default OpeningHoursInput;
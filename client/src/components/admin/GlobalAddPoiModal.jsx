import React, { useEffect, useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { X } from 'lucide-react';
import Select from 'react-select';
import { createPoi, fetchAllComuniForAdmin } from '../../api';
import RichTextEditor from './forms/RichTextEditor';
import OpeningHoursInput from './forms/OpeningHoursInput';


const categories = ["Restaurant", "Bar", "FuelStation", "Supermarket", "Accommodation", "EmergencyService", "TouristAttraction", "Parking", "CarRepairShop"];

function GlobalAddPoiModal({ preselectedCategory, onClose, onPoiAdded }) {
    const { register, handleSubmit, watch, control, formState: { isSubmitting } } = useForm({
        defaultValues: {
            category: preselectedCategory || ''
        }
    });

    const [comuni, setComuni] = useState([]);
    const [isLoadingComuni, setIsLoadingComuni] = useState(true);


    useEffect(() => {
        const loadComuni = async () => {
            try {
                // Carichiamo una lista leggera (limit o select specifica se l'API lo supporta, qui ne prendiamo tanti)
                const res = await fetchAllComuniForAdmin({ limit: 8000 });
                setComuni(res.data.data);
            } catch (error) {
                console.error("Errore comuni:", error);
            } finally {
                setIsLoadingComuni(false);
            }
        };
        loadComuni();
    }, []);

    const comuniOptions = useMemo(() =>
            comuni.map(c => ({ value: c.id, label: `${c.name} (${c.province.sigla})` })),
        [comuni]);

    const onSubmit = async (data) => {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (key === 'images') {
                if (data.images && data.images.length > 0) {
                    for (let i = 0; i < data.images.length; i++) formData.append('images', data.images[i]);
                }
            } else if (data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key]);
            }
        });

        try {
            await createPoi(formData);
            alert("Punto vendita aggiunto con successo!");
            if (onPoiAdded) onPoiAdded();
            onClose();
        } catch (error) {
            console.error("Errore creazione:", error);
            alert("Errore durante la creazione.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold">Aggiungi Nuovo {preselectedCategory}</h2>
                    <button onClick={onClose}><X /></button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 overflow-y-auto">

                    {/* SELEZIONE COMUNE (La parte nuova) */}
                    <div>
                        <label className="block font-semibold mb-1">Comune *</label>
                        <Controller
                            name="comuneId"
                            control={control}
                            rules={{ required: "Seleziona un comune" }}
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    options={comuniOptions}
                                    isLoading={isLoadingComuni}
                                    placeholder="Cerca comune (es. Roma)..."
                                    onChange={(option) => field.onChange(option ? option.value : null)}
                                    value={comuniOptions.find(c => c.value === field.value)}
                                />
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div><label>Nome *</label><input {...register('name', { required: true })} className="w-full border p-2 rounded mt-1"/></div>
                        <div><label>Categoria</label>
                            <select {...register('category', { required: true })} className="w-full border p-2 rounded mt-1" disabled={!!preselectedCategory}>
                                <option value="">Seleziona...</option>
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                    </div>

                    {watch('category') === 'EmergencyService' && (
                        <div>
                            <label className="block font-semibold mb-1">Tipo Servizio Sanitario *</label>
                            <select {...register('serviceType', { required: true })} className="w-full border p-2 rounded mt-1">
                                <option value="">Seleziona...</option>
                                <option value="Ambulatorio">Ambulatorio</option>
                                <option value="Farmacia">Farmacia</option>
                                <option value="Ospedale">Ospedale</option>
                                <option value="Guardia Medica">Guardia Medica</option>
                                <option value="Altro">Altro</option>
                            </select>
                        </div>
                    )}

                    <div><label>Indirizzo *</label><input {...register('address', { required: true })} className="w-full border p-2 rounded mt-1"/></div>

                    <div>
                        <label className="font-semibold block mb-2">Orari</label>
                        <Controller name="openingHours" control={control} defaultValue="{}" render={({field}) => <OpeningHoursInput value={field.value} onChange={field.onChange}/>} />
                    </div>

                    <div><label>Descrizione</label><Controller name="description" control={control} defaultValue="" render={({field}) => <RichTextEditor value={field.value} onChange={field.onChange}/>} /></div>

                    <div className="grid grid-cols-2 gap-4">
                        <div><label>Sito Web</label><input {...register('website')} className="w-full border p-2 rounded mt-1"/></div>
                        <div><label>Telefono</label><input {...register('phoneNumber')} className="w-full border p-2 rounded mt-1"/></div>
                    </div>



                    <div><label>Immagini</label><input type="file" {...register('images')} multiple className="w-full text-sm mt-1"/></div>

                    <div className="pt-4 border-t flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="bg-gray-200 px-4 py-2 rounded-lg">Annulla</button>
                        <button type="submit" disabled={isSubmitting} className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold">{isSubmitting ? '...' : 'Salva'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default GlobalAddPoiModal;
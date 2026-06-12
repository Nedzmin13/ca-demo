import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Helmet } from 'react-helmet-async';
import { importGlobalCsv } from '../../api';
import { UploadCloud, FileSpreadsheet, CheckCircle, AlertTriangle } from 'lucide-react';

const categoryLabels = {
    Supermarket: 'Supermercati',
    Restaurant: 'Ristoranti',
    FuelStation: 'Benzina',
    'EmergencyService:Farmacia': 'Farmacia',
    'EmergencyService:Ospedale': 'Ospedale',
    'EmergencyService:Guardia Medica': 'Guardia Medica',
    'EmergencyService:Ambulatorio': 'Ambulatori',
    Bar: 'Bar',
    Parking: 'Parcheggi',
    CarRepairShop: 'Officine'
};

function AdminBulkImportPage() {
    const { register, handleSubmit, formState: { isSubmitting } } = useForm();
    const [result, setResult] = useState(null);

    const onSubmit = async (data) => {
        setResult(null);
        if (!data.file || !data.category) {
            alert("Seleziona categoria e file.");
            return;
        }

        const formData = new FormData();
        formData.append('file', data.file[0]);
        formData.append('category', data.category);

        try {
            const res = await importGlobalCsv(formData);
            setResult({ success: true, message: res.data.message, errors: res.data.errors });
        } catch (error) {
            console.error(error);
            setResult({ success: false, message: "Errore durante l'importazione (Controlla console)." });
        }
    };

    return (
        <>
            <Helmet><title>Importazione Massiva - Admin</title></Helmet>

            <div className="bg-white p-8 rounded-lg shadow-md max-w-3xl mx-auto mt-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                        <UploadCloud size={32} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Importazione Massiva Globale</h1>
                        <p className="text-gray-500">Carica punti di interesse per città diverse in un colpo solo.</p>
                    </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-8 text-sm text-gray-700">
                    <h3 className="font-bold flex items-center gap-2 mb-2">
                        <FileSpreadsheet size={16} /> Struttura CSV Richiesta
                    </h3>
                    <code className="block bg-white p-3 rounded border text-xs overflow-x-auto mb-2">
                        Nome;Comune;Indirizzo;Telefono;Lun;Mar;Mer;Gio;Ven;Sab;Dom
                    </code>
                    <ul className="space-y-1 list-disc pl-5 text-xs text-gray-500">
                        <li><strong>Comune:</strong> Deve essere scritto esattamente come nel database (es. "Milano", non "milano").</li>
                        <li><strong>Orari:</strong> Usa <code>08:00-20:00</code>, <code>24H</code>, <code>ND</code> o lascia vuoto per chiuso.</li>
                    </ul>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label className="block font-semibold mb-2">Cosa stai caricando?</label>
                        <select {...register('category', { required: true })} className="w-full border p-3 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                            <option value="">Seleziona Categoria...</option>
                            {Object.entries(categoryLabels).map(([val, label]) => (
                                <option key={val} value={val}>{label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block font-semibold mb-2">File CSV</label>
                        <input type="file" accept=".csv" {...register('file', { required: true })} className="w-full border p-3 rounded-lg bg-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                    </div>

                    <button disabled={isSubmitting} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition disabled:bg-gray-400">
                        {isSubmitting ? 'Caricamento in corso...' : 'Avvia Importazione'}
                    </button>
                </form>

                {result && (
                    <div className={`mt-8 p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                        <h4 className={`font-bold flex items-center gap-2 ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                            {result.success ? <CheckCircle size={20}/> : <AlertTriangle size={20}/>}
                            {result.success ? 'Importazione Completata' : 'Errore'}
                        </h4>
                        <p className="mt-1 text-sm">{result.message}</p>

                        {result.errors && result.errors.length > 0 && (
                            <div className="mt-4 bg-white p-3 rounded border max-h-60 overflow-y-auto">
                                <p className="font-bold text-xs text-red-600 mb-2">Errori riscontrati:</p>
                                {result.errors.map((err, i) => (
                                    <p key={i} className="text-xs text-gray-600 font-mono border-b last:border-0 py-1">{err}</p>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}

export default AdminBulkImportPage;
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Edit, Search, PlusCircle, Trash2, ArrowLeft, FileSpreadsheet } from 'lucide-react';
import { fetchPoisByCategoryAdmin, deletePoi } from '../../../api';


import GlobalAddPoiModal from '../../../components/admin/GlobalAddPoiModal';
import EditPoiModal from '../../../components/admin/EditPoiModal';

function AdminSinglePoiListPage({ category, subType, title }) {
    const [pois, setPois] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // STATI MODALI
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [poiToEdit, setPoiToEdit] = useState(null);

    // Determina dove tornare (Ristorazione o Sanità)
    const backLink = category === 'EmergencyService' ? '/admin/sanita' : '/admin/ristorazione';
    const backText = category === 'EmergencyService' ? 'Torna alla Dashboard Sanità' : 'Torna alla Dashboard Ristorazione';

    const loadData = async () => {
        setLoading(true);
        try {
            // Costruiamo i parametri per l'API
            const params = { search, page };
            if (subType) {
                params.serviceType = subType; // Passiamo il sottotipo (es. Farmacia) se esiste
            }

            const res = await fetchPoisByCategoryAdmin(category, params);
            setPois(res.data.data);
            setTotalPages(res.data.pagination.pages);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // Ricarica quando cambiano i filtri o la pagina
    useEffect(() => { loadData(); }, [category, subType, page]);

    // Debounce per la ricerca
    useEffect(() => {
        const timer = setTimeout(() => { setPage(1); loadData(); }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const handleDelete = async (id) => {
        if(window.confirm("Eliminare definitivamente questo elemento?")) {
            await deletePoi(id);
            loadData();
        }
    };

    // Callback dopo aggiunta/modifica
    const handleOperationSuccess = () => {
        setPoiToEdit(null); // Chiude edit
        setIsAddModalOpen(false); // Chiude add
        loadData(); // Ricarica lista
    };

    return (
        <>
            <Helmet><title>{title} - Admin</title></Helmet>

            <Link to={backLink} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6">
                <ArrowLeft size={16} /> {backText}
            </Link>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
                    <div className="flex gap-2">
                        <Link to="/admin/import-massivo" className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-600 flex items-center gap-2">
                            <FileSpreadsheet size={18}/> Importa CSV
                        </Link>
                        {/* TASTO AGGIUNGI ORA APRE IL MODALE */}
                        <button onClick={() => setIsAddModalOpen(true)} className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-600 flex items-center gap-2">
                            <PlusCircle size={18}/> Aggiungi
                        </button>
                    </div>
                </div>

                <div className="mb-4 relative max-w-md">
                    <input type="text" placeholder="Cerca nome, città..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 p-2 border rounded-lg" />
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                        <tr>
                            <th className="px-6 py-3">Nome</th>
                            <th className="px-6 py-3">Città</th>
                            <th className="px-6 py-3">Indirizzo</th>
                            <th className="px-6 py-3">Azioni</th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? <tr><td colSpan="4" className="text-center p-6">Caricamento...</td></tr> :
                            pois.map(poi => (
                                <tr key={poi.id} className="border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-bold text-gray-900">{poi.name}</td>
                                    <td className="px-6 py-4">{poi.comune.name} ({poi.comune.province.sigla})</td>
                                    <td className="px-6 py-4 truncate max-w-xs">{poi.address}</td>
                                    <td className="px-6 py-4 flex gap-3">
                                        {/* TASTO MODIFICA ORA APRE IL MODALE LOCALE */}
                                        <button onClick={() => setPoiToEdit(poi)} className="text-blue-600 hover:text-blue-800 p-1 bg-blue-50 rounded" title="Modifica">
                                            <Edit size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(poi.id)} className="text-red-600 hover:text-red-800 p-1 bg-red-50 rounded" title="Elimina">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-4 flex justify-between items-center border-t pt-4">
                    <button disabled={page===1} onClick={()=>setPage(p=>p-1)} className="text-blue-600 disabled:text-gray-300">Indietro</button>
                    <span>Pagina {page} di {totalPages}</span>
                    <button disabled={page===totalPages} onClick={()=>setPage(p=>p+1)} className="text-blue-600 disabled:text-gray-300">Avanti</button>
                </div>
            </div>

            {/* MODALE DI AGGIUNTA GLOBALE */}
            {isAddModalOpen && (
                <GlobalAddPoiModal
                    preselectedCategory={category}
                    // Se stiamo aggiungendo in una lista specifica (es. Farmacie), passiamo il subtype come predefinito nel modale se possibile,
                    // oppure il modale deve essere abbastanza intelligente da gestirlo.
                    // Per ora category è sufficiente (EmergencyService).
                    onClose={() => setIsAddModalOpen(false)}
                    onPoiAdded={handleOperationSuccess}
                />
            )}

            {/* MODALE DI MODIFICA */}
            {poiToEdit && (
                <EditPoiModal
                    poiToEdit={poiToEdit}
                    onClose={() => setPoiToEdit(null)}
                    onPoiUpdated={handleOperationSuccess}
                />
            )}
        </>
    );
}

export default AdminSinglePoiListPage;
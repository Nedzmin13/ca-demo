import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams, useLocation } from 'react-router-dom';
import { fetchGuidesByCategoryIdAdmin, deleteGuide } from '../../api';
import { Edit, Trash2, ArrowLeft, Plus } from 'lucide-react';

function AdminGuidesListPage() {
    const { categoryId } = useParams();
    const location = useLocation(); // Per ottenere dati passati dalla pagina precedente
    const [guides, setGuides] = useState([]);
    const [loading, setLoading] = useState(true);

    // Otteniamo il nome della categoria passato tramite lo stato del Link per non fare un'altra chiamata API
    const categoryName = location.state?.categoryName || 'Categoria';

    useEffect(() => {
        const loadGuides = async () => {
            if (!categoryId) return;
            setLoading(true);
            try {
                const response = await fetchGuidesByCategoryIdAdmin(categoryId);
                setGuides(response.data);
            } catch (error) {
                console.error(`Errore nel caricare le guide per la categoria ${categoryId}:`, error);
            } finally {
                setLoading(false);
            }
        };
        loadGuides();
    }, [categoryId]);

    const handleDelete = async (guideId) => {
        if (window.confirm("Sei sicuro di voler eliminare questa guida? L'azione è irreversibile.")) {
            try {
                await deleteGuide(guideId);
                setGuides(prevGuides => prevGuides.filter(guide => guide.id !== guideId));
            } catch (error) {
                alert("Errore durante l'eliminazione della guida.");
            }
        }
    };

    return (
        <>
            <Helmet><title>Guide per {categoryName} - Admin</title></Helmet>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <Link to="/admin/guide" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6">
                    <ArrowLeft size={16} /> Torna alle categorie
                </Link>

                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Guide per: {categoryName}</h1>
                    <Link
                        to={`/admin/guide/category/${categoryId}/nuovo`}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-green-600"
                    >
                        <Plus size={18}/> Aggiungi Guida
                    </Link>
                </div>

                <div className="space-y-3">
                    {loading ? (
                        <p>Caricamento guide...</p>
                    ) : guides.length > 0 ? (
                        guides.map(guide => (
                            <div key={guide.id} className="border p-4 rounded-lg flex justify-between items-center hover:bg-gray-50">
                                <div>
                                    <p className="font-bold text-gray-900">{guide.title}</p>
                                    <p className="text-sm text-gray-500">{guide.excerpt?.substring(0, 70)}...</p>
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                                    <Link to={`/admin/guide/modifica/${guide.id}`} className="text-blue-500 hover:text-blue-700" title="Modifica">
                                        <Edit size={18}/>
                                    </Link>
                                    <button onClick={() => handleDelete(guide.id)} className="text-red-500 hover:text-red-700" title="Elimina">
                                        <Trash2 size={18}/>
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500">Nessuna guida trovata per questa categoria.</p>
                            <p className="mt-2 text-sm">Puoi iniziare aggiungendone una!</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default AdminGuidesListPage;
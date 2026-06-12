import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { fetchGuidesForAdmin, deleteGuide } from '../../api';
import { Edit, Trash2, ArrowLeft } from 'lucide-react';

// --- CORREZIONE NOME FUNZIONE ---
function AdminGuidesPage() {
    const { categoryName } = useParams();
    const navigate = useNavigate();
    const [guides, setGuides] = useState([]);
    const [loading, setLoading] = useState(true);

    const decodedCategoryName = decodeURIComponent(categoryName);

    useEffect(() => {
        const loadGuides = async () => {
            setLoading(true);
            try {
                const response = await fetchGuidesForAdmin({ category: decodedCategoryName });
                setGuides(response.data);
            } catch (error) {
                console.error(`Errore nel caricare le guide per ${decodedCategoryName}:`, error);
            } finally {
                setLoading(false);
            }
        };
        loadGuides();
    }, [decodedCategoryName]);

    const handleDelete = async (id) => {
        if (window.confirm("Sei sicuro di voler eliminare questa guida?")) {
            try {
                await deleteGuide(id);
                setGuides(prevGuides => prevGuides.filter(guide => guide.id !== id));
            } catch (error) {
                alert("Errore durante l'eliminazione.");
            }
        }
    };

    return (
        <>
            <Helmet><title>Guide: {decodedCategoryName} - Admin</title></Helmet>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <Link to="/admin/guide" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6">
                    <ArrowLeft size={16} /> Torna a tutte le categorie
                </Link>

                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Guide per: {decodedCategoryName}</h1>
                    <Link to="/admin/guide/nuovo" className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-600">
                        Aggiungi Nuova Guida
                    </Link>
                </div>

                <div className="space-y-4">
                    {loading ? <p>Caricamento...</p> : guides.map(item => (
                        <div key={item.id} className="border p-4 rounded-lg flex justify-between items-center">
                            <div>
                                <p className="font-bold">{item.title}</p>
                                <p className="text-sm text-gray-500">{item.subcategory}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Link to={`/admin/guide/modifica/${item.id}`} className="text-blue-500"><Edit/></Link>
                                <button onClick={() => handleDelete(item.id)} className="text-red-500"><Trash2/></button>
                            </div>
                        </div>
                    ))}
                    {!loading && guides.length === 0 && <p className="text-center py-8">Nessuna guida trovata per questa categoria.</p>}
                </div>
            </div>
        </>
    );
}

// --- CORREZIONE NOME EXPORT ---
export default AdminGuidesPage;
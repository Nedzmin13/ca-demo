import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom'; // useParams per leggere il tipo
import { PlusCircle, Edit, Search } from 'lucide-react';
import { fetchAllChains, createChain } from '../../api';

// Dizionario per titoli e traduzioni
const PAGE_CONFIG = {
    restaurant: { title: "Catene di Ristorazione", singular: "Ristorante", category: "Restaurant" },
    fuel: { title: "Compagnie Petrolifere", singular: "Distributore", category: "FuelStation" },
    medical: { title: "Gruppi Sanitari", singular: "Struttura", category: "EmergencyService" }
};

function AdminChainsListPage() {
    const { type } = useParams(); // 'restaurant', 'fuel', 'medical'
    const config = PAGE_CONFIG[type] || PAGE_CONFIG.restaurant;

    const [chains, setChains] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newChainName, setNewChainName] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const loadChains = async () => {
        setLoading(true);
        try {
            const response = await fetchAllChains(type);
            setChains(response.data);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    // Ricarica quando cambia il tipo (es. passi da ristoranti a benzina)
    useEffect(() => { loadChains(); }, [type]);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newChainName.trim()) return;
        try {
            await createChain(type, { name: newChainName, category: config.category });
            setNewChainName('');
            setIsModalOpen(false);
            loadChains();
        } catch (error) { alert("Errore creazione catena."); }
    };

    const filteredChains = chains.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <>
            <Helmet><title>{config.title} - Admin</title></Helmet>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">{config.title}</h1>
                    <button onClick={() => setIsModalOpen(true)} className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-600">
                        <PlusCircle size={18} /> Aggiungi Catena
                    </button>
                </div>

                <div className="mb-6 relative max-w-md">
                    <input type="text" placeholder={`Cerca ${config.singular}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full border p-2 pl-10 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="px-6 py-3">Nome</th>
                            <th className="px-6 py-3">Punti Vendita</th>
                            <th className="px-6 py-3">Azioni</th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? <tr><td colSpan="3" className="text-center p-6">Caricamento...</td></tr> :
                            filteredChains.length > 0 ? filteredChains.map(chain => (
                                <tr key={chain.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{chain.name}</td>
                                    <td className="px-6 py-4">{chain._count.locations}</td>
                                    <td className="px-6 py-4">
                                        <Link to={`/admin/brands/${type}/${chain.id}`} className="text-blue-600 hover:text-blue-800"><Edit size={18} /></Link>
                                    </td>
                                </tr>
                            )) : <tr><td colSpan="3" className="text-center p-6">Nessuna catena trovata.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Nuova Catena</h2>
                        <form onSubmit={handleCreate}>
                            <label className="block text-sm font-medium text-gray-700">Nome</label>
                            <input type="text" value={newChainName} onChange={(e) => setNewChainName(e.target.value)} className="mt-1 w-full border p-2 rounded-lg" required />
                            <div className="flex justify-end gap-4 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-200 px-4 py-2 rounded-lg">Annulla</button>
                                <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded-lg">Salva</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

export default AdminChainsListPage;
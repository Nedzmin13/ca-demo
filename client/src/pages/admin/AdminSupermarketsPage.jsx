import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { PlusCircle, Edit, Search } from 'lucide-react';
import { fetchAllSupermarketBrands, createSupermarketBrand } from '../../api';

function AdminSupermarketsPage() {
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newBrandName, setNewBrandName] = useState('');

    // NUOVO STATO RICERCA
    const [searchTerm, setSearchTerm] = useState('');

    const loadBrands = async () => {
        setLoading(true);
        try {
            const response = await fetchAllSupermarketBrands();
            setBrands(response.data);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    useEffect(() => { loadBrands(); }, []);

    const handleCreateBrand = async (e) => {
        e.preventDefault();
        if (!newBrandName.trim()) return;
        try {
            await createSupermarketBrand({ name: newBrandName });
            setNewBrandName('');
            setIsModalOpen(false);
            loadBrands();
        } catch (error) { alert("Errore creazione brand."); }
    };

    // FILTRO
    const filteredBrands = brands.filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <>
            <Helmet><title>Gestione Supermercati - Admin</title></Helmet>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Catene di Supermercati</h1>
                    <button onClick={() => setIsModalOpen(true)} className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-600">
                        <PlusCircle size={18} /> Aggiungi Catena
                    </button>
                </div>

                {/* BARRA DI RICERCA */}
                <div className="mb-6 relative max-w-md">
                    <input
                        type="text"
                        placeholder="Cerca catena (es. Lidl)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full border p-2 pl-10 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Nome Catena</th>
                            <th scope="col" className="px-6 py-3">Punti Vendita</th>
                            <th scope="col" className="px-6 py-3">Azioni</th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <tr><td colSpan="3" className="text-center p-6">Caricamento...</td></tr>
                        ) : filteredBrands.length > 0 ? (
                            filteredBrands.map(brand => (
                                <tr key={brand.id} className="bg-white border-b hover:bg-gray-50">
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900">{brand.name}</th>
                                    <td className="px-6 py-4">{brand._count.locations}</td>
                                    <td className="px-6 py-4">
                                        <Link to={`/admin/supermercati/${brand.id}`} className="text-blue-600 hover:text-blue-800">
                                            <Edit size={18} />
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="3" className="text-center p-6">Nessuna catena trovata.</td></tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Nuova Catena</h2>
                        <form onSubmit={handleCreateBrand}>
                            <label className="block text-sm font-medium text-gray-700">Nome</label>
                            <input type="text" value={newBrandName} onChange={(e) => setNewBrandName(e.target.value)} className="mt-1 w-full border p-2 rounded-lg" required />
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

export default AdminSupermarketsPage;
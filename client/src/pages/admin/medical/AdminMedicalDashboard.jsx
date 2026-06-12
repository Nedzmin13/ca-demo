import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { HeartPulse, Pill, Stethoscope, Building2, BriefcaseMedical } from 'lucide-react';

function AdminMedicalDashboard() {
    return (
        <>
            <Helmet><title>Gestione Sanità - Admin</title></Helmet>

            <h1 className="text-3xl font-bold text-gray-800 mb-8">Gestione Sanità & Emergenza</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* CARD 1: GRUPPI SANITARI (Catene) */}
                <Link to="/admin/brands/medical" className="block bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow border border-gray-100 group">
                    <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
                        <BriefcaseMedical size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Gruppi Sanitari</h2>
                    <p className="text-gray-500 mt-2 text-sm">Gestisci Gruppo San Donato, DentalPro, Humanitas e altre catene.</p>
                </Link>

                {/* CARD 2: OSPEDALI */}
                <Link to="/admin/sanita-list/Ospedale" className="block bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow border border-gray-100 group">
                    <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center text-red-600 mb-4 group-hover:scale-110 transition-transform">
                        <Building2 size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Ospedali</h2>
                    <p className="text-gray-500 mt-2 text-sm">Lista di tutti gli ospedali pubblici e privati.</p>
                </Link>

                {/* CARD 3: FARMACIE */}
                <Link to="/admin/sanita-list/Farmacia" className="block bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow border border-gray-100 group">
                    <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center text-green-600 mb-4 group-hover:scale-110 transition-transform">
                        <Pill size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Farmacie</h2>
                    <p className="text-gray-500 mt-2 text-sm">Elenco completo delle farmacie comunali e private.</p>
                </Link>

                {/* CARD 4: GUARDIA MEDICA */}
                <Link to="/admin/sanita-list/Guardia Medica" className="block bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow border border-gray-100 group">
                    <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                        <HeartPulse size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Guardia Medica</h2>
                    <p className="text-gray-500 mt-2 text-sm">Sedi di continuità assistenziale.</p>
                </Link>

                {/* CARD 5: AMBULATORI */}
                <Link to="/admin/sanita-list/Ambulatorio" className="block bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow border border-gray-100 group">
                    <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-110 transition-transform">
                        <Stethoscope size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Ambulatori</h2>
                    <p className="text-gray-500 mt-2 text-sm">Poliambulatori, studi medici e cliniche.</p>
                </Link>

            </div>
        </>
    );
}

export default AdminMedicalDashboard;
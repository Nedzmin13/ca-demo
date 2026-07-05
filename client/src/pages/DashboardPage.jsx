// client/src/pages/DashboardPage.jsx
import React from 'react';
import { Helmet } from 'react-helmet-async';
import useAuthStore from '../store/authStore';

function DashboardPage() {
    const { userInfo } = useAuthStore();
    return (
        <>
            <Helmet><title>Dashboard - ComuniAmo Admin</title></Helmet>
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Benvenuto, {userInfo?.email}!</h1>
                <p className="mt-2 text-gray-600">
                    Seleziona una voce dal menu a sinistra per iniziare a gestire i contenuti del sito.
                </p>
            </div>
        </>
    );
}
export default DashboardPage;
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AdminLayout from "./layouts/AdminLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

// Import Pagine Pubbliche
import HomePage from './pages/HomePage';
import TravelPage from './pages/TravelPage';
import RegionsListPage from './pages/RegionsListPage';
import RegionDetailPage from "./pages/RegionDetailPage.jsx";
import ProvinceDetailPage from "./pages/ProvinceDetailPage.jsx";
import ComuneDetailPage from "./pages/ComuneDetailPage.jsx";
import OffersPage from "./pages/OffersPage.jsx";
import OfferDetailPage from "./pages/OfferDetailPage.jsx";
// import ItineraryDetailPage from "./pages/ItineraryDetailPage.jsx";
// import ItinerariesListPage from "./pages/ItinerariesListPage.jsx";
import TopDestinationsPage from "./pages/TopDestinationsPage.jsx";
import DestinationDetailPage from "./pages/DestinationDetailPage.jsx";
import BonusPage from "./pages/BonusPage.jsx";
import BonusDetailPage from "./pages/BonusDetailPage.jsx";
import UtilityNewsPage from "./pages/UtilityNewsPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import PoiDetailPage from "./pages/PoiDetailPage.jsx";
import GuidesPage from "./pages/GuidesPage.jsx";
import GuideCategoryPage from "./pages/GuideCategoryPage.jsx";
import GuideDetailPage from "./pages/GuideDetailPage.jsx";
import ServiceRegionsPage from "./pages/services/ServiceRegionsPage.jsx";
import ServiceProvinceListPage from "./pages/services/ServiceProvinceListPage.jsx";
import AttractionRegionsPage from "./pages/attractions/AttractionRegionsPage.jsx";
import AttractionProvinceListPage from "./pages/attractions/AttractionProvinceListPage.jsx";

// Import Pagine Admin
import DashboardPage from "./pages/DashboardPage.jsx";
import AdminComuniListPage from "./pages/admin/AdminComuniListPage.jsx";
import AdminComuneDetailPage from "./pages/admin/AdminComuneDetailPage.jsx";
import AdminOffersPage from "./pages/admin/AdminOffersPage.jsx";
import AdminBonusPage from "./pages/admin/AdminBonusPage.jsx";
import AdminDestinationsPage from "./pages/admin/AdminDestinationsPage.jsx";
// import AdminItinerariesListPage from './pages/admin/AdminItinerariesListPage';
// import AdminItineraryEditPage from './pages/admin/AdminItineraryEditPage';
import AdminNewsPage from "./pages/admin/AdminNewsPage.jsx";
import AdminStrikesPage from "./pages/admin/AdminStrikesPage.jsx";
import AdminTrafficPage from "./pages/admin/AdminTrafficPage.jsx";
import AdminRegionsPage from "./pages/admin/AdminRegionsPage.jsx";
import AdminProvincesPage from "./pages/admin/AdminProvincesPage.jsx";

// --- NUOVI IMPORT PER LA SEZIONE ADMIN GUIDE ---
import AdminGuidesCategoriesPage from "./pages/admin/AdminGuidesCategoriesPage.jsx";
import AdminGuidesListPage from './pages/admin/AdminGuidesListPage';
import AdminGuideEditPage from "./pages/admin/AdminGuideEditPage.jsx";
import AdminHowToCategoriesPage from "./pages/admin/AdminHowToCategoriesPage.jsx";
import AdminHowToArticlesListPage from "./pages/admin/AdminHowToArticlesListPage.jsx";
import AdminHowToArticleEditPage from "./pages/admin/AdminHowToArticleEditPage.jsx";
import HowToPage from "./pages/HowToPage.jsx";
import HowToCategoryPage from "./pages/HowToCategoryPage.jsx";
import HowToArticlePage from "./pages/HowToArticlePage.jsx";
// import NewsDetailPage from "./pages/NewsDetailPage.jsx";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage.jsx";
import CookiePolicyPage from "./pages/CookiePolicyPage.jsx";
import TermsAndConditionsPage from "./pages/TermsAndConditionsPage.jsx";
import ChiSiamoPage from "./pages/ChiSiamoPage.jsx";
import FaqPage from "./pages/FaqPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
// import ItinerariesByRegionPage from "./pages/ItinerariesByRegionPage.jsx";
import AdminSupermarketsPage from "./pages/admin/AdminSupermarketsPage.jsx";
import AdminSupermarketDetailPage from "./pages/admin/AdminSupermarketDetailPage.jsx";
import AdminChainsListPage from "./pages/admin/AdminChainsListPage.jsx";
import AdminChainDetailPage from "./pages/admin/AdminChainDetailPage.jsx";
import AdminBulkImportPage from "./pages/admin/AdminBulkImportPage.jsx";
import AdminRestaurantDashboard from "./pages/admin/restaurant/AdminRestaurantDashboard.jsx";
import AdminSinglePoiListPage from "./pages/admin/restaurant/AdminSinglePoiListPage.jsx";
import AdminMedicalDashboard from "./pages/admin/medical/AdminMedicalDashboard.jsx";

import ScrollToTop from "./components/ScrollToTop";

const Placeholder = ({ title }) => <div className="text-center p-20 text-3xl font-bold">{title}</div>;

function App() {
    return (
        <>
            <ScrollToTop />
            <Routes>
                {/* --- ROTTE PUBBLICHE --- */}
                <Route path="/" element={<MainLayout />}>
                    <Route index element={<HomePage />} />
                    <Route path="viaggio" element={<TravelPage />} />
                    <Route path="viaggio/regioni" element={<RegionsListPage />} />
                    <Route path="viaggio/:regionName" element={<RegionDetailPage />} />
                    <Route path="viaggio/:regionName/:provinceSigla" element={<ProvinceDetailPage />} />
                    <Route path="viaggio/:regionName/:provinceSigla/:comuneSlug" element={<ComuneDetailPage />} />
                    <Route path="/comune/:comuneSlug" element={<ComuneDetailPage />} />
                    <Route path="/poi/:id" element={<PoiDetailPage />} />
                    <Route path="/servizi-essenziali" element={<ServiceRegionsPage />} />
                    <Route path="/servizi-essenziali/:regionName" element={<RegionDetailPage />} />
                    <Route path="/servizi-essenziali/:regionName/:provinceName/:provinceId" element={<ServiceProvinceListPage />} />
                    <Route path="/cosa-vedere" element={<AttractionRegionsPage />} />
                    <Route path="/cosa-vedere/:regionName" element={<RegionDetailPage />} />
                    <Route path="/cosa-vedere/:regionName/:provinceName/:provinceId" element={<AttractionProvinceListPage />} />

                    {/* ROTTE NASCOSTE PER APPROVAZIONE ADSENSE */}
                    {/* <Route path="/itinerari" element={<ItinerariesListPage />} /> */}
                    {/* <Route path="/itinerari/regione/:regionSlug" element={<ItinerariesByRegionPage />} /> */}
                    {/* <Route path="/itinerari/:id" element={<ItineraryDetailPage />} /> */}
                    {/* <Route path="/notizie/:id" element={<NewsDetailPage />} /> */}

                    <Route path="affari-sconti" element={<OffersPage />} />
                    <Route path="/offerte/:id" element={<OfferDetailPage />} />
                    <Route path="bonus" element={<BonusPage />} />
                    <Route path="/bonus/:id" element={<BonusDetailPage />} />
                    <Route path="top-destinazioni" element={<TopDestinationsPage />} />
                    <Route path="/destinazioni/:id" element={<DestinationDetailPage />} />
                    <Route path="notizie-utili" element={<UtilityNewsPage />} />

                    <Route path="/pratiche-utili" element={<GuidesPage />} />
                    <Route path="/pratiche-utili/category/:categorySlug" element={<GuideCategoryPage />} />
                    <Route path="/pratiche-utili/:slug" element={<GuideDetailPage />} />
                    <Route path="/come-fare" element={<HowToPage />} />
                    <Route path="/come-fare/category/:categorySlug" element={<HowToCategoryPage />} />
                    <Route path="/come-fare/:slug" element={<HowToArticlePage />} />

                    <Route path="contatti" element={<Placeholder title="Contatti" />} />
                    <Route path="chi-siamo" element={<ChiSiamoPage />} />
                    <Route path="faq" element={<FaqPage />} />
                    <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
                    <Route path="cookie-policy" element={<CookiePolicyPage />} />
                    <Route path="termini-e-condizioni" element={<TermsAndConditionsPage />} />

                    <Route path="*" element={<NotFoundPage />} />
                </Route>

                {/* --- ROTTE LOGIN E ADMIN --- */}
                <Route path="/login" element={<LoginPage />} />
                <Route element={<ProtectedRoute />}>
                    <Route path="/admin" element={<AdminLayout />}>
                        <Route path="dashboard" element={<DashboardPage />} />
                        <Route path="comuni" element={<AdminComuniListPage />} />
                        <Route path="comuni/:id" element={<AdminComuneDetailPage />} />
                        <Route path="offerte" element={<AdminOffersPage />} />
                        <Route path="bonus" element={<AdminBonusPage />} />
                        <Route path="destinazioni" element={<AdminDestinationsPage />} />

                        {/* <Route path="itinerari" element={<AdminItinerariesListPage />} /> */}
                        {/* <Route path="itinerari/nuovo" element={<AdminItineraryEditPage />} /> */}
                        {/* <Route path="itinerari/modifica/:id" element={<AdminItineraryEditPage />} /> */}

                        <Route path="notizie" element={<AdminNewsPage />} />
                        <Route path="scioperi" element={<AdminStrikesPage />} />
                        <Route path="traffico" element={<AdminTrafficPage />} />
                        <Route path="regioni" element={<AdminRegionsPage />} />
                        <Route path="province" element={<AdminProvincesPage />} />

                        {/* --- INIZIO BLOCCO GUIDE ADMIN --- */}
                        <Route path="guide" element={<AdminGuidesCategoriesPage />} />
                        <Route path="guide/category/:categoryId" element={<AdminGuidesListPage />} />
                        <Route path="guide/category/:categoryId/nuovo" element={<AdminGuideEditPage />} />
                        <Route path="guide/modifica/:guideId" element={<AdminGuideEditPage />} />

                        {/* --- FINE BLOCCO GUIDE ADMIN --- */}
                        <Route path="howto" element={<AdminHowToCategoriesPage />} />
                        <Route path="howto/category/:categoryId" element={<AdminHowToArticlesListPage />} />
                        <Route path="howto/category/:categoryId/nuovo" element={<AdminHowToArticleEditPage />} />
                        <Route path="howto/modifica/:articleId" element={<AdminHowToArticleEditPage />} />

                        <Route path="supermercati" element={<AdminSupermarketsPage />} />
                        <Route path="supermercati/:brandId" element={<AdminSupermarketDetailPage />} />
                        <Route path="brands/:type" element={<AdminChainsListPage />} />
                        <Route path="brands/:type/:id" element={<AdminChainDetailPage />} />
                        <Route path="import-massivo" element={<AdminBulkImportPage />} />
                        <Route path="ristorazione" element={<AdminRestaurantDashboard />} />
                        <Route path="ristoranti-list" element={<AdminSinglePoiListPage category="Restaurant" title="Ristoranti Singoli" />} />
                        <Route path="bar-list" element={<AdminSinglePoiListPage category="Bar" title="Bar & Caffetterie" />} />
                        <Route path="sanita" element={<AdminMedicalDashboard />} />

                        {/* LISTE SANITÀ FILTRATE */}
                        <Route path="sanita-list/Ospedale" element={<AdminSinglePoiListPage category="EmergencyService" subType="Ospedale" title="Ospedali" />} />
                        <Route path="sanita-list/Farmacia" element={<AdminSinglePoiListPage category="EmergencyService" subType="Farmacia" title="Farmacie" />} />
                        <Route path="sanita-list/Guardia Medica" element={<AdminSinglePoiListPage category="EmergencyService" subType="Guardia Medica" title="Guardia Medica" />} />
                        <Route path="sanita-list/Ambulatorio" element={<AdminSinglePoiListPage category="EmergencyService" subType="Ambulatorio" title="Ambulatori" />} />
                    </Route>
                </Route>
            </Routes>
        </>
    );
}

export default App;
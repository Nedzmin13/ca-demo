

import axios from 'axios';
import useAuthStore from '../store/authStore';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const API = axios.create({ baseURL: BASE_URL });
const PrivateAPI = axios.create({ baseURL: BASE_URL });

// Questo intercettore aggiunge automaticamente il token a ogni richiesta di PrivateAPI
PrivateAPI.interceptors.request.use((config) => {
    // Leggiamo il token direttamente dallo stato dello store, che è la posizione corretta
    const token = useAuthStore.getState().token;

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    } else {
        console.warn("Nessun token trovato nello store. La richiesta API privata potrebbe fallire.");
    }
    return config;
});

// --- API Pubbliche ---
export const fetchRegions = () => API.get('/regions');
export const fetchRegionByName = (name) => API.get(`/regions/${name}`);
export const fetchProvinceBySigla = (sigla) => API.get(`/provinces/${sigla}`);
export const fetchComuneBySlug = (slug) => API.get(`/comuni/${slug}`);
export const fetchOffers = (params) => API.get('/offers', { params });
export const fetchOfferById = (id) => API.get(`/offers/${id}`);
export const fetchFeaturedPoisByProvince = (provinceId, type) => API.get(`/pois/featured-by-province/${provinceId}`, { params: { type } });
export const fetchItineraries = (params) => API.get('/itineraries', { params });
export const fetchItineraryById = (id) => API.get(`/itineraries/${id}`);
export const fetchDestinationsBySeason = (season) => API.get('/destinations', { params: { season } });
export const fetchDestinationById = (id) => API.get(`/destinations/${id}`);
export const fetchBonuses = (params) => API.get('/bonuses', { params });
export const fetchBonusById = (id) => API.get(`/bonuses/${id}`);
export const fetchUtilityInfo = () => API.get('/utility/all');
export const loginAdmin = (credentials) => API.post('/auth/login', credentials);
export const fetchNews = (params) => API.get('/news', { params });
export const fetchNewsById = (id) => API.get(`/news/${id}`);
export const globalSearch = (query) => API.get('/search', { params: { q: query } });
export const geoSearch = (query) => API.get('/geo-search', { params: { q: query } });
export const fetchPoiById = (id) => API.get(`/pois/${id}`);
export const fetchAllGuides = () => API.get('/guides');
export const fetchAllCategoriesWithGuides = () => API.get('/categories');
export const fetchGuideBySlug = (slug) => API.get(`/guides/${slug}`);
export const fetchGuidesByCategory = (categorySlug) => API.get(`/guides/category/${categorySlug}`);
export const fetchHowToCategoriesWithArticles = () => API.get('/howto-articles');
export const fetchHowToArticlesByCategory = (categorySlug) => API.get(`/howto-articles/category/${categorySlug}`);
export const fetchHowToArticleBySlug = (slug) => API.get(`/howto-articles/${slug}`);
export const fetchTopDestinationsHome = () => API.get('/destinations', { params: { featured: true, limit: 3 } });
export const fetchTopDestinationsTravel = () => API.get('/destinations', { params: { featuredTravel: true, limit: 3 } });

// --- API Private (Admin) ---
export const fetchAllComuniForAdmin = (params) => PrivateAPI.get('/comuni/admin', { params });
export const fetchComuneByIdForAdmin = (id) => PrivateAPI.get(`/comuni/admin/${id}`);
export const createPoi = (formData) => PrivateAPI.post('/pois', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const fetchPoiDetails = (id) => PrivateAPI.get(`/pois/${id}/details`);
export const updatePoi = (id, data) => PrivateAPI.put(`/pois/${id}`, data);
export const deletePoi = (id) => PrivateAPI.delete(`/pois/${id}`);
export const addImagesToPoi = (poiId, formData) => PrivateAPI.post(`/pois/${poiId}/images`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteImage = (imageId) => PrivateAPI.delete(`/pois/images/${imageId}`);
export const updateComune = (id, formData) => PrivateAPI.put(`/comuni/admin/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteComuneImage = (imageId) => PrivateAPI.delete(`/comuni/admin/images/${imageId}`);
export const updateComuneImage = (imageId, data) => PrivateAPI.put(`/comuni/admin/images/${imageId}`, data);
export const fetchOffersForAdmin = () => PrivateAPI.get('/offers/admin');
export const createOffer = (formData) => PrivateAPI.post('/offers/admin', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateOffer = (id, data) => PrivateAPI.put(`/offers/admin/${id}`, data);
export const deleteOffer = (id) => PrivateAPI.delete(`/offers/admin/${id}`);
export const addOfferImages = (id, formData) => PrivateAPI.post(`/offers/admin/${id}/images`, formData);
export const deleteOfferImage = (imageId) => PrivateAPI.delete(`/offers/admin/images/${imageId}`);
export const fetchBonusesForAdmin = () => PrivateAPI.get('/bonuses');
export const createBonus = (data) => PrivateAPI.post('/bonuses/admin', data);
export const updateBonus = (id, data) => PrivateAPI.put(`/bonuses/admin/${id}`, data);
export const deleteBonus = (id) => PrivateAPI.delete(`/bonuses/admin/${id}`);
export const fetchDestinationsForAdmin = (params) => PrivateAPI.get('/destinations/admin', { params });
export const createDestination = (formData) => PrivateAPI.post('/destinations/admin', formData);
export const updateDestination = (id, data) => PrivateAPI.put(`/destinations/admin/${id}`, data);
export const deleteDestination = (id) => PrivateAPI.delete(`/destinations/admin/${id}`);
export const addImagesToDestination = (id, formData) => PrivateAPI.post(`/destinations/admin/${id}/images`, formData);
export const deleteDestinationImage = (id) => PrivateAPI.delete(`/destinations/admin/images/${id}`);
export const updateDestinationImage = (imageId, data) => PrivateAPI.put(`/destinations/admin/images/${imageId}`, data);
export const fetchItinerariesForAdmin = (params) => PrivateAPI.get('/itineraries/admin/list', { params });
export const createItinerary = (formData) => PrivateAPI.post('/itineraries/admin', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateItinerary = (id, formData) => PrivateAPI.put(`/itineraries/admin/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteItinerary = (id) => PrivateAPI.delete(`/itineraries/admin/${id}`);
export const deleteItineraryImage = (imageId) => PrivateAPI.delete(`/itineraries/admin/images/${imageId}`);
export const fetchNewsForAdmin = () => PrivateAPI.get('/news/admin');
export const createNews = (formData) => PrivateAPI.post('/news/admin', formData);
export const updateNews = (id, formData) => PrivateAPI.put(`/news/admin/${id}`, formData);
export const deleteNews = (id) => PrivateAPI.delete(`/news/admin/${id}`);
export const fetchStrikesForAdmin = () => PrivateAPI.get('/strikes');
export const createStrike = (data) => PrivateAPI.post('/strikes/admin', data);
export const updateStrike = (id, data) => PrivateAPI.put(`/strikes/admin/${id}`, data);
export const deleteStrike = (id) => PrivateAPI.delete(`/strikes/admin/${id}`);
export const fetchTrafficAlertsForAdmin = () => PrivateAPI.get('/traffic');
export const createTrafficAlert = (data) => PrivateAPI.post('/traffic/admin', data);
export const updateTrafficAlert = (id, data) => PrivateAPI.put(`/traffic/admin/${id}`, data);
export const deleteTrafficAlert = (id) => PrivateAPI.delete(`/traffic/admin/${id}`);
export const fetchProvincesForAdmin = (page = 1, limit = 25) => PrivateAPI.get('/provinces/admin', { params: { page, limit } });
export const updateProvince = (id, data) => PrivateAPI.put(`/provinces/admin/${id}`, data);
export const fetchRegionsForAdmin = () => PrivateAPI.get('/regions/admin');
export const updateRegion = (id, data) => PrivateAPI.put(`/regions/admin/${id}`, data);
export const fetchCategoriesForAdmin = () => PrivateAPI.get('/categories/admin');
export const createCategory = (data) => PrivateAPI.post('/categories/admin', data);
export const updateCategory = (id, data) => PrivateAPI.put(`/categories/admin/${id}`, data);
export const deleteCategory = (id) => PrivateAPI.delete(`/categories/admin/${id}`);
export const fetchGuidesByCategoryIdAdmin = (categoryId) => PrivateAPI.get('/guides/admin', { params: { categoryId } });
export const fetchGuideByIdAdmin = (id) => PrivateAPI.get(`/guides/admin/${id}`);
export const createGuide = (formData) => PrivateAPI.post('/guides/admin', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateGuide = (id, formData) => PrivateAPI.put(`/guides/admin/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteGuide = (id) => PrivateAPI.delete(`/guides/admin/${id}`);
export const addGuideImages = (guideId, formData) => PrivateAPI.post(`/guides/admin/${guideId}/images`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteGuideImage = (imageId) => PrivateAPI.delete(`/guides/admin/images/${imageId}`);
export const fetchHowToCategoriesForAdmin = () => PrivateAPI.get('/howto-categories/admin');
export const createHowToCategory = (data) => PrivateAPI.post('/howto-categories/admin', data);
export const updateHowToCategory = (id, data) => PrivateAPI.put(`/howto-categories/admin/${id}`, data);
export const deleteHowToCategory = (id) => PrivateAPI.delete(`/howto-categories/admin/${id}`);
export const fetchHowToArticlesByCategoryIdAdmin = (categoryId) => PrivateAPI.get('/howto-articles/admin', { params: { categoryId } });
export const fetchHowToArticleByIdAdmin = (id) => PrivateAPI.get(`/howto-articles/admin/${id}`);
export const createHowToArticle = (data) => PrivateAPI.post('/howto-articles/admin', data);
export const updateHowToArticle = (id, data) => PrivateAPI.put(`/howto-articles/admin/${id}`, data);
export const deleteHowToArticle = (id) => PrivateAPI.delete(`/howto-articles/admin/${id}`);
export const addHowToArticleImages = (articleId, formData) => PrivateAPI.post(`/howto-articles/admin/${articleId}/images`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteHowToArticleImage = (imageId) => PrivateAPI.delete(`/howto-articles/admin/images/${imageId}`);
export const uploadEditorImage = (formData) => PrivateAPI.post('/images/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

// Supermercati
export const fetchAllSupermarketBrands = () => PrivateAPI.get('/supermarkets/brands');
export const createSupermarketBrand = (brandData) => PrivateAPI.post('/supermarkets/brands', brandData);
export const fetchSupermarketBrandDetails = (brandId) => PrivateAPI.get(`/supermarkets/brands/${brandId}`);
export const addLocationToBrand = (brandId, locationData) => PrivateAPI.post(`/supermarkets/brands/${brandId}/locations`, locationData);
export const removeLocationFromBrand = (poiId) => PrivateAPI.delete(`/supermarkets/locations/${poiId}`);
export const fetchLeafletsForBrand = (brandId) => PrivateAPI.get(`/supermarkets/brands/${brandId}/leaflets`);
export const upsertLeaflet = (leafletData) => PrivateAPI.post('/supermarkets/leaflets', leafletData);
export const updateSupermarketBrand = (brandId, data) => PrivateAPI.put(`/supermarkets/brands/${brandId}`, data);
export const propagateBrandData = (brandId) => PrivateAPI.put(`/supermarkets/brands/${brandId}/propagate`);
export const importCsvLocations = (brandId, formData) => PrivateAPI.post(`/supermarkets/brands/${brandId}/import-csv`, formData);

// --- CATENE GENERICHE (Ristoranti, Benzina, Sanità) ---
export const fetchAllChains = (type) => PrivateAPI.get(`/chains/${type}`);
export const createChain = (type, data) => PrivateAPI.post(`/chains/${type}`, data);
export const fetchChainDetails = (type, id) => PrivateAPI.get(`/chains/${type}/${id}`);
export const updateChain = (type, id, data) => PrivateAPI.put(`/chains/${type}/${id}`, data);
export const addLocationToChain = (type, id, data) => PrivateAPI.post(`/chains/${type}/${id}/locations`, data);
export const removeLocationFromChain = (type, poiId) => PrivateAPI.delete(`/chains/${type}/locations/${poiId}`);
export const importChainCsv = (type, id, formData) => PrivateAPI.post(`/chains/${type}/${id}/import-csv`, formData);
export const propagateChainData = (type, id) => PrivateAPI.put(`/chains/${type}/${id}/propagate`);

export const importComuneCsv = (comuneId, formData) => PrivateAPI.post(`/comuni/admin/${comuneId}/import-csv`, formData);
// client/src/api/index.js
export const importGlobalCsv = (formData) => PrivateAPI.post('/pois/import-global', formData);
// ...
export const fetchPoisByCategoryAdmin = (category, params) => PrivateAPI.get('/pois/admin/category', { params: { category, ...params } });
// ...
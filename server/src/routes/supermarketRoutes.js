// server/src/routes/supermarketRoutes.js

import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js'; // <-- ASSICURATI CHE QUESTO FILE ESISTA (Lo usi già per i POI)
import {
    createSupermarketBrand,
    getAllSupermarketBrands,
    getBrandDetails,
    addLocationToBrand,
    removeLocationFromBrand,
    getLeafletsForBrand,
    upsertLeaflet,
    updateSupermarketBrand, propagateBrandDetails, importLocationsFromCsv
} from '../controllers/supermarketController.js';

const router = express.Router();

router.route('/brands')
    .post(protect, createSupermarketBrand)
    .get(protect, getAllSupermarketBrands);

router.route('/brands/:brandId')
    .get(protect, getBrandDetails)
    // ▼▼▼ MODIFICA QUI: Aggiungiamo upload.single('image') ▼▼▼
    .put(protect, upload.single('image'), updateSupermarketBrand);

router.route('/brands/:brandId/locations')
    .post(protect, addLocationToBrand);

router.route('/locations/:poiId')
    .delete(protect, removeLocationFromBrand);

router.route('/brands/:brandId/leaflets')
    .get(protect, getLeafletsForBrand);

router.route('/leaflets')
    .post(protect, upsertLeaflet);

router.route('/brands/:brandId/propagate')
    .put(protect, propagateBrandDetails);

router.route('/brands/:brandId/import-csv')
    .post(protect, upload.single('file'), importLocationsFromCsv);

export default router;
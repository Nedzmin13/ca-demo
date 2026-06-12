import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import {
    createChain, getAllChains, getChainDetails, updateChain,
    addLocationToChain, removeLocationFromChain, importChainCsv, propagateChainData
} from '../controllers/chainController.js';

const router = express.Router();

// Le rotte avranno il parametro :type che può essere 'restaurant', 'fuel', 'medical'

router.route('/:type')
    .post(protect, createChain)
    .get(protect, getAllChains);

router.route('/:type/:id')
    .get(protect, getChainDetails)
    .put(protect, upload.single('image'), updateChain);

router.route('/:type/:id/locations')
    .post(protect, addLocationToChain);

router.route('/:type/locations/:poiId')
    .delete(protect, removeLocationFromChain);

router.route('/:type/:id/import-csv')
    .post(protect, upload.single('file'), importChainCsv);

router.route('/:type/:id/propagate')
    .put(protect, propagateChainData);

export default router;
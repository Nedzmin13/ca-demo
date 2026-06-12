// server/src/routes/destinationRoutes.js

import express from 'express';
import {
    getDestinationsBySeason,
    getDestinationById,
    getAllDestinationsForAdmin,
    createDestination,
    updateDestination,
    deleteDestination,
    deleteDestinationImage,
    updateDestinationImage
} from '../controllers/destinationsController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// --- ROTTE PUBBLICHE (Lista) ---
router.route('/').get(getDestinationsBySeason);

// --- ROTTE ADMIN (Devono stare PRIMA di /:id per evitare conflitti) ---
router.route('/admin')
    .get(protect, getAllDestinationsForAdmin)
    .post(protect, upload.array('images'), createDestination);

router.route('/admin/images/:imageId')
    .put(protect, updateDestinationImage)
    .delete(protect, deleteDestinationImage);

router.route('/admin/:id')
    .put(protect, upload.array('images'), updateDestination)
    .delete(protect, deleteDestination);

// --- ROTTE PUBBLICHE (Singolo ID) ---
// QUESTA DEVE STARE ALLA FINE ASSOLUTA
router.route('/:id').get(getDestinationById);

export default router;
// server/routes/comuneRoutes.js (Versione Corretta e Pulita)

import express from 'express';
import {
    getComuneBySlug,
    getAllComuniForAdmin,
    getComuneByIdForAdmin,
    updateComune,          // L'unica funzione di aggiornamento che ci serve
    deleteComuneImage, updateComuneImage,
    importComunePoisFromCsv
} from '../controllers/comuniController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// --- Rotte Admin ---
router.route('/admin').get(protect, getAllComuniForAdmin);

router.route('/admin/:id')
    .get(protect, getComuneByIdForAdmin)
    // La rotta PUT ora gestisce sia testo che immagini
    .put(protect, upload.array('images'), updateComune);

router.route('/admin/:id/import-csv')
    .post(protect, upload.single('file'), importComunePoisFromCsv);

router.route('/admin/images/:imageId')
    .put(protect, updateComuneImage)
    .delete(protect, deleteComuneImage);

// --- Rotte Pubbliche ---
router.route('/:slug').get(getComuneBySlug);

export default router;
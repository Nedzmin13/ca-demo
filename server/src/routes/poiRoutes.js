import express from 'express';
import {
    getFeaturedPoisByProvince,
    getPoiDetailsById,
    createPoi,
    updatePoi,
    deletePoi,
    addImagesToPoi,
    deleteImage,
    importGlobalPois,
    getPoisByCategoryAdmin
} from '../controllers/poiController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// --- ROTTE PUBBLICHE ---
// GET /api/pois/featured-by-province/:provinceId
router.route('/featured-by-province/:provinceId').get(getFeaturedPoisByProvince);
// GET /api/pois/:id
router.route('/:id').get(getPoiDetailsById);


// --- ROTTE ADMIN ---
// POST /api/pois
router.route('/').post(protect, upload.array('images'), createPoi);

// GET /api/pois/:id/details (per la modifica)
router.route('/:id/details').get(protect, getPoiDetailsById);

router.route('/admin/category').get(protect, getPoisByCategoryAdmin);


// PUT e DELETE /api/pois/:id
router.route('/:id')
    .put(protect, updatePoi)
    .delete(protect, deletePoi);

// POST /api/pois/:id/images (per aggiungere immagini dopo)
router.route('/:id/images')
    .post(protect, upload.array('newImages'), addImagesToPoi);

// DELETE /api/pois/images/:imageId
router.route('/images/:imageId')
    .delete(protect, deleteImage);

router.route('/import-global')
    .post(protect, upload.single('file'), importGlobalPois);



export default router;
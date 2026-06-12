import express from 'express';
import {
    getAllGuides, getGuideBySlug, getGuidesByCategory,
    getGuidesByCategoryIdAdmin, getGuideByIdAdmin,
    createGuide, updateGuide, deleteGuide,
    addGuideImages, deleteGuideImage
} from '../controllers/guidesController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// --- Rotte Admin ---
router.route('/admin').get(protect, getGuidesByCategoryIdAdmin).post(protect, upload.single('image'), createGuide);
router.route('/admin/:id').get(protect, getGuideByIdAdmin).put(protect, upload.single('image'), updateGuide).delete(protect, deleteGuide);
router.route('/admin/:guideId/images').post(protect, upload.array('images'), addGuideImages);
router.route('/admin/images/:imageId').delete(protect, deleteGuideImage);

// --- Rotte Pubbliche ---
router.route('/').get(getAllGuides);
router.route('/category/:categorySlug').get(getGuidesByCategory);
router.route('/:slug').get(getGuideBySlug);

export default router;
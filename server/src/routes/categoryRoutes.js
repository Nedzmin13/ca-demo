import express from 'express';
import {
    getAllCategoriesAdmin,
    createCategory,
    updateCategory,
    deleteCategory, getAllCategoriesPublic
} from '../controllers/categoryController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/admin')
    .get(protect, getAllCategoriesAdmin)
    .post(protect, createCategory);

router.route('/admin/:id')
    .put(protect, updateCategory)
    .delete(protect, deleteCategory);

router.route('/').get(getAllCategoriesPublic);

export default router;
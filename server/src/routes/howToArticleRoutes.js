import express from 'express';
import {
    getPublicCategoriesWithArticles, getPublicArticlesByCategory, getPublicArticleBySlug,
    getArticlesByCategoryIdAdmin, getArticleByIdAdmin, createArticle, updateArticle,
    deleteArticle, addArticleImages, deleteArticleImage
} from '../controllers/howToArticleController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/admin').get(protect, getArticlesByCategoryIdAdmin).post(protect, createArticle);
router.route('/admin/:id').get(protect, getArticleByIdAdmin).put(protect, updateArticle).delete(protect, deleteArticle);
router.route('/admin/:articleId/images').post(protect, upload.array('images'), addArticleImages);
router.route('/admin/images/:imageId').delete(protect, deleteArticleImage);

router.route('/').get(getPublicCategoriesWithArticles);
router.route('/category/:categorySlug').get(getPublicArticlesByCategory);
router.route('/:slug').get(getPublicArticleBySlug);

export default router;
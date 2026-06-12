import express from 'express';
import { uploadEditorImage } from '../controllers/imageController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Definiamo la rotta POST /api/images/upload
// Usa upload.single('image') perché l'editor invierà un file alla volta
router.post('/upload', protect, upload.single('image'), uploadEditorImage);

export default router;
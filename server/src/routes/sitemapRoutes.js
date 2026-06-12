import express from 'express';
import { generateSitemap } from '../controllers/sitemapController.js';

const router = express.Router();

// La rotta sarà accessibile a /sitemap.xml
router.get('/sitemap.xml', generateSitemap);

export default router;
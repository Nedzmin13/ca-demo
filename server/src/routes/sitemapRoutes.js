import express from 'express';
import {
    getSitemapIndex,
    getSitemapMain,
    getSitemapComuni,
    getSitemapPois
} from '../controllers/sitemapController.js';

const router = express.Router();

// L'Indice principale che invierai a Google
router.get('/sitemap.xml', getSitemapIndex);

// Le sotto-mappe
router.get('/sitemap-main.xml', getSitemapMain);
router.get('/sitemap-comuni.xml', getSitemapComuni);
router.get('/sitemap-pois-:page.xml', getSitemapPois); // Paginato per i POI

export default router;
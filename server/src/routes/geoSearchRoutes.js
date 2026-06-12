import express from 'express';
import { geoSearch } from '../controllers/geoSearchController.js';

const router = express.Router();
router.route('/').get(geoSearch);
export default router;
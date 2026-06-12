import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './src/config/prismaClient.js';

// Importa tutte le rotte
import regionRoutes from './src/routes/regionRoutes.js';
import provinceRoutes from './src/routes/provinceRoutes.js';
import comuneRoutes from './src/routes/comuneRoutes.js';
import offerRoutes from './src/routes/offerRoutes.js';
import poiRoutes from './src/routes/poiRoutes.js';
import itineraryRoutes from './src/routes/itineraryRoutes.js';
import destinationRoutes from './src/routes/destinationRoutes.js';
import bonusRoutes from './src/routes/bonusRoutes.js';
import utilityRoutes from './src/routes/utilityRoutes.js';
import authRoutes from './src/routes/authRoutes.js';
import newsRoutes from './src/routes/newsRoutes.js';
import strikeRoutes from './src/routes/strikeRoutes.js';
import trafficRoutes from './src/routes/trafficRoutes.js';
import searchRoutes from './src/routes/searchRoutes.js';
// Assicurati che il nome del file sia corretto (guidesRoutes.js)
import guideRoutes from './src/routes/guideRoutes.js';
import categoryRoutes from "./src/routes/categoryRoutes.js";
import howToCategoryRoutes from "./src/routes/howToCategoryRoutes.js";
import howToArticleRoutes from "./src/routes/howToArticleRoutes.js";
import imageRoutes from "./src/routes/imageRoutes.js";
import sitemapRoutes from "./src/routes/sitemapRoutes.js";
import geoSearchRoutes from "./src/routes/geoSearchRoutes.js";
import supermarketRoutes from './src/routes/supermarketRoutes.js';
import chainRoutes from "./src/routes/chainRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// --- MIDDLEWARE GLOBALI (da mettere sempre all'inizio) ---
app.use(cors());
// Questi due sono FONDAMENTALI e devono stare qui, prima delle rotte
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- REGISTRAZIONE DELLE ROTTE API ---
app.use('/api/regions', regionRoutes);
app.use('/api/provinces', provinceRoutes);
app.use('/api/comuni', comuneRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/pois', poiRoutes);
app.use('/api/itineraries', itineraryRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/bonuses', bonusRoutes);
app.use('/api/utility', utilityRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/strikes', strikeRoutes);
app.use('/api/traffic', trafficRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/geo-search', geoSearchRoutes);
app.use('/api/guides', guideRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/howto-categories', howToCategoryRoutes);
app.use('/api/howto-articles', howToArticleRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/supermarkets', supermarketRoutes);
app.use('/api/chains', chainRoutes);


// --- Rotte di base e test ---
app.get('/api/test-db', async (req, res) => {
    try {
        const guideCount = await prisma.guide.count(); // Testiamo la nuova tabella
        res.json({
            message: 'Connessione al database riuscita!',
            numeroDiGuideTrovate: guideCount
        });
    } catch (error) {
        console.error("Errore di connessione al DB:", error);
        res.status(500).json({ message: 'Errore durante la connessione al database.' });
    }
});

app.use('/', sitemapRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Benvenuto nell\'API di FastInfo!' });
});

// --- AVVIO DEL SERVER ---
app.listen(PORT, () => {
    console.log(`🚀 Server in ascolto sulla porta ${PORT}`);
});
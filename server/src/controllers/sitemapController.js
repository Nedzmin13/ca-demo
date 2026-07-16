import { SitemapStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';
import prisma from '../config/prismaClient.js';

const BASE_URL = 'https://comuniamo.it';

// Helper per generare l'XML facilmente
const generateXML = async (links) => {
    const stream = new SitemapStream({ hostname: BASE_URL });
    return await streamToPromise(Readable.from(links).pipe(stream)).then(data => data.toString());
};

// --- 1. L'INDICE PRINCIPALE ---
export const getSitemapIndex = async (req, res) => {
    try {
        // ▼▼▼ NASCOSTI I POI PER ADSENSE (Mappa più pulita per il bot) ▼▼▼
        /*
        const poiCount = await prisma.pointofinterest.count();
        const poisPerFile = 10000;
        const totalPoiPages = Math.ceil(poiCount / poisPerFile);
        */
        // ▲▲▲ ▲▲▲ ▲▲▲ ▲▲▲ ▲▲▲ ▲▲▲ ▲▲▲

        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

        // Aggiungi mappa principale
        xml += `  <sitemap>\n    <loc>${BASE_URL}/sitemap-main.xml</loc>\n  </sitemap>\n`;

        // ▼▼▼ NASCOSTI I COMUNI E I POI PER ADSENSE ▼▼▼
        /*
        xml += `  <sitemap>\n    <loc>${BASE_URL}/sitemap-comuni.xml</loc>\n  </sitemap>\n`;

        // Aggiungi le mappe paginate dei POI
        for (let i = 1; i <= totalPoiPages; i++) {
            xml += `  <sitemap>\n    <loc>${BASE_URL}/sitemap-pois-${i}.xml</loc>\n  </sitemap>\n`;
        }
        */
        // ▲▲▲ ▲▲▲ ▲▲▲ ▲▲▲ ▲▲▲ ▲▲▲ ▲▲▲

        xml += `</sitemapindex>`;

        res.header('Content-Type', 'application/xml');
        res.send(xml);
    } catch (error) {
        console.error("Errore Sitemap Index:", error);
        res.status(500).send('Error generating sitemap index');
    }
};

// --- 2. MAPPA MAIN (Solo Pagine Accettate da AdSense) ---
export const getSitemapMain = async (req, res) => {
    try {
        const links = [];

        // Pagine base (Nascoste viaggio, offerte, ecc.)
        const staticPages = [
            '/', '/bonus', '/pratiche-utili', '/come-fare', '/chi-siamo', '/faq',
            '/privacy-policy', '/cookie-policy', '/termini-e-condizioni'
        ];
        staticPages.forEach(url => links.push({ url, changefreq: 'weekly', priority: 0.8 }));

        // ▼▼▼ NASCOSTI PER ADSENSE ▼▼▼
        /*
        // Regioni e Province
        const regions = await prisma.region.findMany({ select: { name: true } });
        regions.forEach(r => links.push({ url: `/viaggio/${r.name.toLowerCase()}` }));

        const provinces = await prisma.province.findMany({ select: { sigla: true, region: { select: { name: true } } } });
        provinces.forEach(p => links.push({ url: `/viaggio/${p.region.name.toLowerCase()}/${p.sigla.toLowerCase()}` }));

        // Offerte e Destinazioni
        const offers = await prisma.offer.findMany({ select: { id: true } });
        offers.forEach(o => links.push({ url: `/offerte/${o.id}`, changefreq: 'daily', priority: 0.9 }));

        const dests = await prisma.destination.findMany({ select: { id: true } });
        dests.forEach(d => links.push({ url: `/destinazioni/${d.id}` }));
        */
        // ▲▲▲ ▲▲▲ ▲▲▲ ▲▲▲ ▲▲▲ ▲▲▲ ▲▲▲

        // Bonus
        const bonuses = await prisma.bonus.findMany({ select: { id: true } });
        bonuses.forEach(b => links.push({ url: `/bonus/${b.id}` }));

        // Guide (Pratiche Utili)
        const guides = await prisma.Guide.findMany({ select: { slug: true } });
        guides.forEach(g => links.push({ url: `/pratiche-utili/${g.slug}` }));

        // Categorie Guide
        const guideCategories = await prisma.Category.findMany({ select: { slug: true } });
        guideCategories.forEach(cat => links.push({ url: `/pratiche-utili/category/${cat.slug}` }));

        // Articoli (Come Fare)
        const howToArticles = await prisma.HowToArticle.findMany({ select: { slug: true } });
        howToArticles.forEach(a => links.push({ url: `/come-fare/${a.slug}` }));

        // Categorie Come Fare
        const howToCategories = await prisma.HowToCategory.findMany({ select: { slug: true } });
        howToCategories.forEach(cat => links.push({ url: `/come-fare/category/${cat.slug}` }));

        res.header('Content-Type', 'application/xml');
        res.send(await generateXML(links));
    } catch (error) {
        console.error("Errore Sitemap Main:", error);
        res.status(500).send('Error');
    }
};

// --- 3. MAPPA COMUNI (Nascosta, ma teniamo la funzione) ---
export const getSitemapComuni = async (req, res) => {
    try {
        const links = [];
        const comuni = await prisma.comune.findMany({ select: { slug: true } });
        comuni.forEach(c => links.push({ url: `/comune/${c.slug}`, changefreq: 'weekly' }));

        res.header('Content-Type', 'application/xml');
        res.send(await generateXML(links));
    } catch (error) { res.status(500).send('Error'); }
};

// --- 4. MAPPA POI (Nascosta, ma teniamo la funzione) ---
export const getSitemapPois = async (req, res) => {
    try {
        const page = parseInt(req.params.page) || 1;
        const limit = 10000;
        const skip = (page - 1) * limit;

        const links = [];
        const pois = await prisma.pointofinterest.findMany({
            select: { id: true },
            skip: skip,
            take: limit
        });

        pois.forEach(p => links.push({ url: `/poi/${p.id}`, changefreq: 'monthly' }));

        res.header('Content-Type', 'application/xml');
        res.send(await generateXML(links));
    } catch (error) { res.status(500).send('Error'); }
};
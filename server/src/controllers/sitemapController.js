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
        const poiCount = await prisma.pointofinterest.count();
        const poisPerFile = 30000;

        // ▼▼▼ ECCO L'ERRORE CHE HO CORRETTO QUI SOTTO ▼▼▼
        const totalPoiPages = Math.ceil(poiCount / poisPerFile);

        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

        // Aggiungi mappa principale e comuni
        xml += `  <sitemap>\n    <loc>${BASE_URL}/sitemap-main.xml</loc>\n  </sitemap>\n`;
        xml += `  <sitemap>\n    <loc>${BASE_URL}/sitemap-comuni.xml</loc>\n  </sitemap>\n`;

        // Aggiungi le mappe paginate dei POI
        for (let i = 1; i <= totalPoiPages; i++) {
            xml += `  <sitemap>\n    <loc>${BASE_URL}/sitemap-pois-${i}.xml</loc>\n  </sitemap>\n`;
        }

        xml += `</sitemapindex>`;

        res.header('Content-Type', 'application/xml');
        res.send(xml);
    } catch (error) {
        console.error("Errore Sitemap Index:", error);
        res.status(500).send('Error generating sitemap index');
    }
};

// --- 2. MAPPA MAIN (Pagine statiche, Destinazioni, Guide, Offerte) ---
export const getSitemapMain = async (req, res) => {
    try {
        const links = [];

        // Pagine base
        const staticPages = ['/', '/viaggio', '/affari-sconti', '/bonus', '/top-destinazioni', '/pratiche-utili', '/come-fare', '/notizie-utili', '/chi-siamo', '/faq'];
        staticPages.forEach(url => links.push({ url, changefreq: 'weekly', priority: 0.8 }));

        // Regioni e Province
        const regions = await prisma.region.findMany({ select: { name: true } });
        regions.forEach(r => links.push({ url: `/viaggio/${r.name.toLowerCase()}` }));

        const provinces = await prisma.province.findMany({ select: { sigla: true, region: { select: { name: true } } } });
        provinces.forEach(p => links.push({ url: `/viaggio/${p.region.name.toLowerCase()}/${p.sigla.toLowerCase()}` }));

        // Contenuti extra
        const offers = await prisma.offer.findMany({ select: { id: true } });
        offers.forEach(o => links.push({ url: `/offerte/${o.id}`, changefreq: 'daily' }));

        const guides = await prisma.Guide.findMany({ select: { slug: true } });
        guides.forEach(g => links.push({ url: `/pratiche-utili/${g.slug}` }));

        const dests = await prisma.destination.findMany({ select: { id: true } });
        dests.forEach(d => links.push({ url: `/destinazioni/${d.id}` }));

        res.header('Content-Type', 'application/xml');
        res.send(await generateXML(links));
    } catch (error) {
        console.error("Errore Sitemap Main:", error);
        res.status(500).send('Error');
    }
};

// --- 3. MAPPA COMUNI ---
export const getSitemapComuni = async (req, res) => {
    try {
        const links = [];
        const comuni = await prisma.comune.findMany({ select: { slug: true } });
        comuni.forEach(c => links.push({ url: `/comune/${c.slug}`, changefreq: 'weekly' }));

        res.header('Content-Type', 'application/xml');
        res.send(await generateXML(links));
    } catch (error) { res.status(500).send('Error'); }
};

// --- 4. MAPPA POI (Paginata per non superare il limite) ---
export const getSitemapPois = async (req, res) => {
    try {
        const page = parseInt(req.params.page) || 1;
        const limit = 30000;
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
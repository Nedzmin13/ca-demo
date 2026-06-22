import { SitemapStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';
import prisma from '../config/prismaClient.js';

// ▼▼▼ MODIFICATO: ORA PUNTA AL TUO SITO VERO ▼▼▼
const BASE_URL = 'https://comuniamo.it';
// ▲▲▲ ▲▲▲ ▲▲▲ ▲▲▲ ▲▲▲ ▲▲▲ ▲▲▲ ▲▲▲

export const generateSitemap = async (req, res) => {
    try {
        const links = [];

        // --- 1. Pagine Statiche Principali ---
        const staticPages = [
            '/', '/viaggio', '/affari-sconti', '/bonus', '/top-destinazioni',
            '/pratiche-utili', '/come-fare', '/notizie-utili', '/chi-siamo', '/faq',
            '/privacy-policy', '/cookie-policy', '/termini-e-condizioni'
        ];
        staticPages.forEach(url => links.push({ url, changefreq: 'weekly', priority: 0.8 }));

        // --- 2. Pagine Dinamiche dal Database ---

        // Regioni, Province e Comuni
        const regions = await prisma.region.findMany({ select: { name: true } });
        regions.forEach(r => links.push({ url: `/viaggio/${r.name.toLowerCase()}` }));

        const provinces = await prisma.province.findMany({ select: { sigla: true, region: { select: { name: true } } } });
        provinces.forEach(p => links.push({ url: `/viaggio/${p.region.name.toLowerCase()}/${p.sigla.toLowerCase()}` }));

        const comuni = await prisma.comune.findMany({ select: { slug: true } });
        comuni.forEach(c => links.push({ url: `/comune/${c.slug}` }));

        // Punti di Interesse (POI)
        const pois = await prisma.pointofinterest.findMany({ select: { id: true } });
        pois.forEach(p => links.push({ url: `/poi/${p.id}` }));

        // Offerte
        const offers = await prisma.offer.findMany({ select: { id: true } });
        offers.forEach(o => links.push({ url: `/offerte/${o.id}`, changefreq: 'daily', priority: 0.9 }));

        // Bonus
        const bonuses = await prisma.bonus.findMany({ select: { id: true } });
        bonuses.forEach(b => links.push({ url: `/bonus/${b.id}` }));

        // Itinerari
        const itineraries = await prisma.itinerary.findMany({ select: { id: true } });
        itineraries.forEach(i => links.push({ url: `/itinerari/${i.id}` }));

        // Destinazioni
        const destinations = await prisma.destination.findMany({ select: { id: true } });
        destinations.forEach(d => links.push({ url: `/destinazioni/${d.id}` }));

        // Notizie
        const news = await prisma.news.findMany({ select: { id: true } });
        news.forEach(n => links.push({ url: `/notizie/${n.id}`, priority: 1.0, changefreq: 'daily' }));

        // Guide (Pratiche Utili)
        const guides = await prisma.Guide.findMany({ select: { slug: true } });
        guides.forEach(g => links.push({ url: `/pratiche-utili/${g.slug}` }));

        // Articoli (Come Fare)
        const howToArticles = await prisma.HowToArticle.findMany({ select: { slug: true } });
        howToArticles.forEach(a => links.push({ url: `/come-fare/${a.slug}` }));

        // Pagine Categoria (Pratiche Utili e Come Fare)
        const guideCategories = await prisma.Category.findMany({ select: { slug: true } });
        guideCategories.forEach(cat => links.push({ url: `/pratiche-utili/category/${cat.slug}` }));

        const howToCategories = await prisma.HowToCategory.findMany({ select: { slug: true } });
        howToCategories.forEach(cat => links.push({ url: `/come-fare/category/${cat.slug}` }));


        // --- Creazione dello stream XML ---
        const stream = new SitemapStream({ hostname: BASE_URL });
        res.writeHead(200, { 'Content-Type': 'application/xml' });

        const xml = await streamToPromise(Readable.from(links).pipe(stream)).then((data) =>
            data.toString()
        );

        res.end(xml);

    } catch (error) {
        console.error("Errore durante la generazione della sitemap:", error);
        res.status(500).send('Internal Server Error');
    }
};
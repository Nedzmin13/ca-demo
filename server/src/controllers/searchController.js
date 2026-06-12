import prisma from '../config/prismaClient.js';

export const globalSearch = async (req, res) => {
    const { q } = req.query;

    if (!q || q.length < 2) {
        return res.json({ comuni: [], offers: [], itineraries: [], guides: [], howToArticles: [] });
    }

    try {
        const lowerQ = q.toLowerCase();

        // 1. FETCH DAI DATI
        // Per i comuni aumentiamo il limite a 100 per essere sicuri di recuperare la corrispondenza esatta
        // anche se ci sono tanti comuni composti (es. "Romano...", "Roccaromana...").
        const [rawComuni, offers, itineraries, guides, howToArticles] = await Promise.all([
            prisma.comune.findMany({
                where: { name: { contains: q } },
                take: 100, // Aumentato da 20 a 100 per catturare l'esatta corrispondenza
                include: { province: true }
            }),
            prisma.offer.findMany({ where: { title: { contains: q } }, take: 5 }),
            prisma.itinerary.findMany({ where: { title: { contains: q } }, take: 5 }),
            prisma.Guide.findMany({ where: { title: { contains: q } }, take: 5 }),
            prisma.HowToArticle.findMany({ where: { title: { contains: q } }, take: 5 })
        ]);

        // 2. FUNZIONE DI ORDINAMENTO AVANZATA
        // Ordina per:
        // 1. Esatta corrispondenza (Roma)
        // 2. Inizia con (Romano)
        // 3. Lunghezza minore (Roma viene prima di Romagnano)
        const advancedSort = (items) => {
            return items.sort((a, b) => {
                const nameA = (a.name || a.title).toLowerCase();
                const nameB = (b.name || b.title).toLowerCase();

                // Priorità 1: Corrispondenza Esatta
                if (nameA === lowerQ && nameB !== lowerQ) return -1;
                if (nameB === lowerQ && nameA !== lowerQ) return 1;

                // Priorità 2: Inizia con la query
                const startsA = nameA.startsWith(lowerQ);
                const startsB = nameB.startsWith(lowerQ);
                if (startsA && !startsB) return -1;
                if (!startsA && startsB) return 1;

                // Priorità 3: Lunghezza (più corto vince, es. "Roma" < "Romano")
                return nameA.length - nameB.length;
            });
        };

        // Applica ordinamento e taglia i risultati
        const sortedComuni = advancedSort(rawComuni).slice(0, 6); // Teniamo solo i primi 6 migliori
        const sortedOffers = advancedSort(offers);
        const sortedItineraries = advancedSort(itineraries);
        const sortedGuides = advancedSort(guides);
        const sortedHowToArticles = advancedSort(howToArticles);

        res.json({
            comuni: sortedComuni,
            offers: sortedOffers,
            itineraries: sortedItineraries,
            guides: sortedGuides,
            howToArticles: sortedHowToArticles
        });

    } catch (error) {
        console.error("Errore nella ricerca globale:", error);
        res.status(500).json({ message: "Errore del server" });
    }
};
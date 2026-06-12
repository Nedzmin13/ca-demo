import prisma from '../config/prismaClient.js';

export const geoSearch = async (req, res) => {
    const { q } = req.query;

    if (!q || q.length < 3) {
        return res.json({ regions: [], provinces: [], comuni: [] });
    }

    try {
        const [regions, provinces, comuni] = await prisma.$transaction([
            // Cerca Regioni
            prisma.region.findMany({
                where: { name: { contains: q } }, // Rimosso 'mode'
                take: 5
            }),
            // Cerca Province
            prisma.province.findMany({
                where: {
                    OR: [
                        { name: { contains: q } }, // Rimosso 'mode'
                        { sigla: { equals: q } }     // Rimosso 'mode'
                    ]
                },
                include: { region: true },
                take: 5
            }),
            // Cerca Comuni
            prisma.comune.findMany({
                where: { name: { contains: q } }, // Rimosso 'mode'
                include: { province: { include: { region: true } } },
                take: 5
            })
        ]);

        res.json({ regions, provinces, comuni });
    } catch (error) {
        console.error("Errore nella ricerca geografica:", error);
        res.status(500).json({ message: 'Errore del server.' });
    }
};
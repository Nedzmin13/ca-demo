import prisma from '../config/prismaClient.js';
import cloudinary from '../config/cloudinary.js';


const uploadImageToCloudinary = async (file) => {
    const b64 = Buffer.from(file.buffer).toString("base64");
    let dataURI = `data:${file.mimetype};base64,${b64}`;
    return cloudinary.uploader.upload(dataURI, { folder: "fastinfo_offers" });
};

const toNull = (value) => (value === '' || value === undefined ? null : value);


const getAllOffers = async (req, res) => {
    const { category, search } = req.query;
    let whereClause = {};

    if (category) {
        whereClause.category = category;
    }

    if (search) {
        whereClause.OR = [
            // --- CORREZIONE: RIMOSSO 'mode: insensitive' ---
            { title: { contains: search } },
            { store: { contains: search } },
            { description: { contains: search } }
        ];
    }

    try {
        const offers = await prisma.offer.findMany({
            where: whereClause,
            include: { images: true },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(offers);
    } catch (error) {
        console.error("Errore nel recuperare le offerte:", error);
        res.status(500).json({ message: 'Errore del server.' });
    }
};

const getPublicOfferById = async (req, res) => {
    try {
        const offer = await prisma.offer.findUnique({
            where: { id: parseInt(req.params.id) },
            include: { images: true }
        });
        if (!offer) return res.status(404).json({ message: "Offerta non trovata" });
        res.json(offer);
    } catch (error) { res.status(500).json({ message: "Errore server" }); }
};

const getAllOffersForAdmin = async (req, res) => {
    try {
        const offers = await prisma.offer.findMany({
            include: { images: true },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(offers);
    } catch (error) { res.status(500).json({ message: 'Errore del server.' }); }
};

const createOffer = async (req, res) => {
    const { title, description, discount, store, category, link, expiresAt } = req.body;
    try {
        const newOffer = await prisma.$transaction(async (tx) => {
            const createdOffer = await tx.offer.create({
                data: {
                    title,
                    description: toNull(description),
                    discount, store, category, link,
                    expiresAt: expiresAt ? new Date(expiresAt) : null
                }
            });
            if (req.files && req.files.length > 0) {
                const uploadPromises = req.files.map(file => uploadImageToCloudinary(file));
                const uploadResults = await Promise.all(uploadPromises);
                await tx.offerImage.createMany({
                    data: uploadResults.map(r => ({ url: r.secure_url, offerId: createdOffer.id }))
                });
            }
            return tx.offer.findUnique({ where: { id: createdOffer.id }, include: { images: true } });
        });
        res.status(201).json(newOffer);
    } catch (error) { res.status(500).json({ message: "Errore durante la creazione." }); }
};

const updateOffer = async (req, res) => {
    const id = parseInt(req.params.id);
    const { title, description, discount, store, category, link, expiresAt } = req.body;
    try {
        const updatedOffer = await prisma.$transaction(async (tx) => {
            await tx.offer.update({
                where: { id },
                data: {
                    title,
                    description: toNull(description),
                    discount, store, category, link,
                    expiresAt: expiresAt ? new Date(expiresAt) : null
                }
            });
            if (req.files && req.files.length > 0) {
                const uploadPromises = req.files.map(file => uploadImageToCloudinary(file));
                const uploadResults = await Promise.all(uploadPromises);
                await tx.offerImage.createMany({
                    data: uploadResults.map(r => ({ url: r.secure_url, offerId: id }))
                });
            }
            return tx.offer.findUnique({ where: { id }, include: { images: true } });
        });
        res.status(200).json(updatedOffer);
    } catch (error) { res.status(500).json({ message: "Errore durante l'aggiornamento." }); }
};

const deleteOffer = async (req, res) => {
    try {
        await prisma.offer.delete({ where: { id: parseInt(req.params.id) } });
        res.status(200).json({ message: "Offerta eliminata" });
    } catch (error) { res.status(500).json({ message: 'Errore eliminazione' }); }
};

const addOfferImages = async (req, res) => {
    const offerId = parseInt(req.params.id);
    if (!req.files || req.files.length === 0) return res.status(400).json({ message: 'Nessun file' });
    try {
        for (const file of req.files) {
            const b64 = Buffer.from(file.buffer).toString("base64");
            const dataURI = `data:${file.mimetype};base64,${b64}`;
            const result = await cloudinary.uploader.upload(dataURI, { folder: "fastinfo_offers" });
            await prisma.offerImage.create({ data: { url: result.secure_url, offerId: offerId } });
        }
        res.status(201).json({ message: "Immagini aggiunte" });
    } catch (error) { res.status(500).json({ message: "Errore server" }); }
};

const deleteOfferImage = async (req, res) => {
    const imageId = parseInt(req.params.imageId);
    try {
        await prisma.offerImage.delete({ where: { id: imageId } });
        res.status(200).json({ message: "Immagine eliminata" });
    } catch (error) { res.status(500).json({ message: "Errore server" }); }
};

export {
    getAllOffers, getPublicOfferById, getAllOffersForAdmin, createOffer, updateOffer,
    deleteOffer, addOfferImages, deleteOfferImage
};
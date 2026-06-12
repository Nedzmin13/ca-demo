import prisma from '../config/prismaClient.js';
import cloudinary from '../config/cloudinary.js';

const createSlug = (text) => {
    if (!text) return '';
    return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
};

const uploadImageToCloudinary = async (file) => {
    const b64 = Buffer.from(file.buffer).toString("base64");
    let dataURI = `data:${file.mimetype};base64,${b64}`;
    return cloudinary.uploader.upload(dataURI, { folder: "fastinfo_guides" });
};

// --- FUNZIONI PUBBLICHE ---
export const getAllGuides = async (req, res) => {
    try {
        const guides = await prisma.Guide.findMany({ include: { category: true }, orderBy: { title: 'asc' } });
        res.json(guides);
    } catch (error) { res.status(500).json({ message: "Errore server" }); }
};

export const getGuideBySlug = async (req, res) => {
    try {
        const guide = await prisma.Guide.findUnique({
            where: { slug: req.params.slug },
            include: {
                images: true,   // <-- AGGIUNGI QUESTO
                category: true, // <-- AGGIUNGI QUESTO per i breadcrumb
            }
        });
        if (!guide) return res.status(404).json({ message: "Guida non trovata" });
        res.json(guide);
    } catch (error) { res.status(500).json({ message: "Errore server" }); }
};

export const getGuidesByCategory = async (req, res) => {
    try {
        const guides = await prisma.Guide.findMany({
            where: { category: { slug: req.params.categorySlug } },
            orderBy: { title: 'asc' },
        });
        res.json(guides);
    } catch (error) { res.status(500).json({ message: "Errore server" }); }
};

// --- FUNZIONI ADMIN ---
export const getGuidesByCategoryIdAdmin = async (req, res) => {
    const { categoryId } = req.query;
    if (!categoryId) return res.status(400).json({ message: "ID categoria mancante." });
    try {
        const guides = await prisma.Guide.findMany({
            where: { categoryId: parseInt(categoryId) },
            orderBy: { title: 'asc' }
        });
        res.json(guides);
    } catch (error) { res.status(500).json({ message: "Errore server" }); }
};

export const getGuideByIdAdmin = async (req, res) => {
    try {
        const guide = await prisma.Guide.findUnique({
            where: { id: parseInt(req.params.id) },
            include: { images: true, category: true } // Aggiunto category
        });
        if (!guide) return res.status(404).json({ message: "Guida non trovata" });
        res.json(guide);
    } catch (error) { res.status(500).json({ message: "Errore server" }); }
};

export const createGuide = async (req, res) => {
    const { title, content, excerpt, categoryId } = req.body;
    if (!title || !categoryId) {
        return res.status(400).json({ message: "Titolo e Categoria sono obbligatori." });
    }
    try {
        let imageUrl = null;
        if (req.file) { // Gestisce l'immagine di copertina
            const result = await uploadImageToCloudinary(req.file);
            imageUrl = result.secure_url;
        }
        const newGuide = await prisma.Guide.create({
            data: {
                title, slug: createSlug(title), content, excerpt, imageUrl,
                categoryId: parseInt(categoryId)
            }
        });
        res.status(201).json(newGuide);
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(409).json({ message: "Errore: una guida con questo titolo esiste già." });
        }
        res.status(500).json({ message: "Errore durante la creazione della guida." });
    }
};

export const updateGuide = async (req, res) => {
    const { id } = req.params;
    const { title, content, excerpt, existingImageUrl } = req.body;
    if (!title) {
        return res.status(400).json({ message: "Il titolo è obbligatorio." });
    }
    try {
        let imageUrl = existingImageUrl;
        if (req.file) { // Gestisce la sostituzione/aggiunta dell'immagine di copertina
            const result = await uploadImageToCloudinary(req.file);
            imageUrl = result.secure_url;
        }
        const updatedGuide = await prisma.Guide.update({
            where: { id: parseInt(id) },
            data: { title, slug: createSlug(title), content, excerpt, imageUrl }
        });
        res.json(updatedGuide);
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(409).json({ message: "Errore: una guida con questo titolo esiste già." });
        }
        res.status(500).json({ message: "Errore durante l'aggiornamento della guida." });
    }
};

export const deleteGuide = async (req, res) => {
    try {
        await prisma.Guide.delete({ where: { id: parseInt(req.params.id) } });
        res.status(200).json({ message: "Guida eliminata." });
    } catch (error) { res.status(500).json({ message: "Errore eliminazione." }); }
};

export const addGuideImages = async (req, res) => {
    const { guideId } = req.params;
    if (!req.files || req.files.length === 0) return res.status(400).send('Nessun file.');
    try {
        const uploadPromises = req.files.map(file => uploadImageToCloudinary(file));
        const results = await Promise.all(uploadPromises);
        await prisma.guideImage.createMany({
            data: results.map(r => ({ url: r.secure_url, guideId: parseInt(guideId) }))
        });
        res.status(201).json({ message: "Immagini caricate." });
    } catch (error) { res.status(500).send("Errore server."); }
};

export const deleteGuideImage = async (req, res) => {
    try {
        await prisma.guideImage.delete({ where: { id: parseInt(req.params.imageId) } });
        res.status(200).send('Immagine eliminata.');
    } catch (error) { res.status(500).send("Errore server."); }
};
import prisma from '../config/prismaClient.js';
import cloudinary from '../config/cloudinary.js';

const createSlug = (text) => text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
const uploadImageToCloudinary = async (file) => {
    const b64 = Buffer.from(file.buffer).toString("base64");
    let dataURI = `data:${file.mimetype};base64,${b64}`;
    return cloudinary.uploader.upload(dataURI, { folder: "fastinfo_howto" });
};

// --- FUNZIONI PUBBLICHE ---
export const getPublicCategoriesWithArticles = async (req, res) => {
    try {
        const categories = await prisma.howToCategory.findMany({
            orderBy: { name: 'asc' },
            include: { articles: { take: 5, orderBy: { title: 'asc' } } }
        });
        res.json(categories);
    } catch (error) { res.status(500).json({ message: "Errore server" }); }
};

export const getPublicArticlesByCategory = async (req, res) => {
    try {
        const articles = await prisma.howToArticle.findMany({
            where: { category: { slug: req.params.categorySlug } },
            orderBy: { title: 'asc' },
            // --- QUESTA È LA RIGA FONDAMENTALE DA AGGIUNGERE ---
            include: {
                category: true // Include i dati della categoria collegata
            }
        });
        res.json(articles);
    } catch (error) {
        console.error("Errore nel recuperare articoli per categoria:", error);
        res.status(500).json({ message: "Errore server" });
    }
};
export const getPublicArticleBySlug = async (req, res) => {
    try {
        const article = await prisma.howToArticle.findUnique({
            where: { slug: req.params.slug },
            include: { images: true, category: true }
        });
        if (!article) return res.status(404).json({ message: "Articolo non trovato" });
        res.json(article);
    } catch (error) { res.status(500).json({ message: "Errore server" }); }
};

// --- FUNZIONI ADMIN ---
export const getArticlesByCategoryIdAdmin = async (req, res) => {
    const { categoryId } = req.query;
    if (!categoryId) return res.status(400).json({ message: "ID categoria mancante." });
    try {
        const articles = await prisma.howToArticle.findMany({
            where: { categoryId: parseInt(categoryId) },
            orderBy: { title: 'asc' }
        });
        res.json(articles);
    } catch (error) { res.status(500).json({ message: "Errore server" }); }
};

export const getArticleByIdAdmin = async (req, res) => {
    try {
        const article = await prisma.howToArticle.findUnique({
            where: { id: parseInt(req.params.id) },
            include: { images: true, category: true }
        });
        if (!article) return res.status(404).json({ message: "Articolo non trovato" });
        res.json(article);
    } catch (error) { res.status(500).json({ message: "Errore server" }); }
};

export const createArticle = async (req, res) => {
    const { title, content, excerpt, categoryId } = req.body;
    if (!title || !categoryId) return res.status(400).json({ message: "Titolo e Categoria sono obbligatori." });
    try {
        const newArticle = await prisma.howToArticle.create({
            data: { title, slug: createSlug(title), content, excerpt, categoryId: parseInt(categoryId) }
        });
        res.status(201).json(newArticle);
    } catch (error) { res.status(500).json({ message: "Errore, slug duplicato?" }); }
};

export const updateArticle = async (req, res) => {
    const { id } = req.params;
    const { title, content, excerpt } = req.body;
    try {
        const updatedArticle = await prisma.howToArticle.update({
            where: { id: parseInt(id) },
            data: { title, slug: createSlug(title), content, excerpt }
        });
        res.json(updatedArticle);
    } catch (error) { res.status(500).json({ message: "Errore aggiornamento." }); }
};

export const deleteArticle = async (req, res) => {
    try {
        await prisma.howToArticle.delete({ where: { id: parseInt(req.params.id) } });
        res.status(200).json({ message: "Articolo eliminato." });
    } catch (error) { res.status(500).json({ message: "Errore eliminazione." }); }
};

export const addArticleImages = async (req, res) => {
    const { articleId } = req.params;
    if (!req.files || req.files.length === 0) return res.status(400).send('Nessun file.');
    try {
        const uploadPromises = req.files.map(file => uploadImageToCloudinary(file));
        const results = await Promise.all(uploadPromises);
        await prisma.howToImage.createMany({
            data: results.map(r => ({ url: r.secure_url, articleId: parseInt(articleId) }))
        });
        res.status(201).json({ message: "Immagini caricate." });
    } catch (error) { res.status(500).send("Errore server."); }
};

export const deleteArticleImage = async (req, res) => {
    try {
        await prisma.howToImage.delete({ where: { id: parseInt(req.params.imageId) } });
        res.status(200).send('Immagine eliminata.');
    } catch (error) { res.status(500).send("Errore server."); }
};
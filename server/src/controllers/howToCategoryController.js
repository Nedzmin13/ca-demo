import prisma from '../config/prismaClient.js';

const createSlug = (text) => {
    if (!text) return '';
    return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
};

export const getAllCategoriesAdmin = async (req, res) => {
    try {
        const categories = await prisma.howToCategory.findMany({
            orderBy: { name: 'asc' },
            include: { _count: { select: { articles: true } } }
        });
        res.json(categories);
    } catch (error) {
        console.error("Errore nel recuperare le categorie per l'admin:", error);
        res.status(500).json({ message: "Errore del server" });
    }
};

export const createCategory = async (req, res) => {
    const { name, description, iconName } = req.body;
    if (!name) return res.status(400).json({ message: "Il nome è obbligatorio." });
    try {
        const newCategory = await prisma.howToCategory.create({
            data: { name, slug: createSlug(name), description, iconName }
        });
        res.status(201).json(newCategory);
    } catch (error) {
        res.status(500).json({ message: "Errore, il nome o lo slug potrebbero esistere già." });
    }
};

export const updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name, description, iconName } = req.body;
    if (!name) return res.status(400).json({ message: "Il nome è obbligatorio." });
    try {
        const updatedCategory = await prisma.howToCategory.update({
            where: { id: parseInt(id) },
            data: { name, slug: createSlug(name), description, iconName }
        });
        res.json(updatedCategory);
    } catch (error) {
        res.status(500).json({ message: "Errore durante l'aggiornamento." });
    }
};

export const deleteCategory = async (req, res) => {
    try {
        await prisma.howToCategory.delete({ where: { id: parseInt(req.params.id) } });
        res.status(200).json({ message: "Categoria eliminata." });
    } catch (error) {
        res.status(500).json({ message: "Errore durante l'eliminazione." });
    }
};
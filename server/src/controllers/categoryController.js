import prisma from '../config/prismaClient.js';

const createSlug = (text) => {
    if (!text) return '';
    return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
};

// GET /api/categories/admin - Prende tutte le categorie per la dashboard
export const getAllCategoriesAdmin = async (req, res) => {
    try {
        const categories = await prisma.Category.findMany({
            orderBy: { name: 'asc' },
            include: { _count: { select: { guides: true } } }
        });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: "Errore del server" });
    }
};

// POST /api/categories/admin - Crea una nuova categoria
export const createCategory = async (req, res) => {
    const { name, description, iconName } = req.body;
    try {
        const newCategory = await prisma.Category.create({
            data: { name, slug: createSlug(name), description, iconName }
        });
        res.status(201).json(newCategory);
    } catch (error) {
        res.status(500).json({ message: "Errore, il nome potrebbe esistere già." });
    }
};

// PUT /api/categories/admin/:id - Aggiorna una categoria
export const updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name, description, iconName } = req.body;
    try {
        const updatedCategory = await prisma.Category.update({
            where: { id: parseInt(id) },
            data: { name, slug: createSlug(name), description, iconName }
        });
        res.json(updatedCategory);
    } catch (error) {
        res.status(500).json({ message: "Errore durante l'aggiornamento." });
    }
};

// DELETE /api/categories/admin/:id - Elimina una categoria (e le sue guide)
export const deleteCategory = async (req, res) => {
    try {
        await prisma.Category.delete({ where: { id: parseInt(req.params.id) } });
        res.status(200).json({ message: "Categoria eliminata." });
    } catch (error) {
        res.status(500).json({ message: "Errore durante l'eliminazione." });
    }
};

export const getAllCategoriesPublic = async (req, res) => {
    try {
        const categories = await prisma.Category.findMany({
            orderBy: { name: 'asc' },
            include: {
                guides: { // Include le guide associate
                    take: 5, // Prendi solo le prime 5
                    orderBy: { title: 'asc' }
                }
            }
        });
        res.json(categories);
    } catch (error) {
        console.error("Errore nel recuperare le categorie pubbliche:", error);
        res.status(500).json({ message: "Errore del server" });
    }
};

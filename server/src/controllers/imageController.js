import cloudinary from '../config/cloudinary.js';

// Funzione helper per l'upload
const uploadImageToCloudinary = async (file) => {
    const b64 = Buffer.from(file.buffer).toString("base64");
    let dataURI = `data:${file.mimetype};base64,${b64}`;
    // Usiamo una cartella generica per le immagini del contenuto
    return cloudinary.uploader.upload(dataURI, { folder: "fastinfo_content" });
};

// POST /api/images/upload - Riceve un file e restituisce l'URL
export const uploadEditorImage = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Nessun file fornito.' });
    }
    try {
        const result = await uploadImageToCloudinary(req.file);
        // Restituisce l'URL in un formato che React Quill può capire
        res.json({ url: result.secure_url });
    } catch (error) {
        console.error("Errore durante l'upload dell'immagine dall'editor:", error);
        res.status(500).json({ error: "Errore durante l'upload." });
    }
};
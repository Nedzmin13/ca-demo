import React, { useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { uploadEditorImage } from '../../../api'; // Importiamo la nostra nuova funzione API

// Handler personalizzato per l'upload delle immagini
function imageHandler() {
    // 'this' si riferisce all'istanza dell'editor
    const quill = this.quill;

    // Crea un input file fittizio
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    // Quando l'utente seleziona un file...
    input.onchange = async () => {
        const file = input.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('image', file);

            // Mostra un caricamento temporaneo (opzionale ma consigliato)
            const range = quill.getSelection(true);
            quill.insertEmbed(range.index, 'text', ' [Caricamento immagine...] ');

            try {
                // Chiama la nostra API per caricare l'immagine
                const response = await uploadEditorImage(formData);
                const imageUrl = response.data.url;

                // Rimuovi il testo di caricamento
                quill.deleteText(range.index, 26);
                // Inserisci l'immagine nell'editor usando l'URL restituito da Cloudinary
                quill.insertEmbed(range.index, 'image', imageUrl);
                quill.setSelection(range.index + 1);

            } catch (error) {
                console.error("Errore upload immagine:", error);
                quill.deleteText(range.index, 26); // Rimuovi il testo di caricamento anche in caso di errore
                alert("Impossibile caricare l'immagine.");
            }
        }
    };
}

const RichTextEditor = ({ value, onChange }) => {
    // Configurazione della toolbar con il nostro handler personalizzato
    const modules = {
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{'list': 'ordered'}, {'list': 'bullet'}],
                ['link', 'image', 'video'], // 'image' ora attiverà il nostro handler
                [{ 'align': [] }], // Aggiungiamo i controlli di allineamento
                ['clean']
            ],
            handlers: {
                'image': imageHandler // Collega il pulsante 'image' alla nostra funzione
            }
        },
    };

    return (
        <ReactQuill
            theme="snow"
            value={value || ''}
            onChange={onChange}
            modules={modules}
            className="bg-white"
        />
    );
};

export default RichTextEditor;
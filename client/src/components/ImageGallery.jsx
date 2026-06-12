import React, { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, X, Info } from 'lucide-react';

// Lightbox
const Lightbox = ({ images, activeIndex, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(activeIndex);
    const goToPrev = () => setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
    const goToNext = () => setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowLeft') goToPrev();
            if (e.key === 'ArrowRight') goToNext();
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);


    const currentAttribution = images[currentIndex].attribution;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <button className="absolute top-4 right-4 text-white p-2 rounded-full hover:bg-white/20 transition z-50"><X size={32} /></button>
            <button className="absolute left-4 text-white p-2 rounded-full hover:bg-white/20 transition z-50" onClick={(e) => { e.stopPropagation(); goToPrev(); }}><ChevronLeft size={48} /></button>
            <button className="absolute right-4 text-white p-2 rounded-full hover:bg-white/20 transition z-50" onClick={(e) => { e.stopPropagation(); goToNext(); }}><ChevronRight size={48} /></button>

            <div className="relative max-w-6xl max-h-[85vh] flex flex-col items-center justify-center w-full" onClick={(e) => e.stopPropagation()}>
                <img src={images[currentIndex].url} alt="Ingrandimento" className="max-w-full max-h-[80vh] object-contain shadow-2xl" />

                {/* Attribuzione sotto l'immagine nel Lightbox */}
                {currentAttribution && (
                    <div className="mt-4 text-white/80 text-sm bg-black/50 px-4 py-2 rounded-full backdrop-blur-md flex items-center gap-2">
                        <Info size={14} />
                        {currentAttribution}
                    </div>
                )}
            </div>
        </div>
    );
};

// Galleria Principale
export const ImageGallery = ({ images }) => {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

    if (!images || images.length === 0) {
        return (
            <div className="w-full aspect-video bg-gray-100 rounded-xl flex flex-col items-center justify-center text-gray-400 border border-gray-200">
                <span className="text-sm">Nessuna immagine</span>
            </div>
        );
    }

    return (
        <div className="relative group">
            <div className="overflow-hidden rounded-xl shadow-lg border border-gray-100 bg-gray-900" ref={emblaRef}>
                <div className="flex">
                    {images.map((img, index) => (
                        <div className="flex-shrink-0 flex-grow-0 w-full min-w-0 relative" key={img.id || index}>
                            <div
                                className="relative aspect-video overflow-hidden cursor-pointer"
                                onClick={() => { setLightboxIndex(index); setLightboxOpen(true); }}
                            >
                                {/* Sfondo Sfumato */}
                                <div
                                    className="absolute inset-0 bg-cover bg-center blur-3xl opacity-40 scale-110"
                                    style={{ backgroundImage: `url(${img.url})` }}
                                />

                                {/* Immagine Vera */}
                                <img
                                    src={img.url}
                                    alt={`Immagine ${index + 1}`}
                                    className="relative w-full h-full object-contain z-10 transition-transform duration-500 hover:scale-[1.02]"
                                />

                                {/* ATTRIBUZIONE (Overlay in basso a destra) */}
                                {img.attribution && (
                                    <div className="absolute bottom-2 right-2 z-20 max-w-[90%]">
                                        <div className="bg-black/60 backdrop-blur-sm text-white/90 text-[10px] px-3 py-1.5 rounded-lg shadow-sm border border-white/10 truncate flex items-center gap-1.5">
                                            <Info size={10} className="flex-shrink-0" />
                                            <span className="truncate">{img.attribution}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {images.length > 1 && (
                <>
                    <button onClick={scrollPrev} className="absolute top-1/2 left-4 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-all z-30">
                        <ChevronLeft size={24} />
                    </button>
                    <button onClick={scrollNext} className="absolute top-1/2 right-4 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-all z-30">
                        <ChevronRight size={24} />
                    </button>
                </>
            )}

            {lightboxOpen && <Lightbox images={images} activeIndex={lightboxIndex} onClose={() => setLightboxOpen(false)} />}
        </div>
    );
};
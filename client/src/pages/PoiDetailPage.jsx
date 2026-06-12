import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { fetchPoiById } from '../api';
import { ImageGallery } from '../components/ImageGallery';
import { MapPin, Phone, Globe, Clock, Euro, Utensils, Sparkles, Building, Fuel, FileText, HeartPulse, Ticket, BedDouble, ClipboardList, Star, ExternalLink, Wrench, Car } from 'lucide-react';
import OpeningHoursDisplay from "../components/OpeningHoursDisplay.jsx";

// ... (tieni le costanti getCategoryDisplayName, InfoRow, SpecificDetails come sono) ...
const getCategoryDisplayName = (category) => {
    const translations = { 'Accommodation': 'Alloggio', 'Restaurant': 'Ristorante', 'FuelStation': 'Distributore', 'Supermarket': 'Supermercato', 'Bar': 'Bar', 'Parking': 'Parcheggio', 'TouristAttraction': 'Attrazione Turistica', 'EmergencyService': 'Servizio di Emergenza', 'CarRepairShop': 'Officina Meccanica' };
    return translations[category] || category;
};
const InfoRow = ({ icon, label, children }) => {
    if (children === null || children === undefined || children === '' || (Array.isArray(children) && children.length === 0)) return null;
    return ( <div className="flex items-start py-4 border-b last:border-b-0"> <div className="text-gray-500 mr-4 mt-1 flex-shrink-0">{icon}</div> <div> <p className="text-sm font-semibold text-gray-500">{label}</p> <div className="text-gray-800 break-words">{children}</div> </div> </div>);
};
const SpecificDetails = ({ poi }) => {
    const restaurant = poi.restaurant; const bar = poi.bar; const supermarket = poi.supermarket; const parking = poi.parking; const touristattraction = poi.touristattraction; const emergencyservice = poi.emergencyservice; const accommodation = poi.accommodation; const carRepairShop = poi.carrepairshop;
    const leaflet = poi.supermarketBrand?.leaflets?.[0];
    return (
        <>
            {leaflet && poi.category === 'Supermarket' && ( <InfoRow icon={<FileText size={20}/>} label={leaflet.title || 'Volantino'}> <a href={leaflet.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline"> Visualizza Volantino </a> </InfoRow> )}
            {restaurant && (<> <InfoRow icon={<Utensils size={20}/>} label="Tipo Cucina">{restaurant.cuisineType}</InfoRow> <InfoRow icon={<Euro size={20}/>} label="Fascia Prezzo">{restaurant.priceRange}</InfoRow> </>)}
            {accommodation && ( <> <InfoRow icon={<BedDouble size={20}/>} label="Tipo Alloggio">{poi.type}</InfoRow> {poi.stars && <InfoRow icon={<Star size={20}/>} label="Stelle">{poi.stars} stelle</InfoRow>} <InfoRow icon={<ClipboardList size={20}/>} label="Servizi">{poi.services}</InfoRow> {poi.bookingUrl && <InfoRow icon={<ExternalLink size={20}/>} label="Prenota Ora"> <a href={poi.bookingUrl} target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline">Vai al sito di prenotazione</a> </InfoRow> } </>)}
            {poi.category === 'FuelStation' && (<> <InfoRow icon={<Fuel size={20}/>} label="Prezzo Diesel">{poi.dieselPrice ? `${poi.dieselPrice} €/L` : 'N/D'}</InfoRow> <InfoRow icon={<Fuel size={20}/>} label="Prezzo Benzina">{poi.petrolPrice ? `${poi.petrolPrice} €/L` : 'N/D'}</InfoRow> <InfoRow icon={<Fuel size={20}/>} label="Prezzo Gas">{poi.gasPrice ? `${poi.gasPrice} €/L` : 'N/D'}</InfoRow> </>)}
            {bar && (<> <InfoRow icon={<Sparkles size={20}/>} label="Specialità">{bar.specialty}</InfoRow> </>)}
            {parking && (<> <InfoRow icon={<Building size={20}/>} label="Tipo Parcheggio">{parking.parkingType}</InfoRow> </>)}
            {emergencyservice && (<> <InfoRow icon={<HeartPulse size={20}/>} label="Tipo Servizio">{emergencyservice.serviceType}</InfoRow> </>)}
            {touristattraction && (<> <InfoRow icon={<Ticket size={20}/>} label="Costo Ingresso">{touristattraction.entryFee}</InfoRow> </>)}
            {carRepairShop && ( <> <InfoRow icon={<Wrench size={20}/>} label="Servizi Offerti">{carRepairShop.servicesOffered}</InfoRow> <InfoRow icon={<Car size={20}/>} label="Marche Trattate">{carRepairShop.brandsTreated}</InfoRow> </>)}
        </>
    );
};

function PoiDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [poi, setPoi] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchPoiDetails = async () => {
            if (!id) return; setLoading(true); setError(false);
            try {
                const response = await fetchPoiById(id);
                setPoi(response.data);
            } catch (err) { setError(true); }
            finally { setLoading(false); }
        };
        fetchPoiDetails();
    }, [id]);

    if (loading) return <div className="flex justify-center items-center h-screen"><p>Caricamento...</p></div>;
    if (error || !poi) return <div className="flex justify-center items-center h-screen"><p>Errore.</p></div>;

    const pageTitle = `${poi.name} - ${getCategoryDisplayName(poi.category)} a ${poi.comune.name} | FastInfo`;
    const metaDescription = `Dettagli su ${poi.name}.`;

    // --- LOGICA IMMAGINI INTELLIGENTE ---
    let galleryImages = [];

    // 1. Se ci sono foto caricate specificamente, usa quelle
    if (poi.image && poi.image.length > 0) {
        galleryImages = poi.image;
    }
    // 2. Se NON ci sono foto, ma c'è un BRAND collegato con un logo default, usa quello
    else {
        const brandLogo =
            poi.supermarketBrand?.defaultImageUrl ||
            poi.restaurantBrand?.defaultImageUrl ||
            poi.fuelBrand?.defaultImageUrl ||
            poi.medicalBrand?.defaultImageUrl;

        if (brandLogo) {
            galleryImages = [{ id: 'brand-logo', url: brandLogo }];
        }
    }
    // ------------------------------------

    return (
        <>
            <Helmet><title>{pageTitle}</title><meta name="description" content={metaDescription} /></Helmet>
            <div className="bg-gray-50">
                <div className="container mx-auto py-12 px-4 max-w-5xl">
                    <div className="mb-4"> <Link to={-1} className="text-sm text-sky-600 hover:underline"> ← Torna a {poi.comune.name} </Link> </div>

                    {/* PASSA LE IMMAGINI CALCOLATE */}
                    <ImageGallery images={galleryImages} />

                    <div className="bg-white p-6 md:p-8 rounded-b-lg shadow-lg -mt-2 relative grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2">
                            <span className="bg-sky-100 text-sky-800 text-xs font-semibold px-2.5 py-1 rounded-full"> {getCategoryDisplayName(poi.category)} </span>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-2">{poi.name}</h1>
                            <hr className="my-6"/>
                            <div className="prose max-w-none text-gray-700"> <div dangerouslySetInnerHTML={{__html: poi.description || ''}} /> </div>
                        </div>
                        <div className="md:col-span-1">
                            <div className="border rounded-xl p-4">
                                <h3 className="text-xl font-bold mb-3 border-b pb-3">Informazioni Utili</h3>
                                <div>
                                    <InfoRow icon={<MapPin size={20}/>} label="Indirizzo">{poi.address}</InfoRow>
                                    <InfoRow icon={<Phone size={20}/>} label="Telefono">{poi.phoneNumber}</InfoRow>
                                    {poi.website && <InfoRow icon={<Globe size={20}/>} label="Sito Web"><a href={poi.website} target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline">Visita il sito</a></InfoRow>}
                                    <InfoRow icon={<Clock size={20}/>} label="Orari"> <OpeningHoursDisplay hoursData={poi.openingHours} /> </InfoRow>
                                    <SpecificDetails poi={poi} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default PoiDetailPage;
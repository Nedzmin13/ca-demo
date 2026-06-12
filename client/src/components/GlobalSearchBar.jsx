import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCombobox } from 'downshift';
import useDebounce from '../hooks/useDebounce';
import { globalSearch } from '../api';
import { Search, MapPin, Tag, Route as RouteIcon, BookOpen, Wrench } from 'lucide-react';

export function GlobalSearchBar() {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [inputValue, setInputValue] = useState('');

    const debouncedInputValue = useDebounce(inputValue.trim(), 500);

    useEffect(() => {
        if (debouncedInputValue.length < 3) {
            setItems([]);
            return;
        }
        const fetchData = async () => {
            try {
                const response = await globalSearch(debouncedInputValue);
                const combinedResults = [
                    ...response.data.comuni.map(item => ({ ...item, resultType: 'Comune' })),
                    ...response.data.offers.map(item => ({ ...item, resultType: 'Offerta' })),
                    ...response.data.itineraries.map(item => ({ ...item, resultType: 'Itinerario' })),
                    ...response.data.guides.map(item => ({ ...item, resultType: 'Pratica Utile' })),
                    ...response.data.howToArticles.map(item => ({ ...item, resultType: 'Come Fare' })),
                ];
                setItems(combinedResults);
            } catch (error) {
                console.error("Errore nella ricerca globale:", error);
            }
        };
        fetchData();
    }, [debouncedInputValue]);

    const {
        isOpen,
        getMenuProps,
        getInputProps,
        getItemProps,
    } = useCombobox({
        items,
        inputValue,
        selectedItem: null, // <--- LA MAGIA È QUI: Impedisce l'autocompilazione fastidiosa
        itemToString: (item) => (item ? item.title || item.name : ''),
        onInputValueChange: ({ inputValue: newInputValue }) => {
            setInputValue(newInputValue || '');
        },
        onSelectedItemChange: ({ selectedItem }) => {
            if (!selectedItem) return;

            // Navigazione
            if (selectedItem.resultType === 'Comune') navigate(`/comune/${selectedItem.slug}`);
            else if (selectedItem.resultType === 'Offerta') navigate(`/offerte/${selectedItem.id}`);
            else if (selectedItem.resultType === 'Itinerario') navigate(`/itinerari/${selectedItem.id}`);
            else if (selectedItem.resultType === 'Pratica Utile') navigate(`/pratiche-utili/${selectedItem.slug}`);
            else if (selectedItem.resultType === 'Come Fare') navigate(`/come-fare/${selectedItem.slug}`);

            // Svuotiamo i risultati e il testo, e ora non verrà più sovrascritto!
            setInputValue('');
            setItems([]);
        },
    });

    return (
        <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
                {...getInputProps({ value: inputValue })}
                placeholder="Cerca città, offerte..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <ul {...getMenuProps()} className={`absolute mt-1 w-full bg-white shadow-lg rounded-md max-h-80 overflow-auto z-50 ${!isOpen && 'hidden'}`}>
                {isOpen && items.length > 0 && items.map((item, index) => (
                    <li key={`${item.id}-${item.resultType}`} {...getItemProps({ item, index })} className="px-4 py-2 hover:bg-sky-50 cursor-pointer flex items-center gap-3 border-b">
                        {item.resultType === 'Comune' && <MapPin size={16} className="text-gray-400" />}
                        {item.resultType === 'Offerta' && <Tag size={16} className="text-gray-400" />}
                        {item.resultType === 'Itinerario' && <RouteIcon size={16} className="text-gray-400" />}
                        {item.resultType === 'Pratica Utile' && <BookOpen size={16} className="text-gray-400" />}
                        {item.resultType === 'Come Fare' && <Wrench size={16} className="text-gray-400" />}
                        <div>
                            <p className="font-semibold text-sm">{item.title || item.name}</p>
                            <p className="text-xs text-gray-500">{item.resultType}</p>
                        </div>
                    </li>
                ))}
                {isOpen && debouncedInputValue.length >= 3 && items.length === 0 && (
                    <li className="px-4 py-2 text-sm text-gray-500">Nessun risultato trovato.</li>
                )}
            </ul>
        </div>
    );
}
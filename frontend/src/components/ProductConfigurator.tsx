import React, { useEffect, useState } from 'react';
import { useOfferStore } from '../store/offerStore';
import { useOptions, useOptionsByCategory, calculateOptionsPrice } from '../hooks/useOptions';
import { Option, ProductConfig } from '../types';
import { validateDimensions } from '../utils/validation';
import OptionSelector from './OptionSelector';
import { roundPrice } from '../utils/price';

interface ProductConfiguratorProps {
  onSave: () => void;
  onCancel: () => void;
}

const ProductConfigurator: React.FC<ProductConfiguratorProps> = ({ onSave, onCancel }) => {
  const { options: allOptions, loading: optionsLoading } = useOptions();
  const { currentProduct, updateProductConfig, updateProductOption, addProductToOffer } = useOfferStore();
  
  const [selectedType, setSelectedType] = useState<string>('');
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [quantity, setQuantity] = useState<number | undefined>(undefined);
  const [dimensionError, setDimensionError] = useState<string | null>(null);
  const [netPrice, setNetPrice] = useState<number>(0);
  
  // Get type options
  const { options: typeOptions } = useOptionsByCategory('Typ elementu');
  
  // Inicjalizacja produktu przy pierwszym renderowaniu
  useEffect(() => {
    console.log("Inicjalizowanie konfiguracji produktu");
    // Wywołaj initProductConfig bezpośrednio
    useOfferStore.getState().initProductConfig();
    
    // Aktualizuj lokalne stany, jeśli currentProduct jest już zdefiniowany
    if (currentProduct) {
      setSelectedType(currentProduct.typ);
      setWidth(currentProduct.szerokosc);
      setHeight(currentProduct.wysokosc);
      console.log("Zaktualizowano lokalne stany z produktu:", currentProduct);
    }
  }, []); // Pusta tablica zależności - wykonaj tylko raz przy montowaniu komponentu
  
  // Drugi efekt do synchronizacji stanów, gdy currentProduct się zmieni
  useEffect(() => {
    if (currentProduct) {
      setSelectedType(currentProduct.typ || '');
      setWidth(currentProduct.szerokosc || 0);
      setHeight(currentProduct.wysokosc || 0);
      // Jeśli ilosc jest zdefiniowane, ustaw ją, w przeciwnym razie pozostaw puste pole (undefined)
      setQuantity(currentProduct.ilosc);
      console.log("Synchronizacja stanu z produktem:", currentProduct);
    }
  }, [currentProduct]);
  
  // Calculate price when options change
  useEffect(() => {
    if (!currentProduct || optionsLoading || !allOptions.length) return;
    
    console.log("Calculating price with product:", currentProduct);
    
    const baseTypeOption = allOptions.find(option => option.id_opcji === currentProduct.typ);
    const basePrice = baseTypeOption ? baseTypeOption.cena_netto_eur : 0;
    
    console.log("Base price from type:", basePrice);
    
    // Log selected options for debugging
    console.log("Selected options:", currentProduct.options);
    
    const optionsPrice = calculateOptionsPrice(currentProduct.options, allOptions);
    console.log("Additional options price:", optionsPrice);
    
    // Apply size multiplier (example: 10% increase per each 500mm over 1000mm)
    const baseSize = 1000; // 1000mm base size
    const sizeMultiplier = 0.1; // 10% increase per 500mm over base
    const sizeFactor = Math.max(1, 1 + Math.floor(Math.max(width - baseSize, height - baseSize) / 500) * sizeMultiplier);
    console.log("Size factor:", sizeFactor);
    
    const totalPrice = basePrice * sizeFactor + optionsPrice;
    console.log("Total calculated price:", totalPrice);
    
    setNetPrice(roundPrice(totalPrice));
  }, [currentProduct, allOptions, optionsLoading, width, height]);
  
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value;
    setSelectedType(newType);
    updateProductConfig('typ', newType);
  };
  
  const handleDimensionChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    dimension: 'szerokosc' | 'wysokosc'
  ) => {
    const value = parseInt(e.target.value, 10);
    
    if (dimension === 'szerokosc') {
      setWidth(value || 0);
      updateProductConfig('szerokosc', value || 0);
    } else {
      setHeight(value || 0);
      updateProductConfig('wysokosc', value || 0);
    }
    
    // Validate dimensions if both width and height are set
    if ((dimension === 'szerokosc' && height > 0) || (dimension === 'wysokosc' && width > 0)) {
      const validation = validateDimensions(
        dimension === 'szerokosc' ? value : width,
        dimension === 'wysokosc' ? value : height,
        selectedType
      );
      
      setDimensionError(validation.valid ? null : (validation.error || null));
    }
  };
  
  const handleOptionSelect = (category: string, optionId: string) => {
    // Upewnij się, że produkt jest zainicjalizowany przed próbą aktualizacji opcji
    if (!currentProduct) {
      console.warn("Produkt nie jest zainicjalizowany, inicjalizowanie...");
      useOfferStore.getState().initProductConfig();
      // Odczekaj jedną ramkę przed wykonaniem aktualizacji
      setTimeout(() => {
        console.log("Ponowna próba aktualizacji opcji po inicjalizacji produktu");
        updateProductOption(category, optionId);
      }, 0);
      return;
    }
    
    console.log(`Aktualizacja opcji dla kategorii ${category} na wartość ${optionId}`);
    updateProductOption(category, optionId);
  };
  
  const handleSave = () => {
    if (!selectedType || width <= 0 || height <= 0 || dimensionError) {
      return;
    }
    
    // Pozostawiamy undefined jeśli pole było puste
    if (quantity !== undefined) {
      updateProductConfig('ilosc', quantity);
    }
    
    addProductToOffer(netPrice);
    onSave();
  };
  
  // Get categories excluding "Typ elementu" which is handled separately
  const categories = Array.from(
    new Set(allOptions.map(option => option.kategoria))
  ).filter(category => category !== 'Typ elementu');
  
  if (optionsLoading) {
    return <div className="flex justify-center p-8">Ładowanie opcji...</div>;
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Konfiguracja produktu</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Typ elementu
          </label>
          <select
            value={selectedType}
            onChange={handleTypeChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Wybierz typ elementu</option>
            {typeOptions.map(option => (
              <option key={option.id_opcji} value={option.id_opcji}>
                {option.nazwa} ({option.cena_netto_eur} EUR)
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <h3 className="block text-sm font-medium text-gray-700 mb-2">
            Wymiary (mm)
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Szerokość
              </label>
              <input
                type="number"
                value={width || ''}
                onChange={(e) => handleDimensionChange(e, 'szerokosc')}
                min="400"
                max="3000"
                placeholder="np. 1200"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Wysokość
              </label>
              <input
                type="number"
                value={height || ''}
                onChange={(e) => handleDimensionChange(e, 'wysokosc')}
                min="400"
                max="3000"
                placeholder="np. 1400"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          {dimensionError && (
            <p className="mt-2 text-sm text-red-600">{dimensionError}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ilość
          </label>
          <input
            type="number"
            value={quantity === undefined ? '' : quantity}
            placeholder="np. 1"
            onChange={(e) => {
              // Pozwól na puste pole
              if (e.target.value === '') {
                setQuantity(undefined);
                // Nie aktualizujemy store przy pustym polu - dopiero przy zapisie
              } else {
                const value = parseInt(e.target.value, 10);
                if (!isNaN(value)) {
                  setQuantity(value);
                  updateProductConfig('ilosc', value);
                }
              }
            }}
            onBlur={() => {
              // Przy zapisie formularza będzie walidacja - tutaj nie wymuszamy
              // żadnej wartości minimalnej podczas edycji
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      
      {selectedType && (
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Opcje konfiguracji</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map(category => (
              <OptionSelector
                key={category}
                category={category}
                selectedOption={currentProduct?.options[category] || ''}
                onSelect={handleOptionSelect}
              />
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-8 border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between mb-6">
          <span className="text-lg font-semibold text-gray-800">
            Cena netto:
          </span>
          <span className="text-xl font-bold text-blue-600">
            {netPrice.toFixed(2)} EUR
          </span>
        </div>
        
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Anuluj
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!selectedType || width <= 0 || height <= 0 || !!dimensionError}
            className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white ${
              !selectedType || width <= 0 || height <= 0 || !!dimensionError
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
            }`}
          >
            Dodaj do oferty
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductConfigurator;

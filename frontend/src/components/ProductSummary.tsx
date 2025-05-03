import React from 'react';
import { OfferItem, Option } from '../types';
import { formatPrice } from '../utils/price';

interface ProductSummaryProps {
  item: OfferItem;
  index: number;
  options: Option[];
  onRemove: (index: number) => void;
}

const ProductSummary: React.FC<ProductSummaryProps> = ({
  item,
  index,
  options,
  onRemove
}) => {
  // Find the product type option
  const productType = options.find(opt => opt.id_opcji === item.typ);
  
  // Find option names for the configuration
  const getOptionName = (optionId: string): string => {
    const option = options.find(opt => opt.id_opcji === optionId);
    return option ? option.nazwa : 'Nieznana opcja';
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium text-gray-800">
            {productType ? productType.nazwa : 'Nieznany produkt'} - Pozycja {index + 1}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Wymiary: {item.szerokosc} × {item.wysokosc} mm
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <span className="font-medium text-blue-600">
            {formatPrice(item.cena_netto, 'EUR')}
          </span>
          <button
            onClick={() => onRemove(index)}
            className="text-red-500 hover:text-red-700"
            title="Usuń produkt"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Wybrane opcje:
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-gray-600">
          {Object.entries(item.konfiguracja).map(([category, optionId]) => (
            <div key={category} className="flex justify-between">
              <span className="font-medium mr-2">{category}:</span>
              <span>{getOptionName(optionId)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductSummary;

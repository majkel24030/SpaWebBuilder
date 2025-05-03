import React from 'react';
import { useOfferStore } from '../store/offerStore';
import { useOptions } from '../hooks/useOptions';
import ProductSummary from './ProductSummary';
import { formatPrice } from '../utils/price';

interface OfferSummaryProps {
  readOnly?: boolean;
}

const OfferSummary: React.FC<OfferSummaryProps> = ({ readOnly = false }) => {
  const { currentOffer, removeProductFromOffer } = useOfferStore();
  const { options } = useOptions();
  
  if (!currentOffer) {
    return null;
  }
  
  const handleRemoveProduct = (index: number) => {
    if (readOnly) return;
    removeProductFromOffer(index);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Podsumowanie oferty</h2>
      
      {currentOffer.items.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="text-lg">Brak pozycji w ofercie</p>
          <p className="text-sm mt-2">Dodaj produkty, aby wygenerować ofertę</p>
        </div>
      ) : (
        <>
          <div className="mb-6">
            {currentOffer.items.map((item, index) => (
              <ProductSummary
                key={index}
                item={item}
                index={index}
                options={options}
                onRemove={handleRemoveProduct}
              />
            ))}
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-700">Suma netto:</span>
              <span className="font-medium">{formatPrice(currentOffer.suma_netto, 'EUR')}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-700">VAT (23%):</span>
              <span className="font-medium">{formatPrice(currentOffer.suma_vat, 'EUR')}</span>
            </div>
            <div className="flex justify-between items-center py-2 text-lg font-bold">
              <span>Suma brutto:</span>
              <span className="text-blue-600">{formatPrice(currentOffer.suma_brutto, 'EUR')}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OfferSummary;

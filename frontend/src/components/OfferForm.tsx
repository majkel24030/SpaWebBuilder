import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerInfo from './CustomerInfo';
import OfferSummary from './OfferSummary';
import ProductConfigurator from './ProductConfigurator';
import { useOfferStore } from '../store/offerStore';
import { createOffer, updateOffer, downloadOfferPDF } from '../services/offers';

interface OfferFormProps {
  isEditing?: boolean;
}

const OfferForm: React.FC<OfferFormProps> = ({ isEditing = false }) => {
  const navigate = useNavigate();
  const { currentOffer, clearOffer } = useOfferStore();
  
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  const handleAddProduct = () => {
    setIsConfiguring(true);
  };
  
  const handleSaveProduct = () => {
    setIsConfiguring(false);
  };
  
  const handleCancelProduct = () => {
    setIsConfiguring(false);
  };
  
  const handleSaveOffer = async () => {
    if (!currentOffer) return;
    
    setIsSaving(true);
    setSaveError(null);
    
    try {
      if (isEditing && currentOffer.id) {
        await updateOffer(currentOffer.id, currentOffer);
      } else {
        await createOffer(currentOffer);
      }
      
      navigate('/offers');
      clearOffer();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Wystąpił błąd podczas zapisywania oferty');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleGeneratePdf = async () => {
    if (!currentOffer || !currentOffer.id) {
      // Save the offer first if it's not saved yet
      try {
        setIsSaving(true);
        const savedOffer = await createOffer(currentOffer);
        setIsSaving(false);
        setIsGeneratingPdf(true);
        await downloadOfferPDF(savedOffer.id!, savedOffer.numer);
        setIsGeneratingPdf(false);
      } catch (error) {
        setSaveError(error instanceof Error ? error.message : 'Wystąpił błąd podczas generowania PDF');
        setIsSaving(false);
        setIsGeneratingPdf(false);
      }
    } else {
      // If offer already has an ID, just generate PDF
      try {
        setIsGeneratingPdf(true);
        await downloadOfferPDF(currentOffer.id, currentOffer.numer);
        setIsGeneratingPdf(false);
      } catch (error) {
        setSaveError(error instanceof Error ? error.message : 'Wystąpił błąd podczas generowania PDF');
        setIsGeneratingPdf(false);
      }
    }
  };
  
  const handleCancel = () => {
    navigate(-1);
    clearOffer();
  };
  
  // Guard against no current offer
  if (!currentOffer) {
    return (
      <div className="text-center py-10">
        <p className="text-lg text-gray-600">Brak danych oferty</p>
        <button
          onClick={() => navigate('/offers/new')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Utwórz nową ofertę
        </button>
      </div>
    );
  }
  
  // Check if offer has items (for PDF and save validation)
  const hasItems = currentOffer.items.length > 0;
  
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {isEditing ? 'Edycja oferty' : 'Nowa oferta'}
      </h1>
      
      {saveError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <strong className="font-bold">Błąd: </strong>
          <span>{saveError}</span>
        </div>
      )}
      
      <CustomerInfo />
      
      {isConfiguring ? (
        <ProductConfigurator
          onSave={handleSaveProduct}
          onCancel={handleCancelProduct}
        />
      ) : (
        <>
          <OfferSummary />
          
          <div className="flex justify-between mt-8">
            <button
              onClick={handleAddProduct}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Dodaj produkt
              </div>
            </button>
            
            <div className="space-x-4">
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Anuluj
              </button>
              
              <button
                onClick={handleGeneratePdf}
                disabled={!hasItems || isGeneratingPdf}
                className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white ${
                  !hasItems || isGeneratingPdf
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {isGeneratingPdf ? 'Generowanie...' : 'Generuj PDF'}
              </button>
              
              <button
                onClick={handleSaveOffer}
                disabled={!hasItems || isSaving}
                className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white ${
                  !hasItems || isSaving
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isSaving ? 'Zapisywanie...' : 'Zapisz ofertę'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OfferForm;

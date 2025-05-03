import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRequireAuth } from '../hooks/useAuth';
import { useOfferStore } from '../store/offerStore';
import { getOfferById, downloadOfferPDF, deleteOffer } from '../services/offers';
import CustomerInfo from '../components/CustomerInfo';
import OfferSummary from '../components/OfferSummary';
import { Offer } from '../types';

const OfferDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useRequireAuth();
  const { setOffer, clearOffer } = useOfferStore();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offer, setOfferState] = useState<Offer | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  useEffect(() => {
    const fetchOffer = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const fetchedOffer = await getOfferById(parseInt(id));
        setOfferState(fetchedOffer);
        setOffer(fetchedOffer); // Set in global state for components
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch offer details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOffer();
    
    // Cleanup
    return () => {
      clearOffer();
    };
  }, [id, setOffer, clearOffer]);
  
  const handleEdit = () => {
    navigate(`/offers/edit/${id}`);
  };
  
  const handleDelete = () => {
    setShowDeleteModal(true);
  };
  
  const handleConfirmDelete = async () => {
    if (!id) return;
    
    try {
      await deleteOffer(parseInt(id));
      navigate('/offers');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete offer');
    } finally {
      setShowDeleteModal(false);
    }
  };
  
  const handleGeneratePdf = async () => {
    if (!id || !offer) return;
    
    try {
      setIsGeneratingPdf(true);
      await downloadOfferPDF(parseInt(id), offer.numer);
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError(err instanceof Error ? err.message : 'Nie udało się wygenerować PDF');
    } finally {
      setIsGeneratingPdf(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p className="font-bold">Błąd</p>
        <p>{error}</p>
        <button
          onClick={() => navigate('/offers')}
          className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Wróć do listy ofert
        </button>
      </div>
    );
  }
  
  if (!offer) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-700">Oferta nie znaleziona</h2>
        <button
          onClick={() => navigate('/offers')}
          className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Wróć do listy ofert
        </button>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Szczegóły oferty {offer.numer}
        </h1>
        <div className="flex space-x-4">
          <button
            onClick={() => navigate('/offers')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Wróć do listy
          </button>
          <button
            onClick={handleGeneratePdf}
            disabled={isGeneratingPdf}
            className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white ${
              isGeneratingPdf
                ? 'bg-indigo-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isGeneratingPdf ? 'Generowanie...' : 'Generuj PDF'}
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
          >
            Usuń ofertę
          </button>
        </div>
      </div>
      
      <CustomerInfo readOnly />
      <OfferSummary readOnly />
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Potwierdź usunięcie
            </h3>
            <p className="text-gray-700 mb-6">
              Czy na pewno chcesz usunąć ofertę {offer.numer}? Ta operacja jest nieodwracalna.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Anuluj
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Usuń
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfferDetails;

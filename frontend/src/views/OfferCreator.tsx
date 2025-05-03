import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOfferStore } from '../store/offerStore';
import OfferForm from '../components/OfferForm';
import { useRequireAuth } from '../hooks/useAuth';

const OfferCreator: React.FC = () => {
  const { user } = useRequireAuth();
  const { currentOffer, initOffer } = useOfferStore();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Initialize a new offer if there's none
    if (!currentOffer) {
      initOffer({
        numer: generateOfferNumber(),
        data: new Date().toISOString().split('T')[0],
        klient: '',
        suma_netto: 0,
        suma_vat: 0,
        suma_brutto: 0,
        items: []
      });
    }
  }, [currentOffer, initOffer]);
  
  // Generate a default offer number
  function generateOfferNumber(): string {
    const today = new Date();
    const year = today.getFullYear();
    const random = Math.floor(Math.random() * 9000) + 1000;
    
    return `FB/${year}/${random}`;
  }
  
  if (!user) {
    return null; // Will redirect via useRequireAuth
  }
  
  return (
    <div>
      <OfferForm />
    </div>
  );
};

export default OfferCreator;

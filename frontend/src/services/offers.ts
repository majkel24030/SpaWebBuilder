import { Offer, OfferFilter } from '../types';
import { request } from './api';

// Deklaracja globalnej funkcji window.downloadPDF
declare global {
  interface Window {
    downloadPDF?: (offerId: number, offerNumber: string) => void;
  }
}

/**
 * Get all offers for the current user
 */
export const getOffers = async (filter?: OfferFilter): Promise<Offer[]> => {
  let url = '/offers/';
  
  // Add query parameters for filtering
  if (filter) {
    const params = new URLSearchParams();
    
    if (filter.search) {
      params.append('search', filter.search);
    }
    
    if (filter.date_from) {
      params.append('date_from', filter.date_from);
    }
    
    if (filter.date_to) {
      params.append('date_to', filter.date_to);
    }
    
    if (filter.sort_by) {
      params.append('sort_by', filter.sort_by);
      if (filter.sort_direction) {
        params.append('sort_direction', filter.sort_direction);
      }
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
  }
  
  return request<Offer[]>({
    method: 'GET',
    url,
  });
};

/**
 * Get offer by ID
 */
export const getOfferById = async (id: number): Promise<Offer> => {
  return request<Offer>({
    method: 'GET',
    url: `/offers/${id}`,
  });
};

/**
 * Create new offer
 */
export const createOffer = async (offer: Offer): Promise<Offer> => {
  return request<Offer>({
    method: 'POST',
    url: '/offers/',
    data: offer,
  });
};

/**
 * Update existing offer
 */
export const updateOffer = async (id: number, offer: Offer): Promise<Offer> => {
  return request<Offer>({
    method: 'PUT',
    url: `/offers/${id}`,
    data: offer,
  });
};

/**
 * Delete offer
 */
export const deleteOffer = async (id: number): Promise<void> => {
  return request<void>({
    method: 'DELETE',
    url: `/offers/${id}`,
  });
};

/**
 * Generate PDF for offer
 */
export const generateOfferPDF = async (id: number): Promise<Blob> => {
  const response = await request<Blob>({
    method: 'GET',
    url: `/offers/${id}/pdf`,
    responseType: 'blob',
  });
  
  return response;
};

/**
 * Display and download offer PDF
 */
export const downloadOfferPDF = async (id: number, offerNumber: string): Promise<void> => {
  try {
    console.log('Opening PDF for offer:', id, offerNumber);
    
    // Pobierz token uwierzytelniający
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Nie jesteś zalogowany. Zaloguj się, aby wyświetlić PDF.');
      return;
    }
    
    // Używamy skryptu fix-pdf-download.js, który poprawnie obsługuje token
    if (window.downloadPDF) {
      window.downloadPDF(id, offerNumber);
    } else {
      // Dodajemy token do URL jako parametr zapytania
      const pdfUrl = `/api/offers/${id}/pdf?token=${token}`;
      
      // Utworzenie elementu <a> do otwarcia w nowej karcie
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.click();
    }
    
  } catch (error) {
    console.error('Error displaying PDF:', error);
    alert('Nie udało się wyświetlić pliku PDF. Spróbuj ponownie później.');
  }
};

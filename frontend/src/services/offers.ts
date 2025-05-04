import { Offer, OfferFilter } from '../types';
import { request } from './api';

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
    console.log('Processing PDF for offer:', id, offerNumber);
    
    // Zamiast pobierać blob i tworzyć URL, otwórz bezpośrednio URL do PDF
    // Używając bezpośredniego URL do endpointu API, korzystamy z nagłówka Authorization
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Nie jesteś zalogowany. Zaloguj się, aby wyświetlić PDF.');
      return;
    }
    
    // Otwórz nową kartę z bezpośrednim URL do PDF
    // Trzeba przekazać token jako parametr, ponieważ nagłówki nie działają przy window.open
    const timestamp = new Date().getTime(); // Dodajemy timestamp, aby uniknąć cache
    const pdfUrl = `/api/offers/${id}/pdf?token=${encodeURIComponent(token)}&t=${timestamp}`;
    console.log('Opening PDF URL:', pdfUrl);
    
    window.open(pdfUrl, '_blank');
  } catch (error) {
    console.error('Error displaying PDF:', error);
    alert('Nie udało się wyświetlić pliku PDF. Spróbuj ponownie później.');
  }
};

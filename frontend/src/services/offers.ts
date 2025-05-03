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
 * Download offer PDF
 */
export const downloadOfferPDF = async (id: number, offerNumber: string): Promise<void> => {
  // Using the global downloadPDF function from fix-pdf-download.js
  if (window.downloadPDF) {
    window.downloadPDF(id, offerNumber);
  } else {
    // Fallback to the original method
    try {
      const pdfBlob = await generateOfferPDF(id);
      
      // Create a URL for the blob
      const blobUrl = window.URL.createObjectURL(pdfBlob);
      
      // Create a link element
      const downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;
      downloadLink.download = `Oferta_${offerNumber.replace(/\//g, '_')}.pdf`;
      
      // Append to the document, click it, and remove it
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      // Free up the blob URL
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Nie udało się pobrać pliku PDF. Spróbuj ponownie później.');
    }
  }
};

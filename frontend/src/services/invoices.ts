import { request } from './api';
import axios from 'axios';

/**
 * Types for invoice related data
 */
export interface InvoiceClientInfo {
  name: string;
  address: string;
  nip?: string;
  phone?: string;
  email?: string;
}

export interface InvoiceItem {
  id: number;
  type: string;
  width: number;
  height: number;
  quantity: number;
  unit_price: number;
  options: Record<string, string>;
  net_amount: number;
  gross_amount: number;
}

export interface Invoice {
  id: number;
  offer_id: number;
  number: string;
  issue_date: string;
  due_date: string;
  payment_method: string;
  client: InvoiceClientInfo;
  notes?: string;
  items: InvoiceItem[];
  net_total: number;
  vat_rate: number;
  vat_amount: number;
  gross_total: number;
  currency: string;
}

export interface CreateInvoiceData {
  offer_id: number;
  issue_date: string;
  due_date: string;
  payment_method: string;
  client: InvoiceClientInfo;
  notes?: string;
  vat_rate?: number;
  currency?: string;
}

/**
 * Create invoice for an offer
 */
export const createInvoice = async (
  offerId: number,
  clientInfo: InvoiceClientInfo
): Promise<Invoice> => {
  // Calculate due date (14 days from today)
  const today = new Date();
  const dueDate = new Date(today);
  dueDate.setDate(today.getDate() + 14);

  const data: CreateInvoiceData = {
    offer_id: offerId,
    issue_date: today.toISOString().split('T')[0], // YYYY-MM-DD
    due_date: dueDate.toISOString().split('T')[0], // YYYY-MM-DD
    payment_method: 'przelew bankowy',
    client: clientInfo,
  };

  return request<Invoice>({
    url: `/invoices/${offerId}`,
    method: 'POST',
    data,
  });
};

/**
 * Get invoices for an offer
 */
export const getInvoicesForOffer = async (offerId: number): Promise<Invoice[]> => {
  return request<Invoice[]>({
    url: `/invoices/offer/${offerId}`,
    method: 'GET',
  });
};

/**
 * Get invoice by ID
 */
export const getInvoiceById = async (invoiceId: number): Promise<Invoice> => {
  return request<Invoice>({
    url: `/invoices/${invoiceId}`,
    method: 'GET',
  });
};

/**
 * Delete invoice
 */
export const deleteInvoice = async (invoiceId: number): Promise<void> => {
  return request<void>({
    url: `/invoices/${invoiceId}`,
    method: 'DELETE',
  });
};

/**
 * Download invoice PDF
 */
export const downloadInvoicePDF = async (invoiceId: number, invoiceNumber: string): Promise<void> => {
  try {
    const response = await axios.get(`/api/invoices/${invoiceId}/pdf`, {
      responseType: 'blob',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Faktura_${invoiceNumber.replace('/', '_')}.pdf`);
    
    // Append to html page
    document.body.appendChild(link);
    
    // Force download
    link.click();
    
    // Clean up and remove the link
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading invoice PDF:', error);
    throw error;
  }
};
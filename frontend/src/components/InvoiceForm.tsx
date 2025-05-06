import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { InvoiceClientInfo, createInvoice, downloadInvoicePDF } from '../services/invoices';
import { Offer } from '../types';

// Upewnij się, że oferta ma ID
interface OfferWithId extends Omit<Offer, 'id'> {
  id: number;
}

interface InvoiceFormProps {
  offer: OfferWithId;
  onSuccess: () => void;
  onCancel: () => void;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ offer, onSuccess, onCancel }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors } } = useForm<InvoiceClientInfo>({
    defaultValues: {
      name: offer.klient,
      address: '',
      phone: '',
      email: '',
    }
  });

  const onSubmit = async (data: InvoiceClientInfo) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!offer.id) {
        throw new Error('ID oferty jest wymagane');
      }
      const invoice = await createInvoice(offer.id, data);
      await downloadInvoicePDF(invoice.id, invoice.number);
      onSuccess();
    } catch (err) {
      console.error('Error creating invoice:', err);
      setError('Wystąpił błąd podczas generowania faktury. Proszę spróbować ponownie.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Generuj fakturę dla oferty {offer.numer}</h2>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nazwa klienta / Firma *
            </label>
            <input
              type="text"
              {...register('name', { required: 'To pole jest wymagane' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adres *
            </label>
            <textarea
              {...register('address', { required: 'To pole jest wymagane' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Ulica, numer, kod pocztowy, miasto"
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              NIP
            </label>
            <input
              type="text"
              {...register('nip')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="np. 123-456-78-90"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefon
            </label>
            <input
              type="text"
              {...register('phone')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="np. +48 123 456 789"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              {...register('email')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="np. klient@example.com"
            />
          </div>
        </div>
        
        <div className="mt-6 border-t border-gray-200 pt-6">
          <h3 className="font-medium text-gray-800 mb-4">Dane zamówienia</h3>
          
          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <p><strong>Numer oferty:</strong> {offer.numer}</p>
            <p><strong>Data oferty:</strong> {new Date(offer.data).toLocaleDateString()}</p>
            <p><strong>Suma netto:</strong> {offer.suma_netto.toFixed(2)} EUR</p>
            <p><strong>Suma VAT:</strong> {offer.suma_vat.toFixed(2)} EUR</p>
            <p><strong>Suma brutto:</strong> {offer.suma_brutto.toFixed(2)} EUR</p>
          </div>
          
          <p className="text-sm text-gray-600 mb-6">
            Faktura zostanie wygenerowana z domyślnym terminem płatności 14 dni od daty wystawienia.
            Wszystkie dane dotyczące produktów zostaną automatycznie pobrane z oferty.
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
            {error}
          </div>
        )}
        
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Anuluj
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white ${
              isLoading
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
            }`}
          >
            {isLoading ? 'Generowanie...' : 'Generuj fakturę'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InvoiceForm;
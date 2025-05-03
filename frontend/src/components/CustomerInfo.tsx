import React from 'react';
import { useForm } from 'react-hook-form';
import { useOfferStore } from '../store/offerStore';
import { validateOfferData } from '../utils/validation';

interface CustomerInfoProps {
  readOnly?: boolean;
}

const CustomerInfo: React.FC<CustomerInfoProps> = ({ readOnly = false }) => {
  const { currentOffer, updateOfferInfo } = useOfferStore();
  
  const { register, formState: { errors } } = useForm({
    defaultValues: {
      klient: currentOffer?.klient || '',
      numer: currentOffer?.numer || generateDefaultNumber(),
      data: currentOffer?.data || new Date().toISOString().split('T')[0],
      uwagi: currentOffer?.uwagi || ''
    }
  });
  
  function generateDefaultNumber(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 9000) + 1000;
    
    return `FB/${year}/${random}`;
  }
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateOfferInfo(name as keyof typeof currentOffer, value);
  };
  
  if (!currentOffer) {
    return null;
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Dane oferty</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nazwa klienta / firmy *
          </label>
          <input
            type="text"
            {...register('klient', { required: 'Nazwa klienta jest wymagana' })}
            value={currentOffer.klient}
            onChange={handleChange}
            disabled={readOnly}
            className={`w-full px-3 py-2 border ${errors.klient ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${readOnly ? 'bg-gray-100' : ''}`}
          />
          {errors.klient && (
            <p className="mt-1 text-sm text-red-600">{errors.klient.message}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Numer oferty *
          </label>
          <input
            type="text"
            {...register('numer', { 
              required: 'Numer oferty jest wymagany',
              pattern: {
                value: /^[A-Z]+\/\d{4}\/\d{4}$/,
                message: 'Format: XX/RRRR/NNNN'
              }
            })}
            value={currentOffer.numer}
            onChange={handleChange}
            disabled={readOnly}
            placeholder="np. FB/2023/0001"
            className={`w-full px-3 py-2 border ${errors.numer ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${readOnly ? 'bg-gray-100' : ''}`}
          />
          {errors.numer && (
            <p className="mt-1 text-sm text-red-600">{errors.numer.message}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data oferty *
          </label>
          <input
            type="date"
            {...register('data', { required: 'Data jest wymagana' })}
            value={currentOffer.data}
            onChange={handleChange}
            disabled={readOnly}
            className={`w-full px-3 py-2 border ${errors.data ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${readOnly ? 'bg-gray-100' : ''}`}
          />
          {errors.data && (
            <p className="mt-1 text-sm text-red-600">{errors.data.message}</p>
          )}
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Uwagi do oferty
          </label>
          <textarea
            {...register('uwagi')}
            value={currentOffer.uwagi || ''}
            onChange={handleChange}
            disabled={readOnly}
            rows={3}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${readOnly ? 'bg-gray-100' : ''}`}
          />
        </div>
      </div>
    </div>
  );
};

export default CustomerInfo;

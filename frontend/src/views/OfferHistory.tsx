import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useRequireAuth } from '../hooks/useAuth';
import { getOffers, downloadOfferPDF, deleteOffer } from '../services/offers';
import { Offer, OfferFilter } from '../types';
import { formatPrice } from '../utils/price';

const OfferHistory: React.FC = () => {
  const { user } = useRequireAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<OfferFilter>({});
  const [sortBy, setSortBy] = useState<string>('data');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [offerToDelete, setOfferToDelete] = useState<number | null>(null);
  
  const fetchOffers = async () => {
    try {
      setLoading(true);
      const fetchedOffers = await getOffers({
        ...filter,
        sortBy,
        sortDirection,
        search: searchTerm
      });
      setOffers(fetchedOffers);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch offers');
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchOffers();
  }, [filter, sortBy, sortDirection, searchTerm]);
  
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };
  
  const handleDownloadPDF = async (offerId: number, offerNumber: string) => {
    try {
      await downloadOfferPDF(offerId, offerNumber);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download PDF');
    }
  };
  
  const handleDeleteClick = (offerId: number) => {
    setOfferToDelete(offerId);
    setShowDeleteModal(true);
  };
  
  const handleConfirmDelete = async () => {
    if (offerToDelete) {
      try {
        await deleteOffer(offerToDelete);
        await fetchOffers(); // Refresh the list
        setShowDeleteModal(false);
        setOfferToDelete(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete offer');
      }
    }
  };
  
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setOfferToDelete(null);
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleDateFilterChange = (field: 'dateFrom' | 'dateTo', value: string) => {
    setFilter({
      ...filter,
      [field]: value
    });
  };
  
  const clearFilters = () => {
    setFilter({});
    setSearchTerm('');
  };
  
  if (!user) {
    return null; // Will redirect via useRequireAuth
  }
  
  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Historia ofert</h1>
        <Link
          to="/offers/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Nowa oferta
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <span>{error}</span>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Filtrowanie</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Wyszukiwanie
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Numer, klient..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data od
            </label>
            <input
              type="date"
              value={filter.dateFrom || ''}
              onChange={(e) => handleDateFilterChange('dateFrom', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data do
            </label>
            <input
              type="date"
              value={filter.dateTo || ''}
              onChange={(e) => handleDateFilterChange('dateTo', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Wyczyść filtry
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="animate-pulse p-6">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        ) : offers.length === 0 ? (
          <div className="text-center py-10 px-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Brak ofert</h3>
            <p className="text-gray-600 mb-4">
              Nie znaleziono ofert spełniających kryteria wyszukiwania
            </p>
            <Link
              to="/offers/new"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Utwórz pierwszą ofertę
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('numer')}
                  >
                    <div className="flex items-center">
                      Numer oferty
                      {sortBy === 'numer' && (
                        <span className="ml-2">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('klient')}
                  >
                    <div className="flex items-center">
                      Klient
                      {sortBy === 'klient' && (
                        <span className="ml-2">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('data')}
                  >
                    <div className="flex items-center">
                      Data
                      {sortBy === 'data' && (
                        <span className="ml-2">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('suma_brutto')}
                  >
                    <div className="flex items-center">
                      Wartość
                      {sortBy === 'suma_brutto' && (
                        <span className="ml-2">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Produkty
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Akcje
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {offers.map((offer) => (
                  <tr key={offer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {offer.numer}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{offer.klient}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(offer.data).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-blue-600">
                        {formatPrice(offer.suma_brutto, 'EUR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {offer.items.length}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link
                          to={`/offers/${offer.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Szczegóły
                        </Link>
                        <button
                          onClick={() => handleDownloadPDF(offer.id!, offer.numer)}
                          className="text-green-600 hover:text-green-900"
                        >
                          PDF
                        </button>
                        <button
                          onClick={() => handleDeleteClick(offer.id!)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Usuń
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Potwierdź usunięcie
            </h3>
            <p className="text-gray-700 mb-6">
              Czy na pewno chcesz usunąć tę ofertę? Ta operacja jest nieodwracalna.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleCancelDelete}
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

export default OfferHistory;

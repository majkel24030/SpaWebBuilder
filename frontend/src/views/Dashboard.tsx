import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useRequireAuth } from '../hooks/useAuth';
import { getOffers } from '../services/offers';
import { Offer } from '../types';

const Dashboard: React.FC = () => {
  const { user } = useRequireAuth();
  const [recentOffers, setRecentOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchRecentOffers = async () => {
      try {
        setLoading(true);
        const offers = await getOffers();
        setRecentOffers(offers.slice(0, 5)); // Get 5 most recent offers
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch offers');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecentOffers();
  }, []);
  
  if (!user) {
    return null; // Will redirect via useRequireAuth
  }
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Witaj, {user.full_name}!
        </h1>
        <p className="text-gray-600 mt-2">
          Zarządzaj ofertami stolarki okiennej i drzwiowej
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Link
          to="/offers/new"
          className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 hover:bg-blue-50 transition-colors flex flex-col items-center justify-center text-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <h2 className="text-lg font-medium text-gray-800 mb-1">Utwórz nową ofertę</h2>
          <p className="text-sm text-gray-600">
            Stwórz ofertę z wielu produktów i opcji dla klienta
          </p>
        </Link>
        
        <Link
          to="/offers"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h2 className="text-lg font-medium text-gray-800 mb-1">Historia ofert</h2>
          <p className="text-sm text-gray-600">
            Przeglądaj, edytuj i generuj PDF z zapisanych ofert
          </p>
        </Link>
        
        {user.role === 'admin' && (
          <Link
            to="/admin/options"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h2 className="text-lg font-medium text-gray-800 mb-1">Panel administratora</h2>
            <p className="text-sm text-gray-600">
              Zarządzaj opcjami konfiguracji i użytkownikami
            </p>
          </Link>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4">
          Ostatnie oferty
        </h2>
        
        {loading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-14 bg-gray-200 rounded"></div>
            ))}
          </div>
        ) : error ? (
          <div className="text-red-500">
            Błąd ładowania ofert: {error}
          </div>
        ) : recentOffers.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <p>Brak ofert. Utwórz swoją pierwszą ofertę!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {recentOffers.map((offer) => (
              <Link
                key={offer.id}
                to={`/offers/${offer.id}`}
                className="block py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-gray-800">
                      {offer.numer} - {offer.klient}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {new Date(offer.data).toLocaleDateString()} • {offer.items.length} produktów
                    </p>
                  </div>
                  <div className="font-medium text-blue-600">
                    {offer.suma_brutto.toFixed(2)} EUR
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        
        {!loading && recentOffers.length > 0 && (
          <div className="mt-4 text-center">
            <Link
              to="/offers"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Zobacz wszystkie oferty →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

import React, { useEffect } from 'react';
import { useOptionsByCategory } from '../hooks/useOptions';

interface OptionSelectorProps {
  category: string;
  selectedOption: string;
  onSelect: (category: string, optionId: string) => void;
}

const OptionSelector: React.FC<OptionSelectorProps> = ({
  category,
  selectedOption,
  onSelect
}) => {
  const { options, loading, error } = useOptionsByCategory(category);
  
  // Log for debugging
  useEffect(() => {
    if (error) {
      console.error(`Error in OptionSelector for category ${category}:`, error);
    } else if (!loading && options.length === 0) {
      console.warn(`No options found for category ${category}`);
    } else if (!loading) {
      console.log(`Loaded ${options.length} options for category ${category}`);
    }
  }, [category, options, loading, error]);
  
  if (loading) {
    return <div className="animate-pulse h-12 bg-gray-200 rounded"></div>;
  }
  
  if (error) {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {category}
        </label>
        <div className="text-red-500 text-sm">
          Błąd: Nie udało się załadować opcji.
          <button 
            className="ml-2 text-blue-500 underline" 
            onClick={() => window.location.reload()}
          >
            Odśwież
          </button>
        </div>
      </div>
    );
  }
  
  if (!options.length) {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {category}
        </label>
        <div className="text-gray-500 text-sm">Brak opcji dla tej kategorii</div>
      </div>
    );
  }
  
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {category}
      </label>
      <select
        value={selectedOption}
        onChange={(e) => onSelect(category, e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Wybierz opcję</option>
        {options.map(option => (
          <option key={option.id_opcji} value={option.id_opcji}>
            {option.nazwa} {option.cena_netto_eur > 0 ? `(+${option.cena_netto_eur} EUR)` : ''}
          </option>
        ))}
      </select>
    </div>
  );
};

export default OptionSelector;

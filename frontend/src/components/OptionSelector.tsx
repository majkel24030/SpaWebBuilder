import React from 'react';
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
  
  if (loading) {
    return <div className="animate-pulse h-12 bg-gray-200 rounded"></div>;
  }
  
  if (error) {
    return <div className="text-red-500">Błąd: {error}</div>;
  }
  
  if (!options.length) {
    return <div className="text-gray-500">Brak opcji dla kategorii {category}</div>;
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

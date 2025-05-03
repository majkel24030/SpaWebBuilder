import React, { useEffect, useState } from 'react';
import { useRequireAuth } from '../../hooks/useAuth';
import { Option } from '../../types';
import {
  getAllOptions,
  getCategories,
  createOption,
  updateOption,
  deleteOption
} from '../../services/options';

const OptionsManagement: React.FC = () => {
  useRequireAuth(true); // Require admin role
  
  const [options, setOptions] = useState<Option[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const [newOption, setNewOption] = useState<Partial<Option>>({
    id_opcji: '',
    kategoria: '',
    nazwa: '',
    cena_netto_eur: 0
  });
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  
  // Fetch options and categories
  const fetchData = async () => {
    try {
      setLoading(true);
      const [optionsData, categoriesData] = await Promise.all([
        getAllOptions(),
        getCategories()
      ]);
      setOptions(optionsData);
      setCategories(categoriesData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, []);
  
  // Handle input change for new/edit option form
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    form: 'new' | 'edit'
  ) => {
    const { name, value } = e.target;
    
    if (form === 'new') {
      setNewOption({
        ...newOption,
        [name]: name === 'cena_netto_eur' ? parseFloat(value) : value
      });
    } else if (selectedOption) {
      setSelectedOption({
        ...selectedOption,
        [name]: name === 'cena_netto_eur' ? parseFloat(value) : value
      });
    }
  };
  
  // Add new option
  const handleAddOption = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createOption(newOption as Omit<Option, 'id'>);
      setShowAddModal(false);
      setNewOption({
        id_opcji: '',
        kategoria: '',
        nazwa: '',
        cena_netto_eur: 0
      });
      fetchData(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add option');
    }
  };
  
  // Edit option
  const handleEditOption = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedOption) return;
    
    try {
      await updateOption(selectedOption.id_opcji, selectedOption);
      setShowEditModal(false);
      setSelectedOption(null);
      fetchData(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update option');
    }
  };
  
  // Delete option
  const handleDeleteOption = async () => {
    if (!selectedOption) return;
    
    try {
      await deleteOption(selectedOption.id_opcji);
      setShowDeleteModal(false);
      setSelectedOption(null);
      fetchData(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete option');
    }
  };
  
  // Open edit modal
  const openEditModal = (option: Option) => {
    setSelectedOption(option);
    setShowEditModal(true);
  };
  
  // Open delete modal
  const openDeleteModal = (option: Option) => {
    setSelectedOption(option);
    setShowDeleteModal(true);
  };
  
  // Filter options by category
  const filteredOptions = categoryFilter
    ? options.filter(option => option.kategoria === categoryFilter)
    : options;
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Zarządzanie opcjami produktów</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Dodaj nową opcję
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <span>{error}</span>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center space-x-4">
          <label className="block text-sm font-medium text-gray-700">
            Filtruj po kategorii:
          </label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="">Wszystkie kategorie</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="animate-pulse p-6">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        ) : filteredOptions.length === 0 ? (
          <div className="text-center py-10 px-6">
            <h3 className="text-lg font-medium text-gray-800 mb-2">Brak opcji</h3>
            <p className="text-gray-600">Nie znaleziono opcji spełniających kryteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID opcji</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategoria</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nazwa</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cena netto (EUR)</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Akcje</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOptions.map((option) => (
                  <tr key={option.id_opcji}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{option.id_opcji}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{option.kategoria}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{option.nazwa}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{option.cena_netto_eur.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => openEditModal(option)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edytuj
                        </button>
                        <button
                          onClick={() => openDeleteModal(option)}
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
      
      {/* Add Option Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Dodaj nową opcję
            </h3>
            <form onSubmit={handleAddOption}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">ID opcji</label>
                  <input
                    type="text"
                    name="id_opcji"
                    value={newOption.id_opcji}
                    onChange={(e) => handleInputChange(e, 'new')}
                    required
                    placeholder="np. KOL005"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Kategoria</label>
                  <input
                    type="text"
                    name="kategoria"
                    value={newOption.kategoria}
                    onChange={(e) => handleInputChange(e, 'new')}
                    required
                    placeholder="np. Kolor"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nazwa</label>
                  <input
                    type="text"
                    name="nazwa"
                    value={newOption.nazwa}
                    onChange={(e) => handleInputChange(e, 'new')}
                    required
                    placeholder="np. Antracyt obustronny"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cena netto (EUR)</label>
                  <input
                    type="number"
                    name="cena_netto_eur"
                    value={newOption.cena_netto_eur}
                    onChange={(e) => handleInputChange(e, 'new')}
                    required
                    step="0.01"
                    min="0"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
              <div className="mt-5 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700"
                >
                  Dodaj opcję
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Edit Option Modal */}
      {showEditModal && selectedOption && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Edytuj opcję
            </h3>
            <form onSubmit={handleEditOption}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">ID opcji</label>
                  <input
                    type="text"
                    name="id_opcji"
                    value={selectedOption.id_opcji}
                    disabled
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Kategoria</label>
                  <input
                    type="text"
                    name="kategoria"
                    value={selectedOption.kategoria}
                    onChange={(e) => handleInputChange(e, 'edit')}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nazwa</label>
                  <input
                    type="text"
                    name="nazwa"
                    value={selectedOption.nazwa}
                    onChange={(e) => handleInputChange(e, 'edit')}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cena netto (EUR)</label>
                  <input
                    type="number"
                    name="cena_netto_eur"
                    value={selectedOption.cena_netto_eur}
                    onChange={(e) => handleInputChange(e, 'edit')}
                    required
                    step="0.01"
                    min="0"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
              <div className="mt-5 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700"
                >
                  Zapisz zmiany
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedOption && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Potwierdź usunięcie
            </h3>
            <p className="text-gray-700 mb-6">
              Czy na pewno chcesz usunąć opcję <span className="font-medium">{selectedOption.nazwa}</span> z kategorii <span className="font-medium">{selectedOption.kategoria}</span>? Ta operacja jest nieodwracalna.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Anuluj
              </button>
              <button
                onClick={handleDeleteOption}
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

export default OptionsManagement;

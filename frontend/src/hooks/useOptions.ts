import { useState, useEffect } from 'react';
import { Option, OptionsByCategory } from '../types';
import { 
  getAllOptions, 
  getOptionsByCategory, 
  getOptionsGroupedByCategory,
  getCategories
} from '../services/options';

/**
 * Hook to fetch all options
 */
export const useOptions = () => {
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoading(true);
        const data = await getAllOptions();
        setOptions(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch options');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOptions();
  }, []);
  
  return { options, loading, error };
};

/**
 * Hook to fetch options by category
 */
export const useOptionsByCategory = (category: string) => {
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoading(true);
        const data = await getOptionsByCategory(category);
        setOptions(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch options');
      } finally {
        setLoading(false);
      }
    };
    
    if (category) {
      fetchOptions();
    }
  }, [category]);
  
  return { options, loading, error };
};

/**
 * Hook to fetch options grouped by category
 */
export const useOptionsGrouped = () => {
  const [optionsByCategory, setOptionsByCategory] = useState<OptionsByCategory>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoading(true);
        const data = await getOptionsGroupedByCategory();
        setOptionsByCategory(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch options');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOptions();
  }, []);
  
  return { optionsByCategory, loading, error };
};

/**
 * Hook to fetch all categories
 */
export const useCategories = () => {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await getCategories();
        setCategories(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch categories');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);
  
  return { categories, loading, error };
};

/**
 * Find an option based on its ID from a list of options
 */
export const findOptionById = (options: Option[], id: string): Option | undefined => {
  return options.find(option => option.id_opcji === id);
};

/**
 * Calculate the net price for a set of selected options
 */
export const calculateOptionsPrice = (
  selectedOptions: Record<string, string>,
  allOptions: Option[]
): number => {
  let totalPrice = 0;
  
  console.log("Calculating price for options:", selectedOptions);
  
  // Get array of option IDs from the selected options object
  const optionIds = Object.values(selectedOptions);
  console.log("Option IDs to price:", optionIds);
  
  if (optionIds.length === 0) {
    console.log("No options selected, price is 0");
    return 0;
  }
  
  // Price each option
  optionIds.forEach(optionId => {
    if (!optionId) return; // Skip empty options
    
    const option = findOptionById(allOptions, optionId);
    if (option) {
      console.log(`Option ${option.id_opcji} (${option.nazwa}) price: ${option.cena_netto_eur} EUR`);
      totalPrice += option.cena_netto_eur;
    } else {
      console.warn(`Option with ID ${optionId} not found in available options`);
    }
  });
  
  console.log("Total options price:", totalPrice);
  return totalPrice;
};

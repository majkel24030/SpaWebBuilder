import { Option, OptionsByCategory } from '../types';
import { request } from './api';

/**
 * Get all configuration options
 */
export const getAllOptions = async (): Promise<Option[]> => {
  return request<Option[]>({
    url: '/options/',
    method: 'GET'
  });
};

/**
 * Get options by category
 */
export const getOptionsByCategory = async (category: string): Promise<Option[]> => {
  return request<Option[]>({
    url: `/options/category/${encodeURIComponent(category)}`,
    method: 'GET'
  });
};

/**
 * Get all categories
 */
export const getCategories = async (): Promise<string[]> => {
  return request<string[]>({
    url: '/options/categories',
    method: 'GET'
  });
};

/**
 * Get all options grouped by category
 */
export const getOptionsGroupedByCategory = async (): Promise<OptionsByCategory> => {
  const options = await getAllOptions();
  
  return options.reduce((acc: OptionsByCategory, option) => {
    if (!acc[option.kategoria]) {
      acc[option.kategoria] = [];
    }
    acc[option.kategoria].push(option);
    return acc;
  }, {});
};

/**
 * Get option details by ID
 */
export const getOptionById = async (id: string): Promise<Option> => {
  return request<Option>({
    url: `/options/${encodeURIComponent(id)}`,
    method: 'GET'
  });
};

/**
 * Admin: Create a new option
 */
export const createOption = async (option: Omit<Option, 'id_opcji'>): Promise<Option> => {
  return request<Option>({
    url: '/options/',
    method: 'POST',
    data: option
  });
};

/**
 * Admin: Update an option
 */
export const updateOption = async (id: string, option: Partial<Option>): Promise<Option> => {
  return request<Option>({
    url: `/options/${encodeURIComponent(id)}`,
    method: 'PUT',
    data: option
  });
};

/**
 * Admin: Delete an option
 */
export const deleteOption = async (id: string): Promise<void> => {
  return request<void>({
    url: `/options/${encodeURIComponent(id)}`,
    method: 'DELETE'
  });
};
import apiClient from './apiClient';
import type { Category } from '../types/category';

// Archivo para datos generales como categorías y distritos


export const fetchCategories = async (token: string): Promise<Category[]> => {
  const { data } = await apiClient.get('/categories', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

// Podríamos agregar fetchDistricts aquí en el futuro
import apiClient from './apiClient';
import type { Category } from '../types/category';
import type { District } from '../types/district';


// Archivo para datos generales como categorías y distritos

export const fetchCategories = async (token: string): Promise<Category[]> => {
  const { data } = await apiClient.get('/categories', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const fetchDistricts = async (token: string): Promise<District[]> => {
  const { data } = await apiClient.get('/districts', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};


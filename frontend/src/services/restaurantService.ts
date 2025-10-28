import apiClient from './apiClient';
import type { RestaurantDTO, OwnerRestaurantDTO, RestaurantWithDiscounts, RestaurantSearchResponse } from '../types/restaurant';

export async function fetchRestaurants(token?: string): Promise<RestaurantDTO[]> {
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`; //quitar esto ¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡
  }
  const res = await apiClient.get<RestaurantDTO[]>("/restaurants", {
    headers,
  });
  return res.data;
}

export async function fetchOwnerRestaurants(token: string): Promise<OwnerRestaurantDTO[]> {
  const res = await apiClient.get<OwnerRestaurantDTO[]>('/restaurants/owner', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

export const createRestaurant = async (data: FormData, token: string): Promise<OwnerRestaurantDTO> => {
  const res = await apiClient.post("/restaurants", data, {
    headers: {
      "Authorization": `Bearer ${token}`,
      'Content-Type': 'multipart/form-data', //Para subir imágenes en un formulario con el middleware Multer, hay que usar FormData (y el tipo de contenido multipart/form-data
    },
  });
  return res.data;
}
export async function fetchRestaurantById(id: string, token?: string): Promise<RestaurantDTO> {
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await apiClient.get<RestaurantDTO>(`/restaurants/${id}`, {
    headers,
  });
  return res.data;
}

export async function fetchRestaurantsWithDiscounts(): Promise<RestaurantWithDiscounts[]> {
  const response = await apiClient.get<RestaurantWithDiscounts[]>('/restaurants/with-discounts');
  return response.data;
}

type SearchMode = 'results' | 'suggestions';

interface SearchOptions {
  limit?: number;
  suggestionsLimit?: number;
  mode?: SearchMode;
}

export async function searchRestaurants(
  query: string,
  options: SearchOptions = {},
): Promise<RestaurantSearchResponse> {
  const params: Record<string, string | number> = { query };

  if (typeof options.limit === 'number') {
    params.limit = options.limit;
  }

  if (typeof options.suggestionsLimit === 'number') {
    params.suggestionsLimit = options.suggestionsLimit;
  }

  if (options.mode) {
    params.mode = options.mode;
  }

  const response = await apiClient.get<RestaurantSearchResponse>('/restaurants/search', { params });
  return response.data;
}



export async function fetchRestaurantDetailsForOwner(id: string, token: string) {
  const res = await apiClient.get(`/restaurants/${id}/details`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

export async function updateRestaurant(id: string, data: FormData, token: string): Promise<OwnerRestaurantDTO> {
  const res = await apiClient.put(`/restaurants/${id}`, data, {
    headers: {
      "Authorization": `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
}

export async function deleteRestaurant(id: string, token: string): Promise<{ message: string; status: number }> {
  const response = await apiClient.delete(`/restaurants/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}





export async function fetchSearchSuggestions(
  query: string,
  suggestionsLimit = 6,
): Promise<RestaurantSearchResponse> {
  return searchRestaurants(query, { suggestionsLimit, mode: 'suggestions' });
}
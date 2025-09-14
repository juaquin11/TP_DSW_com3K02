import apiClient from './apiClient';
import type { RestaurantDTO, OwnerRestaurantDTO, CreateRestaurantDTO} from '../types/restaurant';

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

export async function createRestaurant(data: CreateRestaurantDTO, token: string): Promise<RestaurantDTO> {
  const res = await apiClient.post("/restaurants", data, {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });
  return res.data;
}

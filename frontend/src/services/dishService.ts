import apiClient from './apiClient';
import type { Dish } from '../types/dish';


export async function fetchDishesByRestaurant(
  restaurantId: string,
  token?: string
): Promise<Dish[]> {
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await apiClient.get<{ data: Dish[] }>(`/dishes/restaurant/${restaurantId}`, {
    headers,
  });
  return res.data.data;
}

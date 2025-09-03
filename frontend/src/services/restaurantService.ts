import apiClient from './apiClient';
import type { RestaurantDTO } from '../types/restaurant';

export async function fetchRestaurants(token?: string): Promise<RestaurantDTO[]> {
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await apiClient.get<RestaurantDTO[]>("/restaurants", {
    headers,
  });
  return res.data;
}
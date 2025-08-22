import axios from 'axios';
import type { RestaurantDTO } from '../types/restaurant';

const API_BASE = 'http://localhost:3000/api';

export async function fetchRestaurants(token?: string): Promise<RestaurantDTO[]> {
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await axios.get<RestaurantDTO[]>(`${API_BASE}/restaurants`, {
    headers,
  });
  return res.data;
}
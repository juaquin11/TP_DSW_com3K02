import axios from 'axios';
import type { RestaurantDTO } from '../types/restaurant';

const API_BASE = 'http://localhost:3000/api';



export async function fetchRestaurants(): Promise<RestaurantDTO[]> {
  const res = await axios.get<RestaurantDTO[]>(`${API_BASE}/restaurants`);
  return res.data;
}

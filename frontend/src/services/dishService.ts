import apiClient from './apiClient';
import type { Dish } from '../types/dish';

export interface DishWithDiscount extends Dish {
  subscription_discount?: number; // Porcentaje de descuento si existe
}

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

export async function fetchDishesWithDiscounts(
  restaurantId: string,
  token: string,
  subscriptionId: string
): Promise<DishWithDiscount[]> {
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await apiClient.get<{ data: DishWithDiscount[] }>(`/dishes/restaurant/discounts/${restaurantId}/${subscriptionId}`, 
    {
      headers,
    }
  );
  return res.data.data;  
}


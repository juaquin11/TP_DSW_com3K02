import apiClient from './apiClient';
import type { Dish } from '../types/dish';

export interface DishWithDiscount extends Dish {
  subscription_discount?: number;
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
  const headers: Record<string, string> = {
    "Authorization": `Bearer ${token}`
  };
  const encodedSubscriptionId = encodeURIComponent(subscriptionId);

const res = await apiClient.get<{ data: DishWithDiscount[] }>(`/dishes/restaurant/${restaurantId}/discounts/${encodedSubscriptionId}`, {    headers,
  });
  return res.data.data;
}

export const createDish = async (data: FormData, token: string): Promise<Dish> => {
  const res = await apiClient.post("/dishes", data, {
    headers: {
      "Authorization": `Bearer ${token}`,
      'Content-Type': 'multipart/form-data', // Correcto
    },
  });
  return res.data.data;
};

export const updateDish = async (
  dishName: string, 
  restaurantId: string, 
  data: FormData, // AHORA ACEPTA FORMDATA
  token: string
): Promise<Dish> => {
  
  const res = await apiClient.put(
    `/dishes/${dishName}/${restaurantId}`, 
    data, // Envía FormData
    {
      headers: {
        "Authorization": `Bearer ${token}`,
        'Content-Type': 'multipart/form-data', // MUY IMPORTANTE
      },
    }
  );
  return res.data.data;
};


export interface JwtPayload {
  id_user: string;
  type: string; // 'owner' | 'client' etc.
  iat?: number;
  exp?: number;
}

export type RestaurantWithRating = {
  id_restaurant: string;
  name: string;
  chair_amount: number;
  chair_available: number;
  street: string;
  height: string;
  image?: string | null;
  opening_time: string;
  closing_time: string;
  id_owner: string;
  id_district: string;
  status: number;
  avgRating: number | null;
  reviewCount: number;
  districtName?: string | null;
};

export type OwnerRestaurant = {
  id_restaurant: string;
  name: string;
  chair_amount: number;
  chair_available: number;
  street: string;
  height: string;
  image?: string | null;
  opening_time: string;
  closing_time: string;
  id_owner: string;
  id_district: string;
  status: number;
  districtName?: string | null;
};

export interface CreateRestaurantPayload {
  name: string;
  chair_amount: number;
  street: string;
  height: string;
  opening_time: string;
  closing_time: string;
  id_owner: string;
  id_district: string;
  categories: string[];
}
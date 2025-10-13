export type RestaurantDTO = {
  id_restaurant: string;
  name: string;
  chair_amount: number;
  chair_available: number;
  street: string;
  height: string;
  image?: string | null;
  opening_time: string;
  closing_time: string;
  id_district: string;
  status: number;
  avgRating: number | null;
  reviewCount: number;
  districtName?: string | null;
};

export type OwnerRestaurantDTO = {
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

export type CreateRestaurantDTO = {
  name: string;
  chair_amount: number;
  street: string;
  height: string;
  opening_time: string;
  closing_time: string;
  id_district: string;
  id_category: string[];
  image?: string;
};

export type RestaurantWithDiscounts = RestaurantDTO & {
  subscriptionNames: string;
};

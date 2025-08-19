export type RestaurantDTO = {
  id_restaurant: string;
  name: string;
  chair_amount: number;
  chair_available: number;
  street: string;
  height: string;
  image?: string | null;
  opening_time: string; // will be ISO string from backend JSON -- "conversion"
  closing_time: string;
  id_district: string;
  status: number;
  avgRating: number | null;
  reviewCount: number;
  districtName?: string | null;
};
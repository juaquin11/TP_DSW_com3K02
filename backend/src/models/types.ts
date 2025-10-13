export interface JwtPayload {
  id_user: string;
  type: string; // 'owner' | 'client' etc.
  iat?: number;
  exp?: number;
}

export interface CreateReservationPayload {
  id_restaurant: string;
  reservation_date: string;
  diners: number;
}

export interface CreateReservationData {
  id_restaurant: string;
  reservation_date: Date;
  diners: number;
  id_client: string;
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
  id_district: string;
  id_category: string[]; // Cambiado de 'categories' para mayor claridad
  image: string;
}

export type RestaurantWithDiscounts = RestaurantWithRating & {
  subscriptionNames: string | null;
};

export interface ReviewWithDetails  {
  review_number: number;
  rating: number;
  comment: string | null;
  reservation_date: string;
  diners: number;
  client_name: string;
  client_email: string;
}

export interface UserProfileReservation {
  id_reservation: string;
  reservation_date: Date;
  diners: number;
  status: number;
  restaurant: {
    id_restaurant: string;
    name: string;
  };
  review: {
    rating: number;
  } | null;
}

export interface UserProfile {
  id_user: string;
  name: string | null;
  email: string;
  phone: string;
  type: string;
  subscription?: {
    plan_name: string;
    adhesion_date: Date;
  } | null;
  penalties: {
    penalty_start_date: Date;
    penalty_end_date: Date;
    client_reason: string | null;
  }[];
  reservations: UserProfileReservation[];
}


export interface UserProfileReservation {
  id_reservation: string;
  reservation_date: string; // string
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

export interface UserProfilePenalty {
  penalty_start_date: string;
  penalty_end_date: string;
  client_reason: string | null;
}

export interface UserProfile {
  id_user: string;
  name: string | null;
  email: string;
  phone: string;
  type: 'client' | 'owner';
  subscription?: {
    plan_name: string;
    adhesion_date: string;
    expiry_date: string; 
  } | null;
  penalties: UserProfilePenalty[];
  reservations: UserProfileReservation[];
}
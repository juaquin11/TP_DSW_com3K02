export interface ReviewDTO  {
  review_number: number;
  rating: number;
  comment: string | null;
  reservation_date: string;
  diners: number;
  client_name: string;
  client_email: string;
}
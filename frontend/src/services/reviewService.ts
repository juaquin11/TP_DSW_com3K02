import apiClient from './apiClient';
import type { ReviewDTO } from '../types/review';

export async function fetchReviewsByRestaurant(
  restaurantId: string,
): Promise<ReviewDTO[]> {
  const response = await apiClient.get<ReviewDTO[]>(`/reviews/byrestaurant/${restaurantId}`);

  return response.data;
}

export const postReview = async (data: { reservationId: string; rating: number; comment: string }, token: string): Promise<void> => {
  await apiClient.post('/reviews', data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

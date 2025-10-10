import { Request, Response } from 'express';
import * as reviewService from '../services/review.service';

export async function getRestaurantReviews(req: Request, res: Response) {
  try {
    const  restaurantId  = req.params.restaurantId;

    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurant ID is required' });
    }

    const reviews = await reviewService.getRecentReviewsByRestaurant(restaurantId);
    return res.json(reviews);
    
  } catch (err: any) {
    console.error('Error fetching restaurant reviews', err);
    return res.status(500).json({ error: 'Failed to fetch reviews' });
  }
}

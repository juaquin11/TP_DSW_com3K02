// controller: http layer
import { Request, Response } from 'express';
import * as restaurantService from '../services/restaurant.service';

export async function listRestaurants(req: Request, res: Response) {
  try {
    const restaurants = await restaurantService.getAllRestaurantsOrderedByRating();
    // return JSON (frontend will filter & render)
    return res.json(restaurants);
  } catch (err: any) {
    console.error('Error listing restaurants', err);
    return res.status(500).json({ error: 'Failed to fetch restaurants' });
  }
}

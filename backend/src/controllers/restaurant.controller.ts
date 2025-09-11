import { Request, Response } from 'express';
import * as restaurantService from '../services/restaurant.service';
import { JwtPayload } from '../models/types';


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

export async function listOwnerRestaurants(req: Request, res: Response) {
  try {
    const user = (req as any).user as JwtPayload;
    if (!user || user.type !== 'owner') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const restaurants = await restaurantService.getOwnerRestaurants(user.id_user);
    return res.json(restaurants);
  } catch (err: any) {
    console.error('Error listing owner restaurants', err);
    return res.status(500).json({ error: 'Failed to fetch restaurants for owner' });
  }
}

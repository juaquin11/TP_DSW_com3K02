import { Request, Response } from 'express';
import * as restaurantService from '../services/restaurant.service';
import { JwtPayload, CreateRestaurantPayload} from '../models/types';


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

export async function createRestaurant(req: Request, res: Response) {
  try {
    const user = (req as any).user as JwtPayload;
    if (user.type !== 'owner') {
      return res.status(403).json({ error: 'Acceso denegado. Solo los dueños pueden crear restaurantes.' });
    }

    const restaurantData: CreateRestaurantPayload = req.body;

    // Validación de campos no vacíos
    const requiredFields: (keyof CreateRestaurantPayload)[] = ['name', 'chair_amount', 'street', 'height', 'opening_time', 'closing_time', 'id_district', 'id_category'];
    for (const field of requiredFields) {
      if (!restaurantData[field] || (Array.isArray(restaurantData[field]) && restaurantData[field].length === 0)) {
        return res.status(400).json({ error: `El campo '${field}' es requerido y no puede estar vacío.` });
      }
    }

    const newRestaurant = await restaurantService.createRestaurant(restaurantData, user.id_user);
    res.status(201).json(newRestaurant);
  } catch (error: any) {
    console.error('Error al crear el restaurante:', error);
    // Error de Prisma para violación de llave única
    if (error.code === 'P2002') {
        return res.status(409).json({ error: 'Ya existe un restaurante con ese nombre.' });
    }
    res.status(500).json({ error: 'Error interno del servidor al crear el restaurante.' });
  }
}

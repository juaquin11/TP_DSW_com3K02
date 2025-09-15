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
      return res.status(403).json({ error: 'Acceso denegado.' });
    }

    const { name, chair_amount, street, height, opening_time, closing_time, id_district, id_category } = req.body;

    // Validación de campos obligatorios
    if (!name || !chair_amount || !street || !height || !opening_time || !closing_time || !id_district || !id_category) {
      return res.status(400).json({ error: 'Todos los campos de texto son requeridos.' });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'La imagen del restaurante es obligatoria.' });
    }

    const chairAmountNumber = parseInt(chair_amount, 10);
    if (isNaN(chairAmountNumber) || chairAmountNumber <= 0) {
      return res.status(400).json({ error: 'La cantidad de sillas debe ser un número mayor a 0.' });
    }
    
    const parsedCategoryIds = JSON.parse(id_category);
    if (!Array.isArray(parsedCategoryIds) || parsedCategoryIds.length === 0) {
        return res.status(400).json({ error: 'Debes seleccionar al menos una categoría.' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    const restaurantData = {
      name,
      chair_amount: chairAmountNumber,
      street,
      height,
      opening_time,
      closing_time,
      id_district,
      id_category: parsedCategoryIds,
      image: imageUrl,
    };

    const newRestaurant = await restaurantService.createRestaurant(restaurantData, user.id_user);
    res.status(201).json(newRestaurant);
  } catch (error: any) {
    console.error('Error al crear el restaurante:', error);
    if (error.code === 'P2002') {
        return res.status(409).json({ error: 'Ya existe un restaurante con ese nombre.' });
    }
    res.status(500).json({ error: 'Error interno al crear el restaurante.' });
  }
}
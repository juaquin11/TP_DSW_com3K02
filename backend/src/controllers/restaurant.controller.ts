import { Request, Response } from 'express';
import * as restaurantService from '../services/restaurant.service';
import { JwtPayload, CreateRestaurantPayload} from '../models/types';
import path from 'path';
import fs from 'fs'; // Importamos el módulo File System
  

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


function slugify(text: string): string { // proceso de convertir un nombre (texto) en un "slug", que es una versión simplificada y legible de ese nombre, diseñada para usarse en URLs de sitios web
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')           // Reemplaza espacios con -
    .replace(/[^\w\-]+/g, '')       // Quita caracteres no válidos
    .replace(/\-\-+/g, '-')         // Reemplaza múltiples - con uno solo
    .replace(/^-+/, '')             // Quita - del inicio
    .replace(/-+$/, '');            // Quita - del final
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

    const tempPath = req.file.path;
    const extension = path.extname(req.file.filename); // Usamos la extensión del archivo temporal
    const uniqueSuffix = Date.now();
    
    // Crea el nuevo nombre de archivo legible y único
    const newFileName = `${slugify(name)}-${uniqueSuffix}${extension}`;
    const newPath = path.join(path.dirname(tempPath), newFileName);

    // Renombra el archivo en el sistema de archivos
    fs.renameSync(tempPath, newPath);
    // --- Fin de la lógica ---

    const restaurantData = {
      name,
      chair_amount: chairAmountNumber,
      street,
      height,
      opening_time,
      closing_time,
      id_district,
      id_category: parsedCategoryIds,
      // Guarda la ruta relativa que usará el frontend
      image: `/uploads/${newFileName}`,
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
export async function getRestaurantById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'Restaurant ID is required' });
    }
    
    const restaurant = await restaurantService.getRestaurantById(id);
    
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    
    return res.json(restaurant);
  } catch (err: any) {
    console.error('Error fetching restaurant by ID', err);
    return res.status(500).json({ error: 'Failed to fetch restaurant' });
  }
}

export async function listRestaurantsWithDiscounts(req: Request, res: Response) {
  try {
    const restaurants = await restaurantService.getRestaurantsWithSubscriptionDiscounts();
    return res.json(restaurants);
  } catch (err: any) {
    console.error('Error listing restaurants with discounts', err);
    return res.status(500).json({ error: 'Failed to fetch restaurants with discounts' });
  }
}

export async function searchRestaurants(req: Request, res: Response) {
  try {
    const queryParam = typeof req.query.query === 'string'
      ? req.query.query
      : typeof req.query.q === 'string'
        ? req.query.q
        : '';

    const query = queryParam.trim();

    if (!query) {
      return res.status(400).json({ error: 'La consulta de búsqueda es obligatoria.' });
    }

    const limitValue = Number.parseInt(String(req.query.limit ?? ''), 10);
    const suggestionsLimitValue = Number.parseInt(String(req.query.suggestionsLimit ?? ''), 10);
    const mode = typeof req.query.mode === 'string' ? req.query.mode : 'results';
    const includeResults = mode !== 'suggestions';

    const data = await restaurantService.searchRestaurants({
      query,
      limit: Number.isNaN(limitValue) ? 12 : limitValue,
      suggestionsLimit: Number.isNaN(suggestionsLimitValue) ? 6 : suggestionsLimitValue,
      includeResults,
    });

    return res.json(data);
  } catch (err: any) {
    console.error('Error searching restaurants', err);
    return res.status(500).json({ error: 'No pudimos realizar la búsqueda.' });
  }
}

export async function getRestaurantDetailsForOwner(req: Request, res: Response) {
  try {
    const  id  = req.params.id;
    const user = (req as any).user as JwtPayload;

    if (!id) {
      return res.status(404).json({ error: 'No se recibio correctamente el id.' });
    }

    if (!user || user.type !== 'owner') {
      return res.status(403).json({ error: 'Forbidden: only owners can access this endpoint.' });
    }

    const restaurant = await restaurantService.getRestaurantDetailsForOwner(id, user.id_user);

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found or you do not have permission to view it.' });
    }

    res.json(restaurant);
  } catch (error: any) {
    console.error('Error fetching restaurant details:', error);
    res.status(500).json({ error: 'Failed to fetch restaurant details.' });
  }
}

export async function updateRestaurant(req: Request, res: Response) {
  try {
    const id  = req.params.id;
    const user = (req as any).user as JwtPayload;

    if (!id) {
      return res.status(404).json({ error: 'No se recibio correctamente el id.' });
    }
    if (!user || user.type !== 'owner') {
      return res.status(403).json({ error: 'Forbidden: only owners can update restaurants.' });
    }

    const data = { ...req.body };

    // Parsear id_category si existe
    if (data.id_category) {
      data.id_category = JSON.parse(data.id_category);
    }

    if (req.file) {
      const tempPath = req.file.path;
      const extension = path.extname(req.file.filename);
      const uniqueSuffix = Date.now();
      const newFileName = `${slugify(data.name)}-${uniqueSuffix}${extension}`;
      const newPath = path.join(path.dirname(tempPath), newFileName);

      // Renombra el archivo en el sistema de archivos
      fs.renameSync(tempPath, newPath);
      data.image = `/uploads/${newFileName}`;
    }

    const updatedRestaurant = await restaurantService.updateRestaurant(id, data, user.id_user);

    res.json(updatedRestaurant);
  } catch (error: any) {
    console.error('Error updating restaurant:', error);
    if (error.message.includes('not found') || error.message.includes('permission')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to update restaurant.' });
  }
}

export async function deleteRestaurant(req: Request, res: Response) {
  try {
    const  id  = req.params.id;
    const user = (req as any).user as JwtPayload;

    if (!id) {
      return res.status(404).json({ error: 'No se recibio correctamente el id.' });
    }

    if (!user || user.type !== 'owner') {
      return res.status(403).json({ error: 'Forbidden: only owners can delete restaurants.' });
    }

    await restaurantService.deleteRestaurant(id, user.id_user);

    res.json({ message: 'Restaurant deleted successfully.' });
  } catch (error: any) {
    console.error('Error deleting restaurant:', error);
    if (error.message.includes('not found') || error.message.includes('permission')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to delete restaurant.' });
  }
}
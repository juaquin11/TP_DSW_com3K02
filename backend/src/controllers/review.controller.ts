import { Request, Response } from 'express';
import * as reviewService from '../services/review.service';
import { JwtPayload } from '../models/types';


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

export async function postReview(req: Request, res: Response) {
  try {
    const userPayload = (req as any).user as JwtPayload;
    const { reservationId, rating, comment } = req.body;

    // Validaciones básicas
    if (!reservationId || !rating) {
      return res.status(400).json({ error: 'Se requiere el ID de la reserva y una puntuación.' });
    }
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'La puntuación debe ser un número entre 1 y 5.' });
    }

    const newReview = await reviewService.createReview(reservationId, userPayload.id_user, rating, comment);

    res.status(201).json({ message: 'Reseña creada con éxito', review: newReview });
  } catch (error: any) {
    console.error('Error al crear la reseña:', error);
    res.status(400).json({ error: error.message || 'No se pudo crear la reseña.' });
  }
}
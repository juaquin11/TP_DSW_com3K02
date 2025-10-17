// backend/src/controllers/reservation.controller.ts
import { Request, Response } from 'express';
import * as reservationService from '../services/reservation.service';
import { CreateReservationPayload, JwtPayload } from '../models/types';

// Mapeo de texto a estado numérico para guardar en la BD
const statusToDbMap: { [key: string]: number } = {
  'pendiente': 0,
  'aceptada': 1,
  'rechazada': 2,
  'asistencia': 3,
  'ausencia': 4,
  'cancelada': 5,
};

export async function getTodayReservations(req: Request, res: Response) {
  try {
    const { id } = req.params; // id del restaurante
        
    if (!id) {
      return res.status(400).json({ error: 'Restaurant ID is required.' });
    }

    const user = (req as any).user as JwtPayload | undefined;

    if (!user || user.type !== 'owner' || !user.id_user) {
      return res.status(403).json({ error: 'Forbidden: only restaurant owners can access reservations.' });
    }

    const reservations = await reservationService.getReservationsForToday(id, user.id_user);
    res.json(reservations);
  } catch (error: any) {
    console.error('Error fetching today\'s reservations:', error);
    res.status(500).json({ error: 'Failed to fetch reservations.' });
  }
}

export async function updateStatus(req: Request, res: Response) {
    try {
        const { id } = req.params; // id de la reserva
        const { status } = req.body; // nuevo estado en formato string
        const user = (req as any).user as JwtPayload;

        if (!id) {
            return res.status(400).json({ error: 'Reservation ID is required.' });
        }
        
        const numericStatus = statusToDbMap[status];
        if (numericStatus === undefined) {
            return res.status(400).json({ error: 'Invalid status provided.' });
        }

        await reservationService.updateReservationStatus(id, numericStatus, user.id_user);
        res.status(200).json({ message: 'Reservation status updated successfully.' });

    } catch (error: any) {
        console.error('Error updating reservation status:', error);
        if (error.code === 'P2025') {
             return res.status(404).json({ error: 'Reservation not found or you do not have permission to modify it.' });
        }
        res.status(500).json({ error: 'Failed to update reservation status.' });
    }
}

export async function createReservation(req: Request, res: Response) {
  try {
    const { restaurantId, reservationDate, diners } = req.body;

    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurant ID is required.' });
    }

    if (!reservationDate) {
      return res.status(400).json({ error: 'Reservation date is required.' });
    }

    if (diners === undefined) {
      return res.status(400).json({ error: 'Diners amount is required.' });
    }

    const user = (req as any).user as JwtPayload | undefined;

    if (!user || !user.id_user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    if (user.type !== 'client') {
      return res.status(403).json({ error: 'Only clients can create reservations.' });
    }

    const parsedDate = new Date(reservationDate);
    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: 'Invalid reservation date.' });
    }

    const dinersNumber = Number(diners);
    if (!Number.isInteger(dinersNumber) || dinersNumber <= 0) {
      return res.status(400).json({ error: 'Invalid diners amount.' });
    }

    const reservation = await reservationService.createReservation(
      restaurantId,
      user.id_user,
      parsedDate,
      dinersNumber
    );

    res.status(201).json(reservation);
  } catch (error: any) {
    console.error('Error creating reservation:', error);
    if (error.code === 'RESTAURANT_NOT_FOUND') {
      return res.status(404).json({ error: 'Restaurant not found.' });
    }
    if (error.code === 'INSUFFICIENT_CAPACITY') {
      return res.status(409).json({ error: 'The restaurant does not have enough availability for the requested diners.' });
    }
    res.status(500).json({ error: 'Failed to create reservation.' });
  }
}
export async function getUpcomingReservations(req: Request, res: Response) {
  try {
    const { id_restaurant } = req.params;
    const user = (req as any).user as JwtPayload | undefined;

    if (!id_restaurant) {
      return res.status(400).json({ error: 'Restaurant ID is required.' });
    }

    if (!user || !user.id_user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    if (user.type !== 'owner') {
      return res.status(403).json({ error: 'Forbidden: only restaurant owners can access this endpoint.' });
    }

    const reservations = await reservationService.getUpcomingReservations(id_restaurant, user.id_user);
    return res.status(200).json(reservations);
  } catch (error: any) {
    console.error('Error fetching upcoming reservations:', error);
    // Si se envía un error claro desde el service, dejarlo pasar
    if (error?.status && error?.message) {
      return res.status(error.status).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Failed to fetch upcoming reservations.' });
  }
}


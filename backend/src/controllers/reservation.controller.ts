// backend/src/controllers/reservation.controller.ts
import { Request, Response } from 'express';
import * as reservationService from '../services/reservation.service';
import { JwtPayload } from '../models/types';

// Mapeo de texto a estado numérico para guardar en la BD
const statusToDbMap: { [key: string]: number } = {
  'aceptada': 1,
  'rechazada': 2,
  'asistencia': 3,
  'ausencia': 4,
};


export async function getTodayReservations(req: Request, res: Response) {
  try {
    const { id } = req.params; // id del restaurante
        
    if (!id) {
      return res.status(400).json({ error: 'Restaurant ID is required.' });
    }

    const user = (req as any).user as JwtPayload;

    const reservations = await reservationService.getReservationsForToday(id);
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
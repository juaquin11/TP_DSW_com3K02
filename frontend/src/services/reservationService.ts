// frontend/src/services/reservationService.ts
import apiClient from './apiClient';
import type { Reservation } from '../types/reservation';

export interface CreateReservationPayload {
  restaurantId: string;
  reservationDate: string;
  chairs: number;
}


/**
 * Obtiene las reservas del día para un restaurante específico.
 * @param restaurantId El ID del restaurante.
 * @param token El token de autenticación del dueño.
 */
export const fetchReservationsForToday = async (restaurantId: string, token: string): Promise<Reservation[]> => {
  const { data } = await apiClient.get<Reservation[]>(`/reservations/restaurant/${restaurantId}/today`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

/**
 * Actualiza el estado de una reserva.
 * @param reservationId El ID de la reserva a actualizar.
 * @param status El nuevo estado para la reserva (ej: 'aceptada', 'rechazada').
 * @param token El token de autenticación del dueño.
 */
export const updateReservationStatus = async (reservationId: string, status: string, token: string): Promise<void> => {
  await apiClient.patch(`/reservations/${reservationId}/status`, { status }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const createReservation = async (
  restaurantId: string,
  reservationDate: string,
  diners: number,
  token: string
): Promise<void> => {
  await apiClient.post(
    '/reservations',
    { restaurantId, reservationDate, diners },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export async function getUpcomingReservations(idRestaurant: string, token: string) {
  const response = await apiClient.get(`/reservations/upcoming/${idRestaurant}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}
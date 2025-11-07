export type ReservationStatus = 
  | 'pendiente' 
  | 'aceptada' 
  | 'rechazada' 
  | 'asistencia'
  | 'ausencia'
  | 'cancelada';

export interface Reservation {
  id: string; // O id_reservation si viene así del backend
  clientName: string; // O el ID del cliente y luego buscamos el nombre
  time: string; // Formato HH:mm
  diners: number;
  status: ReservationStatus;
}

export interface ReservationDTO {
  id: string;
  clientName: string;
  reservationDateTime: string; // ISO format desde backend
  diners: number;
  status: ReservationStatus;
}
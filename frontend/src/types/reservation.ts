export type ReservationStatus = 
  | 'pendiente' 
  | 'aceptada' 
  | 'rechazada' 
  | 'superada' 
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
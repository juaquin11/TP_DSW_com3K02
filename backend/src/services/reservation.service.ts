// backend/src/services/reservation.service.ts
import prisma from '../prisma/client';
// import { reservation_status } from '../generated/prisma';

// Mapeo de estado numérico a texto para consistencia con el frontend
const statusMap: { [key: number]: string } = {
  0: 'pendiente',
  1: 'aceptada',
  2: 'rechazada',
  3: 'asistencia',
  4: 'ausencia',
  5: 'cancelada',
};

export async function getReservationsForToday(restaurantId: string) {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  const reservations = await prisma.reservation.findMany({
    where: {
      id_restaurant: restaurantId,
      reservation_date: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    include: {
      useraccount: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      reservation_date: 'asc',
    },
  });

  const now = new Date();

  return reservations.map(res => {
    let currentStatus = statusMap[res.status] || 'desconocido';

    // Lógica para determinar si la reserva "superó la hora"
    if ((currentStatus === 'pendiente' || currentStatus === 'aceptada') && res.reservation_date < now) {
      currentStatus = 'superada';
    }

    return {
      id: res.id_reservation,
      clientName: res.useraccount.name,
      time: res.reservation_date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      diners: res.diners,
      status: currentStatus,
    };
  });
}

export async function updateReservationStatus(reservationId: string, newStatus: number, ownerId: string) {
    // Verificamos que el dueño que hace la petición es el dueño del restaurante de la reserva.
    const reservation = await prisma.reservation.findFirstOrThrow({
        where: {
            id_reservation: reservationId,
            restaurant: {
                id_owner: ownerId,
            }
        }
    });

    return prisma.reservation.update({
        where: {
            id_reservation: reservation.id_reservation
        },
        data: {
            status: newStatus
        }
    });
}
// backend/src/services/reservation.service.ts
import prisma from '../prisma/client';
import { CreateReservationData } from '../models/types';

// Mapeo de estado numérico a texto para consistencia con el frontend
const statusMap: { [key: number]: string } = {
  0: 'pendiente',
  1: 'aceptada',
  2: 'rechazada',
  3: 'asistencia',
  4: 'ausencia',
  5: 'cancelada',
};

export async function getReservationsForToday(restaurantId: string, ownerId: string) {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  const reservations = await prisma.reservation.findMany({
    where: {
      id_restaurant: restaurantId,
      restaurant: {
        id_owner: ownerId,
      },
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

export async function createReservation(
  restaurantId: string,
  clientId: string,
  reservationDate: Date,
  diners: number
) {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id_restaurant: restaurantId },
    select: {
      id_restaurant: true,
      chair_amount: true,
    },
  });

  if (!restaurant) {
    const error: any = new Error('Restaurant not found');
    error.code = 'RESTAURANT_NOT_FOUND';
    throw error;
  }

  const occupied = await prisma.reservation.aggregate({
    where: {
      id_restaurant: restaurantId,
      status: { in: [0, 1] },
    },
    _sum: {
      diners: true,
    },
  });

  const occupiedSeats = occupied._sum?.diners ?? 0;
  const availableSeats = restaurant.chair_amount - occupiedSeats;

  if (diners > availableSeats) {
    const error: any = new Error('Not enough availability');
    error.code = 'INSUFFICIENT_CAPACITY';
    throw error;
  }

  return prisma.reservation.create({
    data: {
      id_restaurant: restaurantId,
      id_client: clientId,
      reservation_date: reservationDate,
      diners,
    },
  });
}

export async function getUpcomingReservations(restaurantId: string, ownerId: string) {
  // Verificamos que el restaurante pertenezca al owner
  const restaurant = await prisma.restaurant.findUnique({
    where: { id_restaurant: restaurantId },
    select: { id_restaurant: true, id_owner: true },
  });

  if (!restaurant) {
    const err: any = new Error('Restaurant not found');
    err.status = 404;
    err.message = 'Restaurant not found';
    throw err;
  }

  if (restaurant.id_owner !== ownerId) {
    const err: any = new Error('Forbidden');
    err.status = 403;
    err.message = 'You do not have permission to access reservations for this restaurant';
    throw err;
  }

  const now = new Date();

  const reservations = await prisma.reservation.findMany({
    where: {
      id_restaurant: restaurantId,
      reservation_date: {
        gte: now, // fecha/hora >= ahora => aún no cumplió
      },
    },
    include: {
      useraccount: {
        select: {
          name: true,
          id_user: true,
        },
      },
    },
    orderBy: {
      reservation_date: 'asc',
    },
  });

  // Mapear a formato frontend-friendly con ISO DateTime completo
  return reservations.map((r) => {
    const reservationDateObj = new Date(r.reservation_date);

    return {
      id: r.id_reservation,
      clientName: r.useraccount?.name ?? 'Anónimo',
      time: reservationDateObj.toISOString(), // Fecha completa ISO: YYYY-MM-DDTHH:mm:ss.sssZ
      diners: r.diners,
      status: statusMap[r.status] ?? 'desconocido',
    };
  });
}
import prisma from '../prisma/client';
import { Prisma } from '../generated/prisma';
import { ReviewWithDetails } from '../models/types';

export async function getRecentReviewsByRestaurant(
  restaurantId: string,
): Promise<ReviewWithDetails[]> {
  const result = await prisma.$queryRaw<ReviewWithDetails[]>(Prisma.sql`
    SELECT 
      rev.review_number,
      rev.rating,
      rev.comment,
      DATE_FORMAT(res.reservation_date, '%Y-%m-%d %H:%i:%s') AS reservation_date,
      res.diners,
      u.name AS client_name,
      u.email AS client_email
    FROM review AS rev
    INNER JOIN reservation AS res ON rev.id_reservation = res.id_reservation
    INNER JOIN useraccount AS u ON res.id_client = u.id_user
    WHERE res.id_restaurant = ${restaurantId}
    ORDER BY res.reservation_date DESC
    LIMIT 15;
  `);

  return result;
}

/**
 * Crea una nueva reseña para una reserva específica.
 * Verifica que la reserva pertenezca al usuario y que esté en estado 'asistencia'.
 * @param reservationId El ID de la reserva a reseñar.
 * @param userId El ID del usuario que crea la reseña.
 * @param rating La puntuación de 1 a 5.
 * @param comment El comentario opcional.
 */
export async function createReview(reservationId: string, userId: string, rating: number, comment?: string) {
  // Usamos una transacción para asegurar la integridad de los datos
  return prisma.$transaction(async (tx) => {
    // 1. Validar la reserva
    const reservation = await tx.reservation.findFirst({
      where: {
        id_reservation: reservationId,
        id_client: userId,
        status: 3, // Solo se pueden reseñar reservas con 'asistencia' (status 3)
      },
    });

    if (!reservation) {
      throw new Error('Reserva no válida para reseñar. O no te pertenece, o no has asistido.');
    }

    // 2. Crear la reseña
    const newReview = await tx.review.create({
      data: {
        id_reservation: reservationId,
        rating: rating,
        comment: comment ?? null, 
      },
    });

    return newReview;
  });
}
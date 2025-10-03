import prisma from '../prisma/client';
import { JwtPayload } from '../models/types';

/**
 * Obtiene el estado dinámico de un usuario (suscripciones, penalizaciones, notificaciones).
 * @param user Payload del JWT del usuario autenticado.
 */
export async function getUserStatus(user: JwtPayload) {
  const { id_user, type } = user;

  // 1. Chequea suscripción activa
  const subscription = await prisma.has_subscription.findUnique({
    where: { id_client: id_user },
  });
  const hasActiveSubscription = !!subscription;

  // 2. Chequea penalización activa
  const now = new Date();
  const activePenalty = await prisma.penalty.findFirst({
    where: {
      id_client: id_user,
      penalty_end_date: { gte: now },
    },
  });
  const hasActivePenalty = !!activePenalty;

  // 3. Calcula notificaciones según el tipo de usuario
  let notificationCount = 0;
  if (type === 'client') {
    // Para clientes: reservas con asistencia (status 3) sin reseña.
    notificationCount = await prisma.reservation.count({
      where: {
        id_client: id_user,
        status: 3,
        review: null,
      },
    });
  } else if (type === 'owner') {
    // Para dueños: reservas pendientes de gestión (status 0).
    notificationCount = await prisma.reservation.count({
      where: {
        restaurant: { id_owner: id_user },
        status: 0,
      },
    });
  }

  return {
    hasActiveSubscription,
    hasActivePenalty,
    notificationCount,
  };
}

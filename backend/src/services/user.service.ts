import prisma from '../prisma/client';
import { JwtPayload, UserProfile} from '../models/types';

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

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const user = await prisma.useraccount.findUnique({
    where: { id_user: userId },
    select: {
      id_user: true,
      name: true,
      email: true,
      phone: true,
      type: true,
      // Incluimos datos solo si es un cliente
      has_subscription: {
        select: {
          adhesion_date: true,
          subscription: {
            select: {
              plan_name: true,
            },
          },
        },
      },
      penalty: {
        select: {
          penalty_start_date: true,
          penalty_end_date: true,
          client_reason: true,
        },
        orderBy: {
          penalty_start_date: 'desc',
        },
      },
      reservation: {
        select: {
          id_reservation: true,
          reservation_date: true,
          diners: true,
          status: true,
          restaurant: {
            select: {
              id_restaurant: true,
              name: true,
            },
          },
          review: {
            select: {
              rating: true,
            },
          },
        },
        orderBy: {
          reservation_date: 'desc',
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  // Aplanamos la estructura de la suscripción para que sea más fácil de usar en el frontend
  const { has_subscription, penalty, reservation, ...userData } = user;
  const profile: UserProfile = {
    ...userData,
    subscription: has_subscription
      ? {
          plan_name: has_subscription.subscription.plan_name,
          adhesion_date: has_subscription.adhesion_date,
        }
      : null,
    penalties: penalty,
    reservations: reservation,
  };

  return profile;
}

export async function updateUserProfile(userId: string, data: { name?: string; phone?: string }) {
  // Objeto para almacenar los datos que realmente se van a actualizar
  const updateData: { name?: string; phone?: string } = {};

  // Añadimos las propiedades al objeto solo si no son undefined
  if (data.name !== undefined) {
    updateData.name = data.name;
  }
  if (data.phone !== undefined) {
    updateData.phone = data.phone;
  }

  // Usamos 'update' de Prisma con el objeto de datos limpio
  return prisma.useraccount.update({
    where: { id_user: userId },
    data: updateData, // <--- La corrección clave está aquí
    // Devolvemos solo los campos públicos del usuario
    select: {
      id_user: true,
      name: true,
      email: true,
      phone: true,
      type: true,
    },
  });
}

import prisma from '../prisma/client';

export async function linkDishToSubscription(
  dish_name: string,
  id_restaurant: string,
  id_subscription: string,
  discount: number
) {
  // Usamos upsert para crear la relación si no existe, o actualizarla si ya existe.
  return prisma.dish_subscription.upsert({
    where: {
      dish_name_id_restaurant_id_subscription: {
        dish_name,
        id_restaurant,
        id_subscription,
      },
    },
    update: {
      discount,
    },
    create: {
      dish_name,
      id_restaurant,
      id_subscription,
      discount,
    },
  });
}
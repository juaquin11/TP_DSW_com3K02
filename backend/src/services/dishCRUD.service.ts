import prisma from '../prisma/client';
import { dish } from '../generated/prisma';
import { Prisma } from '../generated/prisma';
type CreateDishInput = Omit<dish, 'status'>;
type DishWithDiscount = dish & { subscription_discount?: number };
export const dishService = {
  // Crear plato
  async createDish(data: CreateDishInput): Promise<dish> {
    return await prisma.dish.create({
      data: {
        ...data,
        status: 1 // Valor por defecto
      }
    });
  },

  // Obtener todos los platos
  async getAllDishes(): Promise<dish[]> {
    return prisma.dish.findMany();
  },
  // Obtener todos los platos de un restaurante específico
  async getDishesByRestaurant(id_restaurant: string): Promise<dish[]> {
    return await prisma.dish.findMany({
      where: {
        id_restaurant
      }
    });
  },

  // Obtener plato por nombre y id de restaurante
  async getDish(dish_name: string, id_restaurant: string): Promise<dish | null> {
    return await prisma.dish.findUnique({
      where: {
        dish_name_id_restaurant: {
          dish_name,
          id_restaurant
        }
      }
    });
  },
  // Agregar al final del objeto dishService, antes del cierre:


// Obtener platos con descuentos de suscripción
async getDishesByRestaurantWithDiscounts(
  id_restaurant: string,
  id_subscription: string
): Promise<DishWithDiscount[]> {
  const dishes = await prisma.$queryRaw<DishWithDiscount[]>(Prisma.sql`
    SELECT 
      d.dish_name,
      d.description,
      d.current_price,
      d.id_restaurant,
      d.image,
      d.status,
      ds.discount AS subscription_discount
    FROM dish d
    LEFT JOIN dish_subscription ds 
      ON d.dish_name = ds.dish_name 
      AND d.id_restaurant = ds.id_restaurant
      AND ds.id_subscription = ${id_subscription}
    WHERE d.id_restaurant = ${id_restaurant}
      AND d.status = 1 
  `);

  return dishes;
},



  // Actualizar plato
  async updateDish(
    dish_name: string, 
    id_restaurant: string, 
    data: Partial<dish>
  ): Promise<dish> {
    return await prisma.dish.update({
      where: {
        dish_name_id_restaurant: {
          dish_name,
          id_restaurant
        }
      },
      data
    });
  },

  // Eliminar plato
  async deleteDish(dish_name: string, id_restaurant: string): Promise<dish> {
    return await prisma.dish.delete({
      where: {
        dish_name_id_restaurant: {
          dish_name,
          id_restaurant
        }
      }
    });
  }
};
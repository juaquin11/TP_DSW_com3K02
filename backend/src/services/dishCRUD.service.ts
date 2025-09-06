import prisma from '../prisma/client';
import { dish } from '../generated/prisma';

type CreateDishInput = Omit<dish, 'status'>;

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
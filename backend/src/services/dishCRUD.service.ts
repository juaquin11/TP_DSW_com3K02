import prisma from '../prisma/client';
import { dish } from '../generated/prisma';
import { Prisma } from '../generated/prisma';


type DiscountPayload = {
  id_subscription: string;
  discount: number;
};

type CreateDishInput = Omit<dish, 'status' | 'dish_subscription'>; 

type DishWithRelations = dish & {
  dish_subscription: {
    id_subscription: string;
    discount: number;
  }[];
};

type DishWithDiscount = dish & { subscription_discount?: number };


export const dishService = {
  // Crear plato
  async createDish(data: CreateDishInput): Promise<dish> {
    // La lógica de negocio (asignar status default) vive en el servicio.
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

  // Obtener todos los platos de un restaurante (AHORA INCLUYE DESCUENTOS)
  async getDishesByRestaurant(id_restaurant: string): Promise<DishWithRelations[]> {
    return await prisma.dish.findMany({
      where: {
        id_restaurant
      },
      include: {
        dish_subscription: { // Incluye los descuentos existentes
          select: {
            id_subscription: true,
            discount: true
          }
        } 
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
  
  // Obtener platos con descuentos de suscripción (sin cambios)
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

  // Actualizar plato (AHORA ACEPTA DESCUENTOS Y USA TRANSACCIÓN)
  async updateDish(
    dish_name: string, 
    id_restaurant: string, 
    data: Partial<Omit<dish, 'dish_name' | 'id_restaurant'>>,
    discounts: DiscountPayload[] | null // Nuevo parámetro para descuentos
  ): Promise<dish> {
    
    // Usamos una transacción para asegurar que la actualización del plato
    // y sus descuentos ocurran de forma atómica.
    return await prisma.$transaction(async (tx) => {
      
      // 1. Actualizar los datos básicos del plato (precio, desc, imagen, etc.)
      //    Solo si hay datos para actualizar
      let updatedDish: dish;
      if (Object.keys(data).length > 0) {
        updatedDish = await tx.dish.update({
          where: {
            dish_name_id_restaurant: { dish_name, id_restaurant }
          },
          data
        });
      } else {
        // Si no hay datos, al menos trae el plato actual
        updatedDish = (await tx.dish.findUnique({
          where: { dish_name_id_restaurant: { dish_name, id_restaurant }}
        }))!;
        
        // Si no se encontró el plato, P2025 será lanzado por Prisma
        if (!updatedDish) {
            throw new Prisma.PrismaClientKnownRequestError('Plato no encontrado', {
              code: 'P2025',
              clientVersion: 'x.y.z', // puedes poner una versión genérica
            });
        }
      }

      // 2. Si se enviaron descuentos (discounts NO es null), actualizar las relaciones
      if (discounts !== null && Array.isArray(discounts)) {
        
        // 2a. Borrar todos los descuentos existentes para este plato
        await tx.dish_subscription.deleteMany({
          where: {
            dish_name: dish_name,
            id_restaurant: id_restaurant
          }
        });

        // 2b. Crear los nuevos descuentos (solo los que tienen discount > 0)
        const discountsToCreate = discounts
          .filter(d => d.discount > 0)
          .map(d => ({
            dish_name: dish_name,
            id_restaurant: id_restaurant,
            id_subscription: d.id_subscription,
            discount: d.discount
          }));

        if (discountsToCreate.length > 0) {
          await tx.dish_subscription.createMany({
            data: discountsToCreate
          });
        }
      }
      
      // 3. Retorna el plato actualizado
      return updatedDish;
    });
  },

  // Eliminar plato (borrado lógico, no físico)
  async deleteDish(dish_name: string, id_restaurant: string): Promise<dish> {
    // Este servicio en realidad solo cambia el status (borrado lógico)
    // Buscamos el plato primero
    const dish = await prisma.dish.findUniqueOrThrow({
        where: { dish_name_id_restaurant: { dish_name, id_restaurant } }
    });

    // Cambiamos el status (1 -> 0, 0 -> 1)
    const newStatus = dish.status === 1 ? 0 : 1;

    return await prisma.dish.update({
      where: {
        dish_name_id_restaurant: {
          dish_name,
          id_restaurant
        }
      },
      data: {
        status: newStatus
      }
    });
  }
};
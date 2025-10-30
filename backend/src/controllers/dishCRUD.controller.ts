import { Request, Response } from 'express';
import { dishService } from '../services/dishCRUD.service';
import * as subscriptionService from '../services/subscription.service';
import path from 'path';
import fs from 'fs';
import { dish, Prisma } from '../generated/prisma'; 
import { Decimal } from '@prisma/client/runtime/library';

function slugify(text: string): string {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '').replace(/-+$/, '');
}


export const createDish = async (req: Request, res: Response) => {
  try {
    const dishData = req.body;
    
    if (!dishData.dish_name || !dishData.id_restaurant || !dishData.current_price) {
      return res.status(400).json({ 
        error: 'Faltan campos requeridos: dish_name, id_restaurant, current_price' 
      });
    }

    const dataToCreate = {
      ...dishData,
      current_price: parseFloat(dishData.current_price), // Convertir a número
    };

    let imagePath = '/uploads/default_Dish.jpg'; // Imagen por defecto
    if (req.file) {
        const tempPath = req.file.path;
        const extension = path.extname(req.file.filename);
        const uniqueSuffix = Date.now();
        const newFileName = `${slugify(dishData.dish_name)}-${uniqueSuffix}${extension}`;
        const newPath = path.join(path.dirname(tempPath), newFileName);
        
        fs.renameSync(tempPath, newPath);
        imagePath = `/uploads/${newFileName}`;
    }

    const newDish = await dishService.createDish({ ...dataToCreate, image: imagePath });

    return res.status(201).json({
      message: 'Plato creado exitosamente',
      data: newDish
    });

  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'El plato ya existe en este restaurante' });
    }
    res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
};

// Obtener todos los platos
export const getAllDishes = async (req: Request, res: Response) => {
  try {
    const dishes = await dishService.getAllDishes();
    return res.status(200).json({
      message: 'Platos obtenidos exitosamente',
      data: dishes,
      count: dishes.length
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
};
// Obtener todos los platos de un restaurante
export const getDishesByRestaurant = async (req: Request, res: Response) => {
  try {
    const { id_restaurant } = req.params;
    
    if (!id_restaurant) {
      return res.status(400).json({ error: 'Se requiere id_restaurant' });
    }

    const dishes = await dishService.getDishesByRestaurant(id_restaurant);
    
    return res.status(200).json({
      message: 'Platos del restaurante obtenidos exitosamente',
      data: dishes,
      count: dishes.length
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
};

// Obtener platos de un restaurante con descuentos de suscripción 
export const getDishesByRestaurantWithDiscounts = async (req: Request, res: Response) => {
  try {
    const id_restaurant  = req.params.id_restaurant;
    const id_subscription = req.params.id_subscription;
    
    if (!id_restaurant) {
      return res.status(400).json({ error: 'Se requiere id_restaurant' });
    }
    if (!id_subscription) {
      return res.status(400).json({ error: 'Se requiere id_restaurant' });
    }

    const dishes = await dishService.getDishesByRestaurantWithDiscounts(
      id_restaurant, 
      id_subscription
      
    );
    return res.status(200).json({
      data: dishes
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
};


// Obtener un plato específico
export const getDish = async (req: Request, res: Response) => {
  try {
    const { dish_name, id_restaurant } = req.params;
    
    if (!dish_name || !id_restaurant) {
      return res.status(400).json({ error: 'Se requieren dish_name e id_restaurant' });
    }

    const dish = await dishService.getDish(dish_name, id_restaurant);
    
    if (!dish) {
      return res.status(404).json({ error: 'Plato no encontrado' });
    }

    return res.status(200).json({
      message: 'Plato encontrado',
      data: dish
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
};

// Actualizar un plato
export const updateDish = async (req: Request, res: Response) => {
  try {
    const { dish_name, id_restaurant } = req.params;

    // 1. Validación de parámetros de URL
    if (!dish_name || !id_restaurant) {
      return res.status(400).json({ error: 'Faltan parámetros en la URL' });
    }
    
    const bodyData = req.body;
    // Preparamos el DTO para los datos básicos del plato
    const updateData: Partial<Omit<dish, 'dish_name' | 'id_restaurant'>> = {};

    // 2. Mapeo de campos opcionales del FormData
    if (bodyData.description) {
      updateData.description = bodyData.description;
    }
    if (bodyData.current_price) {
      updateData.current_price = Decimal(bodyData.current_price); // Conversión
    }
    if (bodyData.status !== undefined) {
      updateData.status = parseInt(bodyData.status, 10); // Conversión
    }

    // 3. Procesamiento de nueva imagen (si se envió una)
    if (req.file) {
      const tempPath = req.file.path;
      const extension = path.extname(req.file.filename);
      const uniqueSuffix = Date.now();
      const newFileName = `${slugify(dish_name)}-${uniqueSuffix}${extension}`;
      const newPath = path.join(path.dirname(tempPath), newFileName);
      
      fs.renameSync(tempPath, newPath);
      updateData.image = `/uploads/${newFileName}`;
      
      // TODO: Implementar borrado de imagen antigua si se reemplaza
    }

    // 4. Parsear descuentos
    // El frontend los envía como un JSON string en el campo 'discounts'
    let discountsToUpdate: any[] | null = null;
    if (bodyData.discounts) {
      try {
        discountsToUpdate = JSON.parse(bodyData.discounts);
        if (!Array.isArray(discountsToUpdate)) {
          discountsToUpdate = null; // Ignorar si no es un array
        }
      } catch (e) {
        console.warn('Error parsing discounts JSON', e);
        // No hacer nada, se tratará como si no se hubieran enviado descuentos (null)
      }
    }

    // 5. Llamada al servicio
    const updatedDish = await dishService.updateDish(
      dish_name, 
      id_restaurant, 
      updateData,
      discountsToUpdate // Pasa los descuentos (sea el array o null)
    );
    
    return res.status(200).json({
      message: 'Plato actualizado exitosamente',
      data: updatedDish
    });

  } catch (error: any) {
    if (error.code === 'P2025') { // Error "Not Found" de Prisma
       return res.status(404).json({ error: 'Plato no encontrado' });
    }
    console.error('Error interno en updateDish:', error);
    res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
};


export const deleteDish = async (req: Request, res: Response) => {
  try {
    const { dish_name, id_restaurant } = req.params;

    if (!dish_name || !id_restaurant) {
      return res.status(400).json({ error: 'Se requieren dish_name e id_restaurant' });
    }

    const existingDish = await dishService.getDish(dish_name, id_restaurant);
    if (!existingDish) {
      return res.status(404).json({ error: 'Plato no encontrado' });
    }

    const deletedDish = await dishService.deleteDish(dish_name, id_restaurant);
    
    return res.status(200).json({
      message: 'Plato eliminado exitosamente',
      data: deletedDish
    });
  } catch (error: any) {
    if (error.code === 'P2003') {
      return res.status(409).json({ 
        error: 'No se puede eliminar el plato porque tiene referencias en otras tablas' 
      });
    }
    return res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
};

export const addDiscountSubscription = async (req: Request, res: Response) => {
    try {
        const { dish_name, id_restaurant } = req.params;
        const { id_subscription, discount } = req.body;

        if (!dish_name || !id_restaurant) {
            return res.status(400).json({ error: 'Se requieren dish_name e id_restaurant en los parámetros de la URL.' });
        }

        if (!id_subscription || discount === undefined) {
            return res.status(400).json({ error: 'Faltan id_subscription o discount.' });
        }

        const discountNumber = parseInt(discount, 10);
        if (isNaN(discountNumber) || discountNumber < 0 || discountNumber > 100) {
            return res.status(400).json({ error: 'El descuento debe ser un número entre 0 y 100.' });
        }

        const result = await subscriptionService.linkDishToSubscription(
            dish_name,
            id_restaurant,
            id_subscription,
            discountNumber
        );

        res.status(201).json({ message: 'Descuento vinculado exitosamente', data: result });

    } catch (error: any) {
        console.error("Error al vincular descuento:", error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};


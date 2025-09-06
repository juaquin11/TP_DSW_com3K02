import { Request, Response, NextFunction } from 'express';
import { body, param, validationResult } from 'express-validator';

// Middleware para manejar errores de validación
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Errores de validación',
      details: errors.array()
    });
  }
  next();
};

// Validaciones para crear plato
export const validateCreateDish = [
  body('dish_name')
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('El nombre del plato debe tener entre 1 y 100 caracteres'),
  
  body('description')
    .isString()
    .isLength({ min: 1 })
    .withMessage('La descripción es requerida'),
  
  body('current_price')
    .isDecimal({ decimal_digits: '0,2' })
    .withMessage('El precio debe ser un número decimal válido'),
  
  body('id_restaurant')
    .isUUID()
    .withMessage('El ID del restaurante debe ser un UUID válido'),
  
  body('image')
    .optional()
    .isString()
    .isLength({ max: 255 })
    .withMessage('La URL de la imagen no puede exceder 255 caracteres'),
  
  handleValidationErrors
];

// Validaciones para actualizar plato
export const validateUpdateDish = [
  param('dish_name')
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('El nombre del plato debe tener entre 1 y 100 caracteres'),
  
  param('id_restaurant')
    .isUUID()
    .withMessage('El ID del restaurante debe ser un UUID válido'),
  
  body('description')
    .optional()
    .isString()
    .isLength({ min: 1 })
    .withMessage('La descripción debe ser válida'),
  
  body('current_price')
    .optional()
    .isDecimal({ decimal_digits: '0,2' })
    .withMessage('El precio debe ser un número decimal válido'),
  
  body('status')
    .optional()
    .isInt({ min: 0, max: 1 })
    .withMessage('El status debe ser 0 o 1'),
  
  body('image')
    .optional()
    .isString()
    .isLength({ max: 255 })
    .withMessage('La URL de la imagen no puede exceder 255 caracteres'),
  
  handleValidationErrors
];

// Validaciones para parámetros de ruta
export const validateDishParams = [
  param('dish_name')
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('El nombre del plato debe tener entre 1 y 100 caracteres'),
  
  param('id_restaurant')
    .isUUID()
    .withMessage('El ID del restaurante debe ser un UUID válido'),
  
  handleValidationErrors
];
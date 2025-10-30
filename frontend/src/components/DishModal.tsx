import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import styles from './DishModal.module.css';
import type { Dish } from '../types/dish';
import type { subscription } from '../types/subscription';
import { createDish, updateDish } from '../services/dishService';
import { fetchSubscriptions } from '../services/subscriptionService';
import ImageDropzone from './ImageDropzone';
import { API_BASE_URL } from '../services/apiClient';
import { useToast } from '../context/ToastContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  dishToEdit: Dish | null;
  restaurantId: string;
}

const initializeDiscounts = (dish: Dish | null): Record<string, string> => {
  if (!dish || !dish.dish_subscription) {
    return {};
  }
  // Convierte el array de relaciones en un mapa [id_subscription]: "descuento"
  return dish.dish_subscription.reduce((acc, sub) => {
    acc[sub.id_subscription] = String(sub.discount || 0);
    return acc;
  }, {} as Record<string, string>);
};

const DishModal: React.FC<Props> = ({ isOpen, onClose, onSave, dishToEdit, restaurantId }) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    dish_name: '',
    description: '',
    current_price: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>('');
  
  const [subscriptions, setSubscriptions] = useState<subscription[]>([]);
  // Estado para manejar los valores de los inputs de descuento
  const [discounts, setDiscounts] = useState<Record<string, string>>(() => initializeDiscounts(dishToEdit));
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = dishToEdit !== null;

  useEffect(() => {
    // Cargar suscripciones (siempre que haya token)
    if (token) {
      fetchSubscriptions(token).then(setSubscriptions).catch(console.error);
    }
    
    // Configurar formulario si estamos editando
    if (dishToEdit) {
      setFormData({
        dish_name: dishToEdit.dish_name,
        description: dishToEdit.description,
        current_price: String(dishToEdit.current_price),
      });
      // Inicializar vista previa de imagen
      if (dishToEdit.image) {
        setImagePreview(`${API_BASE_URL}${dishToEdit.image}`);
      } else {
        setImagePreview(null);
      }
      // Inicializar estado de descuentos
      setDiscounts(initializeDiscounts(dishToEdit));
    } else {
      // Resetear formulario para creación
      setFormData({ dish_name: '', description: '', current_price: '' });
      setImageFile(null);
      setImagePreview(null);
      setDiscounts({});
    }
    
    // Limpiar errores y carga al abrir/cambiar modo
    setError(null);
    setIsLoading(false);

  }, [dishToEdit, token, isOpen]); // Reactualizar cuando se abre/cierra o cambia el plato

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageSelect = (file: File) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };
  
  // Manejador para los inputs de descuento
  const handleDiscountChange = (subscriptionId: string, value: string) => {
    // Validar que sea un número entre 0 y 100, o un string vacío
    if (value === '' || (Number(value) >= 0 && Number(value) <= 100)) {
      setDiscounts(prev => ({
        ...prev,
        [subscriptionId]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      // Prepara el FormData
      const data = new FormData();
      data.append('description', formData.description);
      data.append('current_price', formData.current_price);
      
      if (imageFile) { // Si se seleccionó una nueva imagen
        data.append('image', imageFile);
      }
      
      if (isEditing) {
        // --- LÓGICA DE EDICIÓN ---
        
        // 1. Convertir el estado de descuentos a un array para el backend
        const discountData = Object.entries(discounts)
          .map(([id_subscription, discount]) => ({
            id_subscription,
            discount: parseInt(discount, 10) || 0, // Convertir a número, default 0
          }));
          // Nota: Filtramos discounts > 0 en el backend (servicio)

        // 2. Añadir el array como un JSON string al FormData
        data.append('discounts', JSON.stringify(discountData));
        
        // 3. Llamar al servicio de actualización
        await updateDish(dishToEdit.dish_name, restaurantId, data, token);

      } else {
        // --- LÓGICA DE CREACIÓN ---
        data.append('dish_name', formData.dish_name);
        data.append('id_restaurant', restaurantId);
        // (En creación, no enviamos descuentos. Se podrían añadir después si se quisiera).
        
        await createDish(data, token);
      }
      
      onSave(); // Refresca la lista de platos
      onClose(); // Cierra el modal
      
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ocurrió un error al guardar el plato.');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3>{isEditing ? 'Editar Plato' : 'Añadir Nuevo Plato'}</h3>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGrid}>
            <div className={styles.inputGroup}>
              <label htmlFor="dish_name">Nombre del Plato</label>
              <input
                id="dish_name"
                name="dish_name"
                type="text"
                value={formData.dish_name}
                onChange={handleChange}
                disabled={isEditing} // El nombre (PK) no se puede editar
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="current_price">Precio</label>
              <input
                id="current_price"
                name="current_price"
                type="number"
                step="0.01"
                value={formData.current_price}
                onChange={handleChange}
                required
              />
            </div>
            <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
              <label htmlFor="description">Descripción</label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>
            <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
              <label>Imagen del Plato</label>
              <ImageDropzone onFileSelect={handleImageSelect} imagePreview={imagePreview} />
            </div>
          </div>

          {/* Mostrar sección de descuentos SOLO al editar Y si hay suscripciones cargadas */}
          {isEditing && subscriptions.length > 0 && (
            <div className={styles.subscriptionSection}>
              <h4>Descuentos por Suscripción</h4>
              {subscriptions.map(sub => (
                <div key={sub.id_subscription} className={styles.subscriptionRow}>
                  <label htmlFor={`discount-${sub.id_subscription}`}>{sub.plan_name}</label>
                  <input
                    id={`discount-${sub.id_subscription}`}
                    type="number"
                    placeholder="0" // %
                    min="0"
                    max="100"
                    // Componente controlado: valor y onChange conectados al estado 'discounts'
                    value={discounts[sub.id_subscription] || ''} 
                    onChange={(e) => handleDiscountChange(sub.id_subscription, e.target.value)}
                  />
                </div>
              ))}
            </div>
          )}

          {error && <p className={styles.errorMessage}>{error}</p>}
          
          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>Cancelar</button>
            <button type="submit" className={styles.saveButton} disabled={isLoading}>
              {isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


export default DishModal;

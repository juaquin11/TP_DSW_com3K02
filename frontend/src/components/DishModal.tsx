import React, { useState, useEffect, useCallback } from 'react';
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

// Interfaz local para manejar descuentos que pueden venir al editar
interface EditableDish extends Dish {
  discounts?: Record<string, number>; 
}

const DishModal: React.FC<Props> = ({ isOpen, onClose, onSave, dishToEdit, restaurantId }) => {
  const { token } = useAuth();
  const { success: showSuccess, error: showError } = useToast();
  const [formData, setFormData] = useState({
    dish_name: '',
    description: '',
    current_price: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [subscriptions, setSubscriptions] = useState<subscription[]>([]);
  const [discounts, setDiscounts] = useState<Record<string, string>>({}); // Usar string para input
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!dishToEdit;

  // Cargar suscripciones (sólo en modo edición)
  useEffect(() => {
    const loadSubscriptions = async () => {
      if (!token) return;
      try {
        const subs = await fetchSubscriptions(token);
        setSubscriptions(subs);
      } catch (err) {
        console.error("Error loading subscriptions:", err);
        showError("No se pudieron cargar los tipos de suscripción.");
      }
    };

    if (isOpen && isEditing) {
      loadSubscriptions();
    }
  }, [token, isOpen, isEditing, showError]);

  // Resetear formulario al abrir
  useEffect(() => {
    if (isOpen) {
      if (dishToEdit) {
        setFormData({
          dish_name: dishToEdit.dish_name,
          description: dishToEdit.description || '',
          current_price: dishToEdit.current_price.toString(),
        });
        setImagePreview(dishToEdit.image ? `${API_BASE_URL}${dishToEdit.image}` : null);
        
        // Cargar descuentos existentes si vienen en el objeto
        const existingDiscounts = (dishToEdit as EditableDish).discounts || {};
        const stringDiscounts: Record<string, string> = {};
        for (const key in existingDiscounts) {
            stringDiscounts[key] = existingDiscounts[key].toString();
        }
        setDiscounts(stringDiscounts);
        
      } else {
        // Reset para plato nuevo
        setFormData({ dish_name: '', description: '', current_price: '' });
        setImagePreview(null);
        setDiscounts({});
      }
      setImageFile(null);
      setError(null);
    }
  }, [dishToEdit, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageSelect = (file: File | null) => {
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(dishToEdit?.image ? `${API_BASE_URL}${dishToEdit.image}` : null);
    }
  };

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>, subscriptionId: string) => {
    const { value } = e.target;
    // Permitir solo números entre 0-100 o vacío
    if (/^(\d{1,2}|100)?$/.test(value)) {
      setDiscounts(prev => ({ ...prev, [subscriptionId]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("No estás autenticado.");
      return;
    }
    setIsLoading(true);
    setError(null);

    // Procesar descuentos de string a number
    const processedDiscounts: Record<string, number> = {};
    Object.entries(discounts).forEach(([key, value]) => {
      if (value !== '') {
        const numValue = parseInt(value, 10);
        if (!isNaN(numValue)) {
          processedDiscounts[key] = numValue;
        }
      }
    });

    try {
      if (isEditing && dishToEdit) {
        const data = new FormData();
        // Agregamos los campos que SÍ se actualizan
        data.append('description', formData.description);
        data.append('current_price', formData.current_price);
        // dish_name no se puede editar (es clave primaria), así que no se envía en el body
        
        // Si el usuario seleccionó una NUEVA imagen, la añadimos
        if (imageFile) {
          data.append('image', imageFile);
        }
        
        await updateDish(dishToEdit.dish_name, restaurantId, data, token);
      } else {
        // Lógica de Creación
        const data = new FormData();
        data.append('dish_name', formData.dish_name);
        data.append('description', formData.description);
        data.append('current_price', formData.current_price);
        data.append('id_restaurant', restaurantId);
        if (imageFile) {
          data.append('image', imageFile);
        }
        
        // Llama al servicio del frontend
        await createDish(data, token);
      }
      onSave();
      onClose();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Ocurrió un error.';
      setError(errorMessage);
      showError(errorMessage);
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
                type="text"
                id="dish_name"
                name="dish_name"
                value={formData.dish_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="current_price">Precio Actual ($)</label>
              <input
                type="number"
                id="current_price"
                name="current_price"
                value={formData.current_price}
                onChange={handleChange}
                step="0.01"
                min="0"
                required
              />
            </div>
            <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
              <label htmlFor="description">Descripción</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
              />
            </div>
            <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
              <label>Imagen del Plato {isEditing ? '(Opcional: solo si quieres cambiarla)' : '(Requerida)'}</label>
              <ImageDropzone
                onFileSelect={handleImageSelect}
                imagePreview={imagePreview}
              />
            </div>
          </div>

          {isEditing && subscriptions.length > 0 && (
            <div className={styles.subscriptionSection}>
              <h4>Descuentos por Suscripción (%)</h4>
              {subscriptions.map(sub => (
                <div key={sub.id_subscription} className={styles.subscriptionRow}>
                  <label htmlFor={`discount-${sub.id_subscription}`}>{sub.plan_name}</label>
                  <input
                    id={`discount-${sub.id_subscription}`}
                    name={`discount-${sub.id_subscription}`}
                    type="number"
                    placeholder="%"
                    min="0"
                    max="100"
                    value={discounts[sub.id_subscription] || ''}
                    onChange={(e) => handleDiscountChange(e, sub.id_subscription)}
                  />
                </div>
              ))}
            </div>
          )}

          {error && <p className={styles.errorMessage}>{error}</p>}

          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>Cancelar</button>
            <button type="submit" className={styles.saveButton} disabled={isLoading}>
              {isLoading ? (isEditing ? 'Actualizando...' : 'Creando...') : (isEditing ? 'Guardar Cambios' : 'Crear Plato')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DishModal;

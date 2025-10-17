import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import styles from './DishModal.module.css';
import type { Dish } from '../types/dish';
import type { subscription } from '../types/subscription';
import { createDish, updateDish } from '../services/dishService';
import { fetchSubscriptions } from '../services/subscriptionService';
import ImageDropzone from './ImageDropzone';
import { API_BASE_URL } from '../services/apiClient';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void; // Para refrescar la lista de platos
  dishToEdit: Dish | null;
  restaurantId: string;
}

const DishModal: React.FC<Props> = ({ isOpen, onClose, onSave, dishToEdit, restaurantId }) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    dish_name: '',
    description: '',
    current_price: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    dishToEdit?.image ? `${API_BASE_URL}${dishToEdit.image}` : ''
  );
  console.log(dishToEdit);
  const [subscriptions, setSubscriptions] = useState<subscription[]>([]);
  const [discounts, setDiscounts] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = dishToEdit !== null;

  useEffect(() => {
    if (dishToEdit) {
      setFormData({
        dish_name: dishToEdit.dish_name,
        description: dishToEdit.description,
        current_price: String(dishToEdit.current_price),
      });
      if (dishToEdit.image) {
        setImagePreview(`${API_BASE_URL}${dishToEdit.image}`);

      }
    } else {
      // Reset form for creation
      setFormData({ dish_name: '', description: '', current_price: '' });
      setImageFile(null);
      setImagePreview(null);
    }

    // Cargar suscripciones si estamos editando
    if (isEditing && token) {
      fetchSubscriptions(token).then(setSubscriptions).catch(console.error);
    }
  }, [dishToEdit, isEditing, token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageSelect = (file: File) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      if (isEditing) {
        // Lógica de actualización (sin imagen por ahora para simplificar)
        await updateDish(dishToEdit.dish_name, restaurantId, {
          description: formData.description,
          current_price: Number(formData.current_price),
        }, token);
      } else {
        // Lógica de creación con FormData
        const data = new FormData();
        data.append('dish_name', formData.dish_name);
        data.append('description', formData.description);
        data.append('current_price', formData.current_price);
        data.append('id_restaurant', restaurantId);
        if (imageFile) {
          data.append('image', imageFile);
        }
        await createDish(data, token);
      }
      onSave(); // Refresca la lista de platos en el componente padre
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
                disabled={isEditing}
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

          {isEditing && (
            <div className={styles.subscriptionSection}>
              <h4>Descuentos por Suscripción</h4>
              {subscriptions.map(sub => (
                <div key={sub.id_subscription} className={styles.subscriptionRow}>
                  <label htmlFor={`discount-${sub.id_subscription}`}>{sub.plan_name}</label>
                  <input
                    id={`discount-${sub.id_subscription}`}
                    type="number"
                    placeholder="%"
                    min="0"
                    max="100"
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
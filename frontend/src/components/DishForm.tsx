import React, { useState, useEffect } from 'react';
import styles from './DishForm.module.css';
import type { Dish } from '../types/dish';
import ImageDropzone from './ImageDropzone';

interface Props {
  dish: Dish | null; // Si es null, es para crear uno nuevo
  onSave: (dish: Dish) => void;
  onClose: () => void;
}

const DishForm: React.FC<Props> = ({ dish, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    dish_name: '',
    description: '',
    current_price: '',
    status: 1,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(dish?.image || null);

  useEffect(() => {
    if (dish) {
      setFormData({
        dish_name: dish.dish_name,
        description: dish.description,
        current_price: dish.current_price.toString(),
        status: dish.status,
      });
    }
  }, [dish]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleImageSelect = (file: File) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la validación de datos
    const savedDish: Dish = {
      ...formData,
      current_price: parseFloat(formData.current_price) || 0,
      image: imagePreview, // En un caso real, subiríamos la imagen y guardaríamos la URL
      id_restaurant: dish?.id_restaurant || '', // Esto necesitará el ID real
    };
    onSave(savedDish);
  };


  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <form onSubmit={handleSubmit}>
          <h2>{dish ? 'Editar Plato' : 'Añadir Nuevo Plato'}</h2>
          
          <div className={styles.inputGroup}>
            <label htmlFor="dish_name">Nombre del Plato</label>
            <input type="text" name="dish_name" value={formData.dish_name} onChange={handleChange} required disabled={!!dish} />
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="description">Descripción</label>
            <textarea name="description" value={formData.description} onChange={handleChange} required />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="current_price">Precio</label>
            <input type="number" name="current_price" value={formData.current_price} onChange={handleChange} required step="0.01" />
          </div>

          <div className={styles.inputGroup}>
             <label>Imagen del Plato</label>
             <ImageDropzone onFileSelect={handleImageSelect} imagePreview={imagePreview} />
          </div>
          
          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.btnCancel}>Cancelar</button>
            <button type="submit" className={styles.btnSave}>Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DishForm;
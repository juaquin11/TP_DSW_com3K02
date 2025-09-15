import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createRestaurant } from '../services/restaurantService';
import { fetchCategories, fetchDistricts } from '../services/dataService';
import type { Category } from '../types/category';
import type { District } from '../types/district';
import styles from './CreateRestaurantForm.module.css';
import CategoryModal from './CategoryModal';
import RestaurantCard from './RestaurantCard'; // Para la vista previa

const CreateRestaurantForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    chair_amount: '',
    street: '',
    height: '',
    opening_time: '12:00',
    closing_time: '00:00',
    id_district: '',
  });
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;
    const loadData = async () => {
      try {
        const [cats, dists] = await Promise.all([
          fetchCategories(token),
          fetchDistricts(token),
        ]);
        setCategories(cats);
        setDistricts(dists);
        if (dists.length > 0) {
          setFormData(prev => ({ ...prev, id_district: dists[0].id_district }));
        }
      } catch (err) {
        setError('Error al cargar datos necesarios para el formulario.');
      }
    };
    loadData();
  }, [token]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };
  
  const handleToggleCategory = (id: string) => {
    setSelectedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    // Validaciones
    if (Object.values(formData).some(val => val === '') || !imageFile || selectedCategories.size === 0) {
      setError('Todos los campos son obligatorios.');
      return;
    }
    if (parseInt(formData.chair_amount) <= 0) {
      setError('La cantidad de sillas debe ser mayor a 0.');
      return;
    }
    setError(null);
    setIsLoading(true);

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });
    data.append('id_category', JSON.stringify(Array.from(selectedCategories)));
    data.append('image', imageFile);

    try {
      const newRestaurant = await createRestaurant(data, token);
      alert('¡Restaurante creado exitosamente!');
      navigate(`/ownerDashboard/restaurant/${newRestaurant.id_restaurant}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'No se pudo crear el restaurante.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Columna Izquierda: Datos */}
        <div className={styles.column}>
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.inputGroup}>
            <label htmlFor="name">Nombre del Restaurante</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="chair_amount">Cantidad de Sillas</label>
            <input type="number" id="chair_amount" name="chair_amount" value={formData.chair_amount} onChange={handleChange} />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="street">Calle</label>
            <input type="text" id="street" name="street" value={formData.street} onChange={handleChange} />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="height">Altura</label>
            <input type="text" id="height" name="height" value={formData.height} onChange={handleChange} />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="id_district">Distrito</label>
            <select id="id_district" name="id_district" value={formData.id_district} onChange={handleChange}>
              {districts.map(d => <option key={d.id_district} value={d.id_district}>{d.name}</option>)}
            </select>
          </div>
          <div className={styles.timeInputs}>
            <div className={styles.inputGroup}>
              <label htmlFor="opening_time">Apertura</label>
              <input type="time" id="opening_time" name="opening_time" value={formData.opening_time} onChange={handleChange} />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="closing_time">Cierre</label>
              <input type="time" id="closing_time" name="closing_time" value={formData.closing_time} onChange={handleChange} />
            </div>
          </div>
          <div className={styles.inputGroup}>
             <label>Categorías</label>
             <button type="button" onClick={() => setIsModalOpen(true)} className={styles.modalButton}>
               Seleccionar ({selectedCategories.size})
             </button>
          </div>
           <div className={styles.inputGroup}>
            <label htmlFor="image">Imagen Principal</label>
            <input type="file" id="image" accept="image/*" onChange={handleImageChange} className={styles.fileInput} />
          </div>
        </div>

        {/* Columna Derecha: Vista Previa */}
        <div className={styles.column}>
          <h3 className={styles.previewTitle}>Vista Previa</h3>
          <div className={styles.previewWrapper}>
            <RestaurantCard
              name={formData.name || "Nombre de tu Restaurante"}
              image={imagePreview || '/path/to/default/image.webp'}
              street={formData.street || "Calle"}
              height={formData.height || "Altura"}
              rating={0}
            />
          </div>
        </div>

        <div className={styles.fullWidth}>
          <button type="submit" className={styles.submitButton} disabled={isLoading}>
            {isLoading ? 'Creando...' : 'Crear Restaurante'}
          </button>
        </div>
      </form>
      
      {isModalOpen && (
        <CategoryModal
          categories={categories}
          selectedCategories={selectedCategories}
          onToggle={handleToggleCategory}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default CreateRestaurantForm;
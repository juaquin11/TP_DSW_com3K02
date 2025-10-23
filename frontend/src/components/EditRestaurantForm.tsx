import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { updateRestaurant, deleteRestaurant } from '../services/restaurantService';
import { fetchCategories, fetchDistricts } from '../services/dataService';
import type { Category } from '../types/category';
import type { District } from '../types/district';
import styles from './CreateRestaurantForm.module.css';
import CategoryModal from './CategoryModal';
import Stepper from './Stepper';
import ImageDropzone from './ImageDropzone';
import CustomSelect from './CustomSelect';
import { API_BASE_URL } from '../services/apiClient';

const formSteps = ["Datos del Local", "Detalles y Multimedia"];

interface EditRestaurantFormProps {
  restaurantData: any;
  onSuccess: () => void;
  onCancel: () => void;
}

const EditRestaurantForm: React.FC<EditRestaurantFormProps> = ({ restaurantData, onSuccess, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: restaurantData.name || '',
    chair_amount: restaurantData.chair_amount?.toString() || '',
    street: restaurantData.street || '',
    height: restaurantData.height || '',
    opening_time: restaurantData.opening_time?.slice(0, 5) || '12:00',
    closing_time: restaurantData.closing_time?.slice(0, 5) || '00:00',
    id_district: restaurantData.id_district || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set(restaurantData.categories?.map((c: any) => c.id_category) || [])
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(
    restaurantData.image ? `${API_BASE_URL}${restaurantData.image}` : ''
  );
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { token } = useAuth();
  const { success, error: showError } = useToast();

  useEffect(() => {
    if (!token) return;
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [cats, dists] = await Promise.all([
          fetchCategories(token),
          fetchDistricts(token),
        ]);
        setCategories(cats);
        setDistricts(dists);
      } catch (err) {
        setErrors({ form: 'Error al cargar datos necesarios para el formulario.' });
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [token]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleDistrictChange = (value: string) => {
    setFormData(prev => ({ ...prev, id_district: value }));
    if (errors.id_district) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.id_district;
        return newErrors;
      });
    }
  };

  const handleImageSelect = (file: File) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    if (errors.image) {
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.image;
            return newErrors;
        });
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
    if (errors.categories) {
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.categories;
            return newErrors;
        });
    }
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "El nombre es obligatorio.";
    if (!formData.street.trim()) newErrors.street = "La calle es obligatoria.";
    if (!formData.height.trim()) newErrors.height = "La altura es obligatoria.";
    if (!formData.id_district) newErrors.id_district = "Debe seleccionar un distrito.";
    const chairs = parseInt(formData.chair_amount);
    if (isNaN(chairs) || chairs <= 0) newErrors.chair_amount = "Debe ser un número mayor a 0.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const validateStep2 = () => {
      const newErrors: Record<string, string> = {};
      if (selectedCategories.size === 0) newErrors.categories = "Seleccione al menos una categoría.";
      setErrors(prev => ({...prev, ...newErrors}));
      return selectedCategories.size > 0;
  }

  const handleNext = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => setCurrentStep(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1() || !validateStep2()) {
        return;
    }
    if (!token) return;
    
    setIsLoading(true);

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value));
    data.append('id_category', JSON.stringify(Array.from(selectedCategories)));
    if (imageFile) {
      data.append('image', imageFile);
    }

    try {
      await updateRestaurant(restaurantData.id_restaurant, data, token);
      success('¡Restaurante actualizado exitosamente!');
      onSuccess();
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'No se pudo actualizar el restaurante.';
      setErrors({ form: errorMsg });
      showError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      await deleteRestaurant(restaurantData.id_restaurant, token);
      success('Restaurante eliminado exitosamente.');
      onSuccess();
    } catch (err: any) {
      showError(err.response?.data?.error || 'No se pudo eliminar el restaurante.');
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const districtOptions = districts.map(d => ({ value: d.id_district, label: d.name }));
  const stepSubtitles = ['', formData.name.trim() || null];

  return (
    <div className={styles.card}>
      <Stepper steps={formSteps} subtitles={stepSubtitles} currentStep={currentStep} />
      <form onSubmit={handleSubmit} noValidate>
        {currentStep === 1 && (
          <div className={styles.stepContent}>
            <fieldset className={styles.fieldset}>
                <legend>Información General y Ubicación</legend>
                <div className={styles.formGrid}>
                    <div className={styles.inputGroup}>
                        <input id="name" name="name" type="text" className={styles.input} value={formData.name} onChange={handleChange} placeholder=" " />
                        <label htmlFor="name" className={styles.label}>Nombre del Restaurante</label>
                        {errors.name && <span className={styles.errorMessage}>{errors.name}</span>}
                    </div>
                    <div className={styles.inputGroup}>
                        <input id="chair_amount" name="chair_amount" type="number" className={styles.input} value={formData.chair_amount} onChange={handleChange} placeholder=" " />
                        <label htmlFor="chair_amount" className={styles.label}>Cantidad de Sillas</label>
                        {errors.chair_amount && <span className={styles.errorMessage}>{errors.chair_amount}</span>}
                    </div>
                    <div className={styles.inputGroup}>
                        <input id="street" name="street" type="text" className={styles.input} value={formData.street} onChange={handleChange} placeholder=" " />
                        <label htmlFor="street" className={styles.label}>Calle</label>
                        {errors.street && <span className={styles.errorMessage}>{errors.street}</span>}
                    </div>
                     <div className={styles.inputGroup}>
                        <input id="height" name="height" type="text" className={styles.input} value={formData.height} onChange={handleChange} placeholder=" " />
                        <label htmlFor="height" className={styles.label}>Altura</label>
                        {errors.height && <span className={styles.errorMessage}>{errors.height}</span>}
                    </div>
                    <div className={styles.inputGroup}>
                        <CustomSelect
                            options={districtOptions}
                            value={formData.id_district}
                            onChange={handleDistrictChange}
                            placeholder="Seleccione un distrito"
                        />
                        {errors.id_district && <span className={styles.errorMessage}>{errors.id_district}</span>}
                    </div>
                </div>
            </fieldset>
             <div className={styles.navigationButtons}>
                <button type="button" onClick={onCancel} className={styles.navButton}>
                    Cancelar
                </button>
                <button type="button" onClick={handleNext} className={styles.navButton}>
                    Siguiente
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
            <div className={styles.stepContent}>
                 <fieldset className={styles.fieldset}>
                    <legend>Detalles y Multimedia</legend>
                    <div className={styles.formGrid}>
                        <div className={styles.inputGroup}>
                            <label>Horarios</label>
                            <div className={styles.timeInputs}>
                                <input type="time" name="opening_time" value={formData.opening_time} onChange={handleChange} className={styles.input} />
                                <input type="time" name="closing_time" value={formData.closing_time} onChange={handleChange} className={styles.input} />
                            </div>
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Categorías</label>
                            <button type="button" onClick={() => setIsModalOpen(true)} className={styles.modalButton}>
                                Seleccionar ({selectedCategories.size})
                            </button>
                            {errors.categories && <span className={styles.errorMessage}>{errors.categories}</span>}
                        </div>
                        <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                             <label>Imagen del Restaurante</label>
                             <ImageDropzone onFileSelect={handleImageSelect} imagePreview={imagePreview} />
                        </div>
                    </div>
                </fieldset>
                {errors.form && <p className={styles.errorMessage}>{errors.form}</p>}
                <div className={styles.navigationButtons}>
                    <button type="button" onClick={handleBack} className={styles.navButton}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
                        Atrás
                    </button>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button 
                            type="button" 
                            onClick={() => setShowDeleteConfirm(true)} 
                            className={styles.deleteButton}
                            disabled={isLoading}
                        >
                            Eliminar Restaurante
                        </button>
                        <button type="submit" className={styles.submitButton} disabled={isLoading}>
                            {isLoading ? 'Actualizando...' : 'Guardar Cambios'}
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4 12 14.01l-3-3"/></svg>
                        </button>
                    </div>
                </div>
            </div>
        )}
      </form>
      {isModalOpen && (
        <CategoryModal
          categories={categories}
          selectedCategories={selectedCategories}
          onToggle={handleToggleCategory}
          onClose={() => setIsModalOpen(false)}
        />
      )}
      {showDeleteConfirm && (
        <div className={styles.deleteModal}>
          <div className={styles.deleteModalContent}>
            <h3>¿Estás seguro?</h3>
            <p>Esta acción eliminará el restaurante. Esta operación no se puede deshacer.</p>
            <div className={styles.deleteModalButtons}>
              <button onClick={() => setShowDeleteConfirm(false)} className={styles.navButton}>
                Cancelar
              </button>
              <button onClick={handleDelete} className={styles.deleteConfirmButton}>
                Confirmar Eliminación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditRestaurantForm;
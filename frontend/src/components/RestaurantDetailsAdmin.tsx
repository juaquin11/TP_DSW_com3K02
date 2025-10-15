import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchRestaurantDetailsForOwner } from '../services/restaurantService';
import EditRestaurantForm from './EditRestaurantForm';
import styles from './RestaurantDetailsAdmin.module.css';
import { API_BASE_URL } from '../services/apiClient';

interface RestaurantDetailsProps {
  restaurantId: string;
}

const RestaurantDetailsAdmin: React.FC<RestaurantDetailsProps> = ({ restaurantId }) => {
  const [restaurantData, setRestaurantData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { token } = useAuth();

  const loadRestaurantData = async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchRestaurantDetailsForOwner(restaurantId, token);
      setRestaurantData(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar los datos del restaurante.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRestaurantData();
  }, [restaurantId, token]);

  const handleSuccess = () => {
    setIsEditing(false);
    loadRestaurantData();
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Cargando datos del restaurante...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h3>Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!restaurantData) {
    return (
      <div className={styles.errorContainer}>
        <h3>No se encontró el restaurante</h3>
        <p>No se pudo cargar la información del restaurante.</p>
      </div>
    );
  }

  if (isEditing) {
    return (
      <EditRestaurantForm
        restaurantData={restaurantData}
        onSuccess={handleSuccess}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  const imageUrl = restaurantData.image ? `${API_BASE_URL}${restaurantData.image}` : '/default-restaurant.webp';

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Datos del Restaurante</h2>
        <button onClick={() => setIsEditing(true)} className={styles.editButton}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
          </svg>
          Editar
        </button>
      </div>

      <div className={styles.contentGrid}>
        <div className={styles.imageSection}>
          {restaurantData.image ? (
            <img 
              src={ imageUrl} 
              alt={restaurantData.name}
              className={styles.restaurantImage}
            />
          ) : (
            <div className={styles.noImage}>
              <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                <circle cx="9" cy="9" r="2"/>
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
              </svg>
              <p>Sin imagen</p>
            </div>
          )}
        </div>

        <div className={styles.infoSection}>
          <div className={styles.infoGroup}>
            <h3>Información General</h3>
            <div className={styles.infoRow}>
              <span className={styles.label}>Nombre:</span>
              <span className={styles.value}>{restaurantData.name}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Estado:</span>
              <span className={`${styles.statusBadge} ${restaurantData.status === 1 ? styles.active : styles.inactive}`}>
                {restaurantData.status === 1 ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Capacidad:</span>
              <span className={styles.value}>{restaurantData.chair_amount} sillas</span>
            </div>
          </div>

          <div className={styles.infoGroup}>
            <h3>Ubicación</h3>
            <div className={styles.infoRow}>
              <span className={styles.label}>Dirección:</span>
              <span className={styles.value}>{restaurantData.street} {restaurantData.height}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Distrito:</span>
              <span className={styles.value}>{restaurantData.districtName}</span>
            </div>
          </div>

          <div className={styles.infoGroup}>
            <h3>Horarios</h3>
            <div className={styles.infoRow}>
              <span className={styles.label}>Apertura:</span>
              <span className={styles.value}>{restaurantData.opening_time?.slice(0, 5)}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Cierre:</span>
              <span className={styles.value}>{restaurantData.closing_time?.slice(0, 5)}</span>
            </div>
          </div>

          <div className={styles.infoGroup}>
            <h3>Categorías</h3>
            <div className={styles.categoriesContainer}>
              {restaurantData.categories && restaurantData.categories.length > 0 ? (
                restaurantData.categories.map((cat: any) => (
                  <span key={cat.id_category} className={styles.categoryBadge}>
                    {cat.name}
                  </span>
                ))
              ) : (
                <span className={styles.noData}>Sin categorías asignadas</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetailsAdmin;
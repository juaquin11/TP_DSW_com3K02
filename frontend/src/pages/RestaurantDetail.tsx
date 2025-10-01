import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from "./RestaurantDetail.module.css";
import type { RestaurantDTO } from "../types/restaurant";
import type { Dish } from "../types/dish";
import { fetchRestaurantById } from '../services/restaurantService';
import { fetchDishesByRestaurant } from '../services/dishService';

type TabType = 'about' | 'menu';

const RestaurantDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const [restaurant, setRestaurant] = useState<RestaurantDTO | null>(null);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('about');

  useEffect(() => {
    const loadRestaurantData = async () => {
      if (!id) {
        setError('ID de restaurante no válido');
        setLoading(false);
        return;
      }

      try {
        const restaurantData = await fetchRestaurantById(id, token ?? undefined);
        setRestaurant(restaurantData);

        try {
          const dishesData = await fetchDishesByRestaurant(id, token ?? undefined);
          setDishes(dishesData.filter(dish => dish.status === 1));
        } catch (dishError) {
          console.error('Error loading dishes:', dishError);
          setDishes([]);
        }
      } catch (err) {
        setError('Error al cargar el restaurante');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadRestaurantData();
  }, [id, token]);

  if (loading) {
    return (
      <main className={styles.container}>
        <div className={styles.loading}>Cargando restaurante...</div>
      </main>
    );
  }

  if (error || !restaurant) {
    return (
      <main className={styles.container}>
        <div className={styles.error}>{error || 'Restaurante no encontrado'}</div>
      </main>
    );
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < Math.floor(rating) ? styles.starFilled : styles.starEmpty}>
        ★
      </span>
    ));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'about':
        return (
          <div className={styles.tabContent}>
            <h3>Información del Restaurante</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <strong>Dirección:</strong>
                <span>{restaurant.street} {restaurant.height}{restaurant.districtName ? `, ${restaurant.districtName}` : ''}</span>
              </div>
              <div className={styles.infoItem}>
                <strong>Horarios:</strong>
                <span>{restaurant.opening_time.slice(0, 5)} - {restaurant.closing_time.slice(0, 5)}</span>
              </div>
              <div className={styles.infoItem}>
                <strong>Capacidad Total:</strong>
                <span>{restaurant.chair_amount} sillas</span>
              </div>
              <div className={styles.infoItem}>
                <strong>Disponibilidad:</strong>
                <span className={restaurant.chair_available > 0 ? styles.available : styles.unavailable}>
                  {restaurant.chair_available > 0 ? `${restaurant.chair_available} sillas disponibles` : 'Sin disponibilidad'}
                </span>
              </div>
              <div className={styles.infoItem}>
                <strong>Valoración:</strong>
                <span>
                  {restaurant.avgRating ? restaurant.avgRating.toFixed(1) : 'Sin valoraciones'} 
                  {restaurant.reviewCount > 0 && ` (${restaurant.reviewCount} reseñas)`}
                </span>
              </div>
              <div className={styles.infoItem}>
                <strong>Estado:</strong>
                <span className={restaurant.status === 1 ? styles.available : styles.unavailable}>
                  {restaurant.status === 1 ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          </div>
        );
      
      case 'menu':
        return (
          <div className={styles.tabContent}>
            <h3>Nuestro Menú</h3>
            {dishes.length > 0 ? (
              <div className={styles.dishesGallery}>
                {dishes.map((dish, index) => (
                  <div key={`${dish.dish_name}-${index}`} className={styles.dishCard}>
                    <div className={styles.dishImageContainer}>
                      <img
                        src={dish.image ? `/${dish.image}` : '/path/to/default/dish.webp'}
                        alt={dish.dish_name}
                        className={styles.dishImage}
                      />
                    </div>
                    <div className={styles.dishContent}>
                      <div className={styles.dishHeader}>
                        <h4 className={styles.dishName}>{dish.dish_name}</h4>
                        <span className={styles.dishPrice}>${dish.current_price}</span>
                      </div>
                      <p className={styles.dishDescription}>{dish.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.noData}>No hay platos disponibles en este momento.</p>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerImage}>
          <img
            src={restaurant.image ? `/${restaurant.image}` : '/path/to/default/restaurant.webp'}
            alt={restaurant.name}          
          />
        </div>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>{restaurant.name}</h1>
          <div className={styles.subtitle}>
            <div className={styles.rating}>
              {renderStars(restaurant.avgRating || 0)}
              <span className={styles.ratingText}>
                {restaurant.avgRating ? restaurant.avgRating.toFixed(1) : '0.0'} ({restaurant.reviewCount} reseñas)
              </span>
            </div>
            <div className={styles.location}>
              📍 {restaurant.street} {restaurant.height}{restaurant.districtName ? `, ${restaurant.districtName}` : ''}
            </div>
            <div className={styles.hours}>
              🕐 {restaurant.opening_time.slice(0, 5)} - {restaurant.closing_time.slice(0, 5)}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.tabNavigation}>
        <button
          className={`${styles.tabButton} ${activeTab === 'about' ? styles.active : ''}`}
          onClick={() => setActiveTab('about')}
        >
          Información
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'menu' ? styles.active : ''}`}
          onClick={() => setActiveTab('menu')}
        >
          Menú
        </button>
      </div>

      {renderTabContent()}
    </main>
  );
};

export default RestaurantDetail;
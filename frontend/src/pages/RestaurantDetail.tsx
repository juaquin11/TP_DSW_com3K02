import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from "./RestaurantDetail.module.css";
import type { RestaurantDTO } from "../types/restaurant";
import type { Dish } from "../types/dish";
import { fetchRestaurantById } from '../services/restaurantService';
import { fetchDishesByRestaurant } from '../services/dishService';
import { API_BASE_URL } from '../services/apiClient';
import RestaurantReservation from '../components/RestaurantReservation';

// --- Icon Components ---
const LocationIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const CapacityIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;

type TabType = 'menu' | 'info';

const RestaurantDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<RestaurantDTO | null>(null);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('menu');
  const [showReservationForm, setShowReservationForm] = useState(false);

  useEffect(() => {
    const loadRestaurantData = async () => {
      if (!id) {
        setError('ID de restaurante no válido');
        setLoading(false);
        return;
      }
      window.scrollTo(0, 0);
      try {
        const restaurantData = await fetchRestaurantById(id, token ?? undefined);
        setRestaurant(restaurantData);

        const dishesData = await fetchDishesByRestaurant(id, token ?? undefined);
        setDishes(dishesData.filter(dish => dish.status === 1));

      } catch (err) {
        setError('Error al cargar los datos del restaurante.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadRestaurantData();
  }, [id, token]);

 const handleReservationClick = () => {
    if (!id) {
      return;
    }

    if (!token) {
      navigate('/login');
      return;
    }

    navigate(`/restaurant/${id}/reservar`);
  };

  if (loading) {
    return <main className={styles.container}><div className={styles.loading}>Cargando...</div></main>;
  }

  if (error || !restaurant) {
    return <main className={styles.container}><div className={styles.error}>{error || 'Restaurante no encontrado'}</div></main>;
  }

  const imageUrl = restaurant.image ? `${API_BASE_URL}${restaurant.image}` : '/default-restaurant.webp';
  
  const renderStars = (rating: number) => Array.from({ length: 5 }, (_, i) => (
    <span key={i} className={i < Math.round(rating) ? styles.starFilled : styles.starEmpty}>★</span>
  ));

  const renderTabContent = () => {
    switch (activeTab) {
      case 'menu':
        return (
          <div className={styles.dishesGallery}>
            {dishes.length > 0 ? dishes.map((dish, index) => {
              const dishImageUrl = dish.image ? `${API_BASE_URL}${dish.image}` : '/default-dish.webp';
              return (
                <div key={`${dish.dish_name}-${index}`} className={styles.dishCard}>
                  <div className={styles.dishImageContainer}>
                    <img src={dishImageUrl} alt={dish.dish_name} className={styles.dishImage} />
                  </div>
                  <div className={styles.dishContent}>
                    <div className={styles.dishHeader}>
                      <h4 className={styles.dishName}>{dish.dish_name}</h4>
                      <span className={styles.dishPrice}>${dish.current_price}</span>
                    </div>
                    <p className={styles.dishDescription}>{dish.description}</p>
                  </div>
                </div>
              );
            }) : <p className={styles.noData}>No hay platos disponibles en este momento.</p>}
          </div>
        );
      case 'info':
        return (
          <div className={styles.infoSection}>
            <h4>Sobre Nosotros</h4>
            <p>Sumérgete en una experiencia culinaria única en {restaurant.name}. Nuestra pasión es combinar ingredientes frescos y de temporada para crear platos inolvidables que deleitarán tu paladar. Te invitamos a disfrutar de un ambiente acogedor y un servicio excepcional.</p>
            <h4>Detalles Adicionales</h4>
            <ul>
              <li><strong>Estado:</strong> <span className={restaurant.status === 1 ? styles.statusActive : styles.statusInactive}>{restaurant.status === 1 ? 'Abierto' : 'Cerrado'}</span></li>
              <li><strong>Categorías:</strong> Italiana, Pastas (Ejemplo)</li>
              <li><strong>Servicios:</strong> Wi-Fi, Acceso para discapacitados</li>
            </ul>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <main>
      <header className={styles.header} style={{ backgroundImage: `url(${imageUrl})` }}>
        <div className={styles.headerOverlay}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>{restaurant.name}</h1>
            <div className={styles.subtitle}>
              <div className={styles.rating}>
                {renderStars(restaurant.avgRating || 0)}
                <span className={styles.ratingText}>
                  {restaurant.avgRating ? restaurant.avgRating.toFixed(1) : 'Nuevo'}
                  <span>({restaurant.reviewCount} reseñas)</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className={styles.container}>
        <div className={styles.mainContent}>
          <div className={styles.detailsColumn}>
             <div className={styles.infoCard}>
              <h3>Detalles del Restaurante</h3>
              <ul>
                <li><LocationIcon /> {restaurant.street} {restaurant.height}, {restaurant.districtName}</li>
                <li><ClockIcon /> {restaurant.opening_time.slice(0, 5)} - {restaurant.closing_time.slice(0, 5)}</li>
                <li><CapacityIcon /> {restaurant.chair_available} de {restaurant.chair_amount} sillas disponibles</li>
              </ul>
              <button
                type="button"
                className={styles.bookingButton}
                onClick={() => setShowReservationForm(prev => !prev)}
              >
                {showReservationForm ? 'Cerrar formulario' : 'Reservar una Mesa'}
              </button>
              {showReservationForm && (
                <RestaurantReservation
                  restaurantId={restaurant.id_restaurant}
                  onClose={() => setShowReservationForm(false)}
                />
              )}
            </div>
          </div>

          <div className={styles.tabsColumn}>
            <div className={styles.tabNavigation}>
              <button className={activeTab === 'menu' ? styles.active : ''} onClick={() => setActiveTab('menu')}>Menú</button>
              <button className={activeTab === 'info' ? styles.active : ''} onClick={() => setActiveTab('info')}>Información</button>
            </div>
            
            <div className={styles.tabContent}>
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default RestaurantDetail;


import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from "./RestaurantDetail.module.css";
import type { RestaurantDTO } from "../types/restaurant";
import { fetchRestaurantById } from '../services/restaurantService';
import { fetchDishesByRestaurant, fetchDishesWithDiscounts, type DishWithDiscount } from '../services/dishService';
import { fetchSubscriptionByClient } from '../services/subscriptionService';
import { API_BASE_URL } from '../services/apiClient';
import RestaurantReservation from '../components/RestaurantReservation';
import RestaurantReviews from '../components/RestaurantReviews';

// --- Icon Components ---
const LocationIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const CapacityIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>;

const RestaurantDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, token } = useAuth();
  const [restaurant, setRestaurant] = useState<RestaurantDTO | null>(null);
  const [dishes, setDishes] = useState<DishWithDiscount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showReservationForm, setShowReservationForm] = useState(false);
  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | ''>('');

  const isLoggedIn = !!user;
  const hasActiveSubscription = user?.hasActiveSubscription ?? false;

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

        // Si el usuario tiene suscripción activa, traer platos con descuentos
        if (isLoggedIn && hasActiveSubscription && token) {          
          const subscription = await fetchSubscriptionByClient(user.id_user, token);
                     
          const dishesWithDiscounts = await fetchDishesWithDiscounts(id, token,subscription.id_subscription);
          setDishes(dishesWithDiscounts.filter(dish => dish.status === 1));
        } else {
          // Si no tiene suscripción, traer platos normales
          const dishesData = await fetchDishesByRestaurant(id, token ?? undefined);
          setDishes(dishesData.filter(dish => dish.status === 1));
        }

      } catch (err) {
        setError('Error al cargar los datos del restaurante.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadRestaurantData();
  }, [id, token]);

  if (loading) {
    return <main className={styles.container}><div className={styles.loading}>Cargando...</div></main>;
  }

  if (error || !restaurant) {
    return <main className={styles.container}><div className={styles.error}>{error || 'Restaurante no encontrado'}</div></main>;
  }

  const imageUrl = restaurant.image ? `${API_BASE_URL}${restaurant.image}` : '/default-restaurant.webp';
  
  const calculateDiscountedPrice = (price: number, discount?: number): number => {
    if (!discount || discount <= 0) return price;
    const numPrice = Number(price);
    const numDiscount = Number(discount);
    if (isNaN(numPrice) || isNaN(numDiscount)) return price;
    return numPrice - (numPrice * (numDiscount / 100));
  };

  const getDisplayPrice = (dish: DishWithDiscount): number => {
    const basePrice = Number(dish.current_price);
    if (isNaN(basePrice)) return 0;
    
    if (isLoggedIn && hasActiveSubscription && dish.subscription_discount) {
      return calculateDiscountedPrice(basePrice, dish.subscription_discount);
    }
    return basePrice;
  };

  // Aplicar filtros
  const filteredDishes = dishes
    .filter(dish => dish.dish_name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(dish => {
      const price = getDisplayPrice(dish);
      const min = minPrice ? parseFloat(minPrice) : 0;
      const max = maxPrice ? parseFloat(maxPrice) : Infinity;
      return price >= min && price <= max;
    })
    .sort((a, b) => {
      if (!sortOrder) return 0;
      const priceA = getDisplayPrice(a);
      const priceB = getDisplayPrice(b);
      return sortOrder === 'desc' ? priceB - priceA : priceA - priceB;
    });

  const renderStars = (rating: number) => Array.from({ length: 5 }, (_, i) => (
    <span key={i} className={i < Math.round(rating) ? styles.starFilled : styles.starEmpty}>★</span>
  ));

  const clearFilters = () => {
    setSearchTerm('');
    setMinPrice('');
    setMaxPrice('');
    setSortOrder('');
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
        <div className={styles.topSection}>
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
                  openingTime={restaurant.opening_time}
                  closingTime={restaurant.closing_time}
                  onClose={() => setShowReservationForm(false)}
                />
              )}
          </div>

          <RestaurantReviews restaurantId={restaurant.id_restaurant} />
        </div>

        <div className={styles.menuSection}>
          <h3>Nuestro Menú</h3>
          
          <div className={styles.filtersContainer}>
            <div className={styles.searchBar}>
              <SearchIcon />
              <input
                type="text"
                placeholder="Buscar platos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            <div className={styles.priceFilters}>
              <div className={styles.priceInput}>
                <label>Precio mín:</label>
                <input
                  type="number"
                  placeholder=""
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  min="0"
                />
              </div>
              <div className={styles.priceInput}>
                <label>Precio máx:</label>
                <input
                  type="number"
                  placeholder=""
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  min="0"
                />
              </div>
            </div>

            <div className={styles.sortFilter}>
              <label>Ordenar:</label>
              <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc' | '')}>
                <option value="">Sin orden</option>
                <option value="asc">Precio: Menor a Mayor</option>
                <option value="desc">Precio: Mayor a Menor</option>
              </select>
            </div>

            <button onClick={clearFilters} className={styles.clearButton}>
              Limpiar Filtros
            </button>
          </div>

          {filteredDishes.length > 0 ? (
            <div className={styles.dishesGallery}>
              {filteredDishes.map((dish, index) => {
                const dishImageUrl = dish.image ? `${API_BASE_URL}${dish.image}` : '/default-dish.webp';                
                const basePrice = Number(dish.current_price);
                const displayPrice = getDisplayPrice(dish);
                const hasDiscount = dish.subscription_discount && dish.subscription_discount > 0;
                const discountedPrice = hasDiscount ? calculateDiscountedPrice(basePrice, dish.subscription_discount) : basePrice;
                const showMemberPrice = !isLoggedIn || !hasActiveSubscription;

                return (
                  <div key={`${dish.dish_name}-${index}`} className={styles.dishCard}>
                    <div className={styles.dishImageContainer}>
                      <img src={dishImageUrl} alt={dish.dish_name} className={styles.dishImage} />
                      {hasDiscount && showMemberPrice && (
                        <div className={styles.discountBadge}>-{dish.subscription_discount}%</div>
                      )}
                    </div>
                    <div className={styles.dishContent}>
                      <div className={styles.dishHeader}>
                        <h4 className={styles.dishName}>{dish.dish_name}</h4>
                        <div className={styles.priceContainer}>
                          {/* Usuario CON suscripción: mostrar precio con descuento resaltado + porcentaje */}
                          {isLoggedIn && hasActiveSubscription && hasDiscount ? (
                            <>
                              <span className={styles.dishPriceWithDiscount}>${displayPrice.toFixed(2)}</span>
                              <span className={styles.discountPercentage}>-{dish.subscription_discount}%</span>
                            </>
                          ) : (
                            /* Usuario SIN suscripción: mostrar precio normal + precio de miembro */
                            <>
                              <span className={styles.dishPrice}>${displayPrice.toFixed(2)}</span>
                              {showMemberPrice && hasDiscount && (
                                <span className={styles.memberPrice}>
                                  ${discountedPrice.toFixed(2)}
                                  <span className={styles.memberLabel}>Precio para miembros</span>
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                      <p className={styles.dishDescription}>{dish.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className={styles.noData}>No se encontraron platos con los filtros aplicados.</p>
          )}
        </div>
      </div>
    </main>
  );
};

export default RestaurantDetail;
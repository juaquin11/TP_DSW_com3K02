import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchRestaurantsWithDiscounts } from '../services/restaurantService';
import type { RestaurantWithDiscounts } from '../types/restaurant';
import RestaurantCard from '../components/RestaurantCard';
import styles from "./Home.module.css";
import { useAuth } from '../context/AuthContext';

const Home: React.FC = () => {
  const [restaurants, setRestaurants] = useState<RestaurantWithDiscounts[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();
  const navigate = useNavigate();

  const handleRestaurantClick = (restaurantId: string) => {
    if (restaurantId) {
      navigate(`/restaurant/${restaurantId}`);
    }
  };

  useEffect(() => {
    async function getRestaurants() {
      try {
        const data = await fetchRestaurantsWithDiscounts();
        console.log ('Fetched restaurants with discounts:', data);
        setRestaurants(data);
      } catch (err: any) {
        console.error('Failed to fetch restaurants:', err);
        setError('Failed to load restaurants.');
      } finally {
        setLoading(false);
      }
    }
    
    getRestaurants();
  }, [token]);

  if (loading) {
    return <main className={styles.container}>Cargando restaurantes...</main>;
  }

  if (error) {
    return <main className={styles.container}>{error}</main>;
  }

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Featured Restaurants</h1>
      <div className={styles.grid}>
        {restaurants.map((restaurant, index) => (
          <RestaurantCard
            key={restaurant.id_restaurant || index}
            id={restaurant.id_restaurant || ''}
            name={restaurant.name}
            image={restaurant.image || 'path/to/default/image.webp'}
            street={restaurant.street}
            height={restaurant.height}
            rating={restaurant.avgRating || 0}
            subscriptionNames={restaurant.subscriptionNames}
            onClick={handleRestaurantClick}
          />
        ))}
      </div>
    </main>
  );
};

export default Home;
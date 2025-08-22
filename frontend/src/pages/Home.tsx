import React, { useEffect, useState } from 'react';
import { fetchRestaurants } from '../services/restaurantService';
import type { RestaurantDTO } from '../types/restaurant';
import RestaurantCard from '../components/RestaurantCard';
import styles from "./Home.module.css";

const Home: React.FC = () => {
  const [restaurants, setRestaurants] = useState<RestaurantDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getRestaurants() {
      try {
        const data = await fetchRestaurants();
        setRestaurants(data);
      } catch (err: any) {
        console.error('Failed to fetch restaurants:', err);
        setError('Failed to load restaurants.');
      } finally {
        setLoading(false);
      }
    }
    getRestaurants();
  }, []);

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
            name={restaurant.name}
            image={restaurant.image || 'path/to/default/image.webp'}
            street={restaurant.street}
            height={restaurant.height}
            rating={restaurant.avgRating || 0}
          />
        ))}
      </div>
    </main>
  );
};

export default Home;

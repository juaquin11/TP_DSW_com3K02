import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchOwnerRestaurants } from '../services/restaurantService';
import type { OwnerRestaurantDTO } from '../types/restaurant';
import styles from './OwnerHome.module.css';

const OwnerHome: React.FC = () => {
  const [restaurants, setRestaurants] = useState<OwnerRestaurantDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false); 
  const { token, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function getOwnerRestaurants() {
      if (!token || user?.type !== 'owner') {
        navigate('/login');
        return;
      }

      try {
        const data = await fetchOwnerRestaurants(token);
        setRestaurants(data);
      } catch (err: any) {
        console.error('Failed to fetch owner restaurants:', err);
        setError('Failed to load your restaurants.');
      } finally {
        setLoading(false);
      }
    }

    getOwnerRestaurants();
  }, [token, user, navigate]);

  const handleAdminClick = (id: string) => {
    navigate(`/ownerDashboard/restaurant/${id}`);
  };
  
  const handleAddNewRestaurant = (newRestaurant: OwnerRestaurantDTO) => {
    setRestaurants(prev => [...prev, newRestaurant]);
    setShowCreateForm(false); // Ocultar formulario tras el éxito
  };

  if (loading) {
    return <main className={styles.container}>Cargando tus restaurantes...</main>;
  }

  if (error) {
    return <main className={styles.container}>{error}</main>;
  }

  if (restaurants.length === 0) {
    return (
      <main className={styles.container}>
        <h1 className={styles.title}>Mis Restaurantes</h1>
        <p>No tienes restaurantes registrados.</p>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Mis Restaurantes</h1>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Imagen</th>
              <th>Nombre</th>
              <th>Ubicación</th>
              <th>Horario</th>
              <th>Disponibilidad</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {restaurants.map((restaurant) => (
              <tr key={restaurant.id_restaurant}>
                <td>
                  <img src={restaurant.image || '/path/to/default/image.webp'} alt={restaurant.name} className={styles.restaurantImage} />
                </td>
                <td>{restaurant.name}</td>
                <td>
                  {restaurant.street} {restaurant.height}
                  {restaurant.districtName && `, ${restaurant.districtName}`}
                </td>
                <td>
                  {restaurant.opening_time.slice(0, 5)} - {restaurant.closing_time.slice(0, 5)}
                </td>
                <td>
                  {restaurant.chair_amount - restaurant.chair_available} de {restaurant.chair_amount} sillas ocupadas
                </td>
                <td>
                  <button onClick={() => handleAdminClick(restaurant.id_restaurant)} className={styles.adminButton}>
                    Administrar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.actionsContainer}>
        {/* Este botón ahora navega a la nueva página */}
        <button onClick={() => navigate('/ownerDashboard/new-restaurant')} className={styles.addButton}>
          ＋ Agregar Restaurante
        </button>
      </div>      
    </main>
  );
};

export default OwnerHome;

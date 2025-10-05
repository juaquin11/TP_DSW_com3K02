import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchDishesByRestaurant } from '../services/dishService';
import type { Dish } from '../types/dish';
import styles from './DishManagement.module.css';
import { API_BASE_URL } from '../services/apiClient';

interface Props {
  restaurantId: string;
}

const DishManagement: React.FC<Props> = ({ restaurantId }) => {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const loadDishes = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await fetchDishesByRestaurant(restaurantId, token);
      setDishes(data);
      setError(null);
    } catch (err) {
      console.error("Error al cargar los platos:", err);
      setError("No se pudieron cargar los platos.");
    } finally {
      setLoading(false);
    }
  }, [restaurantId, token]);

  useEffect(() => {
    loadDishes();
  }, [loadDishes]);

  if (loading) return <p>Cargando platos...</p>;
  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Gestión de Platos</h2>
        <button className={styles.addButton}>+ Añadir Plato</button>
      </div>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Imagen</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Precio</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {dishes.map(dish => {
              const imageUrl = dish.image ? `${API_BASE_URL}${dish.image}` : `${API_BASE_URL}/uploads/default_Dish.jpg`;
              return (
                <tr key={dish.dish_name}>
                  <td><img src={imageUrl} alt={dish.dish_name} className={styles.dishImage} /></td>
                  <td>{dish.dish_name}</td>
                  <td className={styles.descriptionCell}>{dish.description}</td>
                  <td>${dish.current_price.toFixed(2)}</td>
                  <td>
                    <span className={`${styles.status} ${dish.status === 1 ? styles.active : styles.inactive}`}>
                      {dish.status === 1 ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className={styles.actions}>
                    <button className={styles.editButton}>Editar</button>
                    <button className={styles.deleteButton}>Eliminar</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DishManagement;
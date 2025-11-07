import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { fetchDishesByRestaurant, updateDish } from '../services/dishService';
import type { Dish } from '../types/dish';
import styles from './DishManagement.module.css';
import { API_BASE_URL } from '../services/apiClient';
import DishModal from './DishModal';

interface Props {
  restaurantId: string;
}

const DishManagement: React.FC<Props> = ({ restaurantId }) => {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();
  const { success, error: showError, confirm } = useToast();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);

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

  const handleOpenModalForCreate = () => {
    setEditingDish(null);
    setIsModalOpen(true);
  };

  const handleOpenModalForEdit = (dish: Dish) => {
    setEditingDish(dish);
    setIsModalOpen(true);
  };
  
  const handleToggleStatus = async (dish: Dish) => {
    if (!token) return;
    const newStatus = dish.status === 1 ? 0 : 1;
    const action = newStatus === 1 ? 'activar' : 'desactivar';
    const variant = newStatus === 1 ? 'success' : 'danger';

    confirm(
      `¿Estás seguro de que quieres ${action} el plato "${dish.dish_name}"?`,
      async () => {
        try {
          await updateDish(dish.dish_name, restaurantId, { status: newStatus }, token);
          setDishes(prevDishes => prevDishes.map(d => 
            d.dish_name === dish.dish_name ? { ...d, status: newStatus } : d
          ));
          success(`Plato ${newStatus === 1 ? 'activado' : 'desactivado'} correctamente.`);
        } catch (err: any) {
          showError(err.response?.data?.error || 'Error al cambiar el estado del plato.');
        }
      },
      {
        confirmText: newStatus === 1 ? 'Activar' : 'Desactivar',
        cancelText: 'Cancelar',
        variant: variant
      }
    );
  };

  if (loading) return <p>Cargando platos...</p>;
  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Gestión de Platos</h2>
        <button onClick={handleOpenModalForCreate} className={styles.addButton}>+ Añadir Plato</button>
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
            {dishes.length > 0 ? dishes.map(dish => {
              const imageUrl = dish.image && !dish.image.includes('default') ? `${API_BASE_URL}${dish.image}` : `${API_BASE_URL}/uploads/default_Dish.jpg`;
              return (
                <tr key={dish.dish_name}>
                  <td><img src={imageUrl} alt={dish.dish_name} className={styles.dishImage} /></td>
                  <td>{dish.dish_name}</td>
                  <td className={styles.descriptionCell}>{dish.description}</td>
                  <td>${Number(dish.current_price).toFixed(2)}</td>
                  <td>
                    <span className={`${styles.status} ${dish.status === 1 ? styles.active : styles.inactive}`}>
                      {dish.status === 1 ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className={styles.actions}>
                    <div className={styles.actionsWrapper}>
                      <button onClick={() => handleOpenModalForEdit(dish)} className={styles.editButton}>Editar</button>
                      <button onClick={() => handleToggleStatus(dish)} className={dish.status === 1 ? styles.deleteButton : styles.activateButton}>
                        {dish.status === 1 ? 'Dar de Baja' : 'Activar'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Aún no has añadido ningún plato.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {isModalOpen && (
        <DishModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={loadDishes}
          dishToEdit={editingDish}
          restaurantId={restaurantId}
        />
      )}
    </div>
  );
};

export default DishManagement;
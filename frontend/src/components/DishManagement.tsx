// frontend/src/components/DishManagement.tsx
import React, { useState } from 'react';
import styles from './DishManagement.module.css';
import DishForm from './DishForm'; // <-- El nuevo formulario modal
import type { Dish } from '../types/dish';

// --- DATOS DE EJEMPLO ---
const mockDishes: Dish[] = [
  { dish_name: 'Lasagna de Carne', description: 'Lasagna casera con salsa boloñesa y bechamel.', current_price: 18.50, image: '/img_lasagna.jpg', id_restaurant: '1', status: 1 },
  { dish_name: 'Tacos al Pastor', description: 'Tacos de cerdo marinado con piña y cilantro.', current_price: 12.00, image: '/img_tacos.jpg', id_restaurant: '1', status: 1 },
  { dish_name: 'Hamburguesa Clásica', description: 'Hamburguesa con queso, lechuga, tomate y salsa especial.', current_price: 14.00, image: '/img_burger.jpg', id_restaurant: '1', status: 0 },
];
// ------------------------

interface Props {
  restaurantId: string;
}

const DishManagement: React.FC<Props> = ({ restaurantId }) => {
  const [dishes, setDishes] = useState<Dish[]>(mockDishes);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);

  const handleAddNew = () => {
    setEditingDish(null);
    setIsFormOpen(true);
  };

  const handleEdit = (dish: Dish) => {
    setEditingDish(dish);
    setIsFormOpen(true);
  };

  const handleDelete = (dishName: string) => {
    // Lógica de borrado (aquí iría la llamada a la API)
    if (window.confirm(`¿Seguro que quieres eliminar "${dishName}"?`)) {
      setDishes(prev => prev.filter(d => d.dish_name !== dishName));
    }
  };
  
  const handleSave = (dish: Dish) => {
    // Lógica para guardar (añadir o editar)
    if (editingDish) {
      setDishes(prev => prev.map(d => d.dish_name === editingDish.dish_name ? dish : d));
    } else {
      setDishes(prev => [...prev, dish]);
    }
    setIsFormOpen(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Gestión de Platos</h2>
        <button onClick={handleAddNew} className={styles.addButton}>＋ Añadir Plato</button>
      </div>

      <div className={styles.dishGrid}>
        {dishes.map(dish => (
          <div key={dish.dish_name} className={styles.dishCard}>
            <img src={dish.image || '/path/to/default/dish.webp'} alt={dish.dish_name} className={styles.dishImage} />
            <div className={styles.dishInfo}>
              <h3 className={styles.dishName}>{dish.dish_name}</h3>
              <p className={styles.dishPrice}>${dish.current_price.toFixed(2)}</p>
              <p className={styles.dishDescription}>{dish.description}</p>
              <span className={`${styles.status} ${dish.status === 1 ? styles.active : styles.inactive}`}>
                {dish.status === 1 ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            <div className={styles.dishActions}>
              <button onClick={() => handleEdit(dish)} className={styles.actionButton}>Editar</button>
              <button onClick={() => handleDelete(dish.dish_name)} className={`${styles.actionButton} ${styles.deleteButton}`}>Eliminar</button>
            </div>
          </div>
        ))}
      </div>

      {isFormOpen && (
        <DishForm
          dish={editingDish}
          onSave={handleSave}
          onClose={() => setIsFormOpen(false)}
        />
      )}
    </div>
  );
};

export default DishManagement;
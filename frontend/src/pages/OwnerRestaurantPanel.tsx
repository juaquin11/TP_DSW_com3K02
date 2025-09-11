import React from 'react';
import { useParams } from 'react-router-dom';

const OwnerRestaurantPanel: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <main style={{ padding: '2rem', color: 'var(--restaurant-cream)' }}>
      <h1>Panel de Administración del Restaurante</h1>
      <p>ID del Restaurante: {id}</p>
      <p>Esta es la página de administración del restaurante. Aquí podrás gestionar platos, reservas, ver estadísticas y más.</p>
    </main>
  );
};

export default OwnerRestaurantPanel;

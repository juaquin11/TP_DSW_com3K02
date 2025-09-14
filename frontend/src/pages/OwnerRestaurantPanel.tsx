import React from 'react';
import { useParams } from 'react-router-dom';
import styles from './OwnerRestaurantPanel.module.css';

const OwnerRestaurantPanel: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Administrar Restaurante</h1>
      <p className={styles.info}>
        Aquí podrás editar la información, agregar platos, gestionar descuentos y más para el restaurante con ID: <strong>{id}</strong>.
      </p>
      <div className={styles.comingSoon}>
        <h2>Próximamente...</h2>
        <ul>
          <li>📝 Editar detalles del restaurante</li>
          <li>🍔 Gestión de platos del menú</li>
          <li>💸 Administración de descuentos</li>
          <li>📅 Ver historial de reservas</li>
        </ul>
      </div>
    </main>
  );
};


export default OwnerRestaurantPanel;

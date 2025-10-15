import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import styles from './OwnerRestaurantPanel.module.css';
import ReservationsToday from '../components/ReservationsToday';
import DishManagement from '../components/DishManagement'; 
import RestaurantDetailsAdmin from '../components/RestaurantDetailsAdmin.tsx';

// Opciones del panel de administración
const adminOptions = [
  { id: 'reservations', label: 'Reservas de Hoy' },
  { id: 'dishes', label: 'Gestión de Platos' },
  { id: 'details', label: 'Datos del Restaurante' },
  { id: 'stats', label: 'Estadísticas' },
  { id: 'history', label: 'Historial de Reservas' },
];

const OwnerRestaurantPanel: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('reservations');

  const renderContent = () => {
    switch (activeTab) {
      case 'reservations':
        return <ReservationsToday restaurantId={id!} />;
      case 'dishes': 
        return <DishManagement restaurantId={id!} />;
      case 'details':
        return <RestaurantDetailsAdmin restaurantId={id!} />;
      default:
        return (
          <div className={styles.comingSoon}>
            <h2>Próximamente...</h2>
            <p>Esta sección estará disponible pronto.</p>
          </div>
        );
    }
  };

  return (
    <main className={styles.container}>
      <h1 className={styles.mainTitle}>Panel de Administración</h1>
      <p className={styles.mainSubtitle}>
        Gestiona todo lo relacionado con tu restaurante.
      </p>

      <div className={styles.adminNav}>
        {adminOptions.map(opt => (
          <button
            key={opt.id}
            className={`${styles.navButton} ${activeTab === opt.id ? styles.active : ''}`}
            onClick={() => setActiveTab(opt.id)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className={styles.contentArea}>
        {renderContent()}
      </div>
    </main>
  );
};

export default OwnerRestaurantPanel;
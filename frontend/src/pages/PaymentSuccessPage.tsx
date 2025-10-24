import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Importa useAuth
import styles from './PaymentStatus.module.css'; // Crea este archivo CSS

const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { refreshUserStatus } = useAuth(); // Obtén la función para refrescar

  // Refresca el estado del usuario cuando la página carga
  // Esto ayuda a actualizar si el usuario tiene una suscripción activa
  useEffect(() => {
    refreshUserStatus();
  }, [refreshUserStatus]);

  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.successTitle}>¡Pago Exitoso!</h1>
        <p>Tu suscripción ha sido activada correctamente.</p>
        {/* Opcional: Mostrar el ID de sesión para depuración */}
        {/* sessionId && <p className={styles.sessionId}>ID de Sesión: {sessionId}</p> */}
        <Link to="/profile?tab=subscription" className={styles.button}>
          Ver mi Suscripción
        </Link>
      </div>
    </main>
  );
};

export default PaymentSuccessPage;
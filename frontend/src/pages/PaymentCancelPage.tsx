import React from 'react';
import { Link } from 'react-router-dom';
import styles from './PaymentStatus.module.css'; // Reutiliza el CSS

const PaymentCancelPage: React.FC = () => {
  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.cancelTitle}>Pago Cancelado</h1>
        <p>El proceso de pago fue cancelado. Puedes intentarlo de nuevo cuando quieras.</p>
        <Link to="/profile?tab=subscription" className={styles.button}>
          Volver a Suscripciones
        </Link>
      </div>
    </main>
  );
};

export default PaymentCancelPage;
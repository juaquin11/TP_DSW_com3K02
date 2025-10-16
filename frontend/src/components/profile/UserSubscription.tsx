// frontend/src/components/profile/UserSubscription.tsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchSubscriptions } from '../../services/subscriptionService';
import { createPaymentPreference } from '../../services/paymentService';
import type { UserProfile } from '../../types/user';
import type { subscription as SubscriptionPlan } from '../../types/subscription';
import styles from './UserSubscription.module.css';

interface Props {
  profile: UserProfile;
}

const UserSubscription: React.FC<Props> = ({ profile }) => {
  const { token } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar los planes disponibles cuando el componente se monta
  useEffect(() => {
    if (!profile.subscription && token) {
      const loadPlans = async () => {
        try {
          const availablePlans = await fetchSubscriptions(token);
          setPlans(availablePlans);
        } catch (err) {
          setError('No se pudieron cargar los planes de suscripción.');
        }
      };
      loadPlans();
    }
  }, [profile.subscription, token]);

  const handleSubscribe = async (subscriptionId: string) => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const paymentUrl = await createPaymentPreference(subscriptionId, token);
      // Redirección a Mercado Pago
      window.location.href = paymentUrl;
    } catch (err) {
      setError('Error al iniciar el proceso de pago. Inténtalo de nuevo.');
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  // Si el usuario ya está suscrito, muestra su estado actual
  if (profile.subscription) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>Mi Suscripción</h2>
        <div className={styles.currentPlan}>
          <div className={styles.planIcon}>⭐</div>
          <h3>Plan {profile.subscription.plan_name}</h3>
          <p>Activo hasta el: {formatDate(profile.subscription.expiry_date!)}</p>
          <button className={styles.cancelButton}>Cancelar Suscripción</button>
        </div>
      </div>
    );
  }

  // Si no está suscrito, muestra los planes disponibles
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Elige tu Plan</h2>
      <div className={styles.plansGrid}>
        {plans.map((plan) => (
          <div key={plan.id_subscription} className={styles.planCard}>
            <h3>{plan.plan_name}</h3>
            <p className={styles.price}>${Number(plan.price).toFixed(2)}</p>
            <p className={styles.duration}>
              {plan.duration > 30 ? `${plan.duration / 30} meses` : 'Mensual'}
            </p>
            <button
              onClick={() => handleSubscribe(plan.id_subscription)}
              disabled={isLoading}
              className={styles.subscribeButton}
            >
              {isLoading ? 'Procesando...' : 'Suscribirme'}
            </button>
          </div>
        ))}
      </div>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};

export default UserSubscription;
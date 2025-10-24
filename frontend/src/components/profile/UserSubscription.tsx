// frontend/src/components/profile/UserSubscription.tsx

import React, { useState, useEffect } from 'react';
import { useStripe } from '@stripe/react-stripe-js';
import { useAuth } from '../../context/AuthContext';
import { fetchSubscriptions } from '../../services/subscriptionService';
import { createStripeCheckoutSession } from '../../services/paymentService';
import type { UserProfile } from '../../types/user';
import type { subscription as SubscriptionPlan } from '../../types/subscription';
import styles from './UserSubscription.module.css';

interface Props {
  profile: UserProfile;
}

  const UserSubscription: React.FC<Props> = ({ profile }) => {
  const { token } = useAuth();
  const stripe = useStripe();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
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
    if (!stripe || !token) {
      console.error("Stripe.js no se ha cargado o no estás autenticado.");
      setError("Error al iniciar el pago. Refresca la página.");
      return;
    }

    setIsLoading(prev => ({ ...prev, [subscriptionId]: true }));
    setError(null);

    try {
      // 1. Llama a tu backend para crear la sesión de checkout
      const { sessionId } = await createStripeCheckoutSession(subscriptionId, token);

      // 2. Redirige al usuario a la página de pago de Stripe
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: sessionId,
      });

      // Si redirectToCheckout falla (raro), muestra un error
      if (stripeError) {
        console.error("Error al redirigir a Stripe:", stripeError);
        setError(stripeError.message || "No se pudo redirigir a la página de pago.");
      }
    } catch (err: any) {
      console.error("Error al crear la sesión de checkout:", err);
      setError(err.response?.data?.error || 'Error al iniciar el proceso de pago. Inténtalo de nuevo.');
    } finally {
      setIsLoading(prev => ({ ...prev, [subscriptionId]: false }));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  // Si el usuario ya está suscrito
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

  // Si no está suscrito muestra los planes disponibles ...
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
              disabled={isLoading[plan.id_subscription]} 
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
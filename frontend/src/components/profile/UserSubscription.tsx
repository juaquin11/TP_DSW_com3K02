import React, { useState, useEffect } from 'react';
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
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({}); // Estado de carga individual por botón
  const [error, setError] = useState<string | null>(null);

  // Cargar los planes disponibles cuando el componente se monta (si no está suscrito)
  useEffect(() => {
    if (!profile.subscription && token) {
      const loadPlans = async () => {
        try {
          setError(null); // Limpia errores previos
          const availablePlans = await fetchSubscriptions(token);
          setPlans(availablePlans);
        } catch (err) {
          console.error("Error loading subscription plans:", err);
          setError('No se pudieron cargar los planes de suscripción.');
        }
      };
      loadPlans();
    }
  }, [profile.subscription, token]);

  const handleSubscribe = async (subscriptionId: string) => {
    if (!token) {
      console.error("No estás autenticado.");
      setError("Error al iniciar el pago. Verifica tu sesión.");
      return;
    }

    // Marca este botón específico como 'cargando'
    setIsLoading(prev => ({ ...prev, [subscriptionId]: true }));
    setError(null);

    try {
      console.log(`Iniciando checkout para subscriptionId: ${subscriptionId}`);
      const { url: sessionUrl } = await createStripeCheckoutSession(subscriptionId, token);
      console.log(`URL de sesión recibida: ${sessionUrl}`);

      if (sessionUrl) {
        window.location.href = sessionUrl; // Redirección simple
      } else {
        throw new Error("No se recibió una URL de checkout válida del servidor.");
      }

    } catch (err: any) {
      console.error("Error en handleSubscribe:", err);
      const errorMsg = err.response?.data?.error || err.message || 'Error al iniciar el proceso de pago. Inténtalo de nuevo más tarde.';
      setError(errorMsg);
      setIsLoading(prev => ({ ...prev, [subscriptionId]: false }));
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric', month: 'long', day: 'numeric',
        });
    } catch (e) {
        console.error("Error formatting date:", dateString, e);
        return 'Fecha inválida';
    }
  };

  // Si el usuario ya está suscrito, muestra su estado actual
  if (profile.subscription) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>Mi Suscripción</h2>
        <div className={styles.currentPlan}>
          <div className={styles.planIcon}>⭐</div>
          <h3>Plan {profile.subscription.plan_name}</h3>
          <p>Activo desde: {formatDate(profile.subscription.adhesion_date)}</p>
        </div>
      </div>
    );
  }

  // Si no está suscrito, muestra los planes disponibles
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Elige tu Plan</h2>
      <div className={styles.plansGrid}>
        {plans.length === 0 && !error && <p>Cargando planes...</p>} 
        {plans.map((plan) => (
          <div key={plan.id_subscription} className={styles.planCard}>
            <h3>{plan.plan_name}</h3>
            <p className={styles.price}>${typeof plan.price === 'number' || typeof plan.price === 'string' ? Number(plan.price).toFixed(2) : 'N/A'}</p>
            <p className={styles.duration}>
              {plan.duration > 30 ? `${Math.round(plan.duration / 30)} meses` : 'Mensual'}
            </p>
            <button
              onClick={() => handleSubscribe(plan.id_subscription)}
              disabled={isLoading[plan.id_subscription]} // Usa el estado de carga individual
              className={styles.subscribeButton}
            >
              {isLoading[plan.id_subscription] ? 'Procesando...' : 'Suscribirme'}
            </button>
          </div>
        ))}
      </div>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};

export default UserSubscription;

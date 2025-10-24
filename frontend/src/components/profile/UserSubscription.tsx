// frontend/src/components/profile/UserSubscription.tsx
import React, { useState, useEffect } from 'react';
// import { useStripe } from '@stripe/react-stripe-js'; // Ya no es necesario para este flujo
import { useAuth } from '../../context/AuthContext';
import { fetchSubscriptions } from '../../services/subscriptionService';
import { createStripeCheckoutSession } from '../../services/paymentService'; // Asegúrate que la ruta es correcta
import type { UserProfile } from '../../types/user';
import type { subscription as SubscriptionPlan } from '../../types/subscription';
import styles from './UserSubscription.module.css';

interface Props {
  profile: UserProfile;
}

const UserSubscription: React.FC<Props> = ({ profile }) => {
  const { token } = useAuth();
  // const stripe = useStripe(); // Ya no se necesita para redirectToCheckout
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
    // Solo se necesita el token ahora
    if (!token) {
      console.error("No estás autenticado.");
      setError("Error al iniciar el pago. Verifica tu sesión.");
      return;
    }

    // Marca este botón específico como 'cargando'
    setIsLoading(prev => ({ ...prev, [subscriptionId]: true }));
    setError(null);

    try {
      // 1. Llama a tu backend para crear la sesión (ahora devuelve una URL)
      console.log(`Iniciando checkout para subscriptionId: ${subscriptionId}`);
      const { url: sessionUrl } = await createStripeCheckoutSession(subscriptionId, token);
      console.log(`URL de sesión recibida: ${sessionUrl}`);

      // 2. Si la URL existe, redirige al usuario
      if (sessionUrl) {
        window.location.href = sessionUrl; // Redirección simple
        // No necesitas manejar el isLoading aquí porque el usuario abandona la página
      } else {
        // Esto no debería pasar si el backend valida la respuesta de Stripe
        throw new Error("No se recibió una URL de checkout válida del servidor.");
      }

    } catch (err: any) {
      console.error("Error en handleSubscribe:", err);
      const errorMsg = err.response?.data?.error || err.message || 'Error al iniciar el proceso de pago. Inténtalo de nuevo más tarde.';
      setError(errorMsg);
      // Quita el estado de carga si hubo un error
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
          {/* Asegúrate de que `expiry_date` exista en tu tipo UserProfile si lo vas a usar */}
          {/* <p>Vence el: {formatDate(profile.subscription.expiry_date)}</p> */}
          <button className={styles.cancelButton} disabled>Cancelar Suscripción (Próximamente)</button>
        </div>
      </div>
    );
  }

  // Si no está suscrito, muestra los planes disponibles
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Elige tu Plan</h2>
      <div className={styles.plansGrid}>
        {plans.length === 0 && !error && <p>Cargando planes...</p>} {/* Feedback mientras cargan los planes */}
        {plans.map((plan) => (
          <div key={plan.id_subscription} className={styles.planCard}>
            <h3>{plan.plan_name}</h3>
            {/* Asegúrate que price sea un número antes de formatear */}
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

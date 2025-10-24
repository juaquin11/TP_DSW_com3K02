// frontend/src/services/paymentService.ts
import apiClient from './apiClient';

interface CreateCheckoutSessionResponse {
  sessionId: string; // El ID de la sesión de Stripe
}

/**
 * Llama al backend para crear una sesión de checkout de Stripe.
 * @param subscriptionId El ID del plan que se quiere comprar.
 * @param token El token de autenticación del usuario.
 * @returns El ID de la sesión de checkout.
 */
export const createStripeCheckoutSession = async (subscriptionId: string, token: string): Promise<CreateCheckoutSessionResponse> => {
  const response = await apiClient.post<CreateCheckoutSessionResponse>(
    '/payments/create-checkout-session', // Endpoint del backend
    { subscriptionId }, // Datos enviados al backend
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data; // Devuelve { sessionId: 'cs_test_...' }
};
// frontend/src/services/paymentService.ts
import apiClient from './apiClient';

interface CreateCheckoutSessionResponse {
  url: string; // Esperamos la URL de checkout directamente
}

/**
 * Llama al backend para crear una sesión de checkout de Stripe.
 * @param subscriptionId El ID del plan que se quiere comprar.
 * @param token El token de autenticación del usuario.
 * @returns Un objeto con la URL a la página de checkout de Stripe.
 * @throws {Error} Si la respuesta del backend no contiene la URL.
 */
export const createStripeCheckoutSession = async (subscriptionId: string, token: string): Promise<CreateCheckoutSessionResponse> => {
  const response = await apiClient.post<CreateCheckoutSessionResponse>(
    '/payments/create-checkout-session', // Endpoint del backend
    { subscriptionId }, // Datos enviados al backend
    {
      headers: {
        Authorization: `Bearer ${token}`, // Asegura que el token se envíe
      },
    }
  );

  // Validación extra: Asegurarse de que la URL viene en la respuesta
  if (!response.data || !response.data.url) {
    console.error("Respuesta inesperada del backend:", response);
    throw new Error("El servidor no devolvió la URL de pago necesaria.");
  }

  return response.data; // Devuelve { url: 'https://checkout.stripe.com/...' }
};

// frontend/src/services/paymentService.ts

import apiClient from './apiClient';

interface CreatePreferenceResponse {
  init_point: string; // La URL de pago de Mercado Pago
}

/**
 * Llama al backend para crear una preferencia de pago en Mercado Pago.
 * @param subscriptionId El ID del plan que se quiere comprar.
 * @param token El token de autenticación del usuario.
 * @returns La URL para redirigir al usuario al checkout.
 */
export const createPaymentPreference = async (subscriptionId: string, token: string): Promise<string> => {
  const response = await apiClient.post<CreatePreferenceResponse>(
    '/payments/create-preference',
    { subscriptionId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data.init_point;
};
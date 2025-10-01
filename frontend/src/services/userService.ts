import apiClient from './apiClient';
import type { UserStatus } from '../types/auth';

/**
 * Llama al endpoint del backend para obtener el estado actual del usuario.
 * @param token El token de autenticación del usuario.
 */
export const fetchUserStatus = async (token: string): Promise<UserStatus> => {
  const response = await apiClient.get<UserStatus>('/user/status', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

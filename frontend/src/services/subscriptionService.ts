import apiClient from './apiClient';
import type { subscription } from '../types/subscription';


export async function fetchSubscriptionByClient(id_User: string,token: string): Promise<subscription> {
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await apiClient.get<{data : subscription }>(`/subscriptions/client/${id_User}`, {
    headers,
  });
  return res.data.data;
}

export const fetchSubscriptions = async (token: string): Promise<subscription[]> => {
  const { data } = await apiClient.get('/subscriptions', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};
import apiClient from './apiClient';
import type { UserStatus } from '../types/auth';
import type { UserProfile } from '../types/user'; 


export const fetchUserStatus = async (token: string): Promise<UserStatus> => {
  const response = await apiClient.get<UserStatus>('/user/status', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};


export const fetchUserProfile = async (token: string): Promise<UserProfile> => {
  const response = await apiClient.get<UserProfile>('/user/profile', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

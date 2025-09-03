import apiClient from "./apiClient";
import type { RegisterDTO, LoginDTO, AuthResponseDTO } from '../types/auth.ts';

export const registerUser = async (data: RegisterDTO): Promise<AuthResponseDTO> => {
  const res = await apiClient.post("/auth/register", data);
  return res.data;
};

export const loginUser = async (data: LoginDTO): Promise<AuthResponseDTO> => {
  const res = await apiClient.post("/auth/login", data);
  return res.data;
};
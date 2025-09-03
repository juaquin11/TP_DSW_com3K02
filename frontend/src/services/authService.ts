import apiClient from "./apiClient";

export const registerUser = async (data: { email: string; password: string }) => {
  const res = await apiClient.post("/auth/register", data);
  return res.data;
};

export const loginUser = async (data: { email: string; password: string }) => {
  const res = await apiClient.post("/auth/login", data);
  return res.data;
};
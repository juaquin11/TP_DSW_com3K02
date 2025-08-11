import axios from "axios";

const API_URL = "http://localhost:3000/api/auth"; // URL de tu backend

export const registerUser = async (data: { email: string; password: string }) => {
  const res = await axios.post(`${API_URL}/register`, data);
  return res.data;
};

export const loginUser = async (data: { email: string; password: string }) => {
  const res = await axios.post(`${API_URL}/login`, data);
  return res.data;
};

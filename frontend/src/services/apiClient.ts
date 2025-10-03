import axios from 'axios';

export const API_BASE_URL = 'http://localhost:3000';

const apiClient = axios.create({
  // Ahora la URL de la API se construye a partir de la base
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});


export default apiClient;
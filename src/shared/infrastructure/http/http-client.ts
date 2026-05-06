import axios, { type AxiosInstance } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1';

/**
 * Cliente HTTP único para toda la app. Vive en `shared/infrastructure`
 * porque es transversal: lo consumen los adapters de cualquier bounded context.
 *
 * El interceptor de autenticación se inyecta desde fuera (en la composition root)
 * para que `shared` no dependa del bounded context IAM.
 */
export const createHttpClient = (getToken: () => string | null): AxiosInstance => {
  const http = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
  });

  http.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return http;
};

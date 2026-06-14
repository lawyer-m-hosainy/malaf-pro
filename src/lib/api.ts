import axios from 'axios';
import { useAuthStore } from '@/store/useAuthStore';

const isDevelopment = (import.meta as any).env.MODE === 'development';
const API_URL = isDevelopment ? 'http://localhost:3001/api' : '/api';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// إرفاق التوكن في كل طلب
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// معالجة الأخطاء والتوكن المنتهي
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // التوكن منتهي أو غير صالح، قم بتسجيل الخروج
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

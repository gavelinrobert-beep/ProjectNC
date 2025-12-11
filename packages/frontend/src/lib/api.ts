import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Auth API
export const authAPI = {
  register: async (data: { email: string; username: string; password: string }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (data: { email: string; password: string }) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Character API
export const characterAPI = {
  getCharacters: async () => {
    const response = await api.get('/characters');
    return response.data;
  },

  createCharacter: async (data: { name: string; race: string; class: string }) => {
    const response = await api.post('/characters', data);
    return response.data;
  },

  deleteCharacter: async (id: string) => {
    const response = await api.delete(`/characters/${id}`);
    return response.data;
  },
};

// World API
export const worldAPI = {
  getZones: async () => {
    const response = await api.get('/world/zones');
    return response.data;
  },

  getAbilities: async (classFilter?: string) => {
    const response = await api.get('/world/abilities', {
      params: { class: classFilter },
    });
    return response.data;
  },
};

export default api;

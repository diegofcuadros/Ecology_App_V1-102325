import axios from 'axios';
import type { 
  User, 
  AuthResponse, 
  Article, 
  Assignment, 
  ChatSession, 
  Message,
  Grade 
} from '../../shared/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'student' | 'professor';
  }): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
};

export const articleAPI = {
  getAll: async (): Promise<Article[]> => {
    const response = await api.get('/articles');
    return response.data;
  },
};

export const assignmentAPI = {
  getStudentAssignments: async (): Promise<any[]> => {
    const response = await api.get('/assignments/student');
    return response.data;
  },

  getProfessorAssignments: async (): Promise<any[]> => {
    const response = await api.get('/assignments/professor');
    return response.data;
  },

  getById: async (id: string): Promise<any> => {
    const response = await api.get(`/assignments/${id}`);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/assignments/${id}`);
  },

  getStats: async (id: string): Promise<any> => {
    const response = await api.get(`/assignments/${id}/stats`);
    return response.data;
  },
};

export const chatAPI = {
  getOrCreateSession: async (assignmentId: string): Promise<any> => {
    const response = await api.get(`/chat/session/${assignmentId}`);
    return response.data;
  },

  sendMessage: async (chatSessionId: string, text: string): Promise<any> => {
    const response = await api.post('/chat/message', { chatSessionId, text });
    return response.data;
  },
};

export default api;

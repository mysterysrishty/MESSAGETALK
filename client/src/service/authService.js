
import api from './api';

const authService = {
  // Register
  register: async (name, email, password) => {
    const response = await api.post('/auth/register', {
      name,
      email,
      password
    });
    return response.data;
  },

  // Login
  login: async (email, password) => {
    const response = await api.post('/auth/login', {
      email,
      password
    });
    return response.data;
  },

  // Google login
  loginWithGoogle: async (sessionId) => {
    const response = await api.post('/auth/google/session', {
      session_id: sessionId
    });
    return response.data;
  },

  // Current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  }
};

export default authService;


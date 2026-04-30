
import api from './api';

const userService = {
  // Get all users
  getAllUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  // Search users
  searchUsers: async (query) => {
    const response = await api.get('/users/search', {
      params: { q: query }
    });
    return response.data;
  },

  // Update current profile
  updateProfile: async (payload) => {
    const response = await api.patch('/users/me', payload);
    return response.data;
  }
};

export default userService;



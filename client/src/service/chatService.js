
import api from './api';

const chatService = {
  // Get all conversations
  getConversations: async () => {
    const response = await api.get('/conversations');
    return response.data;
  },

  // Get single conversation
  getConversation: async (conversationId) => {
    const response = await api.get(`/conversations/${conversationId}`);
    return response.data;
  },

  // Create private conversation
  createPrivateConversation: async (userId) => {
    const response = await api.post('/conversations/private', {
      user_id: userId
    });
    return response.data;
  },

  // Create group conversation
  createGroupConversation: async (name, participants) => {
    const response = await api.post('/conversations/group', {
      name,
      participants
    });
    return response.data;
  },

  // Get messages
  getMessages: async (conversationId, limit = 50, before = null) => {
    const params = { limit };
    if (before) params.before = before;

    const response = await api.get(
      `/conversations/${conversationId}/messages`,
      { params }
    );
    return response.data;
  },

  // Send message
  sendMessage: async (conversationId, content, type = 'text') => {
    const response = await api.post(
      `/conversations/${conversationId}/messages`,
      { content, type }
    );
    return response.data;
  }
};

export default chatService;


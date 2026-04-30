
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import useSocket from '../hooks/useSocket';
import chatService from '../service/chatService';
import userService from '../service/userService';
import { SOCKET_EVENTS } from '../utils/constants';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { token } = useAuth();
  const { socket, isConnected } = useSocket(token);

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState({});
  const [users, setUsers] = useState([]);

  // 🔌 SOCKET EVENTS
  useEffect(() => {
    if (!socket) return;

    const handleUserOnline = ({ user_id }) => {
      setOnlineUsers(prev => new Set([...prev, user_id]));
    };

    const handleUserOffline = ({ user_id }) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(user_id);
        return newSet;
      });
    };

    const handleNewMessage = (message) => {
      setMessages((prev) => {
        if (message.conversation_id !== activeConversation?.conversation_id) {
          return prev;
        }

        if (prev.some((m) => m.message_id === message.message_id)) return prev;
        return [...prev, message];
      });

      // Update conversation list
      setConversations(prev =>
        [...prev]
          .map(conv =>
            conv.conversation_id === message.conversation_id
              ? {
                  ...conv,
                  last_message: {
                    content: message.content,
                    sender_id: message.sender_id,
                    timestamp: message.created_at,
                  },
                  updated_at: message.created_at,
                }
              : conv
          )
          .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      );
    };

    const handleTyping = ({ user_id, name, is_typing }) => {
      setTypingUsers(prev => {
        const updated = { ...prev };
        if (is_typing) {
          updated[user_id] = name;
        } else {
          delete updated[user_id];
        }
        return updated;
      });
    };

    socket.on(SOCKET_EVENTS.USER_ONLINE, handleUserOnline);
    socket.on(SOCKET_EVENTS.USER_OFFLINE, handleUserOffline);
    socket.on(SOCKET_EVENTS.NEW_MESSAGE, handleNewMessage);
    socket.on(SOCKET_EVENTS.USER_TYPING, handleTyping);

    return () => {
      socket.off(SOCKET_EVENTS.USER_ONLINE, handleUserOnline);
      socket.off(SOCKET_EVENTS.USER_OFFLINE, handleUserOffline);
      socket.off(SOCKET_EVENTS.NEW_MESSAGE, handleNewMessage);
      socket.off(SOCKET_EVENTS.USER_TYPING, handleTyping);
    };
  }, [activeConversation?.conversation_id, socket]);

  // 📥 FETCH DATA
  const fetchConversations = useCallback(async () => {
    setLoadingConversations(true);
    try {
      const data = await chatService.getConversations();
      setConversations(data);
    } catch (err) {
      console.error("Fetch conversations error:", err);
    } finally {
      setLoadingConversations(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error("Fetch users error:", err);
    }
  }, []);

  const fetchMessages = useCallback(async (conversationId) => {
    setLoadingMessages(true);
    try {
      const data = await chatService.getMessages(conversationId);
      setMessages(data);
    } catch (err) {
      console.error("Fetch messages error:", err);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  // 💬 SEND MESSAGE
  const sendMessage = useCallback((content, type = "text") => {
    if (!socket || !activeConversation) return;

    socket.emit(SOCKET_EVENTS.SEND_MESSAGE, {
      conversation_id: activeConversation.conversation_id,
      content,
      type,
    });
  }, [socket, activeConversation]);

  // ✍️ TYPING
  const sendTyping = useCallback((isTyping) => {
    if (!socket || !activeConversation) return;

    socket.emit(SOCKET_EVENTS.TYPING, {
      conversation_id: activeConversation.conversation_id,
      is_typing: isTyping,
    });
  }, [socket, activeConversation]);

  // 👤 PRIVATE CHAT
  const startPrivateChat = useCallback(async (userId) => {
    try {
      const conv = await chatService.createPrivateConversation(userId);

      setConversations(prev => {
        if (prev.some(c => c.conversation_id === conv.conversation_id)) return prev;
        return [conv, ...prev];
      });

      socket?.emit(SOCKET_EVENTS.JOIN_CONVERSATION, conv.conversation_id);

      return conv;
    } catch (err) {
      console.error("Start private chat error:", err);
      return null;
    }
  }, [socket]);

  // 👥 GROUP CHAT
  const createGroupChat = useCallback(async (name, participants) => {
    try {
      const conv = await chatService.createGroupConversation(name, participants);

      setConversations(prev => [conv, ...prev]);

      socket?.emit(SOCKET_EVENTS.JOIN_CONVERSATION, conv.conversation_id);

      return conv;
    } catch (err) {
      console.error("Create group error:", err);
      return null;
    }
  }, [socket]);

  // 🔄 SELECT CONVERSATION
  const selectConversation = useCallback(async (conversation) => {
    if (!conversation) return;

    setActiveConversation(conversation);
    await fetchMessages(conversation.conversation_id);

    socket?.emit(SOCKET_EVENTS.JOIN_CONVERSATION, conversation.conversation_id);
  }, [fetchMessages, socket]);

  // 🔍 SEARCH USERS
  const searchUsers = useCallback(async (query) => {
    if (!query) return [];
    try {
      return await userService.searchUsers(query);
    } catch {
      return [];
    }
  }, []);

  // 🚀 INITIAL LOAD
  useEffect(() => {
    if (token) {
      fetchConversations();
      fetchUsers();
    }
  }, [token, fetchConversations, fetchUsers]);

  return (
    <ChatContext.Provider
      value={{
        socket,
        isConnected,
        conversations,
        activeConversation,
        messages,
        loadingConversations,
        loadingMessages,
        onlineUsers,
        typingUsers,
        users,
        sendMessage,
        sendTyping,
        startPrivateChat,
        createGroupChat,
        selectConversation,
        searchUsers,
        fetchConversations,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return context;
};

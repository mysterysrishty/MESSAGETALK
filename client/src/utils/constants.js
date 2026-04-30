
// 🌐 API Configuration (React CRA)
export const API_BASE_URL =
  process.env.REACT_APP_BACKEND_URL ||
  "https://messagetalk.onrender.com/api"; // ✅ fallback for production


// 💾 Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: "msgmate_token",
  USER: "msgmate_user",
};


// 🔌 Socket Events
export const SOCKET_EVENTS = {
  CONNECT: "connect",
  DISCONNECT: "disconnect",

  USER_ONLINE: "user_online",
  USER_OFFLINE: "user_offline",

  JOIN_CONVERSATION: "join_conversation",
  LEAVE_CONVERSATION: "leave_conversation",

  SEND_MESSAGE: "send_message",
  NEW_MESSAGE: "new_message",

  TYPING: "typing",
  USER_TYPING: "user_typing",
};


// 💬 Message Types
export const MESSAGE_TYPES = {
  TEXT: "text",
  EMOJI: "emoji",
};


// 👥 Conversation Types
export const CONVERSATION_TYPES = {
  PRIVATE: "private",
  GROUP: "group",
};


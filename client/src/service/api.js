
import axios from "axios";

// ✅ Use environment variable (Vercel friendly)
const API_BASE_URL =
  process.env.REACT_APP_BACKEND_URL || "https://messagetalk.onrender.com/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  
});

// 🔐 Request interceptor (attach token)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("msgmate_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ⚠️ Response interceptor (handle errors globally)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      // Token expired
      localStorage.removeItem("msgmate_token");

      // Better than window.location
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;


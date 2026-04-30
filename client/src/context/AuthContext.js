
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import authService from "../service/authService";
import userService from "../service/userService";
import { STORAGE_KEYS } from "../utils/constants";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    localStorage.getItem(STORAGE_KEYS.TOKEN)
  );
  const [loading, setLoading] = useState(true);

  const syncUserState = useCallback((userData) => {
    setUser(userData);

    if (userData) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }, []);

  // 🔐 CHECK AUTH (on refresh)
  const checkAuth = useCallback(async () => {
    try {
      const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);

      // Skip during OAuth redirect
      if (window.location.hash?.includes("session_id=")) {
        setLoading(false);
        return;
      }

      if (!storedToken) {
        syncUserState(null);
        setToken(null);
        setLoading(false);
        return;
      }

      const userData = await authService.getCurrentUser();

      syncUserState(userData);
      setToken(storedToken);
    } catch (err) {
      console.error("Auth check failed:", err);

      // 🔥 Clean everything if invalid
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      syncUserState(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, [syncUserState]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // 🔑 LOGIN
  const login = async (email, password) => {
    const { user: userData, token: newToken } =
      await authService.login(email, password);

    localStorage.setItem(STORAGE_KEYS.TOKEN, newToken);

    setToken(newToken);
    syncUserState(userData);

    return userData;
  };

  // 📝 REGISTER
  const register = async (name, email, password) => {
    const { user: userData, token: newToken } =
      await authService.register(name, email, password);

    localStorage.setItem(STORAGE_KEYS.TOKEN, newToken);

    setToken(newToken);
    syncUserState(userData);

    return userData;
  };

  // 🌐 GOOGLE LOGIN
  const loginWithGoogle = async (sessionId) => {
    try {
      const { user: userData, token: newToken } =
        await authService.loginWithGoogle(sessionId);

      localStorage.setItem(STORAGE_KEYS.TOKEN, newToken);

      setToken(newToken);
      syncUserState(userData);

      return userData;
    } catch (err) {
      console.error("Google login failed:", err);
      throw err;
    }
  };

  const updateProfile = async (payload) => {
    const updatedUser = await userService.updateProfile(payload);
    syncUserState(updatedUser);
    return updatedUser;
  };

  // 🚪 LOGOUT
  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);

    syncUserState(null);
    setToken(null);

    // Optional: force redirect
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        loginWithGoogle,
        updateProfile,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// 🔁 Hook
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

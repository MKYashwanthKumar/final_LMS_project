import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../services/apiClient";

const AuthContext = createContext(null);
const CURRENT_USER_KEY = "vemu_dlms_current_user";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = () => {
    try {
      const savedUser = localStorage.getItem(CURRENT_USER_KEY);
      setUser(savedUser ? JSON.parse(savedUser) : null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async ({ username, password, role }) => {
    const { data } = await api.post("/auth/login", {
      username,
      password,
      role
    });

    if (!data.success) {
      throw new Error(data.message || "Login failed");
    }

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);

    if (!data.success) {
      throw new Error(data.message || "Registration failed");
    }

    return data;
  };

  const logout = async () => {
    localStorage.removeItem(CURRENT_USER_KEY);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      refreshUser
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
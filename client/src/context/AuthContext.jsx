import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Initialize from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('sb_token');
    const storedUser = localStorage.getItem('sb_user');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('sb_token');
        localStorage.removeItem('sb_user');
      }
    }
    setLoading(false);
    setInitialized(true);
  }, []);

  // Verify token on app load
  useEffect(() => {
    if (!initialized || !token) return;
    const verify = async () => {
      try {
        const res = await authAPI.getMe();
        setUser(res.data.user);
        localStorage.setItem('sb_user', JSON.stringify(res.data.user));
      } catch {
        logout();
      }
    };
    verify();
  }, [initialized]);

  const login = useCallback(async (credentials) => {
    const res = await authAPI.login(credentials);
    const { token: newToken, user: newUser } = res.data;
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('sb_token', newToken);
    localStorage.setItem('sb_user', JSON.stringify(newUser));
    return newUser;
  }, []);

  const register = useCallback(async (data) => {
    const res = await authAPI.register(data);
    const { token: newToken, user: newUser } = res.data;
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('sb_token', newToken);
    localStorage.setItem('sb_user', JSON.stringify(newUser));
    return newUser;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('sb_token');
    localStorage.removeItem('sb_user');
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('sb_user', JSON.stringify(updatedUser));
  }, []);

  const isRole = useCallback((...roles) => {
    return user && roles.includes(user.role);
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isAuthenticated: !!user,
      isStudent: user?.role === 'student',
      isRecruiter: user?.role === 'recruiter',
      isAdmin: user?.role === 'tp_admin' || user?.role === 'super_admin',
      isSuperAdmin: user?.role === 'super_admin',
      isRole,
      login,
      register,
      logout,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

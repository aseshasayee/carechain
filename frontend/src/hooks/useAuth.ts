import { useState, useEffect } from 'react';
import { authService, User } from '@/lib/auth';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(authService.getCurrentUser());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = authService.subscribe(setUser);
    return unsubscribe;
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    setLoading(true);
    try {
      const user = await authService.login(email, password, rememberMe);
      return user;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any) => {
    setLoading(true);
    try {
      const user = await authService.register(userData);
      return user;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout
  };
};
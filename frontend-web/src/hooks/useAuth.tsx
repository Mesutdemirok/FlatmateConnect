import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCurrentUser, login as authLogin, register as authRegister, logout as authLogout, type AuthUser } from '@/lib/auth';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; firstName: string; lastName: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  const refreshUser = async () => {
    try {
      setIsLoading(true);
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error refreshing user:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
      setHasCheckedAuth(true);
    }
  };

  useEffect(() => {
    // Only check auth once on mount
    if (!hasCheckedAuth) {
      refreshUser();
    }
  }, [hasCheckedAuth]);

  const login = async (email: string, password: string) => {
    try {
      const result = await authLogin({ email, password });
      setUser(result.user);
      // Refresh user data after login to ensure consistency
      setTimeout(() => refreshUser(), 100);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (data: { email: string; password: string; firstName: string; lastName: string }) => {
    try {
      const result = await authRegister(data);
      setUser(result.user);
      // Refresh user data after registration to ensure consistency
      setTimeout(() => refreshUser(), 100);
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authLogout();
      setUser(null);
      setHasCheckedAuth(false);
    } catch (error) {
      console.error('Logout error:', error);
      // Clear user even if logout fails
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

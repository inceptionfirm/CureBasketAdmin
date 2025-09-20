import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService from '../services/authService';
import { AuthContextType, User, LoginResponse, RegisterData, RegisterResponse } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps): React.JSX.Element => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if user is already authenticated on app load
    const checkAuth = () => {
      try {
        const isAuth = authService.isAuthenticated();
        const userData = authService.getCurrentUser();
        
        setIsAuthenticated(isAuth);
        setUser(userData || null);
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<LoginResponse> => {
    try {
      setLoading(true);
      const result = await authService.login(email, password);
      
      if (result.success) {
        setUser(result.user);
        setIsAuthenticated(true);
        return { success: true, user: result.user };
      }
      return { success: false, error: result.error };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      return { success: true };
    } catch (error) {
      console.error('Logout failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<RegisterResponse> => {
    try {
      setLoading(true);
      const result = await authService.register(userData);
      return result;
    } catch (error) {
      console.error('Registration failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    register
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

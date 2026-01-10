import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService from '../services/authService';
import { AuthContextType, User, LoginResponse, RegisterData, RegisterResponse } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Export hook first (function declaration for Fast Refresh compatibility)
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Export component as function declaration (not arrow function) for Fast Refresh
export function AuthProvider({ children }: AuthProviderProps) {
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

  const login = async (email: string, password: string, rememberMe: boolean = false): Promise<LoginResponse> => {
    try {
      setLoading(true);
      console.log('🔐 AuthContext: Starting login...');
      const result = await authService.login(email, password, rememberMe);
      
      console.log('🔐 AuthContext: Login result:', result);
      
      if (result.success && result.user) {
        console.log('🔐 AuthContext: Setting user and authenticated state');
        setUser(result.user);
        setIsAuthenticated(true);
        
        // Double-check that auth service confirms authentication
        const isAuth = authService.isAuthenticated();
        const userData = authService.getCurrentUser();
        console.log('🔐 AuthContext: Auth service check:', { isAuth, userData });
        
        return { 
          success: true, 
          user: result.user,
          redirectUrl: result.redirectUrl, // Pass through redirect URL
        };
      }
      
      console.error('🔐 AuthContext: Login failed - no user in result');
      return { success: false, error: result.error || 'Login failed' };
    } catch (error) {
      console.error('❌ AuthContext: Login exception:', error);
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
}

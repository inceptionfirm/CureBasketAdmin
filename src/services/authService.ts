import { User, AuthData, LoginResponse, RegisterData, RegisterResponse } from '../types';

class AuthService {
  private storageKey: string;
  private userKey: string;
  private tokenKey: string;

  constructor() {
    this.storageKey = 'flycanary_auth';
    this.userKey = 'flycanary_user';
    this.tokenKey = 'flycanary_token';
  }

  private mockUsers: User[] = [
    {
      id: 1,
      email: 'admin@flycanary.com',
      password: 'admin123',
      name: 'Admin User',
      role: 'admin',
      avatar: '👨‍💼'
    },
    {
      id: 2,
      email: 'user@flycanary.com',
      password: 'user123',
      name: 'Regular User',
      role: 'user',
      avatar: '👤'
    },
    {
      id: 3,
      email: 'demo@flycanary.com',
      password: 'demo123',
      name: 'Demo User',
      role: 'user',
      avatar: '🎭'
    }
  ];

  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const user = this.mockUsers.find(u => 
        u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );

      if (!user) {
        throw new Error('Invalid email or password');
      }

      const token = this.generateToken(user);
      
      const authData = {
        isAuthenticated: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar
        },
        loginTime: new Date().toISOString()
      };

      localStorage.setItem(this.storageKey, JSON.stringify(authData));
      localStorage.setItem(this.userKey, JSON.stringify(authData.user));
      localStorage.setItem(this.tokenKey, token);

      return {
        success: true,
        user: authData.user,
        token
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  logout(): { success: boolean } {
    try {
      localStorage.removeItem(this.storageKey);
      localStorage.removeItem(this.userKey);
      localStorage.removeItem(this.tokenKey);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  isAuthenticated(): boolean {
    try {
      const authData = localStorage.getItem(this.storageKey);
      
      if (!authData) {
        return false;
      }

      const parsed = JSON.parse(authData);
      const isValid = parsed.isAuthenticated && this.isTokenValid(parsed.token);
      
      return isValid;
    } catch (error) {
      console.error('Auth check error:', error);
      return false;
    }
  }

  getCurrentUser(): User | null {
    try {
      const userData = localStorage.getItem(this.userKey);
      if (!userData) return null;

      return JSON.parse(userData);
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }

  getToken(): string | null {
    try {
      return localStorage.getItem(this.tokenKey);
    } catch (error) {
      console.error('Get token error:', error);
      return null;
    }
  }

  private generateToken(user: User): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      userId: user.id,
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    }));
    const signature = btoa('mock-signature');
    
    return `${header}.${payload}.${signature}`;
  }

  private isTokenValid(token: string): boolean {
    if (!token) return false;
    
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;

      const payload = JSON.parse(atob(parts[1]));
      const now = Math.floor(Date.now() / 1000);
      
      return payload.exp > now;
    } catch (error) {
      return false;
    }
  }

  async register(userData: RegisterData): Promise<RegisterResponse> {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const existingUser = this.mockUsers.find(u => 
        u.email.toLowerCase() === userData.email.toLowerCase()
      );

      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      const newUser = {
        id: this.mockUsers.length + 1,
        ...userData,
        role: 'user',
        avatar: '👤'
      };

      this.mockUsers.push(newUser);

      return {
        success: true,
        message: 'User registered successfully'
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  clearAuthData(): void {
    try {
      localStorage.removeItem(this.storageKey);
      localStorage.removeItem(this.userKey);
      localStorage.removeItem(this.tokenKey);
    } catch (error) {
      console.error('Clear auth data error:', error);
    }
  }
}

export default new AuthService();

import { apiClient } from './apiClient';
import { User, AuthData, LoginResponse, RegisterData, RegisterResponse } from '../types';

interface BackendUser {
  id?: string | number;
  userId?: string | number;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  avatar?: string | null;
  permissions?: string[];
}

interface LoginApiResponse {
  user?: BackendUser;
  userDto?: BackendUser;
  data?: Record<string, any>;
  result?: Record<string, any>;
  token?: string;
  accessToken?: string;
  authToken?: string;
  jwt?: string;
  jwtToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  message?: string;
  status?: string;
  [key: string]: any;
  }

// Note: apiClient handles the baseURL, so we just pass the endpoint path
// No need to build full URLs here anymore

export interface AddressPayload {
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  emailAddress: string;
  phoneNumber: string;
}

export interface ContactPayload {
  email: string;
  mainPhone: string;
  secondaryPhone?: string;
  isEmailVerified: boolean;
  isMainPhoneVerified: boolean;
}

export interface SuperAdminPayload {
  name: string;
  address: AddressPayload;
  contact: ContactPayload;
  tagline: string;
  description: string;
  isCategoryEnabled: boolean;
  isSupplier: boolean;
  isSeller: boolean;
  isActive: boolean;
  isDeleted: boolean;
  isVerified: boolean;
  uniqueId: string;
  domainName: string;
  password: string;
  role: string;
}

class AuthService {
  private readonly storageKey = 'flycanary_auth';
  private readonly userKey = 'flycanary_user';
  private readonly tokenKey = 'flycanary_token';

  async login(email: string, password: string, rememberMe: boolean = false): Promise<LoginResponse> {
    try {
      // apiClient handles baseURL, just pass the endpoint path
      // Backend expects only email and password (rememberMe is handled client-side)
      const loginPayload = { email, password };
      
      console.log('🔐 Login Request:', {
        endpoint: '/auth/login',
        payload: { ...loginPayload, password: '***hidden***' }, // Don't log password
        email,
      });
      
      const response = await apiClient.post<LoginApiResponse>(
        '/auth/login',
        loginPayload
      );

      console.log('🔐 Login API Response:', {
        success: response.success,
        data: response.data,
        message: response.message,
        error: response.error,
        fullResponse: response,
      });
      
      // Log the raw response structure for debugging
      console.log('🔐 Login Response Structure:', {
        hasData: !!response.data,
        dataKeys: response.data ? Object.keys(response.data) : [],
        dataType: typeof response.data,
        responseKeys: Object.keys(response),
      });

      if (!response.success) {
        const errorMsg = response.error || response.message || 'Invalid email or password';
        console.error('❌ Login failed - API returned success: false', {
          error: response.error,
          message: response.message,
          data: response.data,
        });
        throw new Error(errorMsg);
      }

      const payloadSource = response.data ?? (response as unknown as Record<string, any>);
      console.log('🔐 Payload Source:', payloadSource);
      
      if (!payloadSource) {
        console.error('❌ No payload source found in response');
        throw new Error('Invalid response from server: missing data');
      }
      
      const payload = this.extractAuthPayload(payloadSource);
      console.log('🔐 Extracted Payload:', payload);

      if (!payload.token) {
        console.error('❌ No token found in payload:', {
          payload,
          payloadSource,
          extractedPayload: payload,
        });
        throw new Error('Invalid response from server: missing authentication token');
      }

      const derivedUser = payload.user ?? this.deriveUserFromToken(payload.token, email, payloadSource);
      console.log('🔐 Derived User:', derivedUser);

      if (!derivedUser) {
        console.error('❌ Could not derive user from token or payload:', {
          hasPayloadUser: !!payload.user,
          token: payload.token ? 'present' : 'missing',
          email,
          payloadSource,
        });
        throw new Error('Invalid response from server: could not determine user information');
      }

      const normalizedUser = this.normalizeUser(derivedUser);
      console.log('🔐 Normalized User:', normalizedUser);

      this.persistSession({ user: normalizedUser, token: payload.token, rememberMe, refreshToken: payload.refreshToken });
      this.persistBusinessMetadata(payloadSource);

      console.log('✅ Login successful, session persisted');

      // Extract redirect URL from response if available
      const redirectUrl = payloadSource.redirectUrl || 
                         payloadSource.redirect_url || 
                         payloadSource.redirect || 
                         undefined;

      return {
        success: true,
        user: normalizedUser,
        token: payload.token,
        redirectUrl: redirectUrl,
      };
    } catch (error) {
      console.error('❌ Login error:', error);
      const message = error instanceof Error ? error.message : 'Login failed';
      return { success: false, error: message };
    }
  }

  async createSuperAdmin(payload: SuperAdminPayload, apiKey: string): Promise<{ success: boolean; message?: string }> {
    try {
      console.log('🔐 Creating super admin with payload:', {
        endpoint: '/admin-penal/create-superadmin/super-admin-api-key',
        hasApiKey: !!apiKey,
        apiKeyLength: apiKey?.length || 0,
        payload: {
          ...payload,
          password: '***hidden***', // Don't log password
        }
      });

      // apiClient handles baseURL, just pass the endpoint path
      const response = await apiClient.post(
        '/admin-penal/create-superadmin/super-admin-api-key',
        payload,
        {
          'X-API-Key': apiKey,
        }
      );

      console.log('🔐 createSuperAdmin API Response:', {
        success: response.success,
        message: response.message,
        error: response.error,
        data: response.data,
      });

      if (!response.success) {
        const errorMsg = response.error || response.message || 'Failed to create super admin';
        console.error('❌ Create super admin failed:', errorMsg);
        throw new Error(errorMsg);
      }

      console.log('✅ Super admin created successfully');
      return {
        success: true,
        message: response.message || 'Super admin created successfully',
      };
    } catch (error) {
      console.error('❌ Create super admin error:', error);
      const message = error instanceof Error ? error.message : 'Failed to create super admin';
      return { success: false, message };
    }
  }

  logout(): { success: boolean } {
    try {
      localStorage.removeItem(this.storageKey);
      localStorage.removeItem(this.userKey);
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem('authToken');
      localStorage.removeItem('flycanary_refresh_token');
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  isAuthenticated(): boolean {
    try {
      const token = this.getToken();
      if (!token) {
        return false;
      }

      return this.isTokenValid(token);
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
      return localStorage.getItem(this.tokenKey) || localStorage.getItem('authToken');
    } catch (error) {
      console.error('Get token error:', error);
      return null;
    }
  }

  async register(_: RegisterData): Promise<RegisterResponse> {
    return {
      success: false,
      error: 'Registration is disabled. Please ask an administrator to create your account.',
    };
  }

  clearAuthData(): void {
    try {
      localStorage.removeItem(this.storageKey);
      localStorage.removeItem(this.userKey);
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem('authToken');
      localStorage.removeItem('flycanary_refresh_token');
    } catch (error) {
      console.error('Clear auth data error:', error);
    }
  }

  private persistSession({ user, token, rememberMe, refreshToken }: { user: User; token: string; rememberMe: boolean; refreshToken?: string }): void {
    const authData: AuthData = {
      isAuthenticated: true,
      token,
      user,
      loginTime: new Date().toISOString(),
    };

    localStorage.setItem(this.storageKey, JSON.stringify(authData));
    localStorage.setItem(this.userKey, JSON.stringify(user));
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem('authToken', token);
    if (refreshToken) {
      localStorage.setItem('flycanary_refresh_token', refreshToken);
    }

    if (!rememberMe) {
      localStorage.removeItem('flycanary_remembered_email');
    }
  }

  private extractAuthPayload(raw: LoginApiResponse | undefined): { user?: BackendUser; token?: string; refreshToken?: string } {
    if (!raw) {
      return {};
    }

    const possibleContainers: Record<string, any>[] = [];
    const queue: any[] = [raw];
    const visited = new WeakSet<object>();

    const enqueue = (value: any) => {
      if (!value) return;

      if (Array.isArray(value)) {
        value.forEach(item => {
          if (item && typeof item === 'object') {
            queue.push(item);
          }
        });
        return;
      }

      if (typeof value === 'object') {
        queue.push(value);
      }
    };

    while (queue.length > 0) {
      const current = queue.shift();
      if (!current || typeof current !== 'object') {
        continue;
      }

      if (visited.has(current as object)) {
        continue;
      }

      visited.add(current as object);
      possibleContainers.push(current);

      const record = current as Record<string, any>;
      enqueue(record.data);
      enqueue(record.result);
      enqueue(record.payload);
      enqueue(record.body);
      enqueue(record.response);
    }

    const userKeys = ['user', 'userDto', 'userData', 'account', 'profile'];
    const tokenKeys = ['token', 'accessToken', 'authToken', 'jwt', 'jwtToken', 'idToken'];
    const refreshKeys = ['refreshToken', 'refresh_token', 'refreshJwt', 'refreshJwtToken'];

    let user: BackendUser | undefined;
    let token: string | undefined;
    let refreshToken: string | undefined;

    for (const container of possibleContainers) {
      const record = container as Record<string, any>;

      if (!user) {
        for (const key of userKeys) {
          const candidate = record[key];
          if (candidate && typeof candidate === 'object') {
            user = candidate as BackendUser;
            break;
          }
        }

        if (
          !user &&
          typeof record.email === 'string' &&
          (record.name || record.firstName || record.lastName || record.role)
        ) {
          user = record as BackendUser;
        }
      }

      if (!token) {
        for (const key of tokenKeys) {
          const candidate = record[key];
          if (typeof candidate === 'string' && candidate.trim().length > 0) {
            token = candidate;
            break;
          }
        }
      }

      if (!refreshToken) {
        for (const key of refreshKeys) {
          const candidate = record[key];
          if (typeof candidate === 'string' && candidate.trim().length > 0) {
            refreshToken = candidate;
            break;
          }
        }
      }

      if (user && token && refreshToken) {
        break;
      }
    }

    return { user, token, refreshToken };
  }

  private deriveUserFromToken(token: string | undefined, fallbackEmail: string, rootSource?: Record<string, any>): BackendUser | undefined {
    if (!token) {
      return undefined;
    }

    const payload = this.decodeJWT(token);
    if (!payload) {
      if (!fallbackEmail) {
        return undefined;
      }
      return {
        email: fallbackEmail,
        role: this.extractRoleFromRoot(rootSource) ?? 'admin',
      };
    }

    const email = typeof payload.email === 'string'
      ? payload.email
      : typeof payload.sub === 'string'
        ? payload.sub
        : fallbackEmail;

    if (!email) {
      return undefined;
    }

    const userId = payload.userId ?? payload.id ?? payload.uid ?? payload.userID ?? payload.user_id;
    const roleFromPayload = payload.role ?? payload.roleName ?? payload.roleId ?? payload.role_id ?? payload.authorities;
    const role = this.normalizeRole(roleFromPayload) ?? this.extractRoleFromRoot(rootSource) ?? 'admin';
    const name = payload.name ?? payload.fullName ?? email;

    return {
      userId,
      email,
      role,
      name,
    };
  }

  private normalizeRole(roleLike: unknown): User['role'] | undefined {
    if (!roleLike) {
      return undefined;
    }

    if (typeof roleLike === 'string') {
      const lowered = roleLike.toLowerCase();
      if (['superadmin', 'admin', 'demo', 'user'].includes(lowered)) {
        return lowered as User['role'];
      }
      if (lowered.includes('super')) {
        return 'superadmin';
      }
      if (lowered.includes('admin')) {
        return 'admin';
      }
      if (lowered.includes('demo')) {
        return 'demo';
      }
      return 'user';
    }

    if (typeof roleLike === 'number') {
      return roleLike === 0 ? 'user' : 'admin';
    }

    if (Array.isArray(roleLike)) {
      const first = roleLike[0];
      return this.normalizeRole(first);
    }

    return undefined;
  }

  private extractRoleFromRoot(rootSource?: Record<string, any>): User['role'] | undefined {
    if (!rootSource) {
      return undefined;
    }
    const roleLike = rootSource.role ?? rootSource.roleName ?? rootSource.roleId ?? rootSource.role_id;
    return this.normalizeRole(roleLike);
  }

  private persistBusinessMetadata(container?: Record<string, any>): void {
    if (!container || typeof container !== 'object') {
      return;
    }

    const businessKeys = ['businessId', 'businessName', 'businessLogoUrl', 'businessAddress', 'businessContact'];
    const hasBusinessData = businessKeys.some(key => key in container);

    if (hasBusinessData) {
      try {
        localStorage.setItem('flycanary_business', JSON.stringify({
          businessId: container.businessId,
          businessName: container.businessName,
          businessLogoUrl: container.businessLogoUrl,
          businessAddress: container.businessAddress,
          businessContact: container.businessContact,
        }));
      } catch (error) {
        console.warn('Failed to persist business metadata', error);
      }
    }
  }

  private normalizeUser(user: BackendUser): User {
    const id = user.id ?? user.userId ?? '';
    const role = (user.role || 'admin').toLowerCase() as User['role'];
    const name = user.name || [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;

    return {
      id: String(id),
      email: user.email,
      name,
      role,
      avatar: user.avatar || this.generateAvatarFromName(name),
      permissions: user.permissions,
    };
  }

  private isTokenValid(token: string): boolean {
    try {
      const payload = this.decodeJWT(token);
      if (!payload) {
        return token.trim().length > 0;
      }

      if (payload.exp) {
        const now = Math.floor(Date.now() / 1000);
        return payload.exp > now;
      }

      return true;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }

  private decodeJWT(token: string): Record<string, any> | null {
    try {
      const [, payload] = token.split('.');
      if (!payload) {
        return null;
      }

      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    } catch (error) {
      console.warn('Failed to decode JWT:', error);
      return null;
    }
  }

  private generateAvatarFromName(name: string): string {
    if (!name) {
      return '👤';
    }
    const initials = name
      .split(' ')
      .filter(Boolean)
      .map(part => part[0]?.toUpperCase())
      .slice(0, 2)
      .join('');

    return initials || '👤';
  }
}

const authService = new AuthService();
export default authService;
export { authService };

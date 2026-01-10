import { apiClient } from './apiClient';
import { clientConfigManager } from '../config/clientConfig';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'superadmin' | 'admin';
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  profileImage?: string;
}

export interface UserFilters {
  search?: string;
  role?: string;
  status?: string;
}

export interface UserListParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: UserFilters;
}

export interface UserListResponse {
  users: User[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newThisMonth: number;
  recentLogins: number;
}

class UserService {
  private getEndpoint(path: string): string {
    const config = clientConfigManager.getConfig();
    return `${config.api.endpoints.users}${path}`;
  }

  async getUsers(params: UserListParams = {}): Promise<UserListResponse> {
    // Backend uses: /user/getAll?page=0&size=20&sortBy=email
    // Note: page is 0-indexed, size (not pageSize)
    const queryParams: Record<string, any> = {
      page: (params.page || 1) - 1, // Convert 1-indexed to 0-indexed
      size: params.pageSize || 10,
    };

    // Add sort parameters if provided
    if (params.sortBy) {
      queryParams.sortBy = params.sortBy;
    }
    // Backend might not support sortOrder, but include it if provided
    if (params.sortOrder) {
      queryParams.sortOrder = params.sortOrder;
    }

    // Flatten filters object into query parameters
    if (params.filters) {
      if (params.filters.search) {
        queryParams.search = params.filters.search;
      }
      if (params.filters.role) {
        queryParams.role = params.filters.role;
      }
      if (params.filters.status) {
        queryParams.status = params.filters.status;
      }
    }

    // Use the correct endpoint: /user/getAll
    const endpoint = '/user/getAll';

    try {
      const response = await apiClient.get<any>(endpoint, queryParams);

    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch users');
    }

      // Backend response structure:
      // {
      //   "content": [...],
      //   "pageable": {...},
      //   "totalPages": 1,
      //   "totalElements": 2,
      //   ...
      // }
      const data = response.data || {};
      const usersList = data.content || [];
      
      // Extract pagination info from backend response
      const totalElements = data.totalElements || usersList.length;
      const totalPages = data.totalPages || 1;
      const currentPage = data.number !== undefined ? data.number : (queryParams.page || 0);
      const pageSize = data.size || queryParams.size || 10;
      
      console.log(`✅ Successfully fetched users:`, usersList.length, 'total:', totalElements);
      
      return {
        users: usersList,
        pagination: {
          page: currentPage + 1, // Convert back to 1-indexed for frontend
          pageSize: pageSize,
          total: totalElements,
          totalPages: totalPages
        }
      };
    } catch (error) {
      console.error('❌ Failed to fetch users:', error);
      // Return empty result instead of throwing to prevent page break
      return {
        users: [],
        pagination: {
          page: (queryParams.page || 0) + 1,
          pageSize: queryParams.size || 10,
          total: 0,
          totalPages: 0
        }
      };
    }
  }

  async getUser(id: string): Promise<User> {
    // Backend endpoint: GET /user/getById/{id}
    const response = await apiClient.get<any>(`/user/getById/${id}`);

    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch user');
    }

    // Map backend response to frontend User format
    const user = response.data || {};
    const fullName = user.fullName || '';
    const nameParts = fullName.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    const roleStr = (user.role || '').toLowerCase();
    const normalizedRole = roleStr === 'superadmin' ? 'superadmin' : 'admin';
    const status = user.active === true ? 'active' : 'inactive';

    return {
      id: String(user.id || ''),
      firstName: firstName,
      lastName: lastName,
      email: user.email || '',
      phone: user.phone || user.phoneNumber || '',
      role: normalizedRole as 'admin' | 'superadmin',
      status: status as 'active' | 'inactive',
      profileImage: user.profileImage || user.profile_image || '',
      lastLogin: user.lastLogin || user.last_login || '',
      createdAt: user.createdAt || user.created_at || '',
      updatedAt: user.updatedAt || user.updated_at || '',
    };
  }

  async createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const response = await apiClient.post<User>(
      this.getEndpoint(''),
      user
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to create user');
    }

    return response.data!;
  }

  async createAdmin(payload: {
    email: string;
    fullName?: string; // Backend uses fullName, not firstName/lastName
    firstName?: string; // For backward compatibility
    lastName?: string; // For backward compatibility
    phoneNumber: string;
    password: string;
    roleId: number;
    businessId: number;
    isDeleted: boolean;
    isActive: boolean;
  }): Promise<{ success: boolean; message?: string; data?: User }> {
    // Backend expects: { email, fullName, phoneNumber, password, roleId, businessId, isDeleted, isActive }
    // Convert firstName + lastName to fullName if needed
    const fullName = payload.fullName || 
                    (payload.firstName && payload.lastName 
                      ? `${payload.firstName} ${payload.lastName}`.trim()
                      : payload.firstName || payload.lastName || '');
    
    const backendPayload = {
      email: payload.email,
      fullName: fullName,
      phoneNumber: payload.phoneNumber,
      password: payload.password,
      roleId: payload.roleId,
      businessId: payload.businessId,
      isDeleted: payload.isDeleted,
      isActive: payload.isActive,
    };

    console.log('🚀 Calling createAdmin API:', '/user/createAdmin', backendPayload);
    
    const response = await apiClient.post<any>(
      '/user/createAdmin',
      backendPayload
    );

    console.log('📥 createAdmin response:', response);

    if (!response.success) {
      console.error('❌ createAdmin failed:', response.error, response.message);
      throw new Error(response.error || response.message || 'Failed to create admin user');
    }

    console.log('✅ createAdmin successful:', response.data);

    // Map backend response to frontend User format
    const userData = response.data || {};
    const nameParts = (userData.fullName || fullName || '').split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    const roleStr = (userData.role || '').toLowerCase();
    const normalizedRole = roleStr === 'superadmin' ? 'superadmin' : 'admin';
    const status = userData.active === true ? 'active' : 'inactive';

    const mappedUser: User = {
      id: String(userData.id || ''),
      firstName: firstName,
      lastName: lastName,
      email: userData.email || payload.email,
      phone: userData.phone || userData.phoneNumber || payload.phoneNumber,
      role: normalizedRole as 'admin' | 'superadmin',
      status: status as 'active' | 'inactive',
      profileImage: userData.profileImage || userData.profile_image || '',
      lastLogin: userData.lastLogin || userData.last_login || '',
      createdAt: userData.createdAt || userData.created_at || new Date().toISOString(),
      updatedAt: userData.updatedAt || userData.updated_at || new Date().toISOString(),
    };

    return {
      success: true,
      message: response.message || 'Admin user created successfully',
      data: mappedUser,
    };
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    // Backend endpoint: PUT /user/edit/{id}
    // Backend expects: { email, firstName, lastName, phoneNumber, password, roleId, role, businessId, isDeleted, isActive }
    const roleStr = (updates.role || 'admin').toUpperCase();
    const normalizedRole = roleStr === 'SUPERADMIN' ? 'SUPERADMIN' : 'ADMIN';
    
    const payload = {
      email: updates.email || '',
      firstName: updates.firstName || '',
      lastName: updates.lastName || '',
      phoneNumber: updates.phone || '',
      password: (updates as any).password || undefined, // Only include if provided
      roleId: (updates as any).roleId || undefined,
      role: normalizedRole,
      businessId: (updates as any).businessId || undefined,
      isDeleted: updates.status === 'inactive' ? true : false,
      isActive: updates.status === 'active' ? true : false,
    };

    // Remove undefined fields
    Object.keys(payload).forEach(key => {
      if (payload[key as keyof typeof payload] === undefined) {
        delete payload[key as keyof typeof payload];
      }
    });

    // Backend uses POST for edit endpoint (curl --data-raw means POST)
    const response = await apiClient.post<any>(`/user/edit/${id}`, payload);

    if (!response.success) {
      throw new Error(response.error || 'Failed to update user');
    }

    // Map backend response back to frontend format
    const user = response.data || {};
    const fullName = user.fullName || `${payload.firstName} ${payload.lastName}`.trim();
    const nameParts = fullName.split(' ');
    const firstName = nameParts[0] || payload.firstName || '';
    const lastName = nameParts.slice(1).join(' ') || payload.lastName || '';
    
    const roleStr2 = (user.role || payload.role || '').toLowerCase();
    const normalizedRole2 = roleStr2 === 'superadmin' ? 'superadmin' : 'admin';
    const status = user.active !== undefined ? (user.active ? 'active' : 'inactive') : (payload.isActive ? 'active' : 'inactive');

    return {
      id: String(user.id || id),
      firstName: firstName,
      lastName: lastName,
      email: user.email || payload.email || '',
      phone: user.phone || user.phoneNumber || payload.phoneNumber || '',
      role: normalizedRole2 as 'admin' | 'superadmin',
      status: status as 'active' | 'inactive',
      profileImage: user.profileImage || user.profile_image || '',
      lastLogin: user.lastLogin || user.last_login || '',
      createdAt: user.createdAt || user.created_at || '',
      updatedAt: user.updatedAt || user.updated_at || new Date().toISOString(),
    };
  }

  async deleteUser(id: string): Promise<void> {
    // Backend endpoint: DELETE /user/delete/{id}
    const response = await apiClient.delete(`/user/delete/${id}`);

    if (!response.success) {
      throw new Error(response.error || 'Failed to delete user');
    }
  }

  async getUserStats(): Promise<UserStats> {
    // Stats endpoint doesn't exist - return default stats to avoid 404 errors
    // This method is kept for compatibility but returns empty stats
    console.warn('getUserStats endpoint not available. Returning default stats.');
    return {
      totalUsers: 0,
      activeUsers: 0,
      newThisMonth: 0,
      recentLogins: 0
    };
  }

  async getRoles(): Promise<string[]> {
    const response = await apiClient.get<string[]>(
      this.getEndpoint('/roles')
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch roles');
    }

    return response.data!;
  }

  async getDepartments(): Promise<string[]> {
    const response = await apiClient.get<string[]>(
      this.getEndpoint('/departments')
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch departments');
    }

    return response.data!;
  }

  async searchUsers(query: string, limit: number = 10): Promise<User[]> {
    const response = await apiClient.get<User[]>(
      this.getEndpoint('/search'),
      { q: query, limit }
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to search users');
    }

    return response.data!;
  }

  async bulkUpdateUsers(userIds: string[], updates: Partial<User>): Promise<void> {
    const response = await apiClient.put(
      this.getEndpoint('/bulk-update'),
      { userIds, updates }
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to bulk update users');
    }
  }

  async bulkDeleteUsers(userIds: string[]): Promise<void> {
    const response = await apiClient.deleteWithBody(
      this.getEndpoint('/bulk-delete'),
      { userIds }
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to bulk delete users');
    }
  }

  async exportUsers(format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    const response = await apiClient.getBlob(
      this.getEndpoint(`/export?format=${format}`)
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to export users');
    }

    return response.data!;
  }

  async importUsers(file: File, onProgress?: (progress: number) => void): Promise<{
    success: number;
    failed: number;
    errors: string[];
  }> {
    const response = await apiClient.upload<{
      success: number;
      failed: number;
      errors: string[];
    }>(
      this.getEndpoint('/import'),
      file,
      onProgress
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to import users');
    }

    return response.data!;
  }
}

export const userService = new UserService();
export default userService;

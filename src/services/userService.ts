import { apiClient } from './apiClient';
import { clientConfigManager } from '../config/clientConfig';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  status: 'active' | 'inactive';
  dateOfBirth: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  emergencyContact: string;
  emergencyPhone: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  profileImage?: string;
}

export interface UserFilters {
  search?: string;
  role?: string;
  department?: string;
  status?: string;
  country?: string;
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
  totalDepartments: number;
  recentLogins: number;
}

class UserService {
  private getEndpoint(path: string): string {
    const config = clientConfigManager.getConfig();
    return `${config.api.endpoints.users}${path}`;
  }

  async getUsers(params: UserListParams = {}): Promise<UserListResponse> {
    const response = await apiClient.get<UserListResponse>(
      this.getEndpoint(''),
      params
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch users');
    }

    return response.data!;
  }

  async getUser(id: string): Promise<User> {
    const response = await apiClient.get<User>(
      this.getEndpoint(`/${id}`)
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch user');
    }

    return response.data!;
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

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const response = await apiClient.put<User>(
      this.getEndpoint(`/${id}`),
      updates
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to update user');
    }

    return response.data!;
  }

  async deleteUser(id: string): Promise<void> {
    const response = await apiClient.delete(
      this.getEndpoint(`/${id}`)
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to delete user');
    }
  }

  async getUserStats(): Promise<UserStats> {
    const response = await apiClient.get<UserStats>(
      this.getEndpoint('/stats')
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch user stats');
    }

    return response.data!;
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
    const response = await apiClient.delete(
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

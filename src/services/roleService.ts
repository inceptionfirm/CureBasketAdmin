import { apiClient } from './apiClient';

export interface Role {
  id: number;
  businessId: number;
  name: string;
  description?: string;
  roleType: 'USER' | 'ADMIN' | 'SUPERADMIN';
  permissionIds?: number[];
  permissions?: Array<{
    id: number;
    name: string;
    permissionGroupId: number;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRolePayload {
  businessId: number;
  name: string;
  description?: string;
  roleType: 'USER' | 'ADMIN' | 'SUPERADMIN';
  permissionIds: number[];
}

export interface UpdateRolePayload {
  businessId: number;
  name: string;
  description?: string;
  roleType: 'USER' | 'ADMIN' | 'SUPERADMIN';
  permissionIds: number[];
}

export interface RoleListParams {
  page?: number;
  size?: number;
  sortBy?: string;
  asc?: boolean;
}

export interface RoleListResponse {
  roles: Role[];
  pagination: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  };
}

class RoleService {
  private baseEndpoint = '/role';

  async createRole(payload: CreateRolePayload): Promise<{ success: boolean; message?: string; data?: Role }> {
    const response = await apiClient.post<Role>(
      `${this.baseEndpoint}/createRole`,
      payload
    );

    if (!response.success) {
      throw new Error(response.error || response.message || 'Failed to create role');
    }

    return {
      success: true,
      message: response.message || 'Role created successfully',
      data: response.data as Role,
    };
  }

  async updateRole(id: number, payload: UpdateRolePayload): Promise<{ success: boolean; message?: string; data?: Role }> {
    const endpoint = `${this.baseEndpoint}/updateRole?id=${id}`;
    const response = await apiClient.post<Role>(endpoint, payload);

    if (!response.success) {
      throw new Error(response.error || response.message || 'Failed to update role');
    }

    return {
      success: true,
      message: response.message || 'Role updated successfully',
      data: response.data as Role,
    };
  }

  async deleteRole(id: number): Promise<{ success: boolean; message?: string }> {
    const endpoint = `${this.baseEndpoint}/deleteRole?id=${id}`;
    const response = await apiClient.post(endpoint);

    if (!response.success) {
      throw new Error(response.error || response.message || 'Failed to delete role');
    }

    return {
      success: true,
      message: response.message || 'Role deleted successfully',
    };
  }

  async getAllRoles(params: RoleListParams = {}): Promise<RoleListResponse> {
    const queryParams: Record<string, any> = {
      page: params.page ?? 0,
      size: params.size ?? 10,
      sortBy: params.sortBy ?? 'name',
    };

    if (params.asc !== undefined) {
      queryParams.asc = params.asc;
    }

    const response = await apiClient.get<{
      content?: Role[];
      data?: Role[];
      roles?: Role[];
      pageInfo?: {
        pageNumber: number;
        pageSize: number;
        totalRecords: number;
        totalPages: number;
      };
      pagination?: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
      };
    }>(
      `${this.baseEndpoint}/getAllRoles`,
      queryParams
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch roles');
    }

    const data = response.data ?? {};
    const content = data.content ?? data.data ?? data.roles ?? [];
    const pageInfo = data.pageInfo ?? data.pagination;

    return {
      roles: Array.isArray(content) ? content : [],
      pagination: {
        page: (pageInfo?.pageNumber ?? 0) + 1,
        size: pageInfo?.pageSize ?? queryParams.size,
        total: pageInfo?.totalRecords ?? content.length,
        totalPages: pageInfo?.totalPages ?? 1,
      },
    };
  }
}

export const roleService = new RoleService();
export default roleService;


import { apiClient } from './apiClient';

export interface Permission {
  id: number;
  name: string;
  permissionGroupId: number;
  permissionGroupName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PermissionGroup {
  id: number;
  name: string;
  permissions?: Permission[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PermissionListParams {
  page?: number;
  size?: number;
  sortBy?: string;
  asc?: boolean;
}

export interface PermissionListResponse {
  permissions: Permission[];
  pagination: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  };
}

class PermissionService {
  private baseEndpoint = '/permission';
  private groupEndpoint = '/permissionGroup';

  // Permission Group Operations
  async createPermissionGroup(name: string): Promise<{ success: boolean; message?: string; data?: PermissionGroup }> {
    const endpoint = `${this.groupEndpoint}/createPermissionGroup?name=${encodeURIComponent(name)}`;
    console.log('🔐 Creating permission group:', endpoint);
    const response = await apiClient.post<PermissionGroup>(endpoint);
    console.log('🔐 Create permission group response:', response);

    if (!response.success) {
      console.error('❌ Failed to create permission group:', response.error, response.message);
      throw new Error(response.error || response.message || 'Failed to create permission group');
    }

    return {
      success: true,
      message: response.message || 'Permission group created successfully',
      data: response.data as PermissionGroup,
    };
  }

  async updatePermissionGroup(id: number, name: string): Promise<{ success: boolean; message?: string; data?: PermissionGroup }> {
    const endpoint = `${this.groupEndpoint}/updatePermissionGroup?name=${encodeURIComponent(name)}&id=${id}`;
    console.log('🔐 Updating permission group:', endpoint);
    const response = await apiClient.post<PermissionGroup>(endpoint);
    console.log('🔐 Update permission group response:', response);

    if (!response.success) {
      console.error('❌ Failed to update permission group:', response.error, response.message);
      throw new Error(response.error || response.message || 'Failed to update permission group');
    }

    return {
      success: true,
      message: response.message || 'Permission group updated successfully',
      data: response.data as PermissionGroup,
    };
  }

  async deletePermissionGroup(id: number): Promise<{ success: boolean; message?: string }> {
    const endpoint = `${this.groupEndpoint}/deletePermissionGroup?id=${id}`;
    console.log('🔐 Deleting permission group:', endpoint);
    const response = await apiClient.post(endpoint);
    console.log('🔐 Delete permission group response:', response);

    if (!response.success) {
      console.error('❌ Failed to delete permission group:', response.error, response.message);
      throw new Error(response.error || response.message || 'Failed to delete permission group');
    }

    return {
      success: true,
      message: response.message || 'Permission group deleted successfully',
    };
  }

  async getAllPermissionGroups(): Promise<PermissionGroup[]> {
    const endpoint = `${this.groupEndpoint}/getAllPermissionGroup`;
    console.log('🔐 Fetching permission groups:', endpoint);
    const response = await apiClient.get<PermissionGroup[]>(endpoint);
    console.log('🔐 Permission groups response:', response);

    if (!response.success) {
      console.error('❌ Failed to fetch permission groups:', response.error);
      throw new Error(response.error || 'Failed to fetch permission groups');
    }

    const data = response.data;
    if (Array.isArray(data)) {
      console.log('✅ Permission groups (array):', data.length, 'groups');
      return data;
    }
    if (data && typeof data === 'object' && 'data' in data) {
      const groups = Array.isArray((data as any).data) ? (data as any).data : [];
      console.log('✅ Permission groups (nested):', groups.length, 'groups');
      return groups;
    }
    console.warn('⚠️ Permission groups response format unexpected:', data);
    return [];
  }

  async getAllPermissionGroupsWithPermissions(): Promise<PermissionGroup[]> {
    const endpoint = `${this.groupEndpoint}/getAllPermissionGroupWithPermissions`;
    console.log('🔐 Fetching permission groups with permissions:', endpoint);
    const response = await apiClient.get<PermissionGroup[]>(endpoint);
    console.log('🔐 Permission groups with permissions response:', response);

    if (!response.success) {
      console.error('❌ Failed to fetch permission groups with permissions:', response.error);
      throw new Error(response.error || 'Failed to fetch permission groups with permissions');
    }

    const data = response.data;
    if (Array.isArray(data)) {
      console.log('✅ Permission groups with permissions (array):', data.length, 'groups');
      return data;
    }
    if (data && typeof data === 'object' && 'data' in data) {
      const groups = Array.isArray((data as any).data) ? (data as any).data : [];
      console.log('✅ Permission groups with permissions (nested):', groups.length, 'groups');
      return groups;
    }
    console.warn('⚠️ Permission groups with permissions response format unexpected:', data);
    return [];
  }

  // Permission Operations
  async createPermission(name: string, permissionGroupId: number): Promise<{ success: boolean; message?: string; data?: Permission }> {
    const endpoint = `${this.baseEndpoint}/createPermission?name=${encodeURIComponent(name)}&permissionGroupId=${permissionGroupId}`;
    console.log('🔐 Creating permission:', endpoint);
    const response = await apiClient.post<Permission>(endpoint);
    console.log('🔐 Create permission response:', response);

    if (!response.success) {
      console.error('❌ Failed to create permission:', response.error, response.message);
      throw new Error(response.error || response.message || 'Failed to create permission');
    }

    return {
      success: true,
      message: response.message || 'Permission created successfully',
      data: response.data as Permission,
    };
  }

  async updatePermission(id: number, name: string, permissionGroupId: number): Promise<{ success: boolean; message?: string; data?: Permission }> {
    const endpoint = `${this.baseEndpoint}/updatePermission?name=${encodeURIComponent(name)}&permissionGroupId=${permissionGroupId}&id=${id}`;
    console.log('🔐 Updating permission:', endpoint);
    const response = await apiClient.post<Permission>(endpoint);
    console.log('🔐 Update permission response:', response);

    if (!response.success) {
      console.error('❌ Failed to update permission:', response.error, response.message);
      throw new Error(response.error || response.message || 'Failed to update permission');
    }

    return {
      success: true,
      message: response.message || 'Permission updated successfully',
      data: response.data as Permission,
    };
  }

  async deletePermission(ids: number[]): Promise<{ success: boolean; message?: string }> {
    const endpoint = `${this.baseEndpoint}/deletePermission`;
    console.log('🔐 Deleting permission(s):', endpoint, 'IDs:', ids);
    const response = await apiClient.post(endpoint, ids);
    console.log('🔐 Delete permission response:', response);

    if (!response.success) {
      console.error('❌ Failed to delete permission:', response.error, response.message);
      throw new Error(response.error || response.message || 'Failed to delete permission');
    }

    return {
      success: true,
      message: response.message || 'Permission(s) deleted successfully',
    };
  }

  async getAllPermissionsAtOnce(): Promise<Permission[]> {
    const response = await apiClient.get<Permission[]>(
      `${this.baseEndpoint}/getAllPermissionsAtOnce`
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch permissions');
    }

    const data = response.data;
    if (Array.isArray(data)) {
      return data;
    }
    if (data && typeof data === 'object' && 'data' in data) {
      return Array.isArray((data as any).data) ? (data as any).data : [];
    }
    return [];
  }

  async getAllPermissionsInPages(params: PermissionListParams = {}): Promise<PermissionListResponse> {
    const queryParams: Record<string, any> = {
      page: params.page ?? 0,
      size: params.size ?? 10,
      sortBy: params.sortBy ?? 'name',
      asc: params.asc ?? true,
    };

    const endpoint = `${this.baseEndpoint}/getAllPermissionsInPages`;
    console.log('🔐 Fetching permissions:', endpoint, 'with params:', queryParams);
    
    const response = await apiClient.get<{
      content?: Permission[];
      data?: Permission[];
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
      endpoint,
      queryParams
    );

    console.log('🔐 Permissions response:', response);

    if (!response.success) {
      console.error('❌ Failed to fetch permissions:', response.error);
      throw new Error(response.error || 'Failed to fetch permissions');
    }

    const data = response.data ?? {};
    const content = data.content ?? data.data ?? [];
    const pageInfo = data.pageInfo ?? data.pagination;

    console.log('✅ Permissions parsed:', {
      count: Array.isArray(content) ? content.length : 0,
      pageInfo,
    });

    return {
      permissions: Array.isArray(content) ? content : [],
      pagination: {
        page: (pageInfo?.pageNumber ?? 0) + 1,
        size: pageInfo?.pageSize ?? queryParams.size,
        total: pageInfo?.totalRecords ?? content.length,
        totalPages: pageInfo?.totalPages ?? 1,
      },
    };
  }
}

export const permissionService = new PermissionService();
export default permissionService;


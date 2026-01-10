/**
 * Base Service Class
 * Provides common CRUD operations and utilities for all services
 */
import { apiClient } from '../apiClient';
import { ApiResponse, ListResponse, PaginationParams } from '../../config/apiEndpoints';

export interface ServiceConfig {
  baseEndpoint: string;
  enableLogging?: boolean;
  defaultPageSize?: number;
}

export class BaseService<T = any, CreatePayload = Partial<T>, UpdatePayload = Partial<T>> {
  protected baseEndpoint: string;
  protected enableLogging: boolean;
  protected defaultPageSize: number;

  constructor(config: ServiceConfig) {
    this.baseEndpoint = config.baseEndpoint;
    this.enableLogging = config.enableLogging ?? true;
    this.defaultPageSize = config.defaultPageSize ?? 10;
  }

  /**
   * Log helper
   */
  protected log(emoji: string, action: string, endpoint: string, data?: any): void {
    if (this.enableLogging) {
      console.log(`${emoji} ${action}:`, endpoint, data ? 'with data:' : '', data);
    }
  }

  /**
   * Log response helper
   */
  protected logResponse(emoji: string, action: string, response: ApiResponse): void {
    if (this.enableLogging) {
      console.log(`${emoji} ${action} response:`, response);
    }
  }

  /**
   * Log error helper
   */
  protected logError(action: string, error: string, message?: string): void {
    if (this.enableLogging) {
      console.error(`❌ Failed to ${action}:`, error, message);
    }
  }

  /**
   * Handle API response
   */
  protected handleResponse<TData = T>(
    response: ApiResponse<TData>,
    errorMessage: string
  ): TData {
    if (!response.success) {
      const error = response.error || response.message || errorMessage;
      throw new Error(error);
    }
    return response.data as TData;
  }

  /**
   * Handle list response with pagination
   */
  protected handleListResponse<TData = T>(
    response: ApiResponse<ListResponse<TData>>,
    params: PaginationParams = {},
    errorMessage: string = 'Failed to fetch items'
  ): { items: TData[]; pagination: any } {
    if (!response.success) {
      const error = response.error || response.message || errorMessage;
      throw new Error(error);
    }

    const data = response.data ?? {};
    const content = data.content ?? data.data ?? [];
    const pageInfo = data.pageInfo ?? data.pagination;

    return {
      items: Array.isArray(content) ? content : [],
      pagination: {
        page: (pageInfo?.pageNumber ?? params.page ?? 0) + 1,
        pageSize: pageInfo?.pageSize ?? params.pageSize ?? params.size ?? this.defaultPageSize,
        total: pageInfo?.totalRecords ?? content.length,
        totalPages: pageInfo?.totalPages ?? 1,
      },
    };
  }

  /**
   * Extract array from response (handles various response formats)
   */
  protected extractArray<TData = T>(response: ApiResponse<TData[] | { data: TData[] }>): TData[] {
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch items');
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

  /**
   * Generic CREATE operation
   */
  async create(
    endpoint: string,
    payload: CreatePayload,
    actionName: string = 'create'
  ): Promise<{ success: boolean; message?: string; data?: T }> {
    this.log('🚀', `Creating ${actionName}`, endpoint, payload);
    const response = await apiClient.post<T>(endpoint, payload);
    this.logResponse('✅', `Create ${actionName}`, response);

    if (!response.success) {
      this.logError(`create ${actionName}`, response.error || '', response.message);
      throw new Error(response.error || response.message || `Failed to create ${actionName}`);
    }

    return {
      success: true,
      message: response.message || `${actionName} created successfully`,
      data: response.data as T,
    };
  }

  /**
   * Generic UPDATE operation
   */
  async update(
    endpoint: string,
    payload: UpdatePayload,
    actionName: string = 'update'
  ): Promise<{ success: boolean; message?: string; data?: T }> {
    this.log('🔄', `Updating ${actionName}`, endpoint, payload);
    const response = await apiClient.post<T>(endpoint, payload);
    this.logResponse('✅', `Update ${actionName}`, response);

    if (!response.success) {
      this.logError(`update ${actionName}`, response.error || '', response.message);
      throw new Error(response.error || response.message || `Failed to update ${actionName}`);
    }

    return {
      success: true,
      message: response.message || `${actionName} updated successfully`,
      data: response.data as T,
    };
  }

  /**
   * Generic GET by ID operation
   */
  async getById(
    endpoint: string,
    actionName: string = 'item'
  ): Promise<T> {
    this.log('📖', `Fetching ${actionName}`, endpoint);
    const response = await apiClient.post<T>(endpoint);
    this.logResponse('✅', `Get ${actionName}`, response);

    return this.handleResponse(response, `Failed to fetch ${actionName}`);
  }

  /**
   * Generic GET ALL operation with pagination
   */
  async getAll(
    endpoint: string,
    params: PaginationParams = {},
    actionName: string = 'items'
  ): Promise<{ items: T[]; pagination: any }> {
    const queryParams: Record<string, any> = {};
    
    if (params.page !== undefined) queryParams.page = params.page;
    if (params.pageSize !== undefined) queryParams.pageSize = params.pageSize;
    if (params.size !== undefined) queryParams.size = params.size;
    if (params.sortBy) queryParams.sortBy = params.sortBy;
    if (params.sortOrder) queryParams.sortOrder = params.sortOrder;

    this.log('📋', `Fetching all ${actionName}`, endpoint, queryParams);
    const response = await apiClient.get<ListResponse<T>>(endpoint, queryParams);
    this.logResponse('✅', `Get all ${actionName}`, response);

    return this.handleListResponse(response, params, `Failed to fetch ${actionName}`);
  }

  /**
   * Generic DELETE operation
   */
  async delete(
    endpoint: string,
    actionName: string = 'item'
  ): Promise<{ success: boolean; message?: string }> {
    this.log('🗑️', `Deleting ${actionName}`, endpoint);
    const response = await apiClient.post(endpoint);
    this.logResponse('✅', `Delete ${actionName}`, response);

    if (!response.success) {
      this.logError(`delete ${actionName}`, response.error || '', response.message);
      throw new Error(response.error || response.message || `Failed to delete ${actionName}`);
    }

    return {
      success: true,
      message: response.message || `${actionName} deleted successfully`,
    };
  }

  /**
   * Generic GET operation (for simple GET requests)
   */
  async get<TData = T>(
    endpoint: string,
    params?: Record<string, any>,
    actionName: string = 'item'
  ): Promise<TData> {
    this.log('📖', `Fetching ${actionName}`, endpoint, params);
    const response = await apiClient.get<TData>(endpoint, params);
    this.logResponse('✅', `Get ${actionName}`, response);

    return this.handleResponse(response, `Failed to fetch ${actionName}`);
  }

  /**
   * Generic POST operation (for custom POST requests)
   */
  async post<TData = T>(
    endpoint: string,
    data?: any,
    actionName: string = 'operation'
  ): Promise<{ success: boolean; message?: string; data?: TData }> {
    this.log('📤', actionName, endpoint, data instanceof FormData ? '[FormData]' : data);
    const response = await apiClient.post<TData>(endpoint, data);
    this.logResponse('✅', actionName, response);

    if (!response.success) {
      this.logError(actionName, response.error || '', response.message);
      throw new Error(response.error || response.message || `Failed to ${actionName}`);
    }

    return {
      success: true,
      message: response.message || `${actionName} completed successfully`,
      data: response.data as TData,
    };
  }
}


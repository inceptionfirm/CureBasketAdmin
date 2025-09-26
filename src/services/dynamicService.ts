// Dynamic Service Wrapper - Makes all services API-ready
import { apiConfigManager, createDynamicAPICall, withRetry } from '../config/apiConfig';
import { dataService, createDynamicService, createRetryService } from '../services/dataService';
import { handleAPIError, createLoadingKey } from '../hooks/useErrorHandling';

// Generic service interface
export interface ServiceConfig {
  endpoint: string;
  useRetry?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
}

// Generic service class
export class DynamicService<T> {
  protected endpoint: string;
  protected useRetry: boolean;
  protected retryAttempts: number;
  protected retryDelay: number;

  constructor(config: ServiceConfig) {
    this.endpoint = config.endpoint;
    this.useRetry = config.useRetry ?? true;
    this.retryAttempts = config.retryAttempts ?? 3;
    this.retryDelay = config.retryDelay ?? 1000;
  }

  // Generic list method
  async getList(params: any = {}, mockData: T[] = []): Promise<{ items: T[]; pagination: any }> {
    const apiCall = () => dataService.getList<T>(this.endpoint, params);
    return createDynamicService({ items: mockData, pagination: { page: 1, pageSize: 10, total: mockData.length, totalPages: 1 } }, apiCall);
  }

  // Generic get by ID method
  async getById(id: string, mockData?: T): Promise<T> {
    const apiCall = () => dataService.get<T>(`${this.endpoint}/${id}`);
    if (!mockData) {
      throw new Error('Mock data required for getById');
    }
    return createDynamicService(mockData, apiCall);
  }

  // Generic create method
  async create(data: any, mockData?: T): Promise<T> {
    const apiCall = () => dataService.create<T>(this.endpoint, data);
    if (!mockData) {
      throw new Error('Mock data required for create');
    }
    return createDynamicService(mockData, apiCall);
  }

  // Generic update method
  async update(id: string, data: any, mockData?: T): Promise<T> {
    const apiCall = () => dataService.update<T>(this.endpoint, id, data);
    if (!mockData) {
      throw new Error('Mock data required for update');
    }
    return createDynamicService(mockData, apiCall);
  }

  // Generic delete method
  async delete(id: string): Promise<void> {
    const apiCall = () => dataService.deleteItem<void>(this.endpoint, id);
    return createDynamicService(undefined, apiCall);
  }

  // Generic bulk operations
  async bulkUpdate(ids: string[], updates: any): Promise<void> {
    const apiCall = () => dataService.bulkUpdate<void>(this.endpoint, ids, updates);
    return createDynamicService(undefined, apiCall);
  }

  async bulkDelete(ids: string[]): Promise<void> {
    const apiCall = () => dataService.bulkDelete<void>(this.endpoint, ids);
    return createDynamicService(undefined, apiCall);
  }

  // Generic search method
  async search(query: string, params: any = {}, mockData: T[] = []): Promise<T[]> {
    const apiCall = () => dataService.search<T>(this.endpoint, query, params);
    return createDynamicService(mockData, apiCall);
  }

  // Generic stats method
  async getStats(mockData: any): Promise<any> {
    const apiCall = () => dataService.getStats<any>(`${this.endpoint}/stats`);
    return createDynamicService(mockData, apiCall);
  }

  // Generic custom method
  async customRequest(method: 'GET' | 'POST' | 'PUT' | 'DELETE', subEndpoint: string, data?: any, mockData?: any): Promise<any> {
    const apiCall = () => {
      const fullEndpoint = `${this.endpoint}${subEndpoint}`;
      switch (method) {
        case 'GET':
          return dataService.get(fullEndpoint, data);
        case 'POST':
          return dataService.post(fullEndpoint, data);
        case 'PUT':
          return dataService.put(fullEndpoint, data);
        case 'DELETE':
          return dataService.delete(fullEndpoint);
        default:
          throw new Error(`Unsupported method: ${method}`);
      }
    };
    return createDynamicService(mockData, apiCall);
  }
}

// Service factory function
export const createService = <T>(config: ServiceConfig): DynamicService<T> => {
  return new DynamicService<T>(config);
};

// Enhanced service with error handling and loading states
export class EnhancedService<T> extends DynamicService<T> {
  private errorHandler?: (error: any) => void;
  private loadingHandler?: (loading: boolean) => void;

  constructor(config: ServiceConfig, errorHandler?: (error: any) => void, loadingHandler?: (loading: boolean) => void) {
    super(config);
    this.errorHandler = errorHandler;
    this.loadingHandler = loadingHandler;
  }

  // Enhanced methods with error handling and loading states
  async getListWithLoading(params: any = {}, mockData: T[] = [], loadingKey?: string): Promise<{ items: T[]; pagination: any }> {
    const key = loadingKey || createLoadingKey(this.endpoint, 'getList');
    
    try {
      this.setLoading(true, key);
      const result = await this.getList(params, mockData);
      return result;
    } catch (error) {
      this.handleError(error);
      throw error;
    } finally {
      this.setLoading(false, key);
    }
  }

  async createWithLoading(data: any, mockData?: T, loadingKey?: string): Promise<T> {
    const key = loadingKey || createLoadingKey(this.endpoint, 'create');
    
    try {
      this.setLoading(true, key);
      const result = await this.create(data, mockData);
      return result;
    } catch (error) {
      this.handleError(error);
      throw error;
    } finally {
      this.setLoading(false, key);
    }
  }

  async updateWithLoading(id: string, data: any, mockData?: T, loadingKey?: string): Promise<T> {
    const key = loadingKey || createLoadingKey(this.endpoint, 'update');
    
    try {
      this.setLoading(true, key);
      const result = await this.update(id, data, mockData);
      return result;
    } catch (error) {
      this.handleError(error);
      throw error;
    } finally {
      this.setLoading(false, key);
    }
  }

  async deleteWithLoading(id: string, loadingKey?: string): Promise<void> {
    const key = loadingKey || createLoadingKey(this.endpoint, 'delete');
    
    try {
      this.setLoading(true, key);
      await this.delete(id);
    } catch (error) {
      this.handleError(error);
      throw error;
    } finally {
      this.setLoading(false, key);
    }
  }

  private setLoading(loading: boolean, key: string): void {
    if (this.loadingHandler) {
      this.loadingHandler(loading);
    }
  }

  private handleError(error: any): void {
    if (this.errorHandler) {
      const appError = handleAPIError(error, this.endpoint);
      this.errorHandler(appError);
    }
  }
}

// Enhanced service factory
export const createEnhancedService = <T>(
  config: ServiceConfig,
  errorHandler?: (error: any) => void,
  loadingHandler?: (loading: boolean) => void
): EnhancedService<T> => {
  return new EnhancedService<T>(config, errorHandler, loadingHandler);
};

// Utility function to check if API is available
export const isAPIAvailable = (): boolean => {
  return !apiConfigManager.shouldUseMockData();
};

// Utility function to switch between mock and real API
export const switchToRealAPI = (): void => {
  apiConfigManager.enableProductionMode();
};

export const switchToMockAPI = (): void => {
  apiConfigManager.enableDevelopmentMode();
};

export default {
  DynamicService,
  EnhancedService,
  createService,
  createEnhancedService,
  isAPIAvailable,
  switchToRealAPI,
  switchToMockAPI,
};

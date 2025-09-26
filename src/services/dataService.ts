// Centralized Data Service - Dynamic API Integration
import { apiConfigManager, createDynamicAPICall, withRetry } from '../config/apiConfig';

// Generic API response interface
export interface APIResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// Generic API error interface
export interface APIError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

// Generic list parameters
export interface ListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

// Generic list response
export interface ListResponse<T> {
  items: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// Centralized Data Service
class DataService {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = apiConfigManager.getBaseURL();
    this.timeout = apiConfigManager.getTimeout();
  }

  // Generic GET request
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(`${this.baseURL}${endpoint}`);
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          url.searchParams.append(key, params[key].toString());
        }
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(this.timeout),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  // Generic POST request
  async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
      signal: AbortSignal.timeout(this.timeout),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  // Generic PUT request
  async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
      signal: AbortSignal.timeout(this.timeout),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  // Generic DELETE request
  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(this.timeout),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  // Generic list request with pagination
  async getList<T>(endpoint: string, params: ListParams = {}): Promise<ListResponse<T>> {
    const queryParams: Record<string, any> = {
      page: params.page || 1,
      pageSize: params.pageSize || 10,
    };

    if (params.search) {
      queryParams.search = params.search;
    }

    if (params.sortBy) {
      queryParams.sortBy = params.sortBy;
      queryParams.sortOrder = params.sortOrder || 'asc';
    }

    if (params.filters) {
      Object.keys(params.filters).forEach(key => {
        if (params.filters![key] !== undefined && params.filters![key] !== null) {
          queryParams[`filter_${key}`] = params.filters![key];
        }
      });
    }

    return await this.get<ListResponse<T>>(endpoint, queryParams);
  }

  // Generic create request
  async create<T>(endpoint: string, data: any): Promise<T> {
    return await this.post<T>(endpoint, data);
  }

  // Generic update request
  async update<T>(endpoint: string, id: string, data: any): Promise<T> {
    return await this.put<T>(`${endpoint}/${id}`, data);
  }

  // Generic delete request
  async deleteItem<T>(endpoint: string, id: string): Promise<T> {
    return await this.delete<T>(`${endpoint}/${id}`);
  }

  // Generic bulk operations
  async bulkUpdate<T>(endpoint: string, ids: string[], updates: any): Promise<T> {
    return await this.put<T>(`${endpoint}/bulk`, { ids, updates });
  }

  async bulkDelete<T>(endpoint: string, ids: string[]): Promise<T> {
    return await this.delete<T>(`${endpoint}/bulk`, { ids });
  }

  // Generic search request
  async search<T>(endpoint: string, query: string, params: Record<string, any> = {}): Promise<T[]> {
    return await this.get<T[]>(`${endpoint}/search`, { q: query, ...params });
  }

  // Generic stats request
  async getStats<T>(endpoint: string): Promise<T> {
    return await this.get<T>(`${endpoint}/stats`);
  }
}

// Export singleton instance
export const dataService = new DataService();

// Dynamic API wrapper for services
export const createDynamicService = <T>(
  mockData: T,
  apiCall: () => Promise<T>,
  errorMessage: string = 'Service call failed'
) => {
  return createDynamicAPICall(mockData, apiCall, errorMessage);
};

// Retry wrapper for services
export const createRetryService = <T>(
  apiCall: () => Promise<T>,
  maxAttempts?: number,
  delay?: number
) => {
  const config = apiConfigManager.getRetryConfig();
  return withRetry(apiCall, maxAttempts || config.attempts, delay || config.delay);
};

export default dataService;

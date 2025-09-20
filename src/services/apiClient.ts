// API Client - Centralized API management for all modules
import { clientConfigManager } from '../config/clientConfig';

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface APIRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  endpoint: string;
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  timeout?: number;
}

class APIClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private timeout: number;

  constructor() {
    const config = clientConfigManager.getConfig();
    this.baseURL = `${config.api.baseURL}/${config.api.version}`;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...config.api.headers,
    };
    this.timeout = config.api.timeout;
  }

  // Update configuration when it changes
  updateConfig() {
    const config = clientConfigManager.getConfig();
    this.baseURL = `${config.api.baseURL}/${config.api.version}`;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...config.api.headers,
    };
    this.timeout = config.api.timeout;
  }

  // Build URL with query parameters
  private buildURL(endpoint: string, params?: Record<string, any>): string {
    const url = new URL(endpoint, this.baseURL);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    
    return url.toString();
  }

  // Get auth token
  private getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  // Build headers
  private buildHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    const headers = { ...this.defaultHeaders, ...customHeaders };
    
    const token = this.getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    return headers;
  }

  // Make HTTP request
  private async request<T = any>(request: APIRequest): Promise<APIResponse<T>> {
    this.updateConfig(); // Ensure config is up to date
    
    const { method, endpoint, data, params, headers, timeout = this.timeout } = request;
    
    const url = this.buildURL(endpoint, params);
    const requestHeaders = this.buildHeaders(headers);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      return {
        success: true,
        data: result.data || result,
        message: result.message,
        pagination: result.pagination,
      };
      
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: 'Request timeout',
          };
        }
        
        return {
          success: false,
          error: error.message,
        };
      }
      
      return {
        success: false,
        error: 'Unknown error occurred',
      };
    }
  }

  // GET request
  async get<T = any>(
    endpoint: string,
    params?: Record<string, any>,
    headers?: Record<string, string>
  ): Promise<APIResponse<T>> {
    return this.request<T>({
      method: 'GET',
      endpoint,
      params,
      headers,
    });
  }

  // POST request
  async post<T = any>(
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<APIResponse<T>> {
    return this.request<T>({
      method: 'POST',
      endpoint,
      data,
      headers,
    });
  }

  // PUT request
  async put<T = any>(
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<APIResponse<T>> {
    return this.request<T>({
      method: 'PUT',
      endpoint,
      data,
      headers,
    });
  }

  // PATCH request
  async patch<T = any>(
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<APIResponse<T>> {
    return this.request<T>({
      method: 'PATCH',
      endpoint,
      data,
      headers,
    });
  }

  // DELETE request
  async delete<T = any>(
    endpoint: string,
    headers?: Record<string, string>
  ): Promise<APIResponse<T>> {
    return this.request<T>({
      method: 'DELETE',
      endpoint,
      headers,
    });
  }

  // Upload file
  async upload<T = any>(
    endpoint: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<APIResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);
    
    const headers = this.buildHeaders();
    delete headers['Content-Type']; // Let browser set it for FormData
    
    const token = this.getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = (event.loaded / event.total) * 100;
          onProgress(progress);
        }
      });
      
      xhr.addEventListener('load', () => {
        try {
          const result = JSON.parse(xhr.responseText);
          resolve({
            success: xhr.status >= 200 && xhr.status < 300,
            data: result.data || result,
            error: xhr.status >= 400 ? result.error || 'Upload failed' : undefined,
          });
        } catch {
          resolve({
            success: false,
            error: 'Invalid response format',
          });
        }
      });
      
      xhr.addEventListener('error', () => {
        resolve({
          success: false,
          error: 'Upload failed',
        });
      });
      
      xhr.open('POST', this.buildURL(endpoint));
      Object.entries(headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });
      
      xhr.send(formData);
    });
  }
}

// Export singleton instance
export const apiClient = new APIClient();
export default apiClient;

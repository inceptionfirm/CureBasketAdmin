// API Client - Centralized API management for all modules
import { clientConfigManager } from '../config/clientConfig';
import { getBearerTokenFromStorage } from '../utils/authStorage';

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

function pickTrimmedString(v: unknown): string {
  return typeof v === 'string' && v.trim() ? v.trim() : '';
}

/**
 * CureBasket often returns HTTP 200 with `{ success: false, msg, error: [...] }`.
 * Prefer msg/message; if error is a Java stack array (fileName/methodName), don't stringify it for users.
 */
function formatApiSuccessFalseMessage(result: any, endpoint: string): string {
  const fromText = pickTrimmedString(result?.msg) || pickTrimmedString(result?.message);
  if (fromText) {
    return `${fromText} (Failed: success is false in the response body — HTTP 200 does not mean the update worked.)`;
  }

  const err = result?.error;
  if (typeof err === 'string' && err.trim()) return err.trim();
  if (Array.isArray(err) && err.length > 0) {
    const looksLikeJavaStack = err.every(
      (e: any) =>
        e &&
        typeof e === 'object' &&
        typeof e.fileName === 'string' &&
        typeof e.methodName === 'string'
    );
    if (looksLikeJavaStack) {
      return 'Prescription update failed on the server (internal error in PrescriptionDTOs / toCatalogItemDTO). HTTP 200 can still be returned with success: false in the JSON body.';
    }
    const parts = err
      .map((e: any) => (typeof e === 'string' ? e : e?.defaultMessage || e?.message))
      .filter(Boolean);
    if (parts.length) return parts.join('; ');
  }

  return `Request failed (${endpoint}). Response had success: false.`;
}

class APIClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private timeout: number;

  constructor() {
    const config = clientConfigManager.getConfig();
    // Always use the configured base URL (backend URL from config)
    this.baseURL = this.buildBaseURL(config.api.baseURL, config.api.version);
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
    // Always use the configured base URL (backend URL from config)
    this.baseURL = this.buildBaseURL(config.api.baseURL, config.api.version);
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...config.api.headers,
    };
    this.timeout = config.api.timeout;
  }

  private buildBaseURL(baseURL: string, version?: string): string {
    // For relative URLs (proxy), don't add trailing slash
    if (baseURL.startsWith('/')) {
      const trimmedBase = baseURL.replace(/\/+$/, '');
      const trimmedVersion = (version || '').replace(/^\/+|\/+$/g, '');
      const combined = trimmedVersion ? `${trimmedBase}/${trimmedVersion}` : trimmedBase;
      return combined || '/api';
    }
    
    // For absolute URLs, add trailing slash
    const trimmedBase = baseURL.replace(/\/+$/, '');
    const trimmedVersion = (version || '').replace(/^\/+|\/+$/g, '');
    const combined = trimmedVersion ? `${trimmedBase}/${trimmedVersion}` : trimmedBase;
    return `${combined}/`;
  }

  // Build URL with query parameters
  private buildURL(endpoint: string, params?: Record<string, any>): string {
    // Handle relative URLs (for proxy in development)
    if (this.baseURL.startsWith('/')) {
      const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      const base = this.baseURL.endsWith('/') ? this.baseURL.slice(0, -1) : this.baseURL;
      let url = `${base}${normalizedEndpoint}`;
      
      if (params) {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });
        const queryString = queryParams.toString();
        if (queryString) {
          url += `?${queryString}`;
        }
        
        // Log the final URL for blog endpoints
        if (endpoint.includes('blog') && import.meta.env.DEV) {
          console.log('🔍 Final URL with query params:', url);
          console.log('🔍 Query params object:', params);
        }
      }
      
      return url;
    }
    
    // Handle absolute URLs (for production)
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    const url = new URL(normalizedEndpoint, this.baseURL);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
      
      // Log the final URL for blog endpoints
      if (endpoint.includes('blog') && import.meta.env.DEV) {
        console.log('🔍 Final URL with query params:', url.toString());
        console.log('🔍 Query params object:', params);
      }
    }
    
    return url.toString();
  }

  // Get auth token (same keys as authService + nested flycanary_auth)
  private getAuthToken(): string | null {
    return getBearerTokenFromStorage();
  }

  // Build headers
  private buildHeaders(customHeaders?: Record<string, string>, skipAuth?: boolean): Record<string, string> {
    const headers = { ...this.defaultHeaders, ...customHeaders };
    
    // Only add Authorization header if not skipped (for login endpoint)
    if (!skipAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
        // Log token presence (first 20 chars only for security)
        if (import.meta.env.DEV) {
          console.log('🔑 Auth token found:', token.substring(0, 20) + '...');
        }
      }
    }
    
    return headers;
  }

  // Make HTTP request
  private async request<T = any>(request: APIRequest): Promise<APIResponse<T>> {
    this.updateConfig(); // Ensure config is up to date
    
    const { method, endpoint, data, params, headers, timeout = this.timeout } = request;
    
    const url = this.buildURL(endpoint, params);
    // Skip auth header for login endpoint (we're not authenticated yet)
    const skipAuth = endpoint.includes('/auth/login');
    const requestHeaders = this.buildHeaders(headers, skipAuth);
    if (import.meta.env.DEV && !skipAuth && !this.getAuthToken()) {
      console.warn('🔑 No auth token in storage for:', endpoint);
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      // Debug logging (only for non-GET requests or errors)
      if (method !== 'GET' || import.meta.env.DEV) {
        console.log('🚀 API Request:', method, endpoint);
        if (endpoint.includes('/auth/login')) {
          console.log('🔐 Login Request Details:', {
            url,
            method,
            headers: { ...requestHeaders, Authorization: requestHeaders.Authorization ? 'Bearer ***' : 'none' },
            hasData: !!data,
            payload: data && !(data instanceof FormData) ? { ...data, password: '***hidden***' } : '[FormData]',
            skipAuth,
          });
        }
      }
      
      // Handle FormData differently - don't stringify and let browser set Content-Type
      const isFormData = data instanceof FormData;
      
      // Log the payload before stringifying (for debugging)
      if (data && !isFormData && method === 'POST' && endpoint.includes('blog')) {
        console.log('🔍 apiClient: Raw payload before stringify:', data);
        console.log('🔍 apiClient: Payload has status?', 'status' in data, data.status);
        console.log('🔍 apiClient: Payload keys:', Object.keys(data));
      }
      
      const body = isFormData ? data : (data ? JSON.stringify(data) : undefined);
      
      // Log the stringified body for blog requests
      if (body && !isFormData && method === 'POST' && endpoint.includes('blog')) {
        console.log('🔍 apiClient: Stringified body:', body);
        try {
          const parsed = JSON.parse(body as string);
          console.log('🔍 apiClient: Parsed body has status?', 'status' in parsed, parsed.status);
        } catch (e) {
          console.error('🔍 apiClient: Failed to parse body for logging:', e);
        }
      }
      
      // Remove Content-Type header for FormData to let browser set it with boundary
      if (isFormData) {
        delete requestHeaders['Content-Type'];
      }

      // Re-apply Bearer after all header mutations (guards against empty/overridden Authorization from config).
      if (!skipAuth) {
        const token = this.getAuthToken();
        if (token) {
          requestHeaders['Authorization'] = `Bearer ${token}`;
        }
      }
      
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body,
        signal: controller.signal,
        mode: 'cors',
      });
      
      // Only log errors or non-GET requests
      if (!response.ok || method !== 'GET') {
        console.log('📥 API Response:', {
          status: response.status,
          statusText: response.statusText,
          endpoint,
        });
      }
      
      clearTimeout(timeoutId);
      
      // Try to parse response body (even for errors, backend might send useful info)
      let result: any;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          result = await response.json();
      // Log response body for errors or non-GET requests, or for debugging
      if (!response.ok || method !== 'GET' || import.meta.env.DEV) {
        console.log('📦 Response Body:', result);
        if (method === 'GET' && endpoint.includes('blog')) {
          console.log('📦 Full response for blog GET:', {
            url: response.url,
            status: response.status,
            body: result
          });
        }
      }
        } catch (e) {
          console.error('❌ Failed to parse JSON response:', e);
          // If JSON parsing fails, result stays undefined
        }
      }
      
      if (!response.ok) {
        // Extract error message from response body (Spring often uses message, error, or errors[])
        let bodyHint = '';
        if (result && typeof result === 'object') {
          const errs = (result as any).errors;
          if (Array.isArray(errs)) {
            bodyHint = errs
              .map((e: any) =>
                e?.defaultMessage || e?.message || (typeof e === 'string' ? e : JSON.stringify(e))
              )
              .filter(Boolean)
              .join('; ');
          } else if (errs && typeof errs === 'object' && !Array.isArray(errs)) {
            bodyHint = Object.entries(errs)
              .map(([k, v]) => `${k}: ${Array.isArray(v) ? (v as string[]).join(', ') : String(v)}`)
              .join('; ');
          }
        }
        const errorMessage =
          bodyHint ||
          result?.message ||
          result?.error ||
          result?.msg ||
          `HTTP ${response.status}: ${response.statusText}`;
        
        // Enhanced logging for debugging, especially for login
        if (endpoint.includes('/auth/login')) {
          console.error('❌ Login API Error Response:', {
            status: response.status,
            statusText: response.statusText,
            url: response.url,
            requestUrl: url,
            errorBody: result,
            errorMessage,
            headers: Object.fromEntries(response.headers.entries()),
          });
        } else {
          console.error('❌ API Error Response:', {
            status: response.status,
            statusText: response.statusText,
            url: response.url,
            errorBody: result,
            errorMessage,
          });
        }
        
        return {
          success: false,
          error: errorMessage,
          message: result?.message,
          data: result,
        };
      }
      
      // Handle successful HTTP response - but check backend's success field
      const responseData = result?.data || result;
      const responseSuccess = result?.success !== undefined ? result.success : true;
      
      // If backend returns success: false, treat it as an error even if HTTP status is 200
      if (!responseSuccess) {
        const errorMessage = formatApiSuccessFalseMessage(result, endpoint);

        console.error('❌ API returned success: false (HTTP may still be 2xx):', {
          status: response.status,
          endpoint,
          errorBody: result,
          errorMessage,
        });

        return {
          success: false,
          error: errorMessage,
          message: pickTrimmedString(result?.msg) || pickTrimmedString(result?.message) || errorMessage,
          data: result?.data || result,
        };
      }
      
      // Only log for non-GET requests or if there's an issue
      if (method !== 'GET' || !responseSuccess) {
        console.log('✅ API Response:', {
          status: response.status,
          success: responseSuccess,
          endpoint,
        });
      }
      
      return {
        success: responseSuccess,
        data: responseData,
        message: result?.message,
        pagination: result?.pagination,
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

  // DELETE with body (for bulk operations)
  async deleteWithBody<T = any>(
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<APIResponse<T>> {
    return this.request<T>({
      method: 'DELETE',
      endpoint,
      data,
      headers,
    });
  }

  // GET blob (file downloads)
  async getBlob(
    endpoint: string,
    params?: Record<string, any>,
    headers?: Record<string, string>
  ): Promise<APIResponse<Blob>> {
    this.updateConfig();
    const url = this.buildURL(endpoint, params);
    const requestHeaders = this.buildHeaders(headers);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: requestHeaders,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
      return { success: true, data: blob };
    } catch (error) {
      clearTimeout(timeoutId);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
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

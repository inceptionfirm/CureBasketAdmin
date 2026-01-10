// Dynamic API Configuration System
// This allows easy switching between mock data and real APIs

export interface APIConfig {
  useMockData: boolean;
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

export interface MockDataConfig {
  enableMockData: boolean;
  mockDelay: number; // Simulate network delay
  mockErrorRate: number; // 0-1, probability of mock errors
}

// Default configuration
export const DEFAULT_API_CONFIG: APIConfig = {
  useMockData: false, // Using real APIs by default
  baseURL: 'https://java.api.curebasket.com/backend',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000
};

export const DEFAULT_MOCK_CONFIG: MockDataConfig = {
  enableMockData: true,
  mockDelay: 500, // 500ms delay to simulate network
  mockErrorRate: 0.05 // 5% chance of mock errors
};

// API Configuration Manager
class APIConfigManager {
  private config: APIConfig;
  private mockConfig: MockDataConfig;

  constructor() {
    this.config = { ...DEFAULT_API_CONFIG };
    this.mockConfig = { ...DEFAULT_MOCK_CONFIG };
    this.loadFromStorage();
  }

  // Load configuration from localStorage
  private loadFromStorage(): void {
    try {
      const storedConfig = localStorage.getItem('apiConfig');
      const storedMockConfig = localStorage.getItem('mockConfig');
      
      if (storedConfig) {
        this.config = { ...this.config, ...JSON.parse(storedConfig) };
      }
      
      if (storedMockConfig) {
        this.mockConfig = { ...this.mockConfig, ...JSON.parse(storedMockConfig) };
      }
    } catch (error) {
      console.warn('Failed to load API config from storage:', error);
    }
  }

  // Save configuration to localStorage
  private saveToStorage(): void {
    try {
      localStorage.setItem('apiConfig', JSON.stringify(this.config));
      localStorage.setItem('mockConfig', JSON.stringify(this.mockConfig));
    } catch (error) {
      console.warn('Failed to save API config to storage:', error);
    }
  }

  // Get current API configuration
  getConfig(): APIConfig {
    return { ...this.config };
  }

  // Get current mock configuration
  getMockConfig(): MockDataConfig {
    return { ...this.mockConfig };
  }

  // Update API configuration
  updateConfig(updates: Partial<APIConfig>): void {
    this.config = { ...this.config, ...updates };
    this.saveToStorage();
  }

  // Update mock configuration
  updateMockConfig(updates: Partial<MockDataConfig>): void {
    this.mockConfig = { ...this.mockConfig, ...updates };
    this.saveToStorage();
  }

  // Check if mock data should be used
  shouldUseMockData(): boolean {
    return this.config.useMockData || this.mockConfig.enableMockData;
  }

  // Get base URL for API calls
  getBaseURL(): string {
    return this.config.baseURL;
  }

  // Get timeout for API calls
  getTimeout(): number {
    return this.config.timeout;
  }

  // Get retry configuration
  getRetryConfig(): { attempts: number; delay: number } {
    return {
      attempts: this.config.retryAttempts,
      delay: this.config.retryDelay
    };
  }

  // Get mock delay
  getMockDelay(): number {
    return this.mockConfig.mockDelay;
  }

  // Get mock error rate
  getMockErrorRate(): number {
    return this.mockConfig.mockErrorRate;
  }

  // Switch to production mode (disable mock data)
  enableProductionMode(): void {
    this.updateConfig({ useMockData: false });
    this.updateMockConfig({ enableMockData: false });
  }

  // Switch to development mode (enable mock data)
  enableDevelopmentMode(): void {
    this.updateConfig({ useMockData: true });
    this.updateMockConfig({ enableMockData: true });
  }

  // Reset to default configuration
  reset(): void {
    this.config = { ...DEFAULT_API_CONFIG };
    this.mockConfig = { ...DEFAULT_MOCK_CONFIG };
    this.saveToStorage();
  }
}

// Export singleton instance
export const apiConfigManager = new APIConfigManager();

// Utility functions for API calls
export const createMockDelay = (delay?: number): Promise<void> => {
  const actualDelay = delay || apiConfigManager.getMockDelay();
  return new Promise(resolve => setTimeout(resolve, actualDelay));
};

export const shouldMockError = (): boolean => {
  return Math.random() < apiConfigManager.getMockErrorRate();
};

export const createMockError = (message: string = 'Mock API Error'): Error => {
  return new Error(message);
};

// Dynamic API call wrapper
export const createDynamicAPICall = async <T>(
  mockData: T,
  apiCall: () => Promise<T>,
  errorMessage: string = 'API call failed'
): Promise<T> => {
  const config = apiConfigManager.getConfig();
  
  if (config.useMockData) {
    try {
      // Simulate network delay
      await createMockDelay();
      
      // Simulate occasional errors
      if (shouldMockError()) {
        throw createMockError(errorMessage);
      }
      
      return mockData;
    } catch (error) {
      throw error;
    }
  } else {
    try {
      return await apiCall();
    } catch (error) {
      console.error('API call failed:', error);
      throw new Error(errorMessage);
    }
  }
};

// Retry mechanism for API calls
export const withRetry = async <T>(
  apiCall: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxAttempts) {
        throw lastError;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError!;
};

export default apiConfigManager;

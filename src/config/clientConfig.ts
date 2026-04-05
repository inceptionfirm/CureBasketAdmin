// Client Configuration System - White-label pharmaceutical e-commerce platform
// This allows easy customization for different clients

export interface ClientBranding {
  name: string;
  logo: string;
  favicon: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  customCSS?: string;
}

export interface ClientFeatures {
  // E-commerce features
  enableInventory: boolean;
  enablePrescriptions: boolean;
  enableBulkUpload: boolean;
  enableAnalytics: boolean;
  enableReports: boolean;
  enableNotifications: boolean;
  enableMultiLanguage: boolean;
  enableMultiCurrency: boolean;

  // Admin features
  enableUserManagement: boolean;
  enableRoleManagement: boolean;
  enableAuditLogs: boolean;
  enableBackup: boolean;
  enableAPI: boolean;

  // Pharmacy specific
  enablePrescriptionUpload: boolean;
  enableDoctorVerification: boolean;
  enableInsuranceIntegration: boolean;
  enableDeliveryTracking: boolean;
  enableStockManagement: boolean;
}

export interface ClientModules {
  // Core modules
  dashboard: boolean;
  products: boolean;
  orders: boolean;
  customers: boolean;
  inventory: boolean;

  // Pharmacy modules
  prescriptions: boolean;
  medicines: boolean;
  categories: boolean;
  manufacturers: boolean;

  // Content modules
  blogs: boolean;
  banners: boolean;
  notifications: boolean;

  // System modules
  users: boolean;
  roles: boolean;
  settings: boolean;
  analytics: boolean;
  reports: boolean;
}

export interface ClientAPI {
  baseURL: string;
  version: string;
  endpoints: {
    auth: string;
    products: string;
    orders: string;
    customers: string;
    prescriptions: string;
    medicines: string;
    categories: string;
    users: string;
    analytics: string;
    upload: string;
  };
  headers: Record<string, string>;
  timeout: number;
}

export interface ClientConfig {
  id: string;
  name: string;
  domain: string;
  branding: ClientBranding;
  features: ClientFeatures;
  modules: ClientModules;
  api: ClientAPI;
  settings: {
    timezone: string;
    currency: string;
    language: string;
    dateFormat: string;
    numberFormat: string;
  };
  deployment: {
    environment: 'development' | 'staging' | 'production';
    version: string;
    buildDate: string;
  };
}

// Default client configuration template
export const DEFAULT_CLIENT_CONFIG: ClientConfig = {
  id: 'curebasket',
  name: 'CureBasket',
  domain: 'curebasket-admin.vercel.app',
  branding: {
    name: 'CureBasket',
    logo: '/logo.png',
    favicon: '/favicon.ico',
    primaryColor: '#3b82f6',
    secondaryColor: '#1e40af',
    accentColor: '#06b6d4',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    fontFamily: 'Inter, sans-serif',
  },
  features: {
    enableInventory: true,
    enablePrescriptions: true,
    enableBulkUpload: true,
    enableAnalytics: true,
    enableReports: true,
    enableNotifications: true,
    enableMultiLanguage: true,
    enableMultiCurrency: true,
    enableUserManagement: true,
    enableRoleManagement: true,
    enableAuditLogs: true,
    enableBackup: true,
    enableAPI: true,
    enablePrescriptionUpload: true,
    enableDoctorVerification: true,
    enableInsuranceIntegration: false,
    enableDeliveryTracking: true,
    enableStockManagement: true,
  },
  modules: {
    dashboard: true,
    products: true,
    orders: true,
    customers: true,
    inventory: true,
    prescriptions: true,
    medicines: true,
    categories: true,
    manufacturers: true,
    blogs: true,
    banners: true,
    notifications: true,
    users: true,
    roles: true,
    settings: true,
    analytics: true,
    reports: true,
  },
  api: {
    // Production: call API directly. Dev: use same-origin `/api/` so Vite proxies to the server (avoids CORS; Postman does not use CORS).
    baseURL: import.meta.env.DEV ? '/api/' : 'https://api.curebasket.com/',
    version: '',
    endpoints: {
      auth: '/auth',
      products: '/products',
      orders: '/orders',
      customers: '/customers',
      prescriptions: '/prescriptions',
      medicines: '/medicines',
      categories: '/categories',
      users: '/users',
      analytics: '/analytics',
      upload: '/upload',
    },
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    timeout: 30000,
  },
  settings: {
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    language: 'en',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'en-IN',
  },
  deployment: {
    environment: 'production',
    version: '1.0.0',
    buildDate: new Date().toISOString(),
  },
};

// Client configuration manager
class ClientConfigManager {
  private config: ClientConfig;
  private listeners: Array<(config: ClientConfig) => void> = [];

  constructor(initialConfig?: Partial<ClientConfig>) {
    this.config = { ...DEFAULT_CLIENT_CONFIG, ...initialConfig };
    this.loadFromStorage();
  }

  // Load configuration from localStorage
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('clientConfig');
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<ClientConfig>;
        // Shallow merge replaces entire `api` and can drop baseURL/headers/endpoints — deep-merge api only.
        const { api: parsedApi, ...rest } = parsed;
        this.config = { ...this.config, ...rest };
        if (parsedApi && typeof parsedApi === 'object') {
          this.config.api = {
            ...DEFAULT_CLIENT_CONFIG.api,
            ...this.config.api,
            ...parsedApi,
            headers: {
              ...DEFAULT_CLIENT_CONFIG.api.headers,
              ...(this.config.api?.headers || {}),
              ...(parsedApi.headers || {}),
            },
          };
        }
        // Dev-only relative /api/ must not stick on production (wrong host, auth issues).
        if (
          import.meta.env.PROD &&
          typeof this.config.api.baseURL === 'string' &&
          this.config.api.baseURL.startsWith('/')
        ) {
          this.config.api.baseURL = DEFAULT_CLIENT_CONFIG.api.baseURL;
        }
        // In development, ignore a stored absolute API URL (e.g. copied from production localStorage).
        // Otherwise requests go straight to api.curebasket.com (cross-origin) and often return 401 even when
        // the admin JWT exists — same token works via the Vite /api proxy (same-origin + forwarded Bearer).
        if (
          import.meta.env.DEV &&
          typeof this.config.api.baseURL === 'string' &&
          /^https?:\/\//i.test(this.config.api.baseURL)
        ) {
          console.warn(
            '[clientConfig] Development: ignoring stored absolute api.baseURL; using /api/ proxy. Clear localStorage "clientConfig" if you did not intend to override the API.'
          );
          this.config.api.baseURL = '/api/';
        }
      }
    } catch (error) {
      console.warn('Failed to load client config from storage:', error);
    }
  }

  // Save configuration to localStorage
  private saveToStorage(): void {
    try {
      localStorage.setItem('clientConfig', JSON.stringify(this.config));
    } catch (error) {
      console.warn('Failed to save client config to storage:', error);
    }
  }

  // Get current configuration
  getConfig(): ClientConfig {
    return { ...this.config };
  }

  // Update configuration
  updateConfig(updates: Partial<ClientConfig>): void {
    this.config = { ...this.config, ...updates };
    this.saveToStorage();
    this.notifyListeners();
  }

  // Update branding
  updateBranding(branding: Partial<ClientBranding>): void {
    this.config.branding = { ...this.config.branding, ...branding };
    this.saveToStorage();
    this.notifyListeners();
  }

  // Update features
  updateFeatures(features: Partial<ClientFeatures>): void {
    this.config.features = { ...this.config.features, ...features };
    this.saveToStorage();
    this.notifyListeners();
  }

  // Update modules
  updateModules(modules: Partial<ClientModules>): void {
    this.config.modules = { ...this.config.modules, ...modules };
    this.saveToStorage();
    this.notifyListeners();
  }

  // Update API configuration
  updateAPI(api: Partial<ClientAPI>): void {
    this.config.api = { ...this.config.api, ...api };
    this.saveToStorage();
    this.notifyListeners();
  }

  // Check if feature is enabled
  isFeatureEnabled(feature: keyof ClientFeatures): boolean {
    return this.config.features[feature];
  }

  // Check if module is enabled
  isModuleEnabled(module: keyof ClientModules): boolean {
    return this.config.modules[module];
  }

  // Get API endpoint
  getAPIEndpoint(endpoint: keyof ClientAPI['endpoints']): string {
    const base = this.config.api.baseURL.replace(/\/+$/, '');
    const version = (this.config.api.version || '').replace(/^\/+|\/+$/g, '');
    const prefix = version ? `${base}/${version}` : base;
    return `${prefix}${this.config.api.endpoints[endpoint]}`;
  }

  // Subscribe to configuration changes
  subscribe(listener: (config: ClientConfig) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify listeners of configuration changes
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.config));
  }

  // Reset to default configuration
  reset(): void {
    this.config = { ...DEFAULT_CLIENT_CONFIG };
    this.saveToStorage();
    this.notifyListeners();
  }

  // Load configuration from server
  async loadFromServer(): Promise<void> {
    try {
      const response = await fetch('/api/client/config');
      if (response.ok) {
        const serverConfig = await response.json();
        this.updateConfig(serverConfig);
      }
    } catch (error) {
      console.warn('Failed to load client config from server:', error);
    }
  }

  // Save configuration to server
  async saveToServer(): Promise<boolean> {
    try {
      const response = await fetch('/api/client/config', {
        method: 'POST',
        headers: this.config.api.headers,
        body: JSON.stringify(this.config),
      });
      return response.ok;
    } catch (error) {
      console.error('Failed to save client config to server:', error);
      return false;
    }
  }
}

// Export singleton instance
export const clientConfigManager = new ClientConfigManager();
export default clientConfigManager;

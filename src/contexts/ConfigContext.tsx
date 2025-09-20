import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppConfig, defaultConfig, getClientConfig } from '../config/appConfig';

// Function to update favicon dynamically
const updateFavicon = (faviconPath: string) => {
  // Remove existing favicon links
  const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
  existingFavicons.forEach(link => link.remove());

  // Create new favicon links
  const head = document.head;
  
  // Main favicon
  const favicon = document.createElement('link');
  favicon.rel = 'icon';
  favicon.type = 'image/x-icon';
  favicon.href = faviconPath;
  head.appendChild(favicon);

  // PNG favicons for different sizes
  const favicon32 = document.createElement('link');
  favicon32.rel = 'icon';
  favicon32.type = 'image/png';
  favicon32.sizes = '32x32';
  favicon32.href = faviconPath.replace('.ico', '-32x32.png');
  head.appendChild(favicon32);

  const favicon16 = document.createElement('link');
  favicon16.rel = 'icon';
  favicon16.type = 'image/png';
  favicon16.sizes = '16x16';
  favicon16.href = faviconPath.replace('.ico', '-16x16.png');
  head.appendChild(favicon16);

  // Apple touch icon
  const appleTouchIcon = document.createElement('link');
  appleTouchIcon.rel = 'apple-touch-icon';
  appleTouchIcon.href = faviconPath.replace('.ico', '.png');
  head.appendChild(appleTouchIcon);
};

interface ConfigContextType {
  config: AppConfig;
  updateConfig: (updates: Partial<AppConfig>) => void;
  switchClient: (clientId: string) => void;
  currentClient: string;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const useConfig = (): ConfigContextType => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};

interface ConfigProviderProps {
  children: ReactNode;
  clientId?: string;
}

export const ConfigProvider: React.FC<ConfigProviderProps> = ({ 
  children, 
  clientId = 'default' 
}) => {
  const [config, setConfig] = useState<AppConfig>(() => {
    // Try to get config from localStorage first
    const savedConfig = localStorage.getItem('flycanary_config');
    if (savedConfig) {
      try {
        return JSON.parse(savedConfig);
      } catch (error) {
        console.error('Error parsing saved config:', error);
      }
    }
    
    // Fallback to client config or default
    return clientId === 'default' ? defaultConfig : getClientConfig(clientId);
  });

  const [currentClient, setCurrentClient] = useState<string>(clientId);

  // Apply CSS custom properties when config changes
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply color scheme
    root.style.setProperty('--color-primary', config.colors.primary);
    root.style.setProperty('--color-secondary', config.colors.secondary);
    root.style.setProperty('--color-accent', config.colors.accent);
    root.style.setProperty('--color-background', config.colors.background);
    root.style.setProperty('--color-surface', config.colors.surface);
    root.style.setProperty('--color-text-primary', config.colors.text.primary);
    root.style.setProperty('--color-text-secondary', config.colors.text.secondary);
    root.style.setProperty('--color-text-muted', config.colors.text.muted);
    root.style.setProperty('--color-success', config.colors.success);
    root.style.setProperty('--color-warning', config.colors.warning);
    root.style.setProperty('--color-error', config.colors.error);
    root.style.setProperty('--color-info', config.colors.info);

    // Apply typography
    root.style.setProperty('--font-family', config.typography.fontFamily);
    root.style.setProperty('--font-heading', config.typography.headingFont);

    // Apply layout
    root.style.setProperty('--sidebar-width', config.layout.sidebarWidth);
    root.style.setProperty('--header-height', config.layout.headerHeight);
    root.style.setProperty('--border-radius', config.layout.borderRadius);

    // Apply spacing
    Object.entries(config.layout.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });

    // Apply font sizes
    Object.entries(config.typography.fontSize).forEach(([key, value]) => {
      root.style.setProperty(`--font-size-${key}`, value);
    });

    // Update page title and favicon
    document.title = `${config.brand.name} - ${config.brand.tagline}`;
    
    // Update favicon dynamically
    updateFavicon(config.brand.favicon);

  }, [config]);

  const updateConfig = (updates: Partial<AppConfig>) => {
    setConfig(prevConfig => {
      const newConfig = { ...prevConfig, ...updates };
      
      // Save to localStorage
      localStorage.setItem('flycanary_config', JSON.stringify(newConfig));
      
      return newConfig;
    });
  };

  const switchClient = (clientId: string) => {
    const newConfig = clientId === 'default' ? defaultConfig : getClientConfig(clientId);
    setConfig(newConfig);
    setCurrentClient(clientId);
    
    // Save to localStorage
    localStorage.setItem('flycanary_config', JSON.stringify(newConfig));
    localStorage.setItem('flycanary_client', clientId);
  };

  const value = {
    config,
    updateConfig,
    switchClient,
    currentClient
  };

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
};

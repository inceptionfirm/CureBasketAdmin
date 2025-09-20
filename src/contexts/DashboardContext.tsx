import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DashboardConfig, defaultDashboardConfig, getDashboardConfig } from '../config/dashboardConfig';

interface DashboardContextType {
  config: DashboardConfig;
  updateConfig: (updates: Partial<DashboardConfig>) => void;
  switchClient: (clientId: string) => void;
  currentClient: string;
  updateWidget: (widgetId: string, updates: Partial<any>) => void;
  toggleWidget: (widgetId: string) => void;
  toggleSection: (sectionId: string) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const useDashboard = (): DashboardContextType => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

interface DashboardProviderProps {
  children: ReactNode;
  clientId?: string;
}

export const DashboardProvider: React.FC<DashboardProviderProps> = ({ 
  children, 
  clientId = 'default' 
}) => {
  const [config, setConfig] = useState<DashboardConfig>(() => {
    // Try to get config from localStorage first
    const savedConfig = localStorage.getItem(`dashboard_config_${clientId}`);
    if (savedConfig) {
      try {
        return JSON.parse(savedConfig);
      } catch (error) {
        console.error('Error parsing saved dashboard config:', error);
      }
    }
    
    // Fallback to client config or default
    return getDashboardConfig(clientId);
  });

  const [currentClient, setCurrentClient] = useState<string>(clientId);

  // Apply CSS custom properties when config changes
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply dashboard colors
    root.style.setProperty('--dashboard-primary', config.colors.primary);
    root.style.setProperty('--dashboard-secondary', config.colors.secondary);
    root.style.setProperty('--dashboard-accent', config.colors.accent);
    root.style.setProperty('--dashboard-background', config.colors.background);
    root.style.setProperty('--dashboard-surface', config.colors.surface);
    root.style.setProperty('--dashboard-text-primary', config.colors.text.primary);
    root.style.setProperty('--dashboard-text-secondary', config.colors.text.secondary);
    root.style.setProperty('--dashboard-text-muted', config.colors.text.muted);
    root.style.setProperty('--dashboard-success', config.colors.success);
    root.style.setProperty('--dashboard-warning', config.colors.warning);
    root.style.setProperty('--dashboard-error', config.colors.error);
    root.style.setProperty('--dashboard-info', config.colors.info);
    root.style.setProperty('--dashboard-border', config.colors.border);

    // Apply layout properties
    root.style.setProperty('--dashboard-grid-columns', config.layout.gridColumns.toString());
    root.style.setProperty('--dashboard-widget-spacing', config.layout.widgetSpacing);
    root.style.setProperty('--dashboard-section-spacing', config.layout.sectionSpacing);
    root.style.setProperty('--dashboard-card-padding', config.layout.cardPadding);
    root.style.setProperty('--dashboard-card-radius', config.layout.cardRadius);
    root.style.setProperty('--dashboard-card-shadow', config.layout.cardShadow);

  }, [config]);

  const updateConfig = (updates: Partial<DashboardConfig>) => {
    setConfig(prevConfig => {
      const newConfig = { ...prevConfig, ...updates };
      localStorage.setItem(`dashboard_config_${currentClient}`, JSON.stringify(newConfig));
      return newConfig;
    });
  };

  const switchClient = (newClientId: string) => {
    setCurrentClient(newClientId);
    const newConfig = getDashboardConfig(newClientId);
    setConfig(newConfig);
    localStorage.setItem('current_dashboard_client', newClientId);
  };

  const updateWidget = (widgetId: string, updates: Partial<any>) => {
    setConfig(prevConfig => {
      const updatedWidgets = prevConfig.widgets.map(widget => 
        widget.id === widgetId ? { ...widget, ...updates } : widget
      );
      const newConfig = { ...prevConfig, widgets: updatedWidgets };
      localStorage.setItem(`dashboard_config_${currentClient}`, JSON.stringify(newConfig));
      return newConfig;
    });
  };

  const toggleWidget = (widgetId: string) => {
    setConfig(prevConfig => {
      const updatedWidgets = prevConfig.widgets.map(widget => 
        widget.id === widgetId ? { ...widget, visible: !widget.visible } : widget
      );
      const newConfig = { ...prevConfig, widgets: updatedWidgets };
      localStorage.setItem(`dashboard_config_${currentClient}`, JSON.stringify(newConfig));
      return newConfig;
    });
  };

  const toggleSection = (sectionId: string) => {
    setConfig(prevConfig => {
      const updatedSections = prevConfig.sections.map(section => 
        section.id === sectionId ? { ...section, visible: !section.visible } : section
      );
      const newConfig = { ...prevConfig, sections: updatedSections };
      localStorage.setItem(`dashboard_config_${currentClient}`, JSON.stringify(newConfig));
      return newConfig;
    });
  };

  return (
    <DashboardContext.Provider value={{
      config,
      updateConfig,
      switchClient,
      currentClient,
      updateWidget,
      toggleWidget,
      toggleSection
    }}>
      {children}
    </DashboardContext.Provider>
  );
};

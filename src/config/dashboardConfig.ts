// Dashboard Configuration Types
export interface DashboardWidget {
  id: string;
  title: string;
  value: string | number;
  description: string;
  icon: string;
  color: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  visible: boolean;
}

export interface DashboardSection {
  id: string;
  title: string;
  description: string;
  visible: boolean;
  order: number;
}

export interface DashboardLayout {
  gridColumns: number;
  widgetSpacing: string;
  sectionSpacing: string;
  cardPadding: string;
  cardRadius: string;
  cardShadow: string;
}

export interface DashboardColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: {
    primary: string;
    secondary: string;
    muted: string;
  };
  success: string;
  warning: string;
  error: string;
  info: string;
  border: string;
}

export interface DashboardConfig {
  layout: DashboardLayout;
  colors: DashboardColors;
  widgets: DashboardWidget[];
  sections: DashboardSection[];
  features: {
    showWelcomeMessage: boolean;
    showQuickActions: boolean;
    showRecentActivity: boolean;
    showNotifications: boolean;
    showSearchBar: boolean;
  };
  welcomeMessage: {
    title: string;
    subtitle: string;
    visible: boolean;
  };
  quickActions: {
    title: string;
    actions: Array<{
      id: string;
      label: string;
      icon: string;
      color: string;
      visible: boolean;
    }>;
  };
}

// Default Dashboard Configuration
export const defaultDashboardConfig: DashboardConfig = {
  layout: {
    gridColumns: 4,
    widgetSpacing: '1.5rem',
    sectionSpacing: '2rem',
    cardPadding: '1.5rem',
    cardRadius: '12px',
    cardShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
  },
  colors: {
    primary: '#10b981', // Healthcare Green
    secondary: '#059669', // Darker Green
    accent: '#34d399', // Light Green Accent
    background: '#f0fdf4', // Very Light Green Background
    surface: '#ffffff', // White Surface
    text: {
      primary: '#064e3b', // Dark Green Text
      secondary: '#047857', // Medium Green
      muted: '#6b7280' // Neutral Gray
    },
    success: '#10b981', // Green
    warning: '#f59e0b', // Amber
    error: '#ef4444', // Red
    info: '#06b6d4', // Cyan
    border: '#a7f3d0' // Light Green Border
  },
  widgets: [
    {
      id: 'total-categories',
      title: 'Total Categories',
      value: '12',
      description: 'Active categories',
      icon: '📊',
      color: '#10b981', // Healthcare Green
      trend: {
        value: 12,
        direction: 'up'
      },
      visible: true
    },
    {
      id: 'active-elements',
      title: 'Active Elements',
      value: '48',
      description: 'Currently active',
      icon: '⚡',
      color: '#059669', // Darker Green
      trend: {
        value: 8,
        direction: 'up'
      },
      visible: true
    },
    {
      id: 'success-rate',
      title: 'Success Rate',
      value: '94%',
      description: 'This month',
      icon: '✅',
      color: '#34d399', // Light Green Accent
      trend: {
        value: 2,
        direction: 'up'
      },
      visible: true
    },
    {
      id: 'users-online',
      title: 'Users Online',
      value: '23',
      description: 'Active now',
      icon: '👥',
      color: '#06b6d4', // Cyan for variety
      trend: {
        value: 5,
        direction: 'up'
      },
      visible: true
    }
  ],
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      description: 'Key metrics and statistics',
      visible: true,
      order: 1
    },
    {
      id: 'categories',
      title: 'Categories',
      description: 'Manage your product categories',
      visible: true,
      order: 2
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'Performance insights',
      visible: true,
      order: 3
    }
  ],
  features: {
    showWelcomeMessage: true,
    showQuickActions: true,
    showRecentActivity: false,
    showNotifications: true,
    showSearchBar: true
  },
  welcomeMessage: {
    title: 'Welcome back!',
    subtitle: 'Here\'s what\'s happening with your business today.',
    visible: true
  },
  quickActions: {
    title: 'Quick Actions',
    actions: [
      {
        id: 'add-category',
        label: 'Add Category',
        icon: '➕',
        color: '#10b981', // Healthcare Green
        visible: true
      },
      {
        id: 'view-analytics',
        label: 'View Analytics',
        icon: '📈',
        color: '#059669', // Darker Green
        visible: true
      },
      {
        id: 'manage-users',
        label: 'Manage Users',
        icon: '👥',
        color: '#34d399', // Light Green Accent
        visible: true
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: '⚙️',
        color: '#06b6d4', // Cyan
        visible: true
      }
    ]
  }
};

// Client-specific dashboard configurations
export const dashboardClientConfigs: Record<string, Partial<DashboardConfig>> = {
  'ecommerce-client': {
    colors: {
      primary: '#fbbf24',
      secondary: '#fde68a',
      accent: '#fef3c7',
      background: '#fffbeb',
      surface: '#ffffff',
      text: {
        primary: '#374151',
        secondary: '#6b7280',
        muted: '#9ca3af'
      },
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      border: '#f3f4f6'
    },
    widgets: [
      {
        id: 'total-orders',
        title: 'Total Orders',
        value: '1,247',
        description: 'This month',
        icon: '🛒',
        color: '#fbbf24',
        trend: {
          value: 15,
          direction: 'up'
        },
        visible: true
      },
      {
        id: 'revenue',
        title: 'Revenue',
        value: '$24,580',
        description: 'This month',
        icon: '💰',
        color: '#10b981',
        trend: {
          value: 8,
          direction: 'up'
        },
        visible: true
      },
      {
        id: 'customers',
        title: 'Customers',
        value: '892',
        description: 'Active customers',
        icon: '👥',
        color: '#3b82f6',
        trend: {
          value: 12,
          direction: 'up'
        },
        visible: true
      },
      {
        id: 'conversion-rate',
        title: 'Conversion Rate',
        value: '3.2%',
        description: 'This month',
        icon: '📈',
        color: '#8b5cf6',
        trend: {
          value: 0.3,
          direction: 'up'
        },
        visible: true
      }
    ],
    welcomeMessage: {
      title: 'Welcome to ShopMaster!',
      subtitle: 'Monitor your e-commerce performance and manage your store.',
      visible: true
    }
  },
  
  'healthcare-client': {
    colors: {
      primary: '#10b981',
      secondary: '#34d399',
      accent: '#6ee7b7',
      background: '#f0fdf4',
      surface: '#ffffff',
      text: {
        primary: '#374151',
        secondary: '#6b7280',
        muted: '#9ca3af'
      },
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      border: '#d1fae5'
    },
    widgets: [
      {
        id: 'patients-today',
        title: 'Patients Today',
        value: '47',
        description: 'Scheduled appointments',
        icon: '🏥',
        color: '#10b981',
        trend: {
          value: 3,
          direction: 'up'
        },
        visible: true
      },
      {
        id: 'appointments',
        title: 'Appointments',
        value: '156',
        description: 'This week',
        icon: '📅',
        color: '#3b82f6',
        trend: {
          value: 8,
          direction: 'up'
        },
        visible: true
      },
      {
        id: 'revenue',
        title: 'Revenue',
        value: '$18,420',
        description: 'This month',
        icon: '💰',
        color: '#10b981',
        trend: {
          value: 5,
          direction: 'up'
        },
        visible: true
      },
      {
        id: 'satisfaction',
        title: 'Satisfaction',
        value: '4.8/5',
        description: 'Patient rating',
        icon: '⭐',
        color: '#f59e0b',
        trend: {
          value: 0.2,
          direction: 'up'
        },
        visible: true
      }
    ],
    welcomeMessage: {
      title: 'Welcome to HealthCare Pro!',
      subtitle: 'Manage your healthcare practice and patient care.',
      visible: true
    }
  },

  // CureBasket Healthcare Client
  'curebasket-healthcare': {
    colors: {
      primary: '#10b981', // Healthcare Green
      secondary: '#059669', // Darker Green
      accent: '#34d399', // Light Green Accent
      background: '#f0fdf4', // Very Light Green Background
      surface: '#ffffff', // White Surface
      text: {
        primary: '#064e3b', // Dark Green Text
        secondary: '#047857', // Medium Green
        muted: '#6b7280' // Neutral Gray
      },
      success: '#10b981', // Green
      warning: '#f59e0b', // Amber
      error: '#ef4444', // Red
      info: '#06b6d4', // Cyan
      border: '#a7f3d0' // Light Green Border
    },
    widgets: [
      {
        id: 'total-orders',
        title: 'Orders Completed',
        value: '65',
        description: 'This Week',
        icon: '📦',
        color: '#10b981', // Healthcare Green
        trend: {
          value: 12,
          direction: 'up'
        },
        visible: true
      },
      {
        id: 'total-buyers',
        title: 'Buyers',
        value: '43',
        description: 'This Week',
        icon: '👥',
        color: '#059669', // Darker Green
        trend: {
          value: 8,
          direction: 'up'
        },
        visible: true
      },
      {
        id: 'revenue',
        title: 'Revenue',
        value: '$12.5K',
        description: 'This Week',
        icon: '💰',
        color: '#34d399', // Light Green Accent
        trend: {
          value: 5,
          direction: 'up'
        },
        visible: true
      },
      {
        id: 'conversion-rate',
        title: 'Conversion Rate',
        value: '3.2%',
        description: 'This Week',
        icon: '📈',
        color: '#06b6d4', // Cyan
        trend: {
          value: 0.3,
          direction: 'up'
        },
        visible: true
      }
    ],
    welcomeMessage: {
      title: 'Welcome to CureBasket!',
      subtitle: 'Your central hub for managing healthcare operations and monitoring activity.',
      visible: true
    },
    quickActions: {
      title: 'Quick Actions',
      actions: [
        {
          id: 'add-category',
          label: 'Add Category',
          icon: '➕',
          color: '#10b981', // Healthcare Green
          visible: true
        },
        {
          id: 'manage-users',
          label: 'Manage Users',
          icon: '👥',
          color: '#059669', // Darker Green
          visible: true
        },
        {
          id: 'view-reports',
          label: 'View Reports',
          icon: '📊',
          color: '#34d399', // Light Green Accent
          visible: true
        },
        {
          id: 'settings',
          label: 'Settings',
          icon: '⚙️',
          color: '#06b6d4', // Cyan
          visible: true
        }
      ]
    }
  }
};

// Function to get dashboard configuration for a specific client
export const getDashboardConfig = (clientId: string): DashboardConfig => {
  const clientConfig = dashboardClientConfigs[clientId] || {};
  return {
    ...defaultDashboardConfig,
    ...clientConfig,
    widgets: clientConfig.widgets || defaultDashboardConfig.widgets,
    sections: clientConfig.sections || defaultDashboardConfig.sections,
    colors: {
      ...defaultDashboardConfig.colors,
      ...clientConfig.colors
    },
    layout: {
      ...defaultDashboardConfig.layout,
      ...clientConfig.layout
    },
    features: {
      ...defaultDashboardConfig.features,
      ...clientConfig.features
    },
    welcomeMessage: {
      ...defaultDashboardConfig.welcomeMessage,
      ...clientConfig.welcomeMessage
    },
    quickActions: {
      ...defaultDashboardConfig.quickActions,
      ...clientConfig.quickActions
    }
  };
};

// Function to update dashboard configuration
export const updateDashboardConfig = (clientId: string, updates: Partial<DashboardConfig>): void => {
  // This would typically save to localStorage or send to backend
  const currentConfig = getDashboardConfig(clientId);
  const updatedConfig = { ...currentConfig, ...updates };
  localStorage.setItem(`dashboard_config_${clientId}`, JSON.stringify(updatedConfig));
};

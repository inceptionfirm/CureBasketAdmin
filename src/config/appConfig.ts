// Dynamic Application Configuration
// This file contains all customizable elements for different clients

export interface AppConfig {
  // Brand Identity
  brand: {
    name: string;
    logo: string;
    favicon: string;
    tagline: string;
    description: string;
  };

  // Color Scheme
  colors: {
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
  };

  // Typography
  typography: {
    fontFamily: string;
    headingFont: string;
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
      '4xl': string;
    };
  };

  // Layout
  layout: {
    sidebarWidth: string;
    headerHeight: string;
    borderRadius: string;
    spacing: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
  };

  // Dashboard Configuration
  dashboard: {
    title: string;
    subtitle: string;
    widgets: {
      enabled: boolean;
      items: Array<{
        id: string;
        title: string;
        icon: string;
        value: string | number;
        description: string;
        color: string;
      }>;
    };
    categories: {
      enabled: boolean;
      title: string;
      description: string;
    };
  };

  // Navigation
  navigation: {
    sidebar: {
      items: Array<{
        title: string;
        icon: string;
        key: string;
        link: string;
        badge?: string;
        children?: Array<{
          title: string;
          icon: string;
          key: string;
          link: string;
        }>;
      }>;
    };
    header: {
      showUserMenu: boolean;
      showNotifications: boolean;
      showSearch: boolean;
    };
  };

  // Authentication
  auth: {
    loginPage: {
      title: string;
      subtitle: string;
      showDemoAccounts: boolean;
      demoAccounts: Array<{
        email: string;
        password: string;
        role: string;
        name: string;
      }>;
    };
    registration: {
      enabled: boolean;
      requireEmailVerification: boolean;
      allowedDomains: string[];
    };
  };

  // Features
  features: {
    profile: {
      enabled: boolean;
      allowAvatarChange: boolean;
      allowRoleChange: boolean;
    };
    settings: {
      enabled: boolean;
      allowThemeChange: boolean;
      allowLanguageChange: boolean;
    };
    analytics: {
      enabled: boolean;
      showRealTimeData: boolean;
    };
    notifications: {
      enabled: boolean;
      types: string[];
    };
  };

  // API Configuration
  api: {
    baseUrl: string;
    timeout: number;
    retryAttempts: number;
  };

  // Business Information
  business: {
    name: string;
    industry: string;
    contact: {
      email: string;
      phone: string;
      address: string;
    };
    social: {
      website: string;
      linkedin: string;
      twitter: string;
      facebook: string;
    };
  };

  // Customization
  customization: {
    allowClientBranding: boolean;
    allowColorCustomization: boolean;
    allowLogoUpload: boolean;
    allowCustomDomain: boolean;
  };
}

// Default Configuration
export const defaultConfig: AppConfig = {
    brand: {
      name: "CureBasket",
      logo: "/images/logo1.png",
      favicon: "/favicon.ico",
      tagline: "Your Health, Our Priority",
      description: "A comprehensive health and wellness platform"
    },

  colors: {
    primary: "#10b981", // Healthcare Green (matches logo)
    secondary: "#059669", // Darker Green
    accent: "#34d399", // Light Green Accent
    background: "#f0fdf4", // Very Light Green Background
    surface: "#ffffff", // White Surface
    sidebar: "#065f46", // Dark Green Sidebar (healthcare theme)
    header: "#ffffff", // White Header
    text: {
      primary: "#064e3b", // Dark Green Text
      secondary: "#047857", // Medium Green
      muted: "#6b7280", // Neutral Gray
      sidebar: "#d1fae5" // Light Green Text for Sidebar
    },
    success: "#10b981", // Green
    warning: "#f59e0b", // Amber
    error: "#ef4444", // Red
    info: "#06b6d4", // Cyan
    border: "#a7f3d0", // Light Green Border
    shadow: "rgba(16, 185, 129, 0.08)", // Green-tinted Shadow
    hover: "#ecfdf5", // Very Light Green Hover
    active: "#10b981" // Active State (Green)
  },

  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    headingFont: "'Inter', sans-serif",
    fontSize: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem"
    }
  },

  layout: {
    sidebarWidth: "280px",
    headerHeight: "80px",
    borderRadius: "12px",
    spacing: {
      xs: "0.25rem",
      sm: "0.5rem",
      md: "1rem",
      lg: "1.5rem",
      xl: "2rem"
    }
  },

  dashboard: {
    title: "Welcome to FlyCanary Dashboard",
    subtitle: "Your central hub for managing categories and monitoring activity",
    widgets: {
      enabled: true,
      items: [
        {
          id: "total-categories",
          title: "Total Categories",
          icon: "📊",
          value: "0",
          description: "Active categories",
          color: "#667eea"
        },
        {
          id: "active-elements",
          title: "Active Elements",
          icon: "⚡",
          value: "0",
          description: "Currently active",
          color: "#10b981"
        },
        {
          id: "success-rate",
          title: "Success Rate",
          icon: "🎯",
          value: "98%",
          description: "System uptime",
          color: "#f59e0b"
        },
        {
          id: "users-online",
          title: "Users Online",
          icon: "👥",
          value: "1,234",
          description: "Active users",
          color: "#8b5cf6"
        }
      ]
    },
    categories: {
      enabled: true,
      title: "Category Management",
      description: "Manage your business categories and elements"
    }
  },

  navigation: {
    sidebar: {
      items: [
        {
          title: "Dashboard",
          icon: "📊",
          key: "dashboard",
          link: "/dashboard"
        },
        {
          title: "Profile",
          icon: "👤",
          key: "profile",
          link: "/profile"
        },
        {
          title: "Settings",
          icon: "⚙️",
          key: "settings",
          link: "/settings"
        },
        {
          title: "Categories",
          icon: "📁",
          key: "categories",
          link: "/categories"
        },
        {
          title: "Analytics",
          icon: "📈",
          key: "analytics",
          link: "/analytics"
        },
        {
          title: "Reports",
          icon: "📋",
          key: "reports",
          link: "/reports"
        }
      ]
    },
    header: {
      showUserMenu: true,
      showNotifications: true,
      showSearch: false
    }
  },

  auth: {
    loginPage: {
      title: "Sign in to your account",
      subtitle: "Welcome back! Please sign in to continue",
      showDemoAccounts: true,
      demoAccounts: [
        {
          email: "admin@flycanary.com",
          password: "admin123",
          role: "Admin",
          name: "Admin User"
        },
        {
          email: "user@flycanary.com",
          password: "user123",
          role: "User",
          name: "Regular User"
        },
        {
          email: "demo@flycanary.com",
          password: "demo123",
          role: "Demo",
          name: "Demo User"
        }
      ]
    },
    registration: {
      enabled: true,
      requireEmailVerification: false,
      allowedDomains: []
    }
  },

  features: {
    profile: {
      enabled: true,
      allowAvatarChange: true,
      allowRoleChange: true
    },
    settings: {
      enabled: true,
      allowThemeChange: true,
      allowLanguageChange: true
    },
    analytics: {
      enabled: true,
      showRealTimeData: true
    },
    notifications: {
      enabled: true,
      types: ["email", "push", "sms"]
    }
  },

  api: {
    baseUrl: "http://localhost:3001/api",
    timeout: 10000,
    retryAttempts: 3
  },

  business: {
    name: "CureBasket",
    industry: "Healthcare",
    contact: {
      email: "contact@curebasket.com",
      phone: "+1 (555) 123-4567",
      address: "123 Health St, City, State 12345"
    },
    social: {
      website: "https://curebasket.com",
      linkedin: "https://linkedin.com/company/curebasket",
      twitter: "https://twitter.com/curebasket",
      facebook: "https://facebook.com/curebasket"
    }
  },

  customization: {
    allowClientBranding: true,
    allowColorCustomization: true,
    allowLogoUpload: true,
    allowCustomDomain: true
  }
};

// Client-specific configurations
export const clientConfigs: Record<string, Partial<AppConfig>> = {
  // Example: E-commerce client
  "ecommerce-client": {
    brand: {
      name: "ShopMaster",
      logo: "🛒",
      favicon: "/favicon-ecommerce.ico",
      tagline: "E-commerce Dashboard",
      description: "Manage your online store with ease"
    },
    colors: {
      primary: "#f59e0b",
      secondary: "#d97706",
      accent: "#fbbf24",
      background: "#fef3c7",
      surface: "#ffffff",
      text: {
        primary: "#1f2937",
        secondary: "#6b7280",
        muted: "#9ca3af"
      },
      success: "#10b981",
      warning: "#f59e0b",
      error: "#ef4444",
      info: "#3b82f6"
    },
    business: {
      name: "ShopMaster Inc",
      industry: "E-commerce",
      contact: {
        email: "support@shopmaster.com",
        phone: "+1 (555) 987-6543",
        address: "456 Commerce Ave, City, State 54321"
      },
      social: {
        website: "https://shopmaster.com",
        linkedin: "https://linkedin.com/company/shopmaster",
        twitter: "https://twitter.com/shopmaster",
        facebook: "https://facebook.com/shopmaster"
      }
    }
  },

  // Example: Healthcare client
  "healthcare-client": {
    brand: {
      name: "HealthCare Pro",
      logo: "🏥",
      favicon: "/favicon-healthcare.ico",
      tagline: "Healthcare Management",
      description: "Streamline your healthcare operations"
    },
    colors: {
      primary: "#10b981",
      secondary: "#059669",
      accent: "#34d399",
      background: "#f0fdf4",
      surface: "#ffffff",
      text: {
        primary: "#1f2937",
        secondary: "#6b7280",
        muted: "#9ca3af"
      },
      success: "#10b981",
      warning: "#f59e0b",
      error: "#ef4444",
      info: "#3b82f6"
    },
    business: {
      name: "HealthCare Pro Solutions",
      industry: "Healthcare",
      contact: {
        email: "info@healthcarepro.com",
        phone: "+1 (555) 456-7890",
        address: "789 Medical Blvd, City, State 67890"
      },
      social: {
        website: "https://healthcarepro.com",
        linkedin: "https://linkedin.com/company/healthcarepro",
        twitter: "https://twitter.com/healthcarepro",
        facebook: "https://facebook.com/healthcarepro"
      }
    }
  },

  // Example: Restaurant client
  "restaurant-client": {
    brand: {
      name: "Restaurant Manager",
      logo: "🍽️",
      favicon: "/favicon-finance.ico",
      tagline: "Restaurant Operations",
      description: "Manage your restaurant efficiently"
    },
    colors: {
      primary: "#ef4444",
      secondary: "#dc2626",
      accent: "#f87171",
      background: "#fef2f2",
      surface: "#ffffff",
      text: {
        primary: "#1f2937",
        secondary: "#6b7280",
        muted: "#9ca3af"
      },
      success: "#10b981",
      warning: "#f59e0b",
      error: "#ef4444",
      info: "#3b82f6"
    },
    business: {
      name: "Restaurant Manager Pro",
      industry: "Food & Beverage",
      contact: {
        email: "hello@restaurantmanager.com",
        phone: "+1 (555) 321-0987",
        address: "321 Food Court, City, State 10987"
      },
      social: {
        website: "https://restaurantmanager.com",
        linkedin: "https://linkedin.com/company/restaurantmanager",
        twitter: "https://twitter.com/restaurantmanager",
        facebook: "https://facebook.com/restaurantmanager"
      }
    }
  },

  // Example: Tech startup client
  "tech-startup": {
    brand: {
      name: "TechFlow",
      logo: "⚡",
      favicon: "/favicon-tech.ico",
      tagline: "Innovation Dashboard",
      description: "Power your tech startup"
    },
    colors: {
      primary: "#3b82f6",
      secondary: "#2563eb",
      accent: "#60a5fa",
      background: "#eff6ff",
      surface: "#ffffff",
      text: {
        primary: "#1f2937",
        secondary: "#6b7280",
        muted: "#9ca3af"
      },
      success: "#10b981",
      warning: "#f59e0b",
      error: "#ef4444",
      info: "#3b82f6"
    }
  },

};

// Function to get configuration for a specific client
export const getClientConfig = (clientId: string): AppConfig => {
  const clientConfig = clientConfigs[clientId] || {};
  return {
    ...defaultConfig,
    ...clientConfig
  };
};

// Function to update configuration
export const updateConfig = (clientId: string, updates: Partial<AppConfig>): void => {
  if (clientConfigs[clientId]) {
    clientConfigs[clientId] = {
      ...clientConfigs[clientId],
      ...updates
    };
  }
};

// Export the current configuration
export const appConfig = defaultConfig;

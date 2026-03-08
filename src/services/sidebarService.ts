import { mockSidebarApi } from '../mockApi/sidebarApi';

export interface SidebarMenuItem {
  id: string;
  title: string;
  icon: string;
  path: string;
  badge?: string | number;
  children?: SidebarMenuItem[];
  permissions?: string[];
  isActive?: boolean;
  order?: number;
}

export interface SidebarConfig {
  menuItems: SidebarMenuItem[];
  userPermissions: string[];
  lastUpdated: string;
}

const DEFAULT_MENU_ITEMS: SidebarMenuItem[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: '📊',
    path: '/dashboard',
    order: 1
  },
  {
    id: 'users',
    title: 'Users',
    icon: '👥',
    path: '/users',
    badge: 5,
    order: 2
  },
  {
    id: 'categories',
    title: 'Categories',
    icon: '📂',
    path: '/categories',
    order: 3
  },
  {
    id: 'blogs',
    title: 'Blogs',
    icon: '📝',
    path: '/blogs',
    order: 4
  },
  {
    id: 'banner-management',
    title: 'Banner Management',
    icon: '🖼️',
    path: '/banner-management',
    order: 5
  },
  {
    id: 'prescriptions',
    title: 'Prescriptions',
    icon: '💊',
    path: '/prescriptions',
    badge: 12,
    order: 6
  },
  {
    id: 'medicine',
    title: 'Medicine',
    icon: '💉',
    path: '/medicine',
    order: 7
  },
  {
    id: 'bank-contact',
    title: 'Bank & Contact',
    icon: '🏦',
    path: '/bank-contact',
    order: 8
  },
  {
    id: 'order-shipping-config',
    title: 'Order & Shipping Config',
    icon: '🚚',
    path: '/order-shipping-config',
    order: 9
  },
  {
    id: 'cart',
    title: 'Cart',
    icon: '🛒',
    path: '/cart',
    order: 10
  },
  {
    id: 'dispense',
    title: 'Dispense',
    icon: '📦',
    path: '/dispense',
    order: 11
  },
  {
    id: 'profile',
    title: 'Profile',
    icon: '👤',
    path: '/profile',
    order: 12
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: '⚙️',
    path: '/settings',
    order: 13
  }
];

class SidebarService {
  private cache: SidebarConfig | null = null;
  private cacheExpiry: number = 5 * 60 * 1000; // 5 minutes
  private lastFetch: number = 0;

  async fetchSidebarConfig(): Promise<SidebarConfig> {
    try {
      if (this.cache && Date.now() - this.lastFetch < this.cacheExpiry) {
        return this.cache;
      }

      // Try mock API first (for development/testing)
      try {
        const data = await mockSidebarApi.getSidebarConfig();

        if (this.validateSidebarConfig(data)) {
          this.cache = {
            menuItems: data.menuItems || [],
            userPermissions: data.userPermissions || [],
            lastUpdated: data.lastUpdated || new Date().toISOString()
          };
          this.lastFetch = Date.now();
          return this.cache;
        }
      } catch (mockError) {
        // Mock API failed, continue to try real API
        console.debug('Mock sidebar API not available, trying real API');
      }

      // Try real API (endpoint doesn't exist yet, so this will fail gracefully)
      // Using apiClient would be better, but for now we'll just skip it
      // and return default config to avoid 404 errors

      // Note: Sidebar config endpoint doesn't exist on backend yet
      // When it's available, uncomment this section:
      /*
      try {
        const { apiClient } = await import('./apiClient');
        const response = await apiClient.get('/sidebar/config');
          
        if (response.success && this.validateSidebarConfig(response.data)) {
            this.cache = {
            menuItems: response.data.menuItems || [],
            userPermissions: response.data.userPermissions || [],
              lastUpdated: new Date().toISOString()
            };
            this.lastFetch = Date.now();
            return this.cache;
          }
      } catch (apiError) {
        // API endpoint doesn't exist - use default config
        console.debug('Sidebar config endpoint not available, using default config');
      }
      */

      // Return default config (endpoint doesn't exist yet)
      const defaultConfig = this.getDefaultConfig();
      this.cache = defaultConfig;
      this.lastFetch = Date.now();
      return defaultConfig;

    } catch (error) {
      console.warn('Error fetching sidebar config, using default:', error);
      return this.getDefaultConfig();
    }
  }

  getDefaultConfig(): SidebarConfig {
    return {
      menuItems: DEFAULT_MENU_ITEMS,
      userPermissions: [],
      lastUpdated: new Date().toISOString()
    };
  }

  private validateSidebarConfig(data: any): boolean {
    if (!data || typeof data !== 'object') return false;

    if (!Array.isArray(data.menuItems)) return false;

    // Validate each menu item
    for (const item of data.menuItems) {
      if (!item.id || !item.title || !item.path) {
        return false;
      }
    }

    return true;
  }

  filterMenuItemsByPermissions(menuItems: SidebarMenuItem[], userPermissions: string[]): SidebarMenuItem[] {
    return menuItems.filter(item => {
      if (!item.permissions || item.permissions.length === 0) {
        return true;
      }

      return item.permissions.some(permission =>
        userPermissions.includes(permission)
      );
    }).map(item => ({
      ...item,
      children: item.children ? this.filterMenuItemsByPermissions(item.children, userPermissions) : undefined
    }));
  }

  sortMenuItems(menuItems: SidebarMenuItem[]): SidebarMenuItem[] {
    return menuItems
      .sort((a, b) => (a.order || 999) - (b.order || 999))
      .map(item => ({
        ...item,
        children: item.children ? this.sortMenuItems(item.children) : undefined
      }));
  }

  async getMenuItems(): Promise<SidebarMenuItem[]> {
    try {
      const config = await this.fetchSidebarConfig();
      let menuItems = config.menuItems;

      if (config.userPermissions.length > 0) {
        menuItems = this.filterMenuItemsByPermissions(menuItems, config.userPermissions);
      }

      menuItems = this.sortMenuItems(menuItems);

      return menuItems;
    } catch (error) {
      return this.getDefaultConfig().menuItems;
    }
  }

  clearCache(): void {
    this.cache = null;
    this.lastFetch = 0;
  }

  async refreshConfig(): Promise<SidebarConfig> {
    this.clearCache();
    return this.fetchSidebarConfig();
  }
}

export const sidebarService = new SidebarService();
export default sidebarService;

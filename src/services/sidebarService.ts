// Sidebar Service - Fetches dynamic menu items from backend
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

// Default fallback menu items
const DEFAULT_MENU_ITEMS: SidebarMenuItem[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: '📊',
    path: '/dashboard',
    order: 1
  },
  {
    id: 'orders',
    title: 'Orders',
    icon: '📦',
    path: '/orders',
    badge: 12,
    order: 2
  },
  {
    id: 'products',
    title: 'Products',
    icon: '🛍️',
    path: '/products',
    order: 3
  },
  {
    id: 'customers',
    title: 'Customers',
    icon: '👥',
    path: '/customers',
    order: 4
  },
  {
    id: 'analytics',
    title: 'Analytics',
    icon: '📈',
    path: '/analytics',
    order: 5
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: '⚙️',
    path: '/settings',
    order: 6
  }
];

class SidebarService {
  private cache: SidebarConfig | null = null;
  private cacheExpiry: number = 5 * 60 * 1000; // 5 minutes
  private lastFetch: number = 0;

  /**
   * Fetch sidebar configuration from backend
   */
  async fetchSidebarConfig(): Promise<SidebarConfig> {
    try {
      // Check if we have valid cached data
      if (this.cache && Date.now() - this.lastFetch < this.cacheExpiry) {
        return this.cache;
      }

      // Try to fetch from backend (using mock API for development)
      try {
        const data = await mockSidebarApi.getSidebarConfig();
        
        // Validate the response structure
        if (this.validateSidebarConfig(data)) {
          this.cache = {
            menuItems: data.menuItems || [],
            userPermissions: data.userPermissions || [],
            lastUpdated: data.lastUpdated || new Date().toISOString()
          };
          this.lastFetch = Date.now();
          return this.cache;
        }
      } catch (apiError) {
        // Fallback to real API if mock fails
        const response = await fetch('/api/sidebar/config', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          
          // Validate the response structure
          if (this.validateSidebarConfig(data)) {
            this.cache = {
              menuItems: data.menuItems || [],
              userPermissions: data.userPermissions || [],
              lastUpdated: new Date().toISOString()
            };
            this.lastFetch = Date.now();
            return this.cache;
          }
        }
      }

      return this.getDefaultConfig();

    } catch (error) {
      return this.getDefaultConfig();
    }
  }

  /**
   * Get default sidebar configuration
   */
  getDefaultConfig(): SidebarConfig {
    return {
      menuItems: DEFAULT_MENU_ITEMS,
      userPermissions: [],
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Validate sidebar configuration from backend
   */
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

  /**
   * Filter menu items based on user permissions
   */
  filterMenuItemsByPermissions(menuItems: SidebarMenuItem[], userPermissions: string[]): SidebarMenuItem[] {
    return menuItems.filter(item => {
      // If no permissions required, show the item
      if (!item.permissions || item.permissions.length === 0) {
        return true;
      }
      
      // Check if user has any of the required permissions
      return item.permissions.some(permission => 
        userPermissions.includes(permission)
      );
    }).map(item => ({
      ...item,
      children: item.children ? this.filterMenuItemsByPermissions(item.children, userPermissions) : undefined
    }));
  }

  /**
   * Sort menu items by order
   */
  sortMenuItems(menuItems: SidebarMenuItem[]): SidebarMenuItem[] {
    return menuItems
      .sort((a, b) => (a.order || 999) - (b.order || 999))
      .map(item => ({
        ...item,
        children: item.children ? this.sortMenuItems(item.children) : undefined
      }));
  }

  /**
   * Get processed sidebar menu items
   */
  async getMenuItems(): Promise<SidebarMenuItem[]> {
    try {
      const config = await this.fetchSidebarConfig();
      let menuItems = config.menuItems;

      // Filter by permissions if user permissions are available
      if (config.userPermissions.length > 0) {
        menuItems = this.filterMenuItemsByPermissions(menuItems, config.userPermissions);
      }

      // Sort by order
      menuItems = this.sortMenuItems(menuItems);

      return menuItems;
    } catch (error) {
      return this.getDefaultConfig().menuItems;
    }
  }

  /**
   * Clear cache (useful for logout or permission changes)
   */
  clearCache(): void {
    this.cache = null;
    this.lastFetch = 0;
  }

  /**
   * Force refresh sidebar config
   */
  async refreshConfig(): Promise<SidebarConfig> {
    this.clearCache();
    return this.fetchSidebarConfig();
  }
}

// Export singleton instance
export const sidebarService = new SidebarService();
export default sidebarService;

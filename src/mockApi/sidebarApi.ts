// Mock Backend API for Sidebar Configuration
// This simulates what your backend would return

import { SidebarConfig, SidebarMenuItem } from '../services/sidebarService';

export interface MockSidebarResponse extends SidebarConfig {
  // Inherits from SidebarConfig, no additional properties needed
}

// Mock data - this would come from your backend
const MOCK_SIDEBAR_DATA: MockSidebarResponse = {
  menuItems: [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: '📊',
      path: '/dashboard',
      order: 1,
      permissions: ['dashboard:read']
    } as SidebarMenuItem,
    {
      id: 'orders',
      title: 'Orders',
      icon: '📦',
      path: '/orders',
      badge: 12,
      order: 2,
      permissions: ['orders:read']
    } as SidebarMenuItem,
    {
      id: 'products',
      title: 'Products',
      icon: '🛍️',
      path: '/products',
      order: 3,
      permissions: ['products:read'],
      children: [
        {
          id: 'products-list',
          title: 'All Products',
          icon: '📋',
          path: '/products/list'
        } as SidebarMenuItem,
        {
          id: 'products-add',
          title: 'Add Product',
          icon: '➕',
          path: '/products/add'
        } as SidebarMenuItem
      ]
    } as SidebarMenuItem,
    {
      id: 'customers',
      title: 'Customers',
      icon: '👥',
      path: '/customers',
      badge: 5,
      order: 4,
      permissions: ['customers:read']
    } as SidebarMenuItem,
    {
      id: 'analytics',
      title: 'Analytics',
      icon: '📈',
      path: '/analytics',
      order: 5,
      permissions: ['analytics:read']
    } as SidebarMenuItem,
    {
      id: 'settings',
      title: 'Settings',
      icon: '⚙️',
      path: '/settings',
      order: 6,
      permissions: ['settings:read']
    } as SidebarMenuItem,
    {
      id: 'reports',
      title: 'Reports',
      icon: '📊',
      path: '/reports',
      badge: 'NEW',
      order: 7,
      permissions: ['reports:read']
    } as SidebarMenuItem
  ],
  userPermissions: [
    'dashboard:read',
    'orders:read',
    'products:read',
    'customers:read',
    'analytics:read',
    'settings:read',
    'reports:read'
  ],
  lastUpdated: new Date().toISOString()
};

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API functions
export const mockSidebarApi = {
  /**
   * Fetch sidebar configuration
   */
  async getSidebarConfig(): Promise<MockSidebarResponse> {
    // Simulate network delay
    await delay(1000 + Math.random() * 1000);
    
    // Simulate occasional failures (10% chance)
    if (Math.random() < 0.1) {
      throw new Error('Network error: Failed to fetch sidebar config');
    }
    
    return MOCK_SIDEBAR_DATA;
  },

  /**
   * Update sidebar configuration (for admin)
   */
  async updateSidebarConfig(config: Partial<MockSidebarResponse>): Promise<{ success: boolean }> {
    await delay(500);
    
    // Simulate occasional failures (5% chance)
    if (Math.random() < 0.05) {
      throw new Error('Server error: Failed to update sidebar config');
    }
    
    console.log('Sidebar config updated:', config);
    return { success: true };
  },

  /**
   * Get user permissions
   */
  async getUserPermissions(): Promise<string[]> {
    await delay(300);
    return MOCK_SIDEBAR_DATA.userPermissions;
  }
};

// Export for use in development
export default mockSidebarApi;

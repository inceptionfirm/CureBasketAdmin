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
      id: 'users',
      title: 'Users',
      icon: '👥',
      path: '/users',
      badge: 5,
      order: 2,
      permissions: ['users:read']
    } as SidebarMenuItem,
    {
      id: 'categories',
      title: 'Categories',
      icon: '📂',
      path: '/categories',
      order: 3,
      permissions: ['categories:read']
    } as SidebarMenuItem,
    {
      id: 'blogs',
      title: 'Blogs',
      icon: '📝',
      path: '/blogs',
      order: 4,
      permissions: ['blogs:read']
    } as SidebarMenuItem,
    {
      id: 'banner-management',
      title: 'Banner Management',
      icon: '🖼️',
      path: '/banner-management',
      order: 5,
      permissions: ['banners:read']
    } as SidebarMenuItem,
    {
      id: 'prescriptions',
      title: 'Prescriptions',
      icon: '💊',
      path: '/prescriptions',
      badge: 12,
      order: 6,
      permissions: ['prescriptions:read']
    } as SidebarMenuItem,
    {
      id: 'medicine',
      title: 'Medicine',
      icon: '💉',
      path: '/medicine',
      order: 7,
      permissions: ['medicine:read']
    } as SidebarMenuItem,
    {
      id: 'profile',
      title: 'Profile',
      icon: '👤',
      path: '/profile',
      order: 8,
      permissions: ['profile:read']
    } as SidebarMenuItem,
    {
      id: 'settings',
      title: 'Settings',
      icon: '⚙️',
      path: '/settings',
      order: 9,
      permissions: ['settings:read']
    } as SidebarMenuItem
  ],
  userPermissions: [
    'dashboard:read',
    'users:read',
    'categories:read',
    'blogs:read',
    'banners:read',
    'prescriptions:read',
    'medicine:read',
    'profile:read',
    'settings:read'
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

// Menu Service for fetching dynamic menu items from backend
import { SideBarItem } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface MenuResponse {
  success: boolean;
  menuItems: SideBarItem[];
  error?: string;
}

class MenuService {
  // Mock data for development/fallback
  private mockMenuItems: SideBarItem[] = [
    {
      title: "Dashboard",
      icon: "🏠",
      key: "dashboard",
      link: "/dashboard",
      isActive: true,
      isVisible: true
    },
    {
      title: "Users",
      icon: "👥",
      key: "users",
      link: "/users",
      isActive: true,
      isVisible: true
    },
    {
      title: "Categories",
      icon: "📁",
      key: "categories",
      link: "/categories",
      isActive: true,
      isVisible: true
    },
    {
      title: "Blogs",
      icon: "📝",
      key: "blogs",
      link: "/blogs",
      isActive: true,
      isVisible: true
    },
    {
      title: "Banner Management",
      icon: "🖼️",
      key: "banner-management",
      link: "/banner-management",
      isActive: true,
      isVisible: true
    },
    {
      title: "Prescriptions",
      icon: "📋",
      key: "prescriptions",
      link: "/prescriptions",
      isActive: true,
      isVisible: true
    },
    {
      title: "Medicine",
      icon: "💊",
      key: "medicine",
      link: "/medicine",
      isActive: false, // This will be true only if medicine category exists
      isVisible: true
    }
  ];

  async getMenuItems(): Promise<MenuResponse> {
    try {
      // First check if medicine category exists
      const medicineExists = await this.checkMedicineCategoryExists();
      
      // Update medicine menu item based on category existence
      const updatedMenuItems = this.mockMenuItems.map(item => {
        if (item.key === 'medicine') {
          return {
            ...item,
            isActive: medicineExists,
            isVisible: medicineExists
          };
        }
        return item;
      });

      // Filter out inactive items
      const activeMenuItems = updatedMenuItems.filter(item => item.isActive && item.isVisible);

      return {
        success: true,
        menuItems: activeMenuItems
      };
    } catch (error) {
      console.error('Error fetching menu items:', error);
      return {
        success: false,
        menuItems: this.mockMenuItems.filter(item => item.key !== 'medicine'), // Exclude medicine if error
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async checkMedicineCategoryExists(): Promise<boolean> {
    try {
      // Simulate API call to check if medicine category exists
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock logic - in real app, this would check your backend
      // For now, we'll randomly return true/false to demonstrate
      const random = Math.random();
      return random > 0.5; // 50% chance medicine category exists
    } catch (error) {
      console.error('Error checking medicine category:', error);
      return false;
    }
  }

  async getAvailableCategories(): Promise<string[]> {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Mock categories - in real app, fetch from backend
      const categories = ['electronics', 'clothing', 'books', 'home', 'sports'];
      
      // Randomly include medicine category
      const random = Math.random();
      if (random > 0.5) {
        categories.push('medicine');
      }
      
      return categories;
    } catch (error) {
      console.error('Error fetching available categories:', error);
      return [];
    }
  }

  async checkCategoryExists(categoryKey: string): Promise<boolean> {
    try {
      const availableCategories = await this.getAvailableCategories();
      return availableCategories.includes(categoryKey);
    } catch (error) {
      console.error('Error checking category existence:', error);
      return false;
    }
  }
}

export default new MenuService();

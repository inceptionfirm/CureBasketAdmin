// Category Service for handling backend API calls
// Using mock data since backend is not available

import { Category } from '../types';

class CategoryService {
  // Fetch all categories with their active status
  async getCategories(): Promise<Category[]> {
    // Use mock data for now since backend is not available
    console.log('Using mock data for categories');
    return this.getMockCategories();
  }

  // Toggle element active status
  async toggleElementStatus(categoryId: number, elementId: number, isActive: boolean): Promise<{ success: boolean }> {
    // Simulate success for development since backend is not available
    console.log('Simulating element toggle for development');
    return { success: true };
  }

  // Mock data for development
  private getMockCategories(): Category[] {
    return [
      {
        id: 1,
        name: 'Electronics',
        description: 'Electronic devices and accessories',
        isActive: true,
        color: '#3b82f6',
        icon: '📱',
        elements: [
          { id: 1, name: 'Smartphones', isActive: true, color: '#3b82f6' },
          { id: 2, name: 'Laptops', isActive: true, color: '#10b981' },
          { id: 3, name: 'Tablets', isActive: false, color: '#f59e0b' }
        ]
      },
      {
        id: 2,
        name: 'Clothing',
        description: 'Fashion and apparel',
        isActive: true,
        color: '#8b5cf6',
        icon: '👕',
        elements: [
          { id: 4, name: 'T-Shirts', isActive: true, color: '#8b5cf6' },
          { id: 5, name: 'Jeans', isActive: true, color: '#ef4444' },
          { id: 6, name: 'Dresses', isActive: true, color: '#06b6d4' }
        ]
      },
      {
        id: 3,
        name: 'Books',
        description: 'Books and educational materials',
        isActive: true,
        color: '#10b981',
        icon: '📚',
        elements: [
          { id: 7, name: 'Fiction', isActive: true, color: '#10b981' },
          { id: 8, name: 'Non-Fiction', isActive: false, color: '#f59e0b' },
          { id: 9, name: 'Textbooks', isActive: true, color: '#3b82f6' }
        ]
      }
    ];
  }
}

export default new CategoryService();
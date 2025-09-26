import { apiClient } from './apiClient';
import { clientConfigManager } from '../config/clientConfig';

export interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
  image?: string;
  icon?: string;
  parentId?: string;
  level: number;
  status: 'active' | 'inactive' | 'draft';
  sortOrder: number;
  metaTitle?: string;
  metaDescription?: string;
  seoKeywords?: string[];
  isFeatured: boolean;
  productCount: number;
  createdAt: string;
  updatedAt: string;
  children?: Category[];
}

export interface CategoryFilters {
  search?: string;
  status?: string;
  level?: number;
  parentId?: string;
  isFeatured?: boolean;
}

export interface CategoryListParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: CategoryFilters;
}

export interface CategoryListResponse {
  categories: Category[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface CategoryStats {
  totalCategories: number;
  activeCategories: number;
  inactiveCategories: number;
  draftCategories: number;
  featuredCategories: number;
  totalProducts: number;
  topCategories: Array<{ category: string; productCount: number }>;
  categoryLevels: Array<{ level: number; count: number }>;
}

class CategoryService {
  private getEndpoint(path: string): string {
    const config = clientConfigManager.getConfig();
    return `${config.api.endpoints.categories}${path}`;
  }

  async getCategories(params: CategoryListParams = {}): Promise<CategoryListResponse> {
    const response = await apiClient.get<CategoryListResponse>(
      this.getEndpoint(''),
      params
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch categories');
    }

    return response.data!;
  }

  async getCategory(id: string): Promise<Category> {
    const response = await apiClient.get<Category>(
      this.getEndpoint(`/${id}`)
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch category');
    }

    return response.data!;
  }

  async createCategory(category: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'productCount'>): Promise<Category> {
    const response = await apiClient.post<Category>(
      this.getEndpoint(''),
      category
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to create category');
    }

    return response.data!;
  }

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    const response = await apiClient.put<Category>(
      this.getEndpoint(`/${id}`),
      updates
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to update category');
    }

    return response.data!;
  }

  async deleteCategory(id: string): Promise<void> {
    const response = await apiClient.delete(
      this.getEndpoint(`/${id}`)
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to delete category');
    }
  }

  async getCategoryStats(): Promise<CategoryStats> {
    const response = await apiClient.get<CategoryStats>(
      this.getEndpoint('/stats')
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch category stats');
    }

    return response.data!;
  }

  async getCategoryTree(): Promise<Category[]> {
    const response = await apiClient.get<Category[]>(
      this.getEndpoint('/tree')
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch category tree');
    }

    return response.data!;
  }

  async getParentCategories(): Promise<Category[]> {
    const response = await apiClient.get<Category[]>(
      this.getEndpoint('/parents')
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch parent categories');
    }

    return response.data!;
  }

  async searchCategories(query: string, limit: number = 10): Promise<Category[]> {
    const response = await apiClient.get<Category[]>(
      this.getEndpoint('/search'),
      { q: query, limit }
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to search categories');
    }

    return response.data!;
  }

  async bulkUpdateCategories(categoryIds: string[], updates: Partial<Category>): Promise<void> {
    const response = await apiClient.put(
      this.getEndpoint('/bulk-update'),
      { categoryIds, updates }
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to bulk update categories');
    }
  }

  async bulkDeleteCategories(categoryIds: string[]): Promise<void> {
    const response = await apiClient.delete(
      this.getEndpoint('/bulk-delete'),
      { categoryIds }
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to bulk delete categories');
    }
  }

  async reorderCategories(categoryIds: string[]): Promise<void> {
    const response = await apiClient.put(
      this.getEndpoint('/reorder'),
      { categoryIds }
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to reorder categories');
    }
  }

  async exportCategories(format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    const response = await apiClient.getBlob(
      this.getEndpoint(`/export?format=${format}`)
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to export categories');
    }

    return response.data!;
  }

  async importCategories(file: File, onProgress?: (progress: number) => void): Promise<{
    success: number;
    failed: number;
    errors: string[];
  }> {
    const response = await apiClient.upload<{
      success: number;
      failed: number;
      errors: string[];
    }>(
      this.getEndpoint('/import'),
      file,
      onProgress
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to import categories');
    }

    return response.data!;
  }

  async duplicateCategory(id: string): Promise<Category> {
    const response = await apiClient.post<Category>(
      this.getEndpoint(`/${id}/duplicate`)
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to duplicate category');
    }

    return response.data!;
  }
}

export const categoryService = new CategoryService();
export default categoryService;
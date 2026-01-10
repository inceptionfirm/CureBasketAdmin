import { apiClient } from './apiClient';
import { clientConfigManager } from '../config/clientConfig';

export interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
  image?: string;
  icon?: string;
  status: 'active' | 'inactive' | 'draft';
  sortOrder: number;
  metaTitle?: string;
  metaDescription?: string;
  seoKeywords?: string[];
  isFeatured: boolean;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryFilters {
  search?: string;
  status?: string;
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

  // Get All Categories
  // GET /catalog/categories?itemType=PRODUCT&search=&status=&page=&pageSize=&sortBy=&sortOrder=
  async getCategories(params: CategoryListParams = {}): Promise<CategoryListResponse> {
    const query: Record<string, any> = {};
    
    // itemType is required (from curl)
    query.itemType = 'PRODUCT';
    
    // Optional query parameters
    // Don't send empty strings - only send defined, non-empty values
    if (params.page !== undefined && params.page !== null && params.page !== '') {
      query.page = params.page;
    }
    if (params.pageSize !== undefined && params.pageSize !== null && params.pageSize !== '') {
      query.pageSize = params.pageSize;
    }
    if (params.sortBy !== undefined && params.sortBy !== null && params.sortBy !== '') {
      query.sortBy = params.sortBy;
    }
    if (params.sortOrder !== undefined && params.sortOrder !== null && params.sortOrder !== '') {
      query.sortOrder = params.sortOrder;
    }

    if (params.filters) {
      if (params.filters.search !== undefined && params.filters.search !== null && params.filters.search !== '') {
        query.search = params.filters.search;
      }
      if (params.filters.status !== undefined && params.filters.status !== null && params.filters.status !== '') {
        query.status = params.filters.status.toUpperCase();
      }
    }
    
    // Remove any empty string values to match curl behavior
    Object.keys(query).forEach(key => {
      if (query[key] === '' || query[key] === null || query[key] === undefined) {
        delete query[key];
      }
    });
    
    console.log('📦 CategoryService - Query params being sent:', query);

    const response = await apiClient.get<Record<string, any>>(
      '/catalog/categories',
      query
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch categories');
    }

    // Response structure: { success: true, data: { pageInfo: {...}, content: [...] } }
    const payload = response.data ?? {} as any;
    
    console.log('📦 CategoryService - Full response.data:', JSON.stringify(payload, null, 2));
    console.log('📦 CategoryService - payload keys:', Object.keys(payload));
    console.log('📦 CategoryService - payload.content:', payload.content);
    console.log('📦 CategoryService - payload.content is array?', Array.isArray(payload.content));
    console.log('📦 CategoryService - payload.pageInfo:', payload.pageInfo);
    
    // Extract content array - response.data.content
    // Response structure: { success: true, data: { pageInfo: {...}, content: [...] } }
    // So response.data = { pageInfo: {...}, content: [...] }
    let content: any[] = [];
    if (payload.content && Array.isArray(payload.content)) {
      content = payload.content;
      console.log('📦 CategoryService - Found payload.content, length:', content.length);
    } else if (payload.data && payload.data.content && Array.isArray(payload.data.content)) {
      content = payload.data.content;
      console.log('📦 CategoryService - Found payload.data.content, length:', content.length);
    } else if (Array.isArray(payload)) {
      content = payload;
      console.log('📦 CategoryService - Found direct array, length:', content.length);
    } else if (payload.data && Array.isArray(payload.data)) {
      content = payload.data;
      console.log('📦 CategoryService - Found payload.data, length:', content.length);
    } else if (payload.categories && Array.isArray(payload.categories)) {
      content = payload.categories;
      console.log('📦 CategoryService - Found payload.categories, length:', content.length);
    } else {
      console.warn('⚠️ CategoryService - No content array found in payload');
      console.warn('⚠️ CategoryService - Payload structure:', JSON.stringify(payload, null, 2));
    }
    
    // Extract pageInfo - response.data.pageInfo
    const pageInfo = payload.pageInfo || (payload.data ? payload.data.pageInfo : undefined);
    console.log('📦 CategoryService - pageInfo:', pageInfo);
    console.log('📦 CategoryService - totalRecords:', pageInfo?.totalRecords, 'content.length:', content.length);
    
    // If content is empty but totalRecords > 0, log warning
    if (content.length === 0 && pageInfo?.totalRecords > 0) {
      console.warn('⚠️ CategoryService - Content array is empty but totalRecords > 0. This might be a pagination issue.');
      console.warn('⚠️ CategoryService - Requested page:', query.page, 'pageInfo.pageNumber:', pageInfo?.pageNumber);
    }

    // Map API response to Category format
    // API fields: id, categoryName, categoryDescription, itemType, state
    const categories: Category[] = content.map((item: Record<string, any>, index: number) => {
      // Status mapping: ACTIVE -> active, INACTIVE -> inactive
      const rawStatus = (item.state ?? item.status ?? 'ACTIVE').toString().toUpperCase();
      const status: Category['status'] =
        rawStatus === 'INACTIVE'
          ? 'inactive'
          : rawStatus === 'DRAFT'
            ? 'draft'
            : 'active';

      // Name: categoryName from API
      const name = item.categoryName ?? item.name ?? `Category ${index + 1}`;
      const slugSource = item.slug ?? name;

      return {
        id: String(item.id ?? item.categoryId ?? item.businessCategoryId ?? `${Date.now()}-${index}`),
        name,
        description: item.categoryDescription ?? item.description ?? '',
        slug: slugSource
          .toString()
          .trim()
          .toLowerCase()
          .replace(/\s+/g, '-'),
        image: item.image ?? item.imageUrl ?? '',
        icon: item.icon ?? undefined,
        status,
        sortOrder: Number(item.sortOrder ?? item.order ?? 0),
        metaTitle: item.metaTitle,
        metaDescription: item.metaDescription,
        seoKeywords: item.seoKeywords,
        isFeatured: Boolean(item.isFeatured ?? false),
        productCount: Number(item.productCount ?? item.totalProducts ?? 0),
        createdAt: item.createdAt ?? '',
        updatedAt: item.updatedAt ?? '',
      };
    });

    const pagination = {
      page: (pageInfo?.pageNumber ?? 0) + 1,
      pageSize: pageInfo?.pageSize ?? categories.length,
      total: pageInfo?.totalRecords ?? categories.length,
      totalPages: pageInfo?.totalPages ?? 1,
    };

    console.log('📦 CategoryService - Final result:', {
      categoriesCount: categories.length,
      pagination,
      firstCategory: categories[0]
    });

    return {
      categories,
      pagination,
    };
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

  // Create Category
  // POST /catalog/add-category
  async createCategory(category: {
    name: string;
    description?: string;
    itemType?: string;
    status?: string;
  }): Promise<{ message: string }> {
    const payload = {
      categoryName: category.name,
      categoryDescription: category.description || '',
      itemType: category.itemType || 'PRODUCT',
      state: category.status || 'ACTIVE',
    };

    const response = await apiClient.post<{ message?: string }>(
      '/catalog/add-category',
      payload
    );

    if (!response.success) {
      throw new Error(response.error || response.message || 'Failed to create category');
    }

    const responseData = response.data || {};
    return {
      message:
        response.message ||
        (typeof responseData === 'object' && responseData && 'message' in responseData
          ? (responseData as Record<string, any>).message
          : 'Category created successfully'),
    };
  }

  // Update Category
  // POST /catalog/update-category/{id}
  // Request body: Only the fields to update (single or multiple)
  async updateCategory(id: string, updates: Partial<Category> & { itemType?: string; status?: string }): Promise<{ message: string }> {
    // Ensure ID is valid
    const categoryId = Number(id);
    if (isNaN(categoryId) || categoryId <= 0) {
      throw new Error(`Invalid category ID: ${id}`);
    }

    // Build update payload - only include fields that are being updated
    const payload: Record<string, any> = {};
    
    // Category name
    if (updates.name !== undefined && updates.name !== null && updates.name !== '') {
      payload.categoryName = updates.name;
    }
    
    // Category description - can be empty string
    if ('description' in updates) {
      payload.categoryDescription = updates.description || '';
    }
    
    // Item type - only if provided
    if (updates.itemType !== undefined && updates.itemType !== null) {
      payload.itemType = updates.itemType;
    }
    
    // State/Status - map to ACTIVE/INACTIVE
    if (updates.status !== undefined && updates.status !== null) {
      const statusUpper = updates.status.toUpperCase();
      if (statusUpper === 'DRAFT') {
        payload.state = 'INACTIVE';
      } else if (statusUpper === 'ACTIVE' || statusUpper === 'INACTIVE') {
        payload.state = statusUpper;
      }
    }

    if (Object.keys(payload).length === 0) {
      throw new Error('No fields to update');
    }

    const response = await apiClient.post<{ message?: string }>(
      `/catalog/update-category/${categoryId}`,
      payload
    );

    if (!response.success) {
      throw new Error(response.error || response.message || 'Failed to update category');
    }

    const responseData = response.data || {};
    return {
      message:
        response.message ||
        (typeof responseData === 'object' && responseData && 'message' in responseData
          ? (responseData as Record<string, any>).message
          : 'Category updated successfully'),
    };
  }

  // Delete Category
  // POST /catalog/delete-category/{id}
  async deleteCategory(id: string): Promise<{ message: string }> {
    // Ensure ID is valid
    const categoryId = Number(id);
    if (isNaN(categoryId) || categoryId <= 0) {
      throw new Error(`Invalid category ID: ${id}`);
    }

    const response = await apiClient.post<{ message?: string }>(
      `/catalog/delete-category/${categoryId}`
    );

    if (!response.success) {
      throw new Error(response.error || response.message || 'Failed to delete category');
    }

    const responseData = response.data || {};
    return {
      message:
        response.message ||
        (typeof responseData === 'object' && responseData && 'message' in responseData
          ? (responseData as Record<string, any>).message
          : 'Category deleted successfully'),
    };
  }

  async getCategoryStats(): Promise<CategoryStats> {
    const defaultStats: CategoryStats = {
      totalCategories: 0,
      activeCategories: 0,
      inactiveCategories: 0,
      draftCategories: 0,
      featuredCategories: 0,
      totalProducts: 0,
      topCategories: [],
      categoryLevels: [],
    };

    const response = await apiClient.get<Record<string, any>>(
      '/catalog/categories/analytics',
      { itemType: 'PRODUCT' }
    );

    if (!response.success) {
      const isNotFound =
        typeof response.error === 'string' &&
        response.error.toLowerCase().includes('404');

      if (isNotFound) {
        return defaultStats;
      }

      throw new Error(response.error || 'Failed to fetch category stats');
    }

    const data = response.data ?? {};
    return {
      totalCategories: Number(data.totalCategories ?? data.total ?? 0),
      activeCategories: Number(data.activeCategories ?? data.active ?? 0),
      inactiveCategories: Number(data.inactiveCategories ?? data.inactive ?? 0),
      draftCategories: Number(data.draftCategories ?? data.draft ?? 0),
      featuredCategories: Number(data.featuredCategories ?? data.featured ?? 0),
      totalProducts: Number(data.totalProducts ?? 0),
      topCategories: Array.isArray(data.topCategories) ? data.topCategories : [],
      categoryLevels: Array.isArray(data.categoryLevels) ? data.categoryLevels : [],
    };
  }

  async getCategoryTree(): Promise<Category[]> {
    throw new Error('Category tree is not supported');
  }

  async getParentCategories(): Promise<Category[]> {
    throw new Error('Parent categories are not supported');
  }

  async searchCategories(query: string, limit: number = 10): Promise<Category[]> {
    const response = await apiClient.get<Record<string, any>>(
      '/catalog/categories',
      {
        itemType: 'PRODUCT',
        search: query,
        pageSize: limit,
      }
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to search categories');
    }

    const payload = response.data ?? {};
    const content =
      (Array.isArray(payload.content) && payload.content) ||
      (payload.data && Array.isArray(payload.data.content) && payload.data.content) ||
      [];

    return content.map((item: Record<string, any>, index: number) => ({
      id: String(item.id ?? `${Date.now()}-${index}`),
      name: item.categoryName ?? item.name ?? `Category ${index + 1}`,
      description: item.categoryDescription ?? item.description ?? '',
      slug: (item.slug ?? item.categoryName ?? `category-${index + 1}`)
        .toString()
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-'),
      image: item.image ?? item.imageUrl ?? '',
      icon: item.icon ?? undefined,
      status: ((item.state ?? item.status ?? 'ACTIVE').toString().toLowerCase() === 'inactive'
        ? 'inactive'
        : (item.state ?? item.status ?? 'ACTIVE').toString().toLowerCase() === 'draft'
          ? 'draft'
          : 'active'),
      sortOrder: Number(item.sortOrder ?? 0),
      metaTitle: item.metaTitle,
      metaDescription: item.metaDescription,
      seoKeywords: item.seoKeywords,
      isFeatured: Boolean(item.isFeatured ?? false),
      productCount: Number(item.productCount ?? item.totalProducts ?? 0),
      createdAt: item.createdAt ?? '',
      updatedAt: item.updatedAt ?? '',
    }));
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
    const response = await apiClient.deleteWithBody(
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
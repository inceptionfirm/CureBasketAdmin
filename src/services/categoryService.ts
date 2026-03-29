import { apiClient } from './apiClient';
import { clientConfigManager } from '../config/clientConfig';
import { fileUploadService } from './fileUploadService';

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

      // Extract image from files array (similar to Banner/Blog)
      let imageUrl = '';
      console.log(`📦 Category ${index + 1} (${item.categoryName || item.name}):`, {
        hasFiles: !!(item.files && Array.isArray(item.files)),
        filesLength: item.files?.length || 0,
        files: item.files,
        directImage: item.image,
        imageUrl: item.imageUrl
      });
      
      if (item.files && Array.isArray(item.files) && item.files.length > 0) {
        // Try to find the first file with docPath
        const fileWithPath = item.files.find((f: any) => f?.docPath);
        if (fileWithPath?.docPath) {
          const docPath = fileWithPath.docPath;
          console.log(`📦 Found docPath for category ${index + 1}:`, docPath);
          
          // Normalize image URL - add base URL if relative
          if (docPath.startsWith('http://') || docPath.startsWith('https://')) {
            imageUrl = docPath;
          } else {
            // Base URL for images (without /backend)
            const imageBaseURL = 'https://api.curebasket.com';
            imageUrl = docPath.startsWith('/')
              ? `${imageBaseURL}${docPath}`
              : `${imageBaseURL}/${docPath}`;
          }
          console.log(`📦 Normalized image URL for category ${index + 1}:`, imageUrl);
        }
      }
      
      // Fallback to direct image fields if files array is empty
      if (!imageUrl || imageUrl.trim() === '') {
        imageUrl = item.image ?? item.imageUrl ?? '';
        if (imageUrl) {
          console.log(`📦 Using direct image field for category ${index + 1}:`, imageUrl);
        }
      }
      
      if (!imageUrl || imageUrl.trim() === '') {
        console.log(`⚠️ No image found for category ${index + 1} (${item.categoryName || item.name})`);
      }

      return {
        id: String(item.id ?? item.categoryId ?? item.businessCategoryId ?? `${Date.now()}-${index}`),
        name,
        description: item.categoryDescription ?? item.description ?? '',
        slug: slugSource
          .toString()
          .trim()
          .toLowerCase()
          .replace(/\s+/g, '-'),
        image: imageUrl,
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
    // Use the correct endpoint: GET /catalog/categories/{categoryId}
    const categoryId = Number(id);
    if (isNaN(categoryId) || categoryId <= 0) {
      throw new Error(`Invalid category ID: ${id}`);
    }

    const response = await apiClient.get<Category>(
      `/catalog/categories/${categoryId}`
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch category');
    }

    // Map API response to Category format
    const apiCategory = response.data as any;
    if (!apiCategory) {
      throw new Error('Category data not found in response');
    }

    // Map API fields to Category interface
    const rawStatus = (apiCategory.state ?? apiCategory.status ?? 'ACTIVE').toString().toUpperCase();
    const status: Category['status'] =
      rawStatus === 'INACTIVE'
        ? 'inactive'
        : rawStatus === 'DRAFT'
          ? 'draft'
          : 'active';

    // Extract image from files array
    let imageUrl = '';
    if (apiCategory.files && Array.isArray(apiCategory.files) && apiCategory.files.length > 0) {
      const fileWithPath = apiCategory.files.find((f: any) => f?.docPath);
      if (fileWithPath?.docPath) {
        const docPath = fileWithPath.docPath;
        if (docPath.startsWith('http://') || docPath.startsWith('https://')) {
          imageUrl = docPath;
        } else {
          const imageBaseURL = 'https://api.curebasket.com';
          imageUrl = docPath.startsWith('/')
            ? `${imageBaseURL}${docPath}`
            : `${imageBaseURL}/${docPath}`;
        }
      }
    }

    return {
      id: String(apiCategory.id ?? id),
      name: apiCategory.categoryName ?? apiCategory.name ?? '',
      description: apiCategory.categoryDescription ?? apiCategory.description ?? '',
      slug: (apiCategory.slug ?? apiCategory.categoryName ?? apiCategory.name ?? '')
        .toString()
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-'),
      image: imageUrl,
      icon: apiCategory.icon ?? undefined,
      status,
      sortOrder: Number(apiCategory.sortOrder ?? 0),
      metaTitle: apiCategory.metaTitle,
      metaDescription: apiCategory.metaDescription,
      seoKeywords: apiCategory.seoKeywords,
      isFeatured: Boolean(apiCategory.isFeatured ?? false),
      productCount: Number(apiCategory.productCount ?? 0),
      createdAt: apiCategory.createdAt ?? '',
      updatedAt: apiCategory.updatedAt ?? '',
    };
  }

  // Create Category
  // POST /catalog/add-category
  async createCategory(category: {
    name: string;
    description?: string;
    itemType?: string;
    status?: string;
  }): Promise<Category> {
    const payload = {
      categoryName: category.name,
      categoryDescription: category.description || '',
      itemType: category.itemType || 'PRODUCT',
      state: category.status || 'ACTIVE',
      forCategory: true, // Add forCategory flag to the payload
    };

    const response = await apiClient.post<Category | { id?: number; categoryId?: number; message?: string }>(
      '/catalog/add-category',
      payload
    );

    if (!response.success) {
      throw new Error(response.error || response.message || 'Failed to create category');
    }

    const responseData = response.data || {};

    // Extract ID from response
    const categoryId = (responseData as any).id || (responseData as any).categoryId || (responseData as any).businessCategoryId;

    if (!categoryId) {
      // If no ID in response, reload categories to get the latest one
      // This is a fallback - ideally the API should return the created category
      console.warn('⚠️ Category ID not found in response, will need to reload categories');
      throw new Error('Category created but ID not returned. Please refresh the page.');
    }

    // Return category object with ID
    return {
      id: String(categoryId),
      name: category.name,
      description: category.description || '',
      slug: category.name.toLowerCase().replace(/\s+/g, '-'),
      status: (category.status || 'ACTIVE').toLowerCase() as 'active' | 'inactive' | 'draft',
      sortOrder: 0,
      isFeatured: false,
      productCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  // Update Category
  // POST /catalog/update-category/{id}
  // Request body: Only the fields to update (single or multiple)
  async updateCategory(id: string, updates: Partial<Category> & { itemType?: string; status?: string }): Promise<Category> {
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

    // Add forCategory flag to the payload
    payload.forCategory = true;

    const response = await apiClient.post<{ message?: string; data?: any }>(
      `/catalog/update-category/${categoryId}`,
      payload
    );

    if (!response.success) {
      throw new Error(response.error || response.message || 'Failed to update category');
    }

    const responseData = response.data || {};

    // Try to get updated category from response, otherwise construct it from updates
    if (responseData && typeof responseData === 'object' && 'id' in responseData) {
      // Response contains the updated category
      const apiCategory = responseData as any;
      const rawStatus = (apiCategory.state ?? apiCategory.status ?? 'ACTIVE').toString().toUpperCase();
      const status: Category['status'] =
        rawStatus === 'INACTIVE'
          ? 'inactive'
          : rawStatus === 'DRAFT'
            ? 'draft'
            : 'active';

      // Extract image from files array
      let imageUrl = '';
      if (apiCategory.files && Array.isArray(apiCategory.files) && apiCategory.files.length > 0) {
        const fileWithPath = apiCategory.files.find((f: any) => f?.docPath);
        if (fileWithPath?.docPath) {
          const docPath = fileWithPath.docPath;
          if (docPath.startsWith('http://') || docPath.startsWith('https://')) {
            imageUrl = docPath;
          } else {
            const imageBaseURL = 'https://api.curebasket.com';
            imageUrl = docPath.startsWith('/')
              ? `${imageBaseURL}${docPath}`
              : `${imageBaseURL}/${docPath}`;
          }
        }
      }

      return {
        id: String(apiCategory.id ?? id),
        name: apiCategory.categoryName ?? apiCategory.name ?? updates.name ?? '',
        description: apiCategory.categoryDescription ?? apiCategory.description ?? updates.description ?? '',
        slug: (apiCategory.slug ?? apiCategory.categoryName ?? apiCategory.name ?? updates.name ?? '')
          .toString()
          .trim()
          .toLowerCase()
          .replace(/\s+/g, '-'),
        image: imageUrl,
        icon: apiCategory.icon ?? undefined,
        status,
        sortOrder: Number(apiCategory.sortOrder ?? 0),
        metaTitle: apiCategory.metaTitle,
        metaDescription: apiCategory.metaDescription,
        seoKeywords: apiCategory.seoKeywords,
        isFeatured: Boolean(apiCategory.isFeatured ?? false),
        productCount: Number(apiCategory.productCount ?? 0),
        createdAt: apiCategory.createdAt ?? '',
        updatedAt: apiCategory.updatedAt ?? new Date().toISOString(),
      };
    }

    // If response doesn't contain category data, construct it from updates
    // This is a fallback - ideally the API should return the updated category
    console.warn('⚠️ Update response does not contain category data, constructing from updates');
    
    // Try to fetch the category, but if it fails, return a constructed category
    try {
      const updatedCategory = await this.getCategory(id);
      return updatedCategory;
    } catch (fetchError) {
      console.warn('⚠️ Failed to fetch updated category, returning constructed category:', fetchError);
      // Construct category from updates (fallback)
      const rawStatus = (updates.status || 'ACTIVE').toString().toUpperCase();
      const status: Category['status'] =
        rawStatus === 'INACTIVE'
          ? 'inactive'
          : rawStatus === 'DRAFT'
            ? 'draft'
            : 'active';

      return {
        id: String(id),
        name: updates.name || '',
        description: updates.description || '',
        slug: (updates.name || '')
          .toString()
          .trim()
          .toLowerCase()
          .replace(/\s+/g, '-'),
        image: updates.image || '',
        icon: updates.icon,
        status,
        sortOrder: updates.sortOrder ?? 0,
        metaTitle: updates.metaTitle,
        metaDescription: updates.metaDescription,
        seoKeywords: updates.seoKeywords,
        isFeatured: updates.isFeatured ?? false,
        productCount: updates.productCount ?? 0,
        createdAt: updates.createdAt || '',
        updatedAt: new Date().toISOString(),
      };
    }
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

  // Upload Category Files
  /**
   * Upload image files for a category
   * Uses the common catalog upload endpoint: /catalog/upload/file/{categoryId}
   * 
   * @param categoryId - Category ID
   * @param files - Array of image files to upload
   * @param docTypes - Optional document types (e.g., ['thumbnail', 'icon', 'CoverPagePic'])
   * @returns Promise with upload response
   * 
   * @example
   * await categoryService.uploadFiles(12, [file1, file2], ['thumbnail', 'icon']);
   */
  async uploadFiles(
    categoryId: number,
    files: File[],
    docTypes?: string[]
  ): Promise<{ success: boolean; message?: string; data?: any }> {
    try {
      console.log('📦 Uploading category files:', {
        categoryId,
        fileCount: files.length,
        docTypes
      });

      // The backend endpoint /catalog/upload/file/{itemId} checks for a catalog item first
      // Categories are NOT catalog items, so it returns "Catalog Item not found"
      // 
      // Try using fileUploadService which uses 'isCategory' flag instead of 'forCategory'
      // This might be the correct parameter name the backend expects

      // Use fileUploadService.uploadFiles with isCategory: true
      // Note: Backend doesn't accept 'CATEGORY' as itemType, so we use 'BANNER' as a workaround
      // The isCategory flag tells the backend this is for a category, not a banner
      const { fileUploadService } = await import('./fileUploadService');

      const uploadResponse = await fileUploadService.uploadFiles({
        itemId: categoryId,
        itemType: 'BANNER', // Workaround: Backend doesn't accept 'CATEGORY', so use 'BANNER' with isCategory flag
        files,
        docTypes: docTypes || ['IMAGE'],
        isCategory: true // Use isCategory flag - this tells backend it's for a category, not a banner
      });

      console.log('📦 Upload response:', uploadResponse);

      if (!uploadResponse.success) {
        console.error('❌ Category file upload failed:', uploadResponse.message);
        throw new Error(uploadResponse.message || 'Failed to upload category files');
      }

      return {
        success: true,
        message: uploadResponse.message || 'Category files uploaded successfully',
        data: uploadResponse.data || {},
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload category files';
      console.error('❌ Error uploading category files:', error);
      throw new Error(errorMessage);
    }
  }

  // Delete Category File
  /**
   * Delete a file associated with a category
   * Uses the common catalog delete endpoint: /catalog/delete/file?fileId={fileId}
   * 
   * @param fileId - File ID to delete
   * @returns Promise with delete response
   * 
   * @example
   * await categoryService.deleteFile(123);
   */
  async deleteFile(fileId: number): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fileUploadService.deleteFile(fileId);
      return {
        success: response.success,
        message: response.message,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete category file';
      console.error('❌ Error deleting category file:', error);
      throw new Error(errorMessage);
    }
  }
}

export const categoryService = new CategoryService();
export default categoryService;
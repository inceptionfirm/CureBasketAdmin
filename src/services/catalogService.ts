import { apiClient } from './apiClient';

// Catalog API Types
export interface CatalogMainAttribute {
  id?: number;
  name: string;
  scale: string;
  value: string;
  subAttributes?: CatalogSubAttribute[];
}

export interface CatalogSubAttribute {
  id?: number;
  name: string;
  value: string;
}

export interface CatalogItem {
  id: number;
  categoryId?: number;
  itemName: string;
  itemHeading?: string;
  itemDescription?: string;
  itemPrice?: number;
  itemUnits?: number;
  active?: boolean;
  mainAttributes?: CatalogMainAttribute[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: number;
  categoryName: string;
  categoryDescription?: string;
  itemType?: 'PRODUCT' | 'SERVICE' | 'BLOG' | 'BANNER';
  state?: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryListParams {
  itemType?: 'PRODUCT' | 'SERVICE' | 'BLOG' | 'BANNER';
  status?: 'ACTIVE' | 'INACTIVE';
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
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

class CatalogService {
  private baseEndpoint = '/catalog';

  // 16. Create Catalog Item
  async createCatalogItem(itemType: 'PRODUCT' | 'SERVICE', itemData: {
    id?: number;
    categoryId?: number;
    itemName: string;
    itemHeading?: string;
    itemDescription?: string;
    itemPrice?: number;
    itemUnits?: number;
    active?: boolean;
    mainAttributes?: CatalogMainAttribute[];
  }): Promise<{ success: boolean; message?: string; data?: CatalogItem }> {
    console.log('📦 Creating catalog item:', `${this.baseEndpoint}/add-item/${itemType}`);
    const response = await apiClient.post<CatalogItem>(`${this.baseEndpoint}/add-item/${itemType}`, itemData);
    console.log('📦 Create catalog item response:', response);

    if (!response.success) {
      console.error('❌ Failed to create catalog item:', response.error, response.message);
      throw new Error(response.error || response.message || 'Failed to create catalog item');
    }

    return {
      success: true,
      message: response.message || 'Catalog item created successfully',
      data: response.data as CatalogItem,
    };
  }

  // 17. Add Main Attributes to Catalog Item
  async addMainAttributes(itemId: number, attributes: CatalogMainAttribute[]): Promise<{ success: boolean; message?: string }> {
    console.log('📦 Adding main attributes:', `${this.baseEndpoint}/add/main-attr/${itemId}`);
    const response = await apiClient.post(`${this.baseEndpoint}/add/main-attr/${itemId}`, attributes);
    console.log('📦 Add main attributes response:', response);

    if (!response.success) {
      console.error('❌ Failed to add main attributes:', response.error, response.message);
      throw new Error(response.error || response.message || 'Failed to add main attributes');
    }

    return {
      success: true,
      message: response.message || 'Main attributes added successfully',
    };
  }

  // 18. Add Sub Attributes
  async addSubAttributes(itemId: number, mainAttrId: number, attributes: CatalogSubAttribute[]): Promise<{ success: boolean; message?: string }> {
    console.log('📦 Adding sub attributes:', `${this.baseEndpoint}/add/sub-attr/${itemId}/${mainAttrId}`);
    const response = await apiClient.post(`${this.baseEndpoint}/add/sub-attr/${itemId}/${mainAttrId}`, attributes);
    console.log('📦 Add sub attributes response:', response);

    if (!response.success) {
      console.error('❌ Failed to add sub attributes:', response.error, response.message);
      throw new Error(response.error || response.message || 'Failed to add sub attributes');
    }

    return {
      success: true,
      message: response.message || 'Sub attributes added successfully',
    };
  }

  // 19. Update Bulk Attributes
  async updateBulkAttributes(itemId: number, attributes: CatalogMainAttribute[]): Promise<{ success: boolean; message?: string }> {
    console.log('📦 Updating bulk attributes:', `${this.baseEndpoint}/update/bulk-attr/${itemId}`);
    const response = await apiClient.post(`${this.baseEndpoint}/update/bulk-attr/${itemId}`, attributes);
    console.log('📦 Update bulk attributes response:', response);

    if (!response.success) {
      console.error('❌ Failed to update bulk attributes:', response.error, response.message);
      throw new Error(response.error || response.message || 'Failed to update bulk attributes');
    }

    return {
      success: true,
      message: response.message || 'Bulk attributes updated successfully',
    };
  }

  // 20. Update Main Attribute
  async updateMainAttribute(attribute: CatalogMainAttribute): Promise<{ success: boolean; message?: string }> {
    console.log('📦 Updating main attribute:', `${this.baseEndpoint}/update/main-attr`);
    const response = await apiClient.post(`${this.baseEndpoint}/update/main-attr`, attribute);
    console.log('📦 Update main attribute response:', response);

    if (!response.success) {
      console.error('❌ Failed to update main attribute:', response.error, response.message);
      throw new Error(response.error || response.message || 'Failed to update main attribute');
    }

    return {
      success: true,
      message: response.message || 'Main attribute updated successfully',
    };
  }

  // 21. Update Sub Attribute
  async updateSubAttribute(attribute: CatalogSubAttribute): Promise<{ success: boolean; message?: string }> {
    console.log('📦 Updating sub attribute:', `${this.baseEndpoint}/update/sub-attr`);
    const response = await apiClient.post(`${this.baseEndpoint}/update/sub-attr`, attribute);
    console.log('📦 Update sub attribute response:', response);

    if (!response.success) {
      console.error('❌ Failed to update sub attribute:', response.error, response.message);
      throw new Error(response.error || response.message || 'Failed to update sub attribute');
    }

    return {
      success: true,
      message: response.message || 'Sub attribute updated successfully',
    };
  }

  // 22. Delete Main Attribute (Cascade)
  async deleteMainAttribute(mainAttrId: number): Promise<{ success: boolean; message?: string }> {
    console.log('📦 Deleting main attribute:', `${this.baseEndpoint}/delete/main-attr/${mainAttrId}`);
    const response = await apiClient.post(`${this.baseEndpoint}/delete/main-attr/${mainAttrId}`);
    console.log('📦 Delete main attribute response:', response);

    if (!response.success) {
      console.error('❌ Failed to delete main attribute:', response.error, response.message);
      throw new Error(response.error || response.message || 'Failed to delete main attribute');
    }

    return {
      success: true,
      message: response.message || 'Main attribute deleted successfully',
    };
  }

  // 23. Delete Sub Attribute
  async deleteSubAttribute(subAttrId: number): Promise<{ success: boolean; message?: string }> {
    console.log('📦 Deleting sub attribute:', `${this.baseEndpoint}/delete/sub-attr/${subAttrId}`);
    const response = await apiClient.post(`${this.baseEndpoint}/delete/sub-attr/${subAttrId}`);
    console.log('📦 Delete sub attribute response:', response);

    if (!response.success) {
      console.error('❌ Failed to delete sub attribute:', response.error, response.message);
      throw new Error(response.error || response.message || 'Failed to delete sub attribute');
    }

    return {
      success: true,
      message: response.message || 'Sub attribute deleted successfully',
    };
  }

  // 24. Refresh Catalog Item Cache
  async refreshCatalogItemCache(itemId: number): Promise<{ success: boolean; message?: string }> {
    console.log('📦 Refreshing catalog item cache:', `${this.baseEndpoint}/refresh/${itemId}`);
    const response = await apiClient.post(`${this.baseEndpoint}/refresh/${itemId}`);
    console.log('📦 Refresh cache response:', response);

    if (!response.success) {
      console.error('❌ Failed to refresh cache:', response.error, response.message);
      throw new Error(response.error || response.message || 'Failed to refresh cache');
    }

    return {
      success: true,
      message: response.message || 'Cache refreshed successfully',
    };
  }

  // 25. Upload Files (Note: This requires FormData, not JSON)
  async uploadFiles(
    itemId: number,
    files: File[],
    itemType: 'PRODUCT' | 'SERVICE',
    documentTypes: ('IMAGE' | 'THUMBNAIL' | 'DOCUMENT')[],
    forCategory: boolean = false
  ): Promise<{ success: boolean; message?: string }> {
    console.log('📦 Uploading files:', `${this.baseEndpoint}/uplaod/file/${itemId}`);
    
    const formData = new FormData();
    files.forEach(file => {
      formData.append('file', file);
    });
    formData.append('itemType', itemType);
    documentTypes.forEach(type => {
      formData.append('documentType', type);
    });
    formData.append('forCategory', forCategory.toString());

    // Note: apiClient.post should handle FormData automatically
    const response = await apiClient.post(`${this.baseEndpoint}/uplaod/file/${itemId}`, formData);
    console.log('📦 Upload files response:', response);

    if (!response.success) {
      console.error('❌ Failed to upload files:', response.error, response.message);
      throw new Error(response.error || response.message || 'Failed to upload files');
    }

    return {
      success: true,
      message: response.message || 'Files uploaded successfully',
    };
  }

  // 26. Delete File
  async deleteFile(fileId: number): Promise<{ success: boolean; message?: string }> {
    const endpoint = `${this.baseEndpoint}/delete/file?fileId=${fileId}`;
    console.log('📦 Deleting file:', endpoint);
    const response = await apiClient.post(endpoint);
    console.log('📦 Delete file response:', response);

    if (!response.success) {
      console.error('❌ Failed to delete file:', response.error, response.message);
      throw new Error(response.error || response.message || 'Failed to delete file');
    }

    return {
      success: true,
      message: response.message || 'File deleted successfully',
    };
  }

  // 27. Delete All Files by Catalog Item
  async deleteAllItemFiles(itemId: number): Promise<{ success: boolean; message?: string }> {
    console.log('📦 Deleting all item files:', `${this.baseEndpoint}/delete/item/files/${itemId}`);
    const response = await apiClient.post(`${this.baseEndpoint}/delete/item/files/${itemId}`);
    console.log('📦 Delete all item files response:', response);

    if (!response.success) {
      console.error('❌ Failed to delete all item files:', response.error, response.message);
      throw new Error(response.error || response.message || 'Failed to delete all item files');
    }

    return {
      success: true,
      message: response.message || 'All item files deleted successfully',
    };
  }

  // 28. Disable Catalog Item
  async disableCatalogItem(itemId: number): Promise<{ success: boolean; message?: string }> {
    console.log('📦 Disabling catalog item:', `${this.baseEndpoint}/disable/item/${itemId}`);
    const response = await apiClient.post(`${this.baseEndpoint}/disable/item/${itemId}`);
    console.log('📦 Disable catalog item response:', response);

    if (!response.success) {
      console.error('❌ Failed to disable catalog item:', response.error, response.message);
      throw new Error(response.error || response.message || 'Failed to disable catalog item');
    }

    return {
      success: true,
      message: response.message || 'Catalog item disabled successfully',
    };
  }

  // 29. Enable Catalog Item
  async enableCatalogItem(itemId: number): Promise<{ success: boolean; message?: string }> {
    console.log('📦 Enabling catalog item:', `${this.baseEndpoint}/enable/item/${itemId}`);
    const response = await apiClient.post(`${this.baseEndpoint}/enable/item/${itemId}`);
    console.log('📦 Enable catalog item response:', response);

    if (!response.success) {
      console.error('❌ Failed to enable catalog item:', response.error, response.message);
      throw new Error(response.error || response.message || 'Failed to enable catalog item');
    }

    return {
      success: true,
      message: response.message || 'Catalog item enabled successfully',
    };
  }

  // 30. Disable Category
  async disableCategory(categoryId: number): Promise<{ success: boolean; message?: string }> {
    console.log('📦 Disabling category:', `${this.baseEndpoint}/disable/category/${categoryId}`);
    const response = await apiClient.post(`${this.baseEndpoint}/disable/category/${categoryId}`);
    console.log('📦 Disable category response:', response);

    if (!response.success) {
      console.error('❌ Failed to disable category:', response.error, response.message);
      throw new Error(response.error || response.message || 'Failed to disable category');
    }

    return {
      success: true,
      message: response.message || 'Category disabled successfully',
    };
  }

  // 31. Enable Category
  async enableCategory(categoryId: number): Promise<{ success: boolean; message?: string }> {
    console.log('📦 Enabling category:', `${this.baseEndpoint}/enable/category/${categoryId}`);
    const response = await apiClient.post(`${this.baseEndpoint}/enable/category/${categoryId}`);
    console.log('📦 Enable category response:', response);

    if (!response.success) {
      console.error('❌ Failed to enable category:', response.error, response.message);
      throw new Error(response.error || response.message || 'Failed to enable category');
    }

    return {
      success: true,
      message: response.message || 'Category enabled successfully',
    };
  }

  // 32. Filter Catalog Items
  async filterCatalogItems(
    itemType: 'PRODUCT' | 'SERVICE',
    filters: {
      categoryId?: number;
      status?: boolean;
    }
  ): Promise<CatalogItem[]> {
    const queryParams: Record<string, any> = {};
    if (filters.categoryId !== undefined) queryParams.categoryId = filters.categoryId;
    if (filters.status !== undefined) queryParams.status = filters.status;

    console.log('📦 Filtering catalog items:', `${this.baseEndpoint}/filter/${itemType}`, 'with params:', queryParams);
    const response = await apiClient.get<CatalogItem[]>(`${this.baseEndpoint}/filter/${itemType}`, queryParams);
    console.log('📦 Filter catalog items response:', response);

    if (!response.success) {
      console.error('❌ Failed to filter catalog items:', response.error);
      throw new Error(response.error || 'Failed to filter catalog items');
    }

    const data = response.data;
    if (Array.isArray(data)) {
      return data;
    }
    if (data && typeof data === 'object' && 'data' in data) {
      return Array.isArray((data as any).data) ? (data as any).data : [];
    }
    return [];
  }

  // 33. Get All Categories
  async getAllCategories(params: CategoryListParams = {}): Promise<CategoryListResponse> {
    const queryParams: Record<string, any> = {};
    
    if (params.itemType) queryParams.itemType = params.itemType;
    if (params.status) queryParams.status = params.status;
    if (params.page !== undefined) queryParams.page = params.page;
    if (params.pageSize !== undefined) queryParams.pageSize = params.pageSize;
    if (params.sortBy) queryParams.sortBy = params.sortBy;
    if (params.sortOrder) queryParams.sortOrder = params.sortOrder;

    console.log('📦 Fetching all categories:', `${this.baseEndpoint}/categories`, 'with params:', queryParams);
    const response = await apiClient.get<{
      content?: Category[];
      data?: Category[];
      pageInfo?: {
        pageNumber: number;
        pageSize: number;
        totalRecords: number;
        totalPages: number;
      };
    }>(`${this.baseEndpoint}/categories`, queryParams);
    console.log('📦 Get all categories response:', response);

    if (!response.success) {
      console.error('❌ Failed to fetch categories:', response.error);
      throw new Error(response.error || 'Failed to fetch categories');
    }

    const data = response.data ?? {};
    const content = data.content ?? data.data ?? [];
    const pageInfo = data.pageInfo;

    return {
      categories: Array.isArray(content) ? content : [],
      pagination: {
        page: (pageInfo?.pageNumber ?? params.page ?? 0) + 1,
        pageSize: pageInfo?.pageSize ?? params.pageSize ?? 10,
        total: pageInfo?.totalRecords ?? content.length,
        totalPages: pageInfo?.totalPages ?? 1,
      },
    };
  }

  // 34. Create Category
  async createCategory(categoryData: {
    id?: number;
    categoryName: string;
    categoryDescription?: string;
    itemType: 'PRODUCT' | 'SERVICE' | 'BLOG' | 'BANNER';
    state: 'ACTIVE' | 'INACTIVE';
  }): Promise<{ success: boolean; message?: string; data?: Category }> {
    console.log('📦 Creating category:', `${this.baseEndpoint}/add-category`);
    const response = await apiClient.post<Category>(`${this.baseEndpoint}/add-category`, categoryData);
    console.log('📦 Create category response:', response);

    if (!response.success) {
      console.error('❌ Failed to create category:', response.error, response.message);
      throw new Error(response.error || response.message || 'Failed to create category');
    }

    return {
      success: true,
      message: response.message || 'Category created successfully',
      data: response.data as Category,
    };
  }

  // 35. Update Category
  async updateCategory(categoryId: number, updates: Partial<Category>): Promise<{ success: boolean; message?: string; data?: Category }> {
    console.log('📦 Updating category:', `${this.baseEndpoint}/update-category/${categoryId}`);
    const response = await apiClient.post<Category>(`${this.baseEndpoint}/update-category/${categoryId}`, updates);
    console.log('📦 Update category response:', response);

    if (!response.success) {
      console.error('❌ Failed to update category:', response.error, response.message);
      throw new Error(response.error || response.message || 'Failed to update category');
    }

    return {
      success: true,
      message: response.message || 'Category updated successfully',
      data: response.data as Category,
    };
  }

  // 36. Delete Category
  async deleteCategory(categoryId: number): Promise<{ success: boolean; message?: string }> {
    console.log('📦 Deleting category:', `${this.baseEndpoint}/delete-category/${categoryId}`);
    const response = await apiClient.post(`${this.baseEndpoint}/delete-category/${categoryId}`);
    console.log('📦 Delete category response:', response);

    if (!response.success) {
      console.error('❌ Failed to delete category:', response.error, response.message);
      throw new Error(response.error || response.message || 'Failed to delete category');
    }

    return {
      success: true,
      message: response.message || 'Category deleted successfully',
    };
  }

  // 37. Delete All Files for Category
  async deleteAllCategoryFiles(categoryId: number): Promise<{ success: boolean; message?: string }> {
    console.log('📦 Deleting all category files:', `${this.baseEndpoint}/delete/category/files/${categoryId}`);
    const response = await apiClient.post(`${this.baseEndpoint}/delete/category/files/${categoryId}`);
    console.log('📦 Delete all category files response:', response);

    if (!response.success) {
      console.error('❌ Failed to delete all category files:', response.error, response.message);
      throw new Error(response.error || response.message || 'Failed to delete all category files');
    }

    return {
      success: true,
      message: response.message || 'All category files deleted successfully',
    };
  }
}

export const catalogService = new CatalogService();
export default catalogService;


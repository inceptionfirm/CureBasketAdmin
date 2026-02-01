import { apiClient } from './apiClient';
import { fileUploadService } from './fileUploadService';

// Blog API Types based on actual backend structure
export interface BlogMainAttribute {
  id?: number;
  name: string;
  scale?: string;
  value: string;
  subAttributes?: BlogSubAttribute[];
}

export interface BlogSubAttribute {
  id?: number;
  name: string;
  value: string;
}

export interface Blog {
  id: number;
  categoryId?: number;
  itemName: string;
  itemHeading: string;
  itemDescription?: string;
  author?: string;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  tags?: string[];
  publishDate?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'; // Backend requires this field
  active: boolean;
  mainAttributes?: BlogMainAttribute[];
  createdAt?: string;
  updatedAt?: string;
}

export interface BlogListParams {
  itemType?: 'BLOG';
  status?: 'ACTIVE' | 'INACTIVE';
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface BlogListResponse {
  blogs: Blog[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

class BlogService {
  private baseEndpoint = '/blog';

  // 6. Create New Blog
  // POST /blog/add-blog
  // New structure: { itemType, position, type, title, description, status, priority }
  async createBlog(blogData: {
    itemType?: 'BLOG';
    position?: string;
    type?: string;
    title?: string;
    description?: string;
    status?: string;
    priority?: number | string;
    // Legacy fields for backward compatibility
    category?: string;
    categoryId?: number;
    content?: string;
    excerpt?: string;
    seoTitle?: string;
    seoDescription?: string;
    itemName?: string;
    itemHeading?: string;
    itemDescription?: string;
    author?: string;
    tags?: string[];
    publishDate?: string;
    active?: boolean;
    mainAttributes?: BlogMainAttribute[];
  }): Promise<{ success: boolean; message?: string; data?: Blog }> {
    // Build payload with new structure
    const payload: any = {
      itemType: blogData.itemType || 'BLOG',
      position: blogData.position || '',
      type: blogData.type || '',
      title: blogData.title || blogData.itemName || blogData.itemHeading || '',
      description: blogData.description || blogData.content || blogData.itemDescription || '',
      status: blogData.status || (blogData.active ? 'ACTIVE' : 'DRAFT'),
      priority: blogData.priority !== undefined ? blogData.priority : 0,
    };
    
    // Remove only null/undefined values, but keep empty strings for optional fields
    // Required fields: itemType, status, title - always keep these
    Object.keys(payload).forEach(key => {
      // Always keep required fields
      if (key === 'itemType' || key === 'status' || key === 'title') {
        return;
      }
      // Remove null/undefined, but keep empty strings for optional fields
      if (payload[key] === null || payload[key] === undefined) {
        delete payload[key];
      }
    });
    
    const endpoint = `${this.baseEndpoint}/add-blog`;
    console.log('📝 Create blog endpoint:', endpoint);
    console.log('📝 Create blog payload (raw):', payload);
    console.log('📝 Create blog payload (stringified):', JSON.stringify(payload, null, 2));
    console.log('📝 Payload keys:', Object.keys(payload));
    console.log('📝 Payload values:', Object.values(payload));
    
    const response = await apiClient.post<Blog>(endpoint, payload);
    console.log('📝 Create blog response:', response);
    
    if (!response.success) {
      console.error('❌ Blog creation failed:', {
        error: response.error,
        message: response.message,
        data: response.data,
        fullResponse: response
      });
    }

    if (!response.success) {
      console.error('❌ Failed to create blog:', {
        error: response.error,
        message: response.message,
        data: response.data,
        fullResponse: response
      });
      
      // Extract more detailed error message from various possible locations
      let errorDetails = 'Failed to create blog';
      
      if (response.data) {
        if (typeof response.data === 'string') {
          errorDetails = response.data;
        } else if (response.data.message) {
          errorDetails = response.data.message;
        } else if (response.data.error) {
          errorDetails = response.data.error;
        } else if (response.data.msg) {
          errorDetails = response.data.msg;
        } else if (response.data.errorMessage) {
          errorDetails = response.data.errorMessage;
        }
      }
      
      if (response.error) {
        errorDetails = response.error;
      } else if (response.message) {
        errorDetails = response.message;
      }
      
      // Create error object with full details
      const error = new Error(errorDetails);
      (error as any).response = response;
      (error as any).data = response.data;
      throw error;
    }

    return {
      success: true,
      message: response.message || 'Blog created successfully',
      data: response.data as Blog,
    };
  }

  // 7. Update Blog
  // POST /blog/update-blog/{id}
  // Payload: Only fields to update (single or multiple)
  async updateBlog(id: number, updates: {
    itemType?: 'BLOG';
    category?: string;
    status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    title?: string;
    content?: string;
    excerpt?: string;
    seoTitle?: string;
    seoDescription?: string;
    // Legacy fields for backward compatibility
    [key: string]: any;
  }): Promise<{ success: boolean; message?: string; data?: Blog }> {
    // Build update payload - only include fields that are being updated
    const updatePayload: any = {};
    
    // Map legacy fields to new structure if needed
    if (updates.itemType !== undefined) updatePayload.itemType = updates.itemType;
    if (updates.category !== undefined) updatePayload.category = updates.category;
    if (updates.status !== undefined) updatePayload.status = updates.status;
    if (updates.title !== undefined) updatePayload.title = updates.title;
    if (updates.content !== undefined) updatePayload.content = updates.content;
    if (updates.excerpt !== undefined) updatePayload.excerpt = updates.excerpt;
    if (updates.seoTitle !== undefined) updatePayload.seoTitle = updates.seoTitle;
    if (updates.seoDescription !== undefined) updatePayload.seoDescription = updates.seoDescription;
    
    // Handle legacy field mappings
    if (updates.itemName !== undefined && !updatePayload.title) {
      updatePayload.title = updates.itemName;
    }
    if (updates.itemDescription !== undefined && !updatePayload.content) {
      updatePayload.content = updates.itemDescription;
    }
    if (updates.categoryId !== undefined && !updatePayload.category) {
      updatePayload.category = updates.categoryId.toString();
    }
    
    // Remove id from payload (it's in the URL)
    delete updatePayload.id;
    
    // Remove null/undefined/empty values
    Object.keys(updatePayload).forEach(key => {
      if (updatePayload[key] === null || updatePayload[key] === undefined || updatePayload[key] === '') {
        delete updatePayload[key];
      }
    });

    const endpoint = `${this.baseEndpoint}/update-blog/${id}`;
    console.log('📝 Update blog endpoint:', endpoint);
    console.log('📝 Update blog payload:', JSON.stringify(updatePayload, null, 2));
    
    const response = await apiClient.post<Blog>(endpoint, updatePayload);
    console.log('📝 Update blog response:', response);

    if (!response.success) {
      // Extract detailed error message
      let errorMessage = 'Failed to update blog';
      
      if (response.error) {
        errorMessage = response.error;
      } else if (response.data) {
        if (typeof response.data === 'string') {
          errorMessage = response.data;
        } else if (response.data.message) {
          errorMessage = response.data.message;
        } else if (response.data.error) {
          errorMessage = response.data.error;
        } else if (response.data.msg) {
          errorMessage = response.data.msg;
  }
      }
      
      console.error('❌ Failed to update blog:', {
        error: response.error,
        message: response.message,
        data: response.data,
        errorMessage
      });
      
      throw new Error(errorMessage);
    }

    return {
      success: true,
      message: response.message || 'Blog updated successfully',
      data: response.data as Blog,
    };
  }

  // 8. Get Blog by ID
  // POST /blog/get-blog/{id}
  async getBlogById(id: number): Promise<Blog> {
    const endpoint = `${this.baseEndpoint}/get-blog/${id}`;
    console.log('📝 Get blog by ID endpoint:', endpoint);
    const response = await apiClient.post<Blog>(endpoint);
    console.log('📝 Get blog response:', response);

    if (!response.success) {
      console.error('❌ Failed to fetch blog:', response.error);
      throw new Error(response.error || 'Failed to fetch blog');
    }

    return response.data as Blog;
  }

  // 9. Get All Blogs (with Filters)
  // Note: Endpoint might be /blog/get-all (without userType) or might need POST method
  // User didn't provide curl for this endpoint, trying /blog/get-all first
  async getAllBlogs(userType: string = 'ADMIN', params: BlogListParams = {}): Promise<BlogListResponse> {
    const queryParams: Record<string, any> = {};
    
    if (params.itemType) queryParams.itemType = params.itemType;
    
    // Backend requires status/type parameter - error says "Invalid 'Type': null"
    // Always include status if provided, and also try 'type' parameter
    if (params.status && params.status !== null && params.status !== undefined) {
      // Ensure status is uppercase and valid
      const statusUpper = String(params.status).toUpperCase();
      if (statusUpper === 'DRAFT' || statusUpper === 'PUBLISHED' || statusUpper === 'ARCHIVED') {
        queryParams.status = statusUpper;
        // Also try 'type' parameter in case backend expects that name
        queryParams.type = statusUpper;
      }
    }
    
    // Also check if 'type' is provided separately
    if (params.type && params.type !== null && params.type !== undefined) {
      const typeUpper = String(params.type).toUpperCase();
      if (typeUpper === 'DRAFT' || typeUpper === 'PUBLISHED' || typeUpper === 'ARCHIVED') {
        queryParams.type = typeUpper;
        // If status wasn't set, also set it
        if (!queryParams.status) {
          queryParams.status = typeUpper;
  }
      }
    }
    
    console.log('📝 BlogService queryParams before sending:', queryParams);
    
    if (params.priority) queryParams.priority = params.priority;
    if (params.page !== undefined) queryParams.page = params.page;
    if (params.pageSize !== undefined) queryParams.pageSize = params.pageSize;
    if (params.sortBy) queryParams.sortBy = params.sortBy;
    if (params.sortOrder) queryParams.sortOrder = params.sortOrder;
    
    // Remove any null/undefined values to prevent sending them as query params
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] === null || queryParams[key] === undefined) {
        delete queryParams[key];
      }
    });

    // Use /blog/get-all without userType in path (userType can be added as query param if needed)
    const endpoint = `${this.baseEndpoint}/get-all`;
    console.log('📝 Fetching all blogs:', endpoint, 'with params:', queryParams);
    console.log('📝 Full URL will be:', endpoint);
    
    // Try GET first, if it fails with 404, try POST method (like get-blog-by-id uses POST)
    let response;
    try {
      response = await apiClient.get<{
        content?: Blog[];
        data?: Blog[];
        pageInfo?: {
          pageNumber: number;
          pageSize: number;
          totalRecords: number;
          totalPages: number;
        };
      }>(endpoint, queryParams);
      
      // If GET fails, try POST (some endpoints use POST instead of GET)
      if (!response.success) {
        console.log('📝 GET failed, trying POST method...');
        response = await apiClient.post<{
          content?: Blog[];
          data?: Blog[];
          pageInfo?: {
            pageNumber: number;
            pageSize: number;
            totalRecords: number;
            totalPages: number;
          };
        }>(endpoint, queryParams);
      }
    } catch (getError: any) {
      // If GET throws an error, try POST method
      console.log('📝 GET failed with error, trying POST method...', getError);
      try {
        response = await apiClient.post<{
          content?: Blog[];
          data?: Blog[];
          pageInfo?: {
            pageNumber: number;
            pageSize: number;
            totalRecords: number;
            totalPages: number;
          };
        }>(endpoint, queryParams);
      } catch (postError) {
        throw getError; // Re-throw original error if POST also fails
      }
    }
    console.log('📝 Get all blogs response:', response);
    console.log('📝 Get all blogs response.data:', response.data);

    if (!response.success) {
      // Extract detailed error message
      let errorMessage = 'Failed to fetch blogs';
      
      if (response.error) {
        errorMessage = response.error;
      } else if (response.data) {
        if (typeof response.data === 'string') {
          errorMessage = response.data;
        } else if (response.data.message) {
          errorMessage = response.data.message;
        } else if (response.data.error) {
          errorMessage = response.data.error;
        } else if (response.data.msg) {
          errorMessage = response.data.msg;
  }
      }
      
      console.error('❌ Failed to fetch blogs:', {
        error: response.error,
        message: response.message,
        data: response.data,
        errorMessage
      });
      
      throw new Error(errorMessage);
    }

    const data = response.data ?? {};
    
    // Handle different response structures
    // Backend might return: { content: [...] } or { data: [...] } or just an array
    let content: Blog[] = [];
    
    if (Array.isArray(data)) {
      content = data;
    } else if (Array.isArray(data.content)) {
      content = data.content;
    } else if (Array.isArray(data.data)) {
      content = data.data;
    } else if (Array.isArray(data.blogs)) {
      content = data.blogs;
    }
    
    const pageInfo = data.pageInfo || data.pagination;

    return {
      blogs: Array.isArray(content) ? content : [],
      pagination: {
        page: (pageInfo?.pageNumber ?? pageInfo?.page ?? params.page ?? 0) + 1,
        pageSize: pageInfo?.pageSize ?? pageInfo?.size ?? params.pageSize ?? 10,
        total: pageInfo?.totalRecords ?? pageInfo?.total ?? content.length,
        totalPages: pageInfo?.totalPages ?? Math.ceil((pageInfo?.totalRecords ?? content.length) / (pageInfo?.pageSize ?? params.pageSize ?? 10)),
      },
    };
  }

  // 10. Delete Blog
  async deleteBlog(id: number): Promise<{ success: boolean; message?: string }> {
    console.log('📝 Deleting blog:', `${this.baseEndpoint}/delete/${id}`);
    const response = await apiClient.post(`${this.baseEndpoint}/delete/${id}`);
    console.log('📝 Delete blog response:', response);

    if (!response.success) {
      console.error('❌ Failed to delete blog:', response.error, response.message);
      throw new Error(response.error || response.message || 'Failed to delete blog');
    }

    return {
      success: true,
      message: response.message || 'Blog deleted successfully',
    };
  }

  // 6. Upload Blog Files
  /**
   * Upload image files for a blog
   * Uses the common catalog upload endpoint: /catalog/upload/file/{blogId}
   * 
   * @param blogId - Blog ID
   * @param files - Array of image files to upload
   * @param docTypes - Optional document types (e.g., ['thumbnail', 'featuredImage', 'CoverPagePic'])
   * @returns Promise with upload response
   * 
   * @example
   * await blogService.uploadFiles(45, [file1, file2], ['thumbnail', 'featuredImage']);
   */
  async uploadFiles(
    blogId: number,
    files: File[],
    docTypes?: string[]
  ): Promise<{ success: boolean; message?: string; data?: any }> {
    try {
      const response = await fileUploadService.uploadBlogFiles(blogId, files, docTypes);
      return {
        success: response.success,
        message: response.message,
        data: response.data,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload blog files';
      console.error('❌ Error uploading blog files:', error);
      throw new Error(errorMessage);
    }
  }

  // 7. Delete Blog File
  /**
   * Delete a file associated with a blog
   * Uses the common catalog delete endpoint: /catalog/delete/file?fileId={fileId}
   * 
   * @param fileId - File ID to delete
   * @returns Promise with delete response
   * 
   * @example
   * await blogService.deleteFile(123);
   */
  async deleteFile(fileId: number): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fileUploadService.deleteFile(fileId);
      return {
        success: response.success,
        message: response.message,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete blog file';
      console.error('❌ Error deleting blog file:', error);
      throw new Error(errorMessage);
    }
  }
}

export const blogService = new BlogService();
export default blogService;

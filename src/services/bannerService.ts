import { apiClient } from './apiClient';
import { fileUploadService } from './fileUploadService';

// Banner API Types based on actual backend structure
export interface BannerMainAttribute {
  id?: number;
  name: string;
  scale: string;
  value: string;
  subAttributes?: BannerSubAttribute[];
}

export interface BannerSubAttribute {
  id?: number;
  name: string;
  value: string;
}

export interface Banner {
  id: number;
  categoryId?: number;
  itemName: string;
  itemHeading: string;
  itemDescription?: string;
  position: 'TOP' | 'MIDDLE' | 'BOTTOM' | 'SIDEBAR' | 'POPUP';
  type: 'PROMOTIONAL' | 'ANNOUNCEMENT' | 'ADVERTISEMENT' | 'NOTIFICATION';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  startDate?: string;
  endDate?: string;
  active: boolean;
  mainAttributes?: BannerMainAttribute[];
  createdAt?: string;
  updatedAt?: string;
}

export interface BannerListParams {
  itemType?: 'BANNER';
  status?: 'ACTIVE' | 'INACTIVE';
  position?: 'TOP' | 'MIDDLE' | 'BOTTOM' | 'SIDEBAR' | 'POPUP';
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface BannerListResponse {
  banners: Banner[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

class BannerService {
  private baseEndpoint = '/banner';

  // 1. Create New Banner
  async createBanner(bannerData: {
    itemType?: 'BANNER';
    position?: string;
    type?: string;
    title?: string;
    description?: string;
    status?: string;
    priority?: number | string;
    // Legacy fields for backward compatibility
    id?: number;
    categoryId?: number;
    itemName?: string;
    itemHeading?: string;
    itemDescription?: string;
    active?: boolean;
    startDate?: string;
    endDate?: string;
    mainAttributes?: BannerMainAttribute[];
  }): Promise<{ success: boolean; message?: string; data?: Banner }> {
    // Build payload with ONLY the 7 allowed fields (exactly matching backend API)
    // Backend only accepts: itemType, position, type, title, description, status, priority
    // DO NOT send any other fields (no createdAt, updatedAt, id, etc.)
    const finalPayload: Record<string, any> = {};

    // itemType - always required
    finalPayload.itemType = bannerData.itemType || 'BANNER';

    // position - only if provided and not empty
    const position = bannerData.position;
    if (position && position.trim() !== '') {
      finalPayload.position = position;
    }

    // type - only if provided and not empty
    const type = bannerData.type;
    if (type && type.trim() !== '') {
      finalPayload.type = type;
    }

    // title - map from various sources, only if not empty
    const title = bannerData.title || bannerData.itemName || bannerData.itemHeading;
    if (title && title.trim() !== '') {
      finalPayload.title = title;
    }

    // description - map from various sources, only if not empty
    const description = bannerData.description || bannerData.itemDescription;
    if (description && description.trim() !== '') {
      finalPayload.description = description;
    }

    // status - map from status or active field
    const status = bannerData.status || (bannerData.active !== undefined ? (bannerData.active ? 'ACTIVE' : 'INACTIVE') : '');
    if (status && status.trim() !== '') {
      finalPayload.status = status;
    }

    // priority - always include (can be 0)
    finalPayload.priority = bannerData.priority !== undefined ? Number(bannerData.priority) : 0;

    // Final safety check - create a completely clean object with ONLY the 7 allowed fields
    const cleanPayload: Record<string, any> = {};
    const allowedFields = ['itemType', 'position', 'type', 'title', 'description', 'status', 'priority'];
    allowedFields.forEach(field => {
      if (finalPayload[field] !== undefined) {
        cleanPayload[field] = finalPayload[field];
      }
    });

    console.log('📢 Creating banner:', `${this.baseEndpoint}/add-banner`);
    console.log('📢 Final payload (only allowed fields):', JSON.stringify(cleanPayload, null, 2));
    console.log('📢 Payload keys:', Object.keys(cleanPayload));
    const response = await apiClient.post<Banner>(`${this.baseEndpoint}/add-banner`, cleanPayload);
    console.log('📢 Create banner response:', response);

    if (!response.success) {
      console.error('❌ Failed to create banner:', response.error, response.message);
      throw new Error(response.error || response.message || 'Failed to create banner');
    }

    return {
      success: true,
      message: response.message || 'Banner created successfully',
      data: response.data as Banner,
    };
  }

  // 2. Update Banner
  async updateBanner(id: number, updates: {
    itemType?: 'BANNER';
    position?: string;
    type?: string;
    title?: string;
    description?: string;
    status?: string;
    priority?: number | string;
    // Legacy fields for backward compatibility
    itemName?: string;
    itemHeading?: string;
    itemDescription?: string;
    active?: boolean;
  }): Promise<{ success: boolean; message?: string; data?: Banner }> {
    // Build payload with ONLY the 7 allowed fields (exactly matching backend API)
    // Backend only accepts: itemType, position, type, title, description, status, priority
    // DO NOT send any other fields (no createdAt, updatedAt, id, etc.)
    const finalPayload: Record<string, any> = {};

    // Only include fields that are explicitly provided in updates
    // itemType
    if (updates.itemType !== undefined) {
      finalPayload.itemType = updates.itemType;
    }

    // position - only if provided and not empty
    if (updates.position !== undefined && updates.position.trim() !== '') {
      finalPayload.position = updates.position;
    }

    // type - only if provided and not empty
    if (updates.type !== undefined && updates.type.trim() !== '') {
      finalPayload.type = updates.type;
    }

    // title - map from various sources, only if not empty
    const title = updates.title || updates.itemName || updates.itemHeading;
    if (title !== undefined && title.trim() !== '') {
      finalPayload.title = title;
    }

    // description - map from various sources, only if not empty
    const description = updates.description || updates.itemDescription;
    if (description !== undefined && description.trim() !== '') {
      finalPayload.description = description;
    }

    // status - map from status or active field
    const status = updates.status || (updates.active !== undefined ? (updates.active ? 'ACTIVE' : 'INACTIVE') : undefined);
    if (status !== undefined && status.trim() !== '') {
      finalPayload.status = status;
    }

    // priority - only if provided
    if (updates.priority !== undefined) {
      finalPayload.priority = Number(updates.priority);
    }

    // Final safety check - create a completely clean object with ONLY the 7 allowed fields
    const cleanPayload: Record<string, any> = {};
    const allowedFields = ['itemType', 'position', 'type', 'title', 'description', 'status', 'priority'];
    allowedFields.forEach(field => {
      if (finalPayload[field] !== undefined) {
        cleanPayload[field] = finalPayload[field];
      }
    });

    // Validate payload - remove empty strings for non-description fields and ensure types are correct
    const validatedPayload: Record<string, any> = {};
    Object.entries(cleanPayload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'description') {
          // Description can be empty string
          validatedPayload[key] = value;
        } else if (key === 'priority') {
          // Priority must be a number (0 or positive)
          const numValue = Number(value);
          if (!isNaN(numValue)) {
            validatedPayload[key] = numValue;
          }
        } else if (key === 'status') {
          // Status must be ACTIVE or INACTIVE (uppercase)
          validatedPayload[key] = String(value).toUpperCase();
        } else if (typeof value === 'string' && value.trim() === '') {
          // Skip empty strings for other string fields
          console.log(`⚠️ Skipping empty string for field: ${key}`);
        } else {
          validatedPayload[key] = value;
        }
      }
    });

    // Ensure itemType is always present for updates
    if (!validatedPayload.itemType) {
      validatedPayload.itemType = 'BANNER';
    }

    // Ensure at least one field is being updated (not just itemType)
    const fieldsToUpdate = Object.keys(validatedPayload).filter(k => k !== 'itemType');
    if (fieldsToUpdate.length === 0) {
      throw new Error('No fields to update. Please provide at least one field to update.');
    }

    console.log('📢 Updating banner:', `${this.baseEndpoint}/update-banner/${id}`);
    console.log('📢 Final payload (validated):', JSON.stringify(validatedPayload, null, 2));
    console.log('📢 Payload keys:', Object.keys(validatedPayload));

    const response = await apiClient.post<Banner>(`${this.baseEndpoint}/update-banner/${id}`, validatedPayload);
    console.log('📢 Update banner response:', response);

    if (!response.success) {
      const errorDetails = {
        error: response.error,
        message: response.message,
        status: response.error?.includes('500') ? '500 Internal Server Error' : 'Unknown',
        payload: validatedPayload,
        responseData: response.data
      };
      console.error('❌ Failed to update banner:', errorDetails);
      throw new Error(response.error || response.message || 'Failed to update banner');
    }

    return {
      success: true,
      message: response.message || 'Banner updated successfully',
      data: response.data as Banner,
    };
  }

  // 3. Get Banner by ID
  async getBannerById(id: number): Promise<Banner> {
    console.log('📢 Fetching banner by ID:', `${this.baseEndpoint}/get-banner/${id}`);
    const response = await apiClient.post<Banner>(`${this.baseEndpoint}/get-banner/${id}`);
    console.log('📢 Get banner response:', response);

    if (!response.success) {
      console.error('❌ Failed to fetch banner:', response.error);
      throw new Error(response.error || 'Failed to fetch banner');
    }

    return response.data as Banner;
  }

  // 4. Get All Banners (with Filters)
  async getAllBanners(params: BannerListParams = {}): Promise<BannerListResponse> {
    const queryParams: Record<string, any> = {};

    if (params.itemType) queryParams.itemType = params.itemType;

    // Only include status if provided (don't send null/undefined)
    if (params.status && params.status !== null && params.status !== undefined) {
      queryParams.status = params.status;
    }

    if (params.position) queryParams.position = params.position;
    if (params.page !== undefined) queryParams.page = params.page;
    if (params.pageSize !== undefined) queryParams.pageSize = params.pageSize;

    // Backend only allows these sortBy values: ID, ItemType, Position, Type, Title, Description, Status, Priority
    // Don't send sortBy if it's not in the allowed list (like 'createdAt')
    const allowedSortFields = ['ID', 'ItemType', 'Position', 'Type', 'Title', 'Description', 'Status', 'Priority'];
    if (params.sortBy && allowedSortFields.includes(params.sortBy)) {
      queryParams.sortBy = params.sortBy;
    }

    if (params.sortOrder) queryParams.sortOrder = params.sortOrder;

    // Remove any null/undefined values
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] === null || queryParams[key] === undefined) {
        delete queryParams[key];
      }
    });

    console.log('📢 Fetching all banners:', `${this.baseEndpoint}/get-all`, 'with params:', queryParams);
    const response = await apiClient.get<{
      content?: Banner[];
      data?: Banner[];
      banners?: Banner[];
      pageInfo?: {
        pageNumber: number;
        pageSize: number;
        totalRecords: number;
        totalPages: number;
      };
    }>(`${this.baseEndpoint}/get-all`, queryParams);
    console.log('📢 Get all banners response:', response);
    console.log('📢 Get all banners response.data:', response.data);

    // Log the raw API response to see image structure
    if (response.data && response.success) {
      const data = response.data as any;
      const bannersList = data.content || data.data || data.banners || data;
      if (Array.isArray(bannersList) && bannersList.length > 0) {
        console.log('🖼️  Sample banner from API (for image debugging):', JSON.stringify(bannersList[0], null, 2));
        console.log('🖼️  Image fields in banner:', {
          image: bannersList[0].image,
          imageUrl: bannersList[0].imageUrl,
          fileUrl: bannersList[0].fileUrl,
          files: bannersList[0].files,
          mainAttributes: bannersList[0].mainAttributes
        });
      }
    }

    if (!response.success) {
      // Extract detailed error message
      let errorMessage = 'Failed to fetch banners';

      if (response.error) {
        errorMessage = response.error;
      } else if (response.data) {
        const data = response.data as any;
        if (typeof data === 'string') {
          errorMessage = data;
        } else if (data.message) {
          errorMessage = data.message;
        } else if (data.error) {
          errorMessage = data.error;
        } else if (data.msg) {
          errorMessage = data.msg;
        }
      }

      console.error('❌ Failed to fetch banners:', {
        error: response.error,
        message: response.message,
        data: response.data,
        errorMessage
      });

      throw new Error(errorMessage);
    }

    const data = response.data ?? {} as any;

    // Handle different response structures
    let content: Banner[] = [];

    if (Array.isArray(data)) {
      content = data;
    } else if (Array.isArray(data.content)) {
      content = data.content;
    } else if (Array.isArray(data.data)) {
      content = data.data;
    } else if (Array.isArray(data.banners)) {
      content = data.banners;
    }

    // Log the actual structure we're getting for debugging images
    if (content.length > 0) {
      console.log('📦 Response structure analysis:', {
        isArray: Array.isArray(data),
        hasContent: !!(data as any).content,
        hasData: !!(data as any).data,
        hasBanners: !!(data as any).banners,
        contentLength: content.length,
        firstBannerKeys: Object.keys(content[0]),
        firstBanner: {
          id: (content[0] as any).id || (content[0] as any).ID,
          title: (content[0] as any).title || (content[0] as any).itemName || (content[0] as any).itemHeading,
          files: (content[0] as any).files,
          filesType: typeof (content[0] as any).files,
          image: (content[0] as any).image,
          imageUrl: (content[0] as any).imageUrl,
          fileUrl: (content[0] as any).fileUrl,
          mainAttributes: (content[0] as any).mainAttributes
        }
      });
    }

    const pageInfo = data.pageInfo || data.pagination;

    const bannersArray = Array.isArray(content) ? content : [];
    const pageInfoData = pageInfo || {};

    return {
      banners: bannersArray,
      pagination: {
        page: (pageInfoData?.pageNumber ?? pageInfoData?.page ?? params.page ?? 0) + 1,
        pageSize: pageInfoData?.pageSize ?? pageInfoData?.size ?? params.pageSize ?? 10,
        total: pageInfoData?.totalRecords ?? pageInfoData?.total ?? bannersArray.length,
        totalPages: pageInfoData?.totalPages ?? Math.ceil((pageInfoData?.totalRecords ?? bannersArray.length) / (pageInfoData?.pageSize ?? params.pageSize ?? 10)),
      },
    };
  }

  // 5. Delete Banner
  async deleteBanner(id: number): Promise<{ success: boolean; message?: string }> {
    console.log('📢 Deleting banner:', `${this.baseEndpoint}/delete/${id}`);
    const response = await apiClient.post(`${this.baseEndpoint}/delete/${id}`);
    console.log('📢 Delete banner response:', response);

    if (!response.success) {
      console.error('❌ Failed to delete banner:', response.error, response.message);
      throw new Error(response.error || response.message || 'Failed to delete banner');
    }

    return {
      success: true,
      message: response.message || 'Banner deleted successfully',
    };
  }

  // 6. Upload Banner Files
  /**
   * Upload image files for a banner
   * Uses the common catalog upload endpoint: /catalog/upload/file/{bannerId}
   * 
   * @param bannerId - Banner ID
   * @param files - Array of image files to upload
   * @param docTypes - Optional document types (e.g., ['profilePic', 'CoverPagePic', 'thumbnail'])
   * @returns Promise with upload response
   * 
   * @example
   * await bannerService.uploadFiles(37, [file1, file2], ['profilePic', 'CoverPagePic']);
   */
  async uploadFiles(
    bannerId: number,
    files: File[],
    docTypes?: string[]
  ): Promise<{ success: boolean; message?: string; data?: any }> {
    try {
      const response = await fileUploadService.uploadBannerFiles(bannerId, files, docTypes);
      return {
        success: response.success,
        message: response.message,
        data: response.data,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload banner files';
      console.error('❌ Error uploading banner files:', error);
      throw new Error(errorMessage);
    }
  }

  // 7. Delete Banner File
  /**
   * Delete a file associated with a banner
   * Uses the common catalog delete endpoint: /catalog/delete/file?fileId={fileId}
   * 
   * @param fileId - File ID to delete
   * @returns Promise with delete response
   * 
   * @example
   * await bannerService.deleteFile(123);
   */
  async deleteFile(fileId: number): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fileUploadService.deleteFile(fileId);
      return {
        success: response.success,
        message: response.message,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete banner file';
      console.error('❌ Error deleting banner file:', error);
      throw new Error(errorMessage);
    }
  }
}

export const bannerService = new BannerService();
export default bannerService;

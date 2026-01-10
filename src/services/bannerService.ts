import { apiClient } from './apiClient';

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
    id?: number;
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
  }): Promise<{ success: boolean; message?: string; data?: Banner }> {
    console.log('📢 Creating banner:', `${this.baseEndpoint}/add-banner`);
    const response = await apiClient.post<Banner>(`${this.baseEndpoint}/add-banner`, bannerData);
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
  async updateBanner(id: number, updates: Partial<Banner>): Promise<{ success: boolean; message?: string; data?: Banner }> {
    console.log('📢 Updating banner:', `${this.baseEndpoint}/update-banner/${id}`);
    const response = await apiClient.post<Banner>(`${this.baseEndpoint}/update-banner/${id}`, updates);
    console.log('📢 Update banner response:', response);

    if (!response.success) {
      console.error('❌ Failed to update banner:', response.error, response.message);
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
    if (params.sortBy) queryParams.sortBy = params.sortBy;
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
      pageInfo?: {
        pageNumber: number;
        pageSize: number;
        totalRecords: number;
        totalPages: number;
      };
    }>(`${this.baseEndpoint}/get-all`, queryParams);
    console.log('📢 Get all banners response:', response);
    console.log('📢 Get all banners response.data:', response.data);

    if (!response.success) {
      // Extract detailed error message
      let errorMessage = 'Failed to fetch banners';
      
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
      
      console.error('❌ Failed to fetch banners:', {
        error: response.error,
        message: response.message,
        data: response.data,
        errorMessage
      });
      
      throw new Error(errorMessage);
    }

    const data = response.data ?? {};
    
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
    
    const pageInfo = data.pageInfo || data.pagination;

    return {
      banners: Array.isArray(content) ? content : [],
      pagination: {
        page: (pageInfo?.pageNumber ?? pageInfo?.page ?? params.page ?? 0) + 1,
        pageSize: pageInfo?.pageSize ?? pageInfo?.size ?? params.pageSize ?? 10,
        total: pageInfo?.totalRecords ?? pageInfo?.total ?? content.length,
        totalPages: pageInfo?.totalPages ?? Math.ceil((pageInfo?.totalRecords ?? content.length) / (pageInfo?.pageSize ?? params.pageSize ?? 10)),
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
}

export const bannerService = new BannerService();
export default bannerService;

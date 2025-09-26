import { apiClient } from './apiClient';
import { clientConfigManager } from '../config/clientConfig';

export interface Banner {
  id: string;
  title: string;
  description?: string;
  image: string;
  imageAlt?: string;
  linkUrl?: string;
  linkText?: string;
  position: 'top' | 'middle' | 'bottom' | 'sidebar' | 'popup';
  type: 'hero' | 'promotional' | 'announcement' | 'advertisement' | 'notification';
  status: 'active' | 'inactive' | 'scheduled' | 'expired';
  priority: number;
  startDate?: string;
  endDate?: string;
  targetAudience?: {
    ageGroups?: string[];
    locations?: string[];
    userTypes?: string[];
    devices?: string[];
  };
  analytics?: {
    views: number;
    clicks: number;
    conversions: number;
    ctr: number;
  };
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
}

export interface BannerFilters {
  search?: string;
  status?: string;
  position?: string;
  type?: string;
  createdBy?: string;
  startDate?: string;
  endDate?: string;
}

export interface BannerListParams {
  page?: number;
  pageSize?: number;
  filters?: BannerFilters;
  sortBy?: 'title' | 'createdAt' | 'startDate' | 'endDate' | 'priority' | 'views' | 'clicks';
  sortOrder?: 'asc' | 'desc';
}

export interface BannerListResponse {
  banners: Banner[];
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface BannerStats {
  totalBanners: number;
  activeBanners: number;
  inactiveBanners: number;
  scheduledBanners: number;
  expiredBanners: number;
  totalViews: number;
  totalClicks: number;
  averageCtr: number;
}

export interface BannerAnalytics {
  views: number;
  clicks: number;
  conversions: number;
  ctr: number;
  impressions: number;
  uniqueViews: number;
  bounceRate: number;
  topPositions: Array<{
    position: string;
    views: number;
  }>;
  topTypes: Array<{
    type: string;
    clicks: number;
  }>;
  dailyStats: Array<{
    date: string;
    views: number;
    clicks: number;
  }>;
}

class BannerService {
  private baseUrl = '/api/banners';

  async getBanners(params: BannerListParams = {}): Promise<BannerListResponse> {
    const config = clientConfigManager.getConfig();
    if (!config.modules.banners) {
      throw new Error('Banner module is not enabled');
    }

    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    
    if (params.filters) {
      if (params.filters.search) queryParams.append('search', params.filters.search);
      if (params.filters.status) queryParams.append('status', params.filters.status);
      if (params.filters.position) queryParams.append('position', params.filters.position);
      if (params.filters.type) queryParams.append('type', params.filters.type);
      if (params.filters.createdBy) queryParams.append('createdBy', params.filters.createdBy);
      if (params.filters.startDate) queryParams.append('startDate', params.filters.startDate);
      if (params.filters.endDate) queryParams.append('endDate', params.filters.endDate);
    }

    const response = await apiClient.get(`${this.baseUrl}?${queryParams.toString()}`);
    return response.data;
  }

  async getBanner(id: string): Promise<Banner> {
    const config = clientConfigManager.getConfig();
    if (!config.modules.banners) {
      throw new Error('Banner module is not enabled');
    }

    const response = await apiClient.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async createBanner(bannerData: Partial<Banner>): Promise<Banner> {
    const config = clientConfigManager.getConfig();
    if (!config.modules.banners) {
      throw new Error('Banner module is not enabled');
    }

    const response = await apiClient.post(this.baseUrl, bannerData);
    return response.data;
  }

  async updateBanner(id: string, bannerData: Partial<Banner>): Promise<Banner> {
    const config = clientConfigManager.getConfig();
    if (!config.modules.banners) {
      throw new Error('Banner module is not enabled');
    }

    const response = await apiClient.put(`${this.baseUrl}/${id}`, bannerData);
    return response.data;
  }

  async deleteBanner(id: string): Promise<void> {
    const config = clientConfigManager.getConfig();
    if (!config.modules.banners) {
      throw new Error('Banner module is not enabled');
    }

    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  async bulkDeleteBanners(ids: string[]): Promise<void> {
    const config = clientConfigManager.getConfig();
    if (!config.modules.banners) {
      throw new Error('Banner module is not enabled');
    }

    await apiClient.delete(`${this.baseUrl}/bulk`, { data: { ids } });
  }

  async bulkUpdateBanners(ids: string[], updates: Partial<Banner>): Promise<void> {
    const config = clientConfigManager.getConfig();
    if (!config.modules.banners) {
      throw new Error('Banner module is not enabled');
    }

    await apiClient.put(`${this.baseUrl}/bulk`, { data: { ids, updates } });
  }

  async getBannerStats(): Promise<BannerStats> {
    const config = clientConfigManager.getConfig();
    if (!config.modules.banners) {
      throw new Error('Banner module is not enabled');
    }

    const response = await apiClient.get(`${this.baseUrl}/stats`);
    return response.data;
  }

  async getBannerAnalytics(id: string): Promise<BannerAnalytics> {
    const config = clientConfigManager.getConfig();
    if (!config.modules.banners) {
      throw new Error('Banner module is not enabled');
    }

    const response = await apiClient.get(`${this.baseUrl}/${id}/analytics`);
    return response.data;
  }

  async activateBanner(id: string): Promise<Banner> {
    const config = clientConfigManager.getConfig();
    if (!config.modules.banners) {
      throw new Error('Banner module is not enabled');
    }

    const response = await apiClient.post(`${this.baseUrl}/${id}/activate`);
    return response.data;
  }

  async deactivateBanner(id: string): Promise<Banner> {
    const config = clientConfigManager.getConfig();
    if (!config.modules.banners) {
      throw new Error('Banner module is not enabled');
    }

    const response = await apiClient.post(`${this.baseUrl}/${id}/deactivate`);
    return response.data;
  }

  async duplicateBanner(id: string): Promise<Banner> {
    const config = clientConfigManager.getConfig();
    if (!config.modules.banners) {
      throw new Error('Banner module is not enabled');
    }

    const response = await apiClient.post(`${this.baseUrl}/${id}/duplicate`);
    return response.data;
  }

  async getBannersByPosition(position: string): Promise<Banner[]> {
    const config = clientConfigManager.getConfig();
    if (!config.modules.banners) {
      throw new Error('Banner module is not enabled');
    }

    const response = await apiClient.get(`${this.baseUrl}/position/${position}`);
    return response.data;
  }

  async getActiveBanners(): Promise<Banner[]> {
    const config = clientConfigManager.getConfig();
    if (!config.modules.banners) {
      throw new Error('Banner module is not enabled');
    }

    const response = await apiClient.get(`${this.baseUrl}/active`);
    return response.data;
  }

  async trackBannerView(id: string): Promise<void> {
    const config = clientConfigManager.getConfig();
    if (!config.modules.banners) {
      throw new Error('Banner module is not enabled');
    }

    await apiClient.post(`${this.baseUrl}/${id}/track-view`);
  }

  async trackBannerClick(id: string): Promise<void> {
    const config = clientConfigManager.getConfig();
    if (!config.modules.banners) {
      throw new Error('Banner module is not enabled');
    }

    await apiClient.post(`${this.baseUrl}/${id}/track-click`);
  }
}

export const bannerService = new BannerService();

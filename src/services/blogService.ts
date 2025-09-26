import { apiClient } from './apiClient';
import { clientConfigManager } from '../config/clientConfig';

export interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage?: string;
  author: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  views: number;
  likes: number;
  comments: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
}

export interface BlogFilters {
  search?: string;
  status?: string;
  category?: string;
  author?: string;
  tags?: string[];
  publishedAfter?: string;
  publishedBefore?: string;
}

export interface BlogListParams {
  page?: number;
  pageSize?: number;
  filters?: BlogFilters;
  sortBy?: 'title' | 'createdAt' | 'publishedAt' | 'views' | 'likes';
  sortOrder?: 'asc' | 'desc';
}

export interface BlogListResponse {
  blogs: Blog[];
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface BlogStats {
  totalBlogs: number;
  publishedBlogs: number;
  draftBlogs: number;
  archivedBlogs: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
}

export interface BlogAnalytics {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  readingTime: number;
  bounceRate: number;
  topCategories: Array<{
    category: string;
    count: number;
  }>;
  topTags: Array<{
    tag: string;
    count: number;
  }>;
}

class BlogService {
  private baseUrl = '/api/blogs';

  async getBlogs(params: BlogListParams = {}): Promise<BlogListResponse> {
    const config = clientConfigManager.getConfig();
    if (!config.modules.blogs) {
      throw new Error('Blog module is not enabled');
    }

    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    
    if (params.filters) {
      if (params.filters.search) queryParams.append('search', params.filters.search);
      if (params.filters.status) queryParams.append('status', params.filters.status);
      if (params.filters.category) queryParams.append('category', params.filters.category);
      if (params.filters.author) queryParams.append('author', params.filters.author);
      if (params.filters.tags) queryParams.append('tags', params.filters.tags.join(','));
      if (params.filters.publishedAfter) queryParams.append('publishedAfter', params.filters.publishedAfter);
      if (params.filters.publishedBefore) queryParams.append('publishedBefore', params.filters.publishedBefore);
    }

    const response = await apiClient.get(`${this.baseUrl}?${queryParams.toString()}`);
    return response.data;
  }

  async getBlog(id: string): Promise<Blog> {
    const config = clientConfigManager.getConfig();
    if (!config.modules.blogs) {
      throw new Error('Blog module is not enabled');
    }

    const response = await apiClient.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async createBlog(blogData: Partial<Blog>): Promise<Blog> {
    const config = clientConfigManager.getConfig();
    if (!config.modules.blogs) {
      throw new Error('Blog module is not enabled');
    }

    const response = await apiClient.post(this.baseUrl, blogData);
    return response.data;
  }

  async updateBlog(id: string, blogData: Partial<Blog>): Promise<Blog> {
    const config = clientConfigManager.getConfig();
    if (!config.modules.blogs) {
      throw new Error('Blog module is not enabled');
    }

    const response = await apiClient.put(`${this.baseUrl}/${id}`, blogData);
    return response.data;
  }

  async deleteBlog(id: string): Promise<void> {
    const config = clientConfigManager.getConfig();
    if (!config.modules.blogs) {
      throw new Error('Blog module is not enabled');
    }

    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  async bulkDeleteBlogs(ids: string[]): Promise<void> {
    const config = clientConfigManager.getConfig();
    if (!config.modules.blogs) {
      throw new Error('Blog module is not enabled');
    }

    await apiClient.delete(`${this.baseUrl}/bulk`, { data: { ids } });
  }

  async bulkUpdateBlogs(ids: string[], updates: Partial<Blog>): Promise<void> {
    const config = clientConfigManager.getConfig();
    if (!config.modules.blogs) {
      throw new Error('Blog module is not enabled');
    }

    await apiClient.put(`${this.baseUrl}/bulk`, { ids, updates });
  }

  async getBlogStats(): Promise<BlogStats> {
    const config = clientConfigManager.getConfig();
    if (!config.modules.blogs) {
      throw new Error('Blog module is not enabled');
    }

    const response = await apiClient.get(`${this.baseUrl}/stats`);
    return response.data;
  }

  async getBlogAnalytics(id: string): Promise<BlogAnalytics> {
    const config = clientConfigManager.getConfig();
    if (!config.modules.blogs) {
      throw new Error('Blog module is not enabled');
    }

    const response = await apiClient.get(`${this.baseUrl}/${id}/analytics`);
    return response.data;
  }

  async publishBlog(id: string): Promise<Blog> {
    const config = clientConfigManager.getConfig();
    if (!config.modules.blogs) {
      throw new Error('Blog module is not enabled');
    }

    const response = await apiClient.post(`${this.baseUrl}/${id}/publish`);
    return response.data;
  }

  async unpublishBlog(id: string): Promise<Blog> {
    const config = clientConfigManager.getConfig();
    if (!config.modules.blogs) {
      throw new Error('Blog module is not enabled');
    }

    const response = await apiClient.post(`${this.baseUrl}/${id}/unpublish`);
    return response.data;
  }

  async getPopularBlogs(limit: number = 10): Promise<Blog[]> {
    const config = clientConfigManager.getConfig();
    if (!config.modules.blogs) {
      throw new Error('Blog module is not enabled');
    }

    const response = await apiClient.get(`${this.baseUrl}/popular?limit=${limit}`);
    return response.data;
  }

  async getRecentBlogs(limit: number = 10): Promise<Blog[]> {
    const config = clientConfigManager.getConfig();
    if (!config.modules.blogs) {
      throw new Error('Blog module is not enabled');
    }

    const response = await apiClient.get(`${this.baseUrl}/recent?limit=${limit}`);
    return response.data;
  }

  async searchBlogs(query: string, limit: number = 20): Promise<Blog[]> {
    const config = clientConfigManager.getConfig();
    if (!config.modules.blogs) {
      throw new Error('Blog module is not enabled');
    }

    const response = await apiClient.get(`${this.baseUrl}/search?q=${encodeURIComponent(query)}&limit=${limit}`);
    return response.data;
  }
}

export const blogService = new BlogService();

import { apiClient } from './apiClient';
import categoryService from './categoryService';
import userService from './userService';
import medicineService from './modules/medicineService';
import prescriptionService, { Prescription } from './prescriptionService';
import blogService from './blogService';

export interface DashboardStats {
  categories: {
    total: number;
    active: number;
  };
  users: {
    total: number;
  };
  medicines: {
    total: number;
  };
  prescriptions: {
    total: number;
    recent: number;
    pending: number;
    approved: number;
    dispensed: number;
  };
  blogs: {
    total: number;
  };
}

export interface DashboardMetrics {
  totalOrders: number;
  totalBuyers: number;
  totalRevenue: number;
  conversionRate: number;
  period: string;
}

export interface OrderHistoryItem {
  orderId: string;
  status: 'pending' | 'completed' | 'cancelled' | 'processing';
  date: string;
  amount?: number;
  customerName?: string;
}

class DashboardService {
  /**
   * Get comprehensive dashboard statistics from various services
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Fetch all stats in parallel for better performance
      // For categories, use getCategories to get the list and calculate stats
      // For prescriptions, fetch a large page to calculate status breakdown
      // For blogs, fetch from all statuses to count total (similar to how Blogs page does it)
      const [categoriesResponse, users, medicines, prescriptions, allPrescriptions, draftBlogs, publishedBlogs, archivedBlogs] = await Promise.allSettled([
        categoryService.getCategories({ page: 1, pageSize: 1000 }), // Get all categories to count
        userService.getUsers({ page: 1, pageSize: 1 }), // Just get count
        medicineService.getAllMedicines({ page: 0, size: 1 }), // Just get count (0-based)
        prescriptionService.getAllPrescriptions({ page: 0, pageSize: 10, itemType: 'PRESCRIPTION' }), // Get recent prescriptions
        prescriptionService.getAllPrescriptions({ page: 0, pageSize: 1000, itemType: 'PRESCRIPTION' }), // Get all prescriptions for status counts
        blogService.getAllBlogs('ADMIN', { page: 0, pageSize: 1000, itemType: 'BLOG', status: 'DRAFT' as any, type: 'DRAFT' as any } as any), // Get DRAFT blogs
        blogService.getAllBlogs('ADMIN', { page: 0, pageSize: 1000, itemType: 'BLOG', status: 'PUBLISHED' as any, type: 'PUBLISHED' as any } as any), // Get PUBLISHED blogs
        blogService.getAllBlogs('ADMIN', { page: 0, pageSize: 1000, itemType: 'BLOG', status: 'ARCHIVED' as any, type: 'ARCHIVED' as any } as any), // Get ARCHIVED blogs
      ]);
      
      // Calculate category stats from the response
      let categoryTotal = 0;
      let categoryActive = 0;
      
      if (categoriesResponse.status === 'fulfilled') {
        const categoriesData = categoriesResponse.value;
        categoryTotal = categoriesData.pagination?.total || categoriesData.categories?.length || 0;
        // Count active categories
        if (categoriesData.categories && Array.isArray(categoriesData.categories)) {
          categoryActive = categoriesData.categories.filter(
            (cat: any) => cat.status === 'active' || cat.state === 'ACTIVE'
          ).length;
        }
      }
      
      // Calculate prescription status counts from allPrescriptions
      let prescriptionPending = 0;
      let prescriptionApproved = 0;
      let prescriptionDispensed = 0;
      let prescriptionTotal = 0;
      
      if (allPrescriptions.status === 'fulfilled') {
        const allPrescriptionsData = allPrescriptions.value;
        prescriptionTotal = allPrescriptionsData.pagination?.total || 0;
        
        // Count by status from the prescriptions list
        const prescriptionsList = allPrescriptionsData.prescriptions || [];
        prescriptionsList.forEach((prescription: any) => {
          const status = prescription.status?.toUpperCase() || '';
          if (status === 'PENDING') prescriptionPending++;
          else if (status === 'APPROVED') prescriptionApproved++;
          else if (status === 'DISPENSED') prescriptionDispensed++;
        });
      }
      
      // If we didn't get all prescriptions in one call, use total from pagination
      if (prescriptionTotal === 0 && prescriptions.status === 'fulfilled') {
        prescriptionTotal = prescriptions.value.pagination?.total || 0;
      }

      // Calculate blogs total
      let blogsTotal = 0;
      if (draftBlogs.status === 'fulfilled') {
        const draftCount = draftBlogs.value.blogs?.length || 0;
        console.log('📝 Draft blogs count:', draftCount, 'Response:', draftBlogs.value);
        blogsTotal += draftCount;
      } else {
        console.error('❌ Draft blogs failed:', draftBlogs.reason);
      }
      
      if (publishedBlogs.status === 'fulfilled') {
        const publishedCount = publishedBlogs.value.blogs?.length || 0;
        console.log('📝 Published blogs count:', publishedCount, 'Response:', publishedBlogs.value);
        blogsTotal += publishedCount;
      } else {
        console.error('❌ Published blogs failed:', publishedBlogs.reason);
      }
      
      if (archivedBlogs.status === 'fulfilled') {
        const archivedCount = archivedBlogs.value.blogs?.length || 0;
        console.log('📝 Archived blogs count:', archivedCount, 'Response:', archivedBlogs.value);
        blogsTotal += archivedCount;
      } else {
        console.error('❌ Archived blogs failed:', archivedBlogs.reason);
      }

      console.log('📝 Total blogs calculated:', blogsTotal);

      // Log results for debugging
      console.log('📊 Dashboard Stats Results:', {
        categories: {
          status: categoriesResponse.status,
          total: categoryTotal,
          active: categoryActive,
          response: categoriesResponse.status === 'fulfilled' ? {
            pagination: categoriesResponse.value.pagination,
            count: categoriesResponse.value.categories?.length
          } : categoriesResponse.reason
        },
        users: users.status === 'fulfilled' ? {
          total: users.value.pagination?.total,
          pagination: users.value.pagination
        } : users.reason,
        medicines: medicines.status === 'fulfilled' ? {
          total: medicines.value.pagination?.total,
          pagination: medicines.value.pagination
        } : medicines.reason,
        prescriptions: prescriptions.status === 'fulfilled' ? {
          total: prescriptions.value.pagination?.total,
          pagination: prescriptions.value.pagination
        } : prescriptions.reason,
        prescriptionStats: {
          total: prescriptionTotal,
          pending: prescriptionPending,
          approved: prescriptionApproved,
          dispensed: prescriptionDispensed
        },
        blogs: {
          draftStatus: draftBlogs.status,
          publishedStatus: publishedBlogs.status,
          archivedStatus: archivedBlogs.status,
          draftCount: draftBlogs.status === 'fulfilled' ? (draftBlogs.value.blogs?.length || 0) : 0,
          publishedCount: publishedBlogs.status === 'fulfilled' ? (publishedBlogs.value.blogs?.length || 0) : 0,
          archivedCount: archivedBlogs.status === 'fulfilled' ? (archivedBlogs.value.blogs?.length || 0) : 0,
          totalCount: (draftBlogs.status === 'fulfilled' ? (draftBlogs.value.blogs?.length || 0) : 0) +
                      (publishedBlogs.status === 'fulfilled' ? (publishedBlogs.value.blogs?.length || 0) : 0) +
                      (archivedBlogs.status === 'fulfilled' ? (archivedBlogs.value.blogs?.length || 0) : 0)
        },
      });

      return {
        categories: {
          total: categoryTotal,
          active: categoryActive,
        },
        users: {
          total: users.status === 'fulfilled' ? (users.value.pagination?.total || 0) : 0,
        },
        medicines: {
          total: medicines.status === 'fulfilled' ? (medicines.value.pagination?.total || 0) : 0,
        },
        prescriptions: {
          total: prescriptionTotal,
          recent: prescriptions.status === 'fulfilled' ? (prescriptions.value.prescriptions?.length || 0) : 0,
          pending: prescriptionPending,
          approved: prescriptionApproved,
          dispensed: prescriptionDispensed,
        },
        blogs: {
          total: blogsTotal,
        },
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Return default values on error
      return {
        categories: { total: 0, active: 0 },
        users: { total: 0 },
        medicines: { total: 0 },
        prescriptions: { total: 0, recent: 0, pending: 0, approved: 0, dispensed: 0 },
        blogs: { total: 0 },
      };
    }
  }

  /**
   * Get dashboard metrics (orders, revenue, etc.)
   * This will use backend API when available, otherwise returns mock data
   */
  async getDashboardMetrics(period: string = '7 days'): Promise<DashboardMetrics> {
    try {
      const response = await apiClient.get<DashboardMetrics>('/dashboard/metrics', { period });
      if (response.success && response.data) {
        return response.data;
      }
    } catch (error) {
      console.warn('Dashboard metrics API not available, using mock data:', error);
    }
    
    // Return mock data if API is not available
    return this.getMockDashboardMetrics(period);
  }

  /**
   * Get order history
   * This will use backend API when available, otherwise returns mock data
   */
  async getOrderHistory(fromDate?: string, toDate?: string): Promise<OrderHistoryItem[]> {
    try {
      const params: Record<string, string> = {};
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;
      
      const response = await apiClient.get<OrderHistoryItem[]>('/dashboard/order-history', params);
      if (response.success && response.data) {
        return response.data;
      }
    } catch (error) {
      console.warn('Order history API not available, using mock data:', error);
    }
    
    // Return mock data if API is not available
    return this.getMockOrderHistory();
  }

  /**
   * Get recent prescriptions for dashboard
   */
  async getRecentPrescriptions(limit: number = 5): Promise<Prescription[]> {
    try {
      const response = await prescriptionService.getAllPrescriptions({
        itemType: 'PRESCRIPTION',
        page: 0,
        pageSize: limit,
        sortBy: 'prescriptionDate',
        sortOrder: 'DESC'
      });
      
      return response.prescriptions || [];
    } catch (error) {
      console.error('Error fetching recent prescriptions:', error);
      return [];
    }
  }

  private getMockDashboardMetrics(period: string): DashboardMetrics {
    const mockData: Record<string, DashboardMetrics> = {
      '7 days': { totalOrders: 1247, totalBuyers: 892, totalRevenue: 45678.90, conversionRate: 3.2, period: '7 days' },
      '30 days': { totalOrders: 5280, totalBuyers: 3195, totalRevenue: 205000, conversionRate: 3.5, period: '30 days' },
      '90 days': { totalOrders: 15850, totalBuyers: 9620, totalRevenue: 615600, conversionRate: 3.8, period: '90 days' }
    };
    
    return mockData[period] || mockData['7 days'];
  }

  private getMockOrderHistory(): OrderHistoryItem[] {
    return [
      { orderId: '#182728', status: 'pending', date: '2024-01-26', amount: 125.50, customerName: 'John Doe' },
      { orderId: '#182729', status: 'completed', date: '2024-01-25', amount: 89.99, customerName: 'Jane Smith' },
      { orderId: '#182730', status: 'processing', date: '2024-01-24', amount: 234.75, customerName: 'Bob Johnson' },
      { orderId: '#182731', status: 'completed', date: '2024-01-23', amount: 67.25, customerName: 'Alice Brown' },
      { orderId: '#182732', status: 'cancelled', date: '2024-01-22', amount: 156.00, customerName: 'Charlie Wilson' }
    ];
  }
}

export default new DashboardService();

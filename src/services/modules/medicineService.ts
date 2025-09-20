// Medicine Service - Handles all medicine-related API calls
import { apiClient } from '../apiClient';
import { clientConfigManager } from '../../config/clientConfig';

export interface Medicine {
  id: string;
  name: string;
  description: string;
  image?: string;
  category: string;
  manufacturer: string;
  form: string;
  status: 'active' | 'inactive' | 'discontinued';
  price: number;
  stock: number;
  sku: string;
  barcode?: string;
  prescriptionRequired: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MedicineFilters {
  search?: string;
  category?: string;
  manufacturer?: string;
  status?: string;
  form?: string;
  prescriptionRequired?: boolean;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}

export interface MedicineListParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: MedicineFilters;
}

export interface MedicineListResponse {
  medicines: Medicine[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

class MedicineService {
  private getEndpoint(path: string): string {
    const config = clientConfigManager.getConfig();
    return `${config.api.endpoints.medicines}${path}`;
  }

  // Get all medicines with pagination and filters
  async getMedicines(params: MedicineListParams = {}): Promise<MedicineListResponse> {
    const response = await apiClient.get<MedicineListResponse>(
      this.getEndpoint(''),
      params
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch medicines');
    }

    return response.data!;
  }

  // Get medicine by ID
  async getMedicine(id: string): Promise<Medicine> {
    const response = await apiClient.get<Medicine>(
      this.getEndpoint(`/${id}`)
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch medicine');
    }

    return response.data!;
  }

  // Create new medicine
  async createMedicine(medicine: Omit<Medicine, 'id' | 'createdAt' | 'updatedAt'>): Promise<Medicine> {
    const response = await apiClient.post<Medicine>(
      this.getEndpoint(''),
      medicine
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to create medicine');
    }

    return response.data!;
  }

  // Update medicine
  async updateMedicine(id: string, updates: Partial<Medicine>): Promise<Medicine> {
    const response = await apiClient.put<Medicine>(
      this.getEndpoint(`/${id}`),
      updates
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to update medicine');
    }

    return response.data!;
  }

  // Delete medicine
  async deleteMedicine(id: string): Promise<void> {
    const response = await apiClient.delete(
      this.getEndpoint(`/${id}`)
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to delete medicine');
    }
  }

  // Bulk upload medicines
  async bulkUpload(file: File, onProgress?: (progress: number) => void): Promise<{
    success: number;
    failed: number;
    errors: string[];
  }> {
    const response = await apiClient.upload<{
      success: number;
      failed: number;
      errors: string[];
    }>(
      this.getEndpoint('/bulk-upload'),
      file,
      onProgress
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to upload medicines');
    }

    return response.data!;
  }

  // Get medicine categories
  async getCategories(): Promise<string[]> {
    const response = await apiClient.get<string[]>(
      this.getEndpoint('/categories')
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch categories');
    }

    return response.data!;
  }

  // Get manufacturers
  async getManufacturers(): Promise<string[]> {
    const response = await apiClient.get<string[]>(
      this.getEndpoint('/manufacturers')
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch manufacturers');
    }

    return response.data!;
  }

  // Get medicine forms
  async getForms(): Promise<string[]> {
    const response = await apiClient.get<string[]>(
      this.getEndpoint('/forms')
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch forms');
    }

    return response.data!;
  }

  // Search medicines
  async searchMedicines(query: string, limit: number = 10): Promise<Medicine[]> {
    const response = await apiClient.get<Medicine[]>(
      this.getEndpoint('/search'),
      { q: query, limit }
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to search medicines');
    }

    return response.data!;
  }

  // Update medicine stock
  async updateStock(id: string, stock: number): Promise<Medicine> {
    const response = await apiClient.patch<Medicine>(
      this.getEndpoint(`/${id}/stock`),
      { stock }
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to update stock');
    }

    return response.data!;
  }

  // Get low stock medicines
  async getLowStock(threshold: number = 10): Promise<Medicine[]> {
    const response = await apiClient.get<Medicine[]>(
      this.getEndpoint('/low-stock'),
      { threshold }
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch low stock medicines');
    }

    return response.data!;
  }

  // Get medicine analytics
  async getAnalytics(): Promise<{
    totalMedicines: number;
    activeMedicines: number;
    lowStockCount: number;
    categoriesCount: number;
    topCategories: Array<{ category: string; count: number }>;
    recentAdditions: Medicine[];
  }> {
    const response = await apiClient.get(
      this.getEndpoint('/analytics')
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch analytics');
    }

    return response.data!;
  }
}

// Export singleton instance
export const medicineService = new MedicineService();
export default medicineService;

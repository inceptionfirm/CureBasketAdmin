// Medicine Service - Handles all medicine-related API calls
import { apiClient } from '../apiClient';

// FAQ interface
export interface FAQ {
  question?: string;
  answer?: string;
  q?: string; // Alternative field name
  a?: string; // Alternative field name
}

// Package interface for dosages
export interface MedicinePackage {
  size?: number | string;
  quantity?: number | string;
  label?: string;
  unit?: string; // e.g., "Tablet/s"
  totalPrice?: number;
  price?: number;
  pricePerTablet?: number;
  pricePerUnit?: number;
  originalPrice?: number;
  oldPrice?: number;
}

// Dosage interface
export interface MedicineDosage {
  strength?: string;
  value?: string;
  label?: string;
  packages?: MedicinePackage[];
  sizes?: MedicinePackage[];
}

export interface Medicine {
  id: number;
  name: string;
  genericName?: string;
  manufacturer?: string;
  dosageForm?: string;
  strength?: string;
  price?: number;
  description?: string;
  stockQuantity?: number;
  expiryDate?: string;
  createdAt?: string;
  updatedAt?: string;
  // Additional fields that might come from API
  sku?: string;
  category?: string;
  status?: string;
  form?: string;
  image?: string | null;
  barcode?: string;
  prescriptionRequired?: boolean;
  countryOfOrigin?: string;
  
  // New fields for listing/card
  type?: 'prescription' | 'otc' | 'supplement' | 'equipment';
  rating?: number;
  reviews?: number;
  reviewsCount?: number;
  originalPrice?: number;
  
  // New fields for detail page - product info
  genericFor?: string; // or brandName/brand
  brandName?: string;
  brand?: string;
  activeIngredient?: string; // or salt/saltComposition
  salt?: string;
  saltComposition?: string;
  
  // New fields for detail page - extra sections
  precautions?: string;
  sideEffects?: string;
  howToUse?: string; // or dosage/usage
  dosage?: string;
  usage?: string;
  faqs?: FAQ[];
  
  // New fields for rating & discount
  discountPercent?: number;
  
  // New fields for packages/dosages
  availableDosages?: MedicineDosage[];
  dosages?: MedicineDosage[];
  packages?: MedicineDosage[];
}

export interface MedicineListParams {
  page?: number;
  size?: number;
  sortBy?: string;
}

export interface MedicineListResponse {
  medicines: Medicine[];
  pagination: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  };
  /** When API reports more records than returned (e.g. pageInfo.totalRecords), for partial-list notice */
  totalRecordsFromApi?: number;
}

class MedicineService {
  private baseEndpoint = '/medicines';

  // 38. Create Medicine
  async createMedicine(medicineData: any): Promise<{ success: boolean; message?: string; data?: Medicine }> {
    console.log('💉 Creating medicine:', `${this.baseEndpoint}/createMedicine`);
    console.log('💉 Create medicine payload:', medicineData);
    const response = await apiClient.post<Medicine>(`${this.baseEndpoint}/createMedicine`, medicineData);
    console.log('💉 Create medicine response:', response);

    if (!response.success) {
      console.error('❌ Failed to create medicine:', response.error, response.message);
      throw new Error(response.error || response.message || 'Failed to create medicine');
    }

    return {
      success: true,
      message: response.message || 'Medicine created successfully',
      data: response.data as Medicine,
    };
  }

  // 39. Get All Medicines
  // GET /medicines/getAllMedicines?page=0&size=10&sortBy=name
  async getAllMedicines(params: MedicineListParams = {}): Promise<MedicineListResponse> {
    const queryParams: Record<string, any> = {};
    const page = params.page !== undefined ? params.page : 0;
    const size = params.size !== undefined ? params.size : 10;

    queryParams.page = page;
    queryParams.size = size;

    if (params.sortBy && params.sortBy.trim() !== '') {
      queryParams.sortBy = params.sortBy;
    }

    const response = await apiClient.get<any>(`${this.baseEndpoint}/getAllMedicines`, queryParams);

    if (!response.success) {
      // Extract detailed error message
      let errorMessage = 'Failed to fetch medicines';
      
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
      
      throw new Error(errorMessage);
    }

    // API shape: { success, data: { content: Medicine[], pageInfo: { pageNumber, pageSize, totalPages, totalRecords } } }
    const raw = response.data ?? {} as any;
    const data = raw.data && typeof raw.data === 'object' && !Array.isArray(raw.data) ? raw.data : raw;

    let content: any[] = [];
    if (Array.isArray(data)) {
      content = data;
    } else if (data.content && Array.isArray(data.content)) {
      content = data.content;
    } else if (data.data && Array.isArray(data.data)) {
      content = data.data;
    } else if (data.medicines && Array.isArray(data.medicines)) {
      content = data.medicines;
    } else if (data.items && Array.isArray(data.items)) {
      content = data.items;
    }

    const pageInfo = data.pageInfo || data.pagination || data.page || {};

    const pageSize = pageInfo?.pageSize ?? pageInfo?.size ?? params.size ?? 10;
    const total = pageInfo?.totalRecords ?? pageInfo?.total ?? content.length;
    let totalPages = pageInfo?.totalPages;
    if (totalPages == null || totalPages < 1) {
      totalPages = Math.max(1, Math.ceil(total / Math.max(pageSize, 1)));
    }

    return {
      medicines: content,
      pagination: {
        page: (pageInfo?.pageNumber ?? pageInfo?.page ?? params.page ?? 0) + 1,
        size: pageSize,
        total,
        totalPages,
      },
    };
  }

  /**
   * Fetches all medicines. Tries one request with size=1000 (matches CureBasket getAllMedicines curl), then paginates if needed.
   */
  async getAllMedicinesAllPages(params: Omit<MedicineListParams, 'page' | 'size'> & { pageSize?: number } = {}): Promise<MedicineListResponse> {
    const requestedPageSize = params.pageSize ?? 20;
    const allMedicines: any[] = [];
    let total = 0;

    const largeRes = await this.getAllMedicines({ ...params, page: 0, size: 1000 });
    total = largeRes.pagination?.total ?? largeRes.medicines.length;
    allMedicines.push(...largeRes.medicines);

    // 2) If we still have fewer than total, fetch next pages (backend may ignore size and cap at 17)
    let page = 1;
    while (allMedicines.length < total && page <= 99) {
      const res = await this.getAllMedicines({ ...params, page, size: requestedPageSize });
      if (res.medicines.length === 0) break;
      // Avoid duplicates: only add items we don't already have by id
      const existingIds = new Set(allMedicines.map((m: any) => m.id));
      for (const m of res.medicines) {
        if (!existingIds.has(m.id)) {
          existingIds.add(m.id);
          allMedicines.push(m);
        }
      }
      if (res.medicines.length < requestedPageSize) break;
      page++;
    }

    return {
      medicines: allMedicines,
      pagination: {
        page: 1,
        size: allMedicines.length,
        total: allMedicines.length,
        totalPages: Math.ceil(allMedicines.length / requestedPageSize) || 1,
      },
      totalRecordsFromApi: total > allMedicines.length ? total : undefined,
    };
  }

  // 40. Get Medicine by ID
  async getMedicineById(id: number): Promise<Medicine> {
    console.log('💉 Fetching medicine by ID:', `${this.baseEndpoint}/getMedicineById/${id}`);
    const response = await apiClient.get<any>(`${this.baseEndpoint}/getMedicineById/${id}`);
    console.log('💉 Get medicine full response:', response);
    console.log('💉 Get medicine response.data:', response.data);
    console.log('💉 Get medicine response.data keys:', response.data ? Object.keys(response.data) : 'No data');

    if (!response.success) {
      console.error('❌ Failed to fetch medicine:', response.error);
      throw new Error(response.error || 'Failed to fetch medicine');
    }

    // Return the full response data so we can map all fields
    return response.data as Medicine;
  }

  // 41. Update Medicine
  async updateMedicine(id: number, updates: Partial<Medicine>): Promise<{ success: boolean; message?: string; data?: Medicine }> {
    // Remove id from updates if present (id should only be in URL, not in body)
    const { id: _, ...updatePayload } = updates as any;
    
    // Ensure ID is a valid number
    const medicineId = Number(id);
    if (isNaN(medicineId) || medicineId <= 0) {
      throw new Error(`Invalid medicine ID: ${id}`);
    }
    
    // POST /medicines/updateMedicine/{id}
    // Request body: Only the fields to update (single or multiple)
    // Example: { "name": "New Name" } or { "name": "New Name", "price": 100 }
    const endpoint = `${this.baseEndpoint}/updateMedicine/${medicineId}`;
    console.log('💉 Updating medicine:', endpoint);
    console.log('💉 Update payload:', JSON.stringify(updatePayload, null, 2));
    console.log('💉 Image in update payload:', {
      image: updatePayload.image,
      imageType: typeof updatePayload.image,
      imageLength: updatePayload.image?.length,
      isNull: updatePayload.image === null,
      isEmpty: updatePayload.image === ''
    });
    const response = await apiClient.post<Medicine>(endpoint, updatePayload);
    console.log('💉 Update medicine response:', response);
    console.log('💉 Image in update response:', {
      image: response.data?.image,
      imageUrl: (response.data as any)?.imageUrl,
      files: (response.data as any)?.files
    });

    if (!response.success) {
      throw new Error(response.error || response.message || 'Failed to update medicine');
    }

    return {
      success: true,
      message: response.message || 'Medicine updated successfully',
      data: response.data as Medicine,
    };
  }

  // 42. Delete Medicine
  async deleteMedicine(id: number): Promise<{ success: boolean; message?: string }> {
    console.log('💉 Deleting medicine:', `${this.baseEndpoint}/deleteMedicine/${id}`);
    const response = await apiClient.get(`${this.baseEndpoint}/deleteMedicine/${id}`);
    console.log('💉 Delete medicine response:', response);

    if (!response.success) {
      console.error('❌ Failed to delete medicine:', response.error, response.message);
      throw new Error(response.error || response.message || 'Failed to delete medicine');
    }

    return {
      success: true,
      message: response.message || 'Medicine deleted successfully',
    };
  }

  // 43. Get All Manufacturers
  async getAllManufacturers(): Promise<string[]> {
    console.log('💉 Fetching manufacturers:', `${this.baseEndpoint}/getAllManufacturers`);
    const response = await apiClient.get<string[]>(`${this.baseEndpoint}/getAllManufacturers`);
    console.log('💉 Get manufacturers response:', response);

    if (!response.success) {
      console.error('❌ Failed to fetch manufacturers:', response.error);
      throw new Error(response.error || 'Failed to fetch manufacturers');
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

  // 44. Get All Medicine Forms
  async getAllMedicineForms(): Promise<string[]> {
    console.log('💉 Fetching medicine forms:', `${this.baseEndpoint}/getAllMedicineForms`);
    const response = await apiClient.get<string[]>(`${this.baseEndpoint}/getAllMedicineForms`);
    console.log('💉 Get medicine forms response:', response);

    if (!response.success) {
      console.error('❌ Failed to fetch medicine forms:', response.error);
      throw new Error(response.error || 'Failed to fetch medicine forms');
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
}

// Export singleton instance
export const medicineService = new MedicineService();
export default medicineService;



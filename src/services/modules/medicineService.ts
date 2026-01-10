// Medicine Service - Handles all medicine-related API calls
import { apiClient } from '../apiClient';

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
    
    // Page parameter - ensure it's 0-based
    queryParams.page = params.page !== undefined ? params.page : 0;
    
    // Size parameter
    queryParams.size = params.size !== undefined ? params.size : 10;
    
    // SortBy parameter - only include if provided and valid
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

    const data = response.data ?? {} as any;
    
    // Try multiple possible response structures
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

    // Log for debugging (can be removed later)
    if (content.length > 0) {
      console.log('💉 getAllMedicines - First medicine keys:', Object.keys(content[0]));
      console.log('💉 getAllMedicines - First medicine ID:', content[0].id);
      console.log('💉 getAllMedicines - First medicine image:', {
        image: content[0].image,
        imageUrl: content[0].imageUrl,
        thumbnail: content[0].thumbnail,
        files: content[0].files
      });
    }

    return {
      medicines: content,
      pagination: {
        page: (pageInfo?.pageNumber ?? pageInfo?.page ?? params.page ?? 0) + 1,
        size: pageInfo?.pageSize ?? pageInfo?.size ?? params.size ?? 10,
        total: pageInfo?.totalRecords ?? pageInfo?.total ?? content.length,
        totalPages: pageInfo?.totalPages ?? 1,
      },
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



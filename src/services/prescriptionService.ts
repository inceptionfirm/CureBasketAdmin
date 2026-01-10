import { apiClient } from './apiClient';

// Prescription API Types based on actual backend structure
export interface PrescriptionMainAttribute {
  id?: number;
  name: string;
  scale?: string | null; // Dynamic - can be null, "list", "grams", "url", "minutes", etc.
  value?: string; // Optional - can be empty string or any value
  subAttributes?: PrescriptionSubAttribute[];
}

export interface PrescriptionSubAttribute {
  id?: number;
  name: string;
  value: string;
}

export interface Prescription {
  id: number;
  prescriptionNumber: string;
  itemType?: 'PRESCRIPTION';
  patientName: string;
  patientId?: string;
  doctorName: string;
  doctorId?: string;
  diagnosis?: string;
  note?: string;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DISPENSED' | 'EXPIRED';
  prescriptionDate?: string;
  mainAttributes?: PrescriptionMainAttribute[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PrescriptionListParams {
  itemType?: 'PRESCRIPTION';
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DISPENSED' | 'EXPIRED';
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PrescriptionListResponse {
  prescriptions: Prescription[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

class PrescriptionService {
  private baseEndpoint = '/prescriptions';

  // 11. Create New Prescription
  // POST /prescriptions/add-prescription
  // Backend is fully dynamic - accepts any fields and mainAttributes structure
  async createPrescription(prescriptionData: {
    prescriptionNumber: string;
    itemType?: 'PRESCRIPTION';
    patientName: string;
    patientId?: string;
    doctorName: string;
    doctorId?: string;
    diagnosis?: string;
    note?: string;
    status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DISPENSED' | 'EXPIRED';
    priority?: 'HIGH' | 'MEDIUM' | 'LOW';
    prescriptionDate?: string;
    mainAttributes?: Array<{
      id?: number;
      name: string;
      scale?: string | null;
      value?: string;
      subAttributes?: Array<{
        id?: number;
        name: string;
        value: string;
      }>;
    }>;
    [key: string]: any; // Allow any additional dynamic fields
  }): Promise<{ success: boolean; message?: string; data?: Prescription }> {
    const response = await apiClient.post<Prescription>(`${this.baseEndpoint}/add-prescription`, prescriptionData);

    if (!response.success) {
      throw new Error(response.error || response.message || 'Failed to create prescription');
    }

    return {
      success: true,
      message: response.message || 'Prescription created successfully',
      data: response.data as Prescription,
    };
  }

  // 12. Update Prescription
  // POST /prescriptions/update-prescription/{id}
  // Request body: Only the fields to update (single or multiple)
  // Backend is fully dynamic - accepts any fields and mainAttributes structure
  async updatePrescription(id: number, updates: Partial<{
    prescriptionNumber?: string;
    itemType?: 'PRESCRIPTION';
    patientName?: string;
    patientId?: string;
    doctorName?: string;
    doctorId?: string;
    diagnosis?: string;
    note?: string;
    status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DISPENSED' | 'EXPIRED';
    priority?: 'HIGH' | 'MEDIUM' | 'LOW';
    prescriptionDate?: string;
    mainAttributes?: Array<{
      id?: number;
      name: string;
      scale?: string | null;
      value?: string;
      subAttributes?: Array<{
        id?: number;
        name: string;
        value: string;
      }>;
    }>;
    [key: string]: any; // Allow any additional dynamic fields
  }>): Promise<{ success: boolean; message?: string; data?: Prescription }> {
    // Ensure ID is a valid number
    const prescriptionId = Number(id);
    if (isNaN(prescriptionId) || prescriptionId <= 0) {
      throw new Error(`Invalid prescription ID: ${id}`);
    }
    
    const response = await apiClient.post<Prescription>(`${this.baseEndpoint}/update-prescription/${prescriptionId}`, updates);

    if (!response.success) {
      throw new Error(response.error || response.message || 'Failed to update prescription');
    }

    return {
      success: true,
      message: response.message || 'Prescription updated successfully',
      data: response.data as Prescription,
    };
  }

  // 13. Get Prescription by ID
  async getPrescriptionById(id: number): Promise<Prescription> {
    const response = await apiClient.post<Prescription>(`${this.baseEndpoint}/get-prescription/${id}`);

    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch prescription');
    }

    return response.data as Prescription;
  }

  // 14. Get All Prescriptions (with Filters)
  // GET /prescriptions/get-all?itemType=PRESCRIPTION
  async getAllPrescriptions(params: PrescriptionListParams = {}): Promise<PrescriptionListResponse> {
    const queryParams: Record<string, any> = {};
    
    // itemType is required (from curl)
    if (params.itemType) {
      queryParams.itemType = params.itemType;
    }
    
    // Optional filters
    if (params.status) queryParams.status = params.status;
    if (params.priority) queryParams.priority = params.priority;
    if (params.page !== undefined) queryParams.page = params.page;
    if (params.pageSize !== undefined) queryParams.pageSize = params.pageSize;
    if (params.sortBy) queryParams.sortBy = params.sortBy;
    if (params.sortOrder) queryParams.sortOrder = params.sortOrder;

    const response = await apiClient.get<any>(`${this.baseEndpoint}/get-all`, queryParams);

    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch prescriptions');
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
    } else if (data.prescriptions && Array.isArray(data.prescriptions)) {
      content = data.prescriptions;
    }
    
    const pageInfo = data.pageInfo || data.pagination || {};

    return {
      prescriptions: content,
      pagination: {
        page: (pageInfo?.pageNumber ?? pageInfo?.page ?? params.page ?? 0) + 1,
        pageSize: pageInfo?.pageSize ?? params.pageSize ?? 10,
        total: pageInfo?.totalRecords ?? pageInfo?.total ?? content.length,
        totalPages: pageInfo?.totalPages ?? 1,
      },
    };
  }

  // 15. Delete Prescription
  async deletePrescription(id: number): Promise<{ success: boolean; message?: string }> {
    const response = await apiClient.post(`${this.baseEndpoint}/delete/${id}`);

    if (!response.success) {
      throw new Error(response.error || response.message || 'Failed to delete prescription');
    }

    return {
      success: true,
      message: response.message || 'Prescription deleted successfully',
    };
  }
}

export const prescriptionService = new PrescriptionService();
export default prescriptionService;

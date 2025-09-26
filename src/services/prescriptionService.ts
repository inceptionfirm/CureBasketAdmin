import { apiClient } from './apiClient';
import { clientConfigManager } from '../config/clientConfig';

export interface Prescription {
  id: string;
  prescriptionNumber: string;
  patientId: string;
  patient: {
    id: string;
    name: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    address: string;
  };
  doctorId: string;
  doctor: {
    id: string;
    name: string;
    licenseNumber: string;
    specialization: string;
    phone: string;
  };
  medications: PrescriptionMedication[];
  diagnosis: string;
  symptoms: string[];
  notes: string;
  status: 'pending' | 'approved' | 'rejected' | 'dispensed' | 'expired';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  prescribedDate: string;
  expiryDate: string;
  dispensedDate?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
}

export interface PrescriptionMedication {
  id: string;
  medicineId: string;
  medicine: {
    id: string;
    name: string;
    manufacturer: string;
    form: string;
  };
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  instructions: string;
  refillsAllowed: number;
  refillsUsed: number;
}

export interface PrescriptionFilters {
  search?: string;
  status?: string;
  priority?: string;
  doctorId?: string;
  patientId?: string;
  prescribedDateFrom?: string;
  prescribedDateTo?: string;
}

export interface PrescriptionListParams {
  page?: number;
  pageSize?: number;
  filters?: PrescriptionFilters;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PrescriptionListResponse {
  prescriptions: Prescription[];
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface PrescriptionStats {
  totalPrescriptions: number;
  pendingPrescriptions: number;
  approvedPrescriptions: number;
  dispensedPrescriptions: number;
  expiredPrescriptions: number;
  urgentPrescriptions: number;
  totalMedications: number;
  averageProcessingTime: number;
}

class PrescriptionService {
  private baseUrl = '/api/prescriptions';

  async getPrescriptions(params: PrescriptionListParams = {}): Promise<PrescriptionListResponse> {
    const config = clientConfigManager.getConfig();
    if (!config.modules.prescriptions) {
      throw new Error('Prescriptions module is not enabled');
    }

    const response = await apiClient.get(this.baseUrl, { params });
    return response.data;
  }

  async getPrescription(id: string): Promise<Prescription> {
    const config = clientConfigManager.getConfig();
    if (!config.modules.prescriptions) {
      throw new Error('Prescriptions module is not enabled');
    }

    const response = await apiClient.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async createPrescription(prescriptionData: Partial<Prescription>): Promise<Prescription> {
    const config = clientConfigManager.getConfig();
    if (!config.modules.prescriptions) {
      throw new Error('Prescriptions module is not enabled');
    }

    const response = await apiClient.post(this.baseUrl, prescriptionData);
    return response.data;
  }

  async updatePrescription(id: string, prescriptionData: Partial<Prescription>): Promise<Prescription> {
    const config = clientConfigManager.getConfig();
    if (!config.modules.prescriptions) {
      throw new Error('Prescriptions module is not enabled');
    }

    const response = await apiClient.put(`${this.baseUrl}/${id}`, prescriptionData);
    return response.data;
  }

  async deletePrescription(id: string): Promise<void> {
    const config = clientConfigManager.getConfig();
    if (!config.modules.prescriptions) {
      throw new Error('Prescriptions module is not enabled');
    }

    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  async approvePrescription(id: string): Promise<Prescription> {
    const config = clientConfigManager.getConfig();
    if (!config.modules.prescriptions) {
      throw new Error('Prescriptions module is not enabled');
    }

    const response = await apiClient.post(`${this.baseUrl}/${id}/approve`);
    return response.data;
  }

  async rejectPrescription(id: string, reason: string): Promise<Prescription> {
    const config = clientConfigManager.getConfig();
    if (!config.modules.prescriptions) {
      throw new Error('Prescriptions module is not enabled');
    }

    const response = await apiClient.post(`${this.baseUrl}/${id}/reject`, { reason });
    return response.data;
  }

  async dispensePrescription(id: string): Promise<Prescription> {
    const config = clientConfigManager.getConfig();
    if (!config.modules.prescriptions) {
      throw new Error('Prescriptions module is not enabled');
    }

    const response = await apiClient.post(`${this.baseUrl}/${id}/dispense`);
    return response.data;
  }

  async bulkUpdatePrescriptions(ids: string[], updates: Partial<Prescription>): Promise<void> {
    const config = clientConfigManager.getConfig();
    if (!config.modules.prescriptions) {
      throw new Error('Prescriptions module is not enabled');
    }

    await apiClient.put(`${this.baseUrl}/bulk`, { ids, updates });
  }

  async bulkDeletePrescriptions(ids: string[]): Promise<void> {
    const config = clientConfigManager.getConfig();
    if (!config.modules.prescriptions) {
      throw new Error('Prescriptions module is not enabled');
    }

    await apiClient.delete(`${this.baseUrl}/bulk`, { data: { ids } });
  }

  async getPrescriptionStats(): Promise<PrescriptionStats> {
    const config = clientConfigManager.getConfig();
    if (!config.modules.prescriptions) {
      throw new Error('Prescriptions module is not enabled');
    }

    const response = await apiClient.get(`${this.baseUrl}/stats`);
    return response.data;
  }

  async searchPrescriptions(query: string): Promise<Prescription[]> {
    const config = clientConfigManager.getConfig();
    if (!config.modules.prescriptions) {
      throw new Error('Prescriptions module is not enabled');
    }

    const response = await apiClient.get(`${this.baseUrl}/search`, { 
      params: { q: query } 
    });
    return response.data;
  }
}

export const prescriptionService = new PrescriptionService();

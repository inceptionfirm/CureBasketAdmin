import { apiClient } from './apiClient';

export interface BusinessAddressPayload {
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  emailAddress: string;
  phoneNumber: string;
}

export interface BusinessContactPayload {
  email: string;
  mainPhone: string;
  secondaryPhone?: string;
  isEmailVerified: boolean;
  isMainPhoneVerified: boolean;
}

export interface BusinessPayload {
  name: string;
  tagline: string;
  description: string;
  isCategoryEnabled: boolean;
  isSupplier: boolean;
  isSeller: boolean;
  isActive: boolean;
  isDeleted: boolean;
  isVerified: boolean;
  uniqueId: string;
  domainName: string;
  password: string;
  address: BusinessAddressPayload;
  contact: BusinessContactPayload;
}

interface CreateBusinessResponse {
  message?: string;
  success?: boolean;
  data?: {
    businessId?: number;
    id?: number;
    [key: string]: any;
  };
  businessId?: number;
  id?: number;
}

class BusinessService {
  private endpoint = '/admin-penal/add-business';

  async createBusiness(payload: BusinessPayload): Promise<{ 
    success: boolean; 
    message: string;
    businessId?: number;
  }> {
    console.log('🚀 Calling createBusiness API:', this.endpoint, payload);
    
    const response = await apiClient.post<CreateBusinessResponse>(
      this.endpoint,
      payload
    );

    console.log('📥 Business creation response:', response);

    if (!response.success) {
      throw new Error(response.error || response.message || 'Failed to create business');
    }

    const responseData = response.data ?? {};
    const message =
      response.message ||
      (typeof responseData === 'object' && responseData && responseData.message) ||
      'Business created successfully';

    // Extract businessId from response (could be in data.businessId, data.id, or root level)
    const businessId = 
      responseData.businessId || 
      responseData.id || 
      (response as any).businessId || 
      (response as any).id;

    console.log('✅ Business created with ID:', businessId);

    return {
      success: true,
      message,
      businessId: businessId ? Number(businessId) : undefined,
    };
  }
}

export const businessService = new BusinessService();
export default businessService;


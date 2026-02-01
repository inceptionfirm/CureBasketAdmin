import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../config/apiEndpoints';

// Bank information configuration (admin-only)
export interface BankInfo {
  bankName: string;
  bankCode: string;
  bankAccountNumber: string;
  bankAccountName: string;
}

// Mail template configuration for a given status (e.g. APPROVE, DISPENSED)
export interface MailTemplate {
  fromMail: string;
  secretKey: string;
  title: string;
  content: string;
  status?: string;
}

// Contact us information (shown on website)
export interface ContactUsInfo {
  phone: number | string;
  email: string;
  address: string;
  pincode: string;
}

class MetadataService {
  /**
   * Get currently configured bank info
   */
  async getBankInfo(): Promise<BankInfo | null> {
    const response = await apiClient.get<BankInfo | null>(
      API_ENDPOINTS.metadata.getBankInfo
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to load bank info');
    }

    // Some backends may return null/empty when not configured yet
    return (response.data as BankInfo | null) ?? null;
  }

  /**
   * Configure / update bank information
   */
  async configureBankInfo(payload: BankInfo): Promise<{ success: boolean; message?: string }> {
    const response = await apiClient.post(
      API_ENDPOINTS.metadata.configureBankInfo,
      payload
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to save bank info');
    }

    return {
      success: true,
      message: response.message || 'Bank info updated successfully',
    };
  }

  /**
   * Get all configured mail templates
   */
  async getMailInfo(): Promise<MailTemplate[] | any> {
    const response = await apiClient.get<any>(
      API_ENDPOINTS.metadata.getMailInfo
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to load mail templates');
    }

    return response.data;
  }

  /**
   * Configure mail template for a given status (e.g. APPROVE, DISPENSED)
   */
  async configureMailInfo(
    status: string,
    payload: MailTemplate
  ): Promise<{ success: boolean; message?: string }> {
    const response = await apiClient.post(
      API_ENDPOINTS.metadata.configureMailInfo(status),
      payload
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to save mail template');
    }

    return {
      success: true,
      message: response.message || 'Mail template updated successfully',
    };
  }

  /**
   * Get currently configured contact us information
   */
  async getContactUsInfo(): Promise<ContactUsInfo | null> {
    try {
      const response = await apiClient.get<ContactUsInfo | null>(
        API_ENDPOINTS.metadata.getContactUsInfo
      );

      if (!response.success) {
        // If it's a "not found", "no data", or CORS error, return null instead of throwing
        // This allows the UI to still be editable for first-time setup
        const errorMessage = response.error || '';
        if (
          errorMessage.includes('not found') ||
          errorMessage.includes('No Static Resource Found') ||
          errorMessage.includes('404') ||
          errorMessage.includes('Failed to fetch') ||
          errorMessage.includes('CORS') ||
          errorMessage.includes('NetworkError')
        ) {
          // CORS or not found - return null to allow editing
          console.warn('Contact us info GET failed (CORS/not found), but POST may still work:', errorMessage);
          return null;
        }
        throw new Error(response.error || 'Failed to load contact us info');
      }

      // Some backends may return null/empty when not configured yet
      return (response.data as ContactUsInfo | null) ?? null;
    } catch (error) {
      // Catch network errors (CORS, fetch failures, etc.)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (
        errorMessage.includes('Failed to fetch') ||
        errorMessage.includes('CORS') ||
        errorMessage.includes('NetworkError') ||
        errorMessage.includes('Network request failed')
      ) {
        // CORS error - return null to allow editing (POST might still work)
        console.warn('Contact us info GET failed with network/CORS error, but POST may still work:', errorMessage);
        return null;
      }
      // Re-throw other errors
      throw error;
    }
  }

  /**
   * Configure / update contact us information (shown on website)
   */
  async configureContactUsInfo(payload: ContactUsInfo): Promise<{ success: boolean; message?: string }> {
    // Ensure phone is a number if it's a string
    const formattedPayload = {
      ...payload,
      phone: typeof payload.phone === 'string' ? Number(payload.phone) : payload.phone,
    };

    const response = await apiClient.post(
      API_ENDPOINTS.metadata.configureContactUsInfo,
      formattedPayload
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to save contact us info');
    }

    return {
      success: true,
      message: response.message || 'Contact us info updated successfully',
    };
  }
}

export const metadataService = new MetadataService();
export default metadataService;


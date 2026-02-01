// File Upload Service - Common file upload functionality for Banner, Blog, Category, Prescription
// Compatible with Java MultiPartFile backend

import { apiClient } from './apiClient';

// Backend accepts: PRODUCT, BLOG, PRESCRIPTION, MEDICINE, BANNER, ABOUT_US, BANK_INFO, MAIL_INFO
export type ItemType = 'BANNER' | 'BLOG' | 'PRESCRIPTION' | 'PRODUCT' | 'MEDICINE' | 'ABOUT_US' | 'BANK_INFO' | 'MAIL_INFO';
export type DocumentType = string; // e.g., 'profilePic', 'CoverPagePic', 'thumbnail', 'IMAGE', 'THUMBNAIL', 'DOCUMENT'

export interface FileUploadOptions {
  itemId: number;
  itemType: ItemType;
  files: File[];
  docTypes?: DocumentType[]; // Optional: CSV format will be created from this array
  isCategory?: boolean; // For category-specific uploads
}

export interface FileUploadResponse {
  success: boolean;
  message?: string;
  data?: {
    fileIds?: number[];
    fileUrls?: string[];
    [key: string]: any;
  };
}

export interface FileDeleteResponse {
  success: boolean;
  message?: string;
}

class FileUploadService {
  private catalogBaseEndpoint = '/catalog';
  private medicineBaseEndpoint = '/medicines';

  /**
   * Upload files for Banner, Blog, Category, Prescription
   * Uses the common catalog upload endpoint: /catalog/upload/file/{itemId}
   * 
   * @param options - Upload options including itemId, itemType, files, and docTypes
   * @returns Promise with upload response
   * 
   * @example
   * // Upload banner images with document types
   * await fileUploadService.uploadFiles({
   *   itemId: 37,
   *   itemType: 'BANNER',
   *   files: [file1, file2],
   *   docTypes: ['profilePic', 'CoverPagePic'] // Optional
   * });
   * 
   * // Upload without docTypes (docType field won't be sent)
   * await fileUploadService.uploadFiles({
   *   itemId: 37,
   *   itemType: 'PRESCRIPTION',
   *   files: [file1, file2]
   * });
   */
  async uploadFiles(options: FileUploadOptions): Promise<FileUploadResponse> {
    const { itemId, itemType, files, docTypes, isCategory } = options;

    if (!files || files.length === 0) {
      throw new Error('At least one file is required');
    }

    console.log(`📤 Uploading ${files.length} file(s) for ${itemType} (ID: ${itemId})`);

    // Create FormData (compatible with Java MultiPartFile)
    const formData = new FormData();

    // Append all files to 'files' array
    // Backend expects files as an array
    files.forEach((file, index) => {
      formData.append('file', file);
      console.log(`  📎 File ${index + 1}: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
    });

    // Append itemType
    formData.append('itemType', itemType);

    // Append documentType as CSV (always send, even if empty - matches curl format)
    // Format: "file1, file2" (with space after comma as per curl example)
    // Backend expects documentType field to always be present
    let documentTypeCSV = '';
    if (docTypes && docTypes.length > 0) {
      // Validate that docTypes length matches files length
      if (docTypes.length !== files.length) {
        console.warn(`⚠️ Warning: docTypes length (${docTypes.length}) doesn't match files length (${files.length}). Using first ${Math.min(docTypes.length, files.length)} docTypes.`);
      }

      // Create CSV string from docTypes array with space after comma (matches curl: "file1, file2")
      documentTypeCSV = docTypes.slice(0, files.length).join(', ');
    }
    // Always send documentType field (empty string if no docTypes provided)
    formData.append('documentType', documentTypeCSV);
    console.log(`  🏷️  Document Types: ${documentTypeCSV || '(empty - backend will use defaults)'}`);

    // Append isCategory if provided (for category-specific uploads)
    if (isCategory !== undefined) {
      formData.append('isCategory', isCategory.toString());
      console.log(`  📁 Is Category: ${isCategory}`);
    }

    // Also append forCategory if isCategory is true (backend might expect this parameter)
    if (isCategory === true) {
      formData.append('forCategory', 'true');
      console.log(`  📁 For Category: true`);
    }

    // Make the request using apiClient (it handles FormData automatically)
    const endpoint = `${this.catalogBaseEndpoint}/upload/file/${itemId}`;
    console.log(`  🔗 Endpoint: ${endpoint}`);

    try {
      const response = await apiClient.post<any>(endpoint, formData);
      console.log('✅ File upload response:', response);

      if (!response.success) {
        console.error('❌ File upload failed:', response.error, response.message);
        throw new Error(response.error || response.message || 'Failed to upload files');
      }

      return {
        success: true,
        message: response.message || 'Files uploaded successfully',
        data: response.data,
      };
    } catch (error) {
      console.error('❌ File upload error:', error);
      throw error;
    }
  }

  /**
   * Upload file for Medicine (uses separate endpoint)
   * Medicine uses: /medicines/image/upload/{itemId}
   * 
   * @param itemId - Medicine ID
   * @param file - Single file to upload
   * @returns Promise with upload response
   * 
   * @example
   * await fileUploadService.uploadMedicineImage(43, imageFile);
   */
  async uploadMedicineImage(itemId: number, file: File): Promise<FileUploadResponse> {
    console.log(`📤 Uploading image for Medicine (ID: ${itemId})`);
    console.log(`  📎 File: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);

    const formData = new FormData();
    formData.append('file', file);

    const endpoint = `${this.medicineBaseEndpoint}/image/upload/${itemId}`;
    console.log(`  🔗 Endpoint: ${endpoint}`);

    try {
      const response = await apiClient.post<any>(endpoint, formData);
      console.log('✅ Medicine image upload response:', response);

      if (!response.success) {
        console.error('❌ Medicine image upload failed:', response.error, response.message);
        throw new Error(response.error || response.message || 'Failed to upload medicine image');
      }

      return {
        success: true,
        message: response.message || 'Medicine image uploaded successfully',
        data: response.data,
      };
    } catch (error) {
      console.error('❌ Medicine image upload error:', error);
      throw error;
    }
  }

  /**
   * Delete file (common endpoint for all item types)
   * Uses: /catalog/delete/file?fileId={fileId}
   * 
   * @param fileId - File ID to delete
   * @returns Promise with delete response
   * 
   * @example
   * await fileUploadService.deleteFile(123);
   */
  async deleteFile(fileId: number): Promise<FileDeleteResponse> {
    console.log(`🗑️  Deleting file (ID: ${fileId})`);

    // POST request with query parameter (as per backend API)
    const endpoint = `${this.catalogBaseEndpoint}/delete/file?fileId=${fileId}`;

    try {
      const response = await apiClient.post<any>(endpoint, {});
      console.log('✅ File delete response:', response);

      if (!response.success) {
        console.error('❌ File delete failed:', response.error, response.message);
        throw new Error(response.error || response.message || 'Failed to delete file');
      }

      return {
        success: true,
        message: response.message || 'File deleted successfully',
      };
    } catch (error) {
      console.error('❌ File delete error:', error);
      throw error;
    }
  }

  /**
   * Helper method to upload banner image(s)
   * 
   * @param bannerId - Banner ID
   * @param files - Array of image files
   * @param docTypes - Optional document types (e.g., ['profilePic', 'CoverPagePic'])
   * @returns Promise with upload response
   */
  async uploadBannerFiles(
    bannerId: number,
    files: File[],
    docTypes?: DocumentType[]
  ): Promise<FileUploadResponse> {
    return this.uploadFiles({
      itemId: bannerId,
      itemType: 'BANNER',
      files,
      docTypes,
    });
  }

  /**
   * Helper method to upload blog image(s)
   * 
   * @param blogId - Blog ID
   * @param files - Array of image files
   * @param docTypes - Optional document types (e.g., ['thumbnail', 'featuredImage'])
   * @returns Promise with upload response
   */
  async uploadBlogFiles(
    blogId: number,
    files: File[],
    docTypes?: DocumentType[]
  ): Promise<FileUploadResponse> {
    return this.uploadFiles({
      itemId: blogId,
      itemType: 'BLOG',
      files,
      docTypes,
    });
  }

  /**
   * Helper method to upload category image(s)
   * Categories are not catalog items, so we need to use a different approach
   * Uses catalogService.uploadFiles with forCategory: true
   * 
   * @param categoryId - Category ID
   * @param files - Array of image files
   * @param docTypes - Optional document types
   * @returns Promise with upload response
   */
  async uploadCategoryFiles(
    categoryId: number,
    files: File[],
    docTypes?: DocumentType[]
  ): Promise<FileUploadResponse> {
    // Import catalogService dynamically to avoid circular dependency
    const { catalogService } = await import('./catalogService');

    // Use catalogService.uploadFiles with forCategory: true
    // This tells the backend to associate files with a category, not a catalog item
    const documentTypes = (docTypes && docTypes.length > 0)
      ? docTypes.map(dt => dt.toUpperCase() as 'IMAGE' | 'THUMBNAIL' | 'DOCUMENT')
      : ['IMAGE'];

    const result = await catalogService.uploadFiles(
      categoryId,
      files,
      'PRODUCT', // itemType must be PRODUCT or SERVICE
      documentTypes as ('IMAGE' | 'THUMBNAIL' | 'DOCUMENT')[],
      true // forCategory: true - tells backend this is for a category
    );

    return {
      success: result.success,
      message: result.message,
      data: {},
    };
  }

  /**
   * Helper method to upload prescription file(s)
   * 
   * @param prescriptionId - Prescription ID
   * @param files - Array of files (can be images or documents)
   * @param docTypes - Optional document types
   * @returns Promise with upload response
   */
  async uploadPrescriptionFiles(
    prescriptionId: number,
    files: File[],
    docTypes?: DocumentType[]
  ): Promise<FileUploadResponse> {
    return this.uploadFiles({
      itemId: prescriptionId,
      itemType: 'PRESCRIPTION',
      files,
      docTypes,
    });
  }
}

// Export singleton instance
export const fileUploadService = new FileUploadService();
export default fileUploadService;

/**
 * Centralized Service Exports
 * 
 * This file provides a single entry point for all services.
 * Use the unified services for new code, old services are kept for backward compatibility.
 */

// Unified Services (Recommended - Optimized & Dynamic)
export {
  unifiedBannerService as bannerService,
  unifiedBlogService as blogService,
  unifiedPrescriptionService as prescriptionService,
  unifiedMedicineService as medicineService,
  unifiedCatalogService as catalogService,
  type Banner,
  type Blog,
  type Prescription,
  type Medicine,
  type CatalogItem,
  type Category,
} from './unifiedService';

// Base Service (for creating custom services)
export { BaseService } from './base/BaseService';
export type { ServiceConfig } from './base/BaseService';

// API Endpoints Config
export { API_ENDPOINTS } from '../config/apiEndpoints';
export type { PaginationParams, ApiResponse, ListResponse } from '../config/apiEndpoints';

// Legacy Services (for backward compatibility)
// These will be deprecated in future versions
export { bannerService as legacyBannerService } from './bannerService';
export { blogService as legacyBlogService } from './blogService';
export { prescriptionService as legacyPrescriptionService } from './prescriptionService';
export { medicineService as legacyMedicineService } from './modules/medicineService';
export { catalogService as legacyCatalogService } from './catalogService';

// Other Services
export { userService } from './userService';
export { authService } from './authService';
export { permissionService } from './permissionService';
export { roleService } from './roleService';
export { categoryService } from './categoryService';
export { businessService } from './businessService';

// API Client
export { apiClient } from './apiClient';

// Default export with all services
export default {
  // Unified Services (Recommended)
  banner: () => import('./unifiedService').then(m => m.unifiedBannerService),
  blog: () => import('./unifiedService').then(m => m.unifiedBlogService),
  prescription: () => import('./unifiedService').then(m => m.unifiedPrescriptionService),
  medicine: () => import('./unifiedService').then(m => m.unifiedMedicineService),
  catalog: () => import('./unifiedService').then(m => m.unifiedCatalogService),
  
  // Other Services
  user: () => import('./userService').then(m => m.userService),
  auth: () => import('./authService').then(m => m.authService),
  permission: () => import('./permissionService').then(m => m.permissionService),
  role: () => import('./roleService').then(m => m.roleService),
  category: () => import('./categoryService').then(m => m.categoryService),
  business: () => import('./businessService').then(m => m.businessService),
};


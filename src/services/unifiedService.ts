/**
 * Unified Service - All APIs in one optimized, dynamic file
 * Uses BaseService for common operations and centralized endpoints
 */
import { BaseService } from './base/BaseService';
import { API_ENDPOINTS, PaginationParams } from '../config/apiEndpoints';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface Banner {
  id: number;
  categoryId?: number;
  itemName: string;
  itemHeading: string;
  itemDescription?: string;
  position: 'TOP' | 'MIDDLE' | 'BOTTOM' | 'SIDEBAR' | 'POPUP';
  type: 'PROMOTIONAL' | 'ANNOUNCEMENT' | 'ADVERTISEMENT' | 'NOTIFICATION';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  startDate?: string;
  endDate?: string;
  active: boolean;
  mainAttributes?: any[];
}

export interface Blog {
  id: number;
  categoryId?: number;
  itemName: string;
  itemHeading: string;
  itemDescription?: string;
  author?: string;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  tags?: string[];
  publishDate?: string;
  active: boolean;
  mainAttributes?: any[];
}

export interface Prescription {
  id: number;
  prescriptionNumber: string;
  patientName: string;
  patientId?: string;
  doctorName: string;
  doctorId?: string;
  diagnosis?: string;
  note?: string;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DISPENSED' | 'EXPIRED';
  prescriptionDate?: string;
  mainAttributes?: any[];
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
  countryOfOrigin?: string;
}

export interface CatalogItem {
  id: number;
  categoryId?: number;
  itemName: string;
  itemHeading?: string;
  itemDescription?: string;
  itemPrice?: number;
  itemUnits?: number;
  active?: boolean;
  mainAttributes?: any[];
}

export interface Category {
  id: number;
  categoryName: string;
  categoryDescription?: string;
  itemType?: 'PRODUCT' | 'SERVICE' | 'BLOG' | 'BANNER';
  state?: 'ACTIVE' | 'INACTIVE';
}

// ============================================================================
// SERVICE CLASSES
// ============================================================================

class BannerService extends BaseService<Banner> {
  constructor() {
    super({ baseEndpoint: '/banner', enableLogging: true });
  }

  async createBanner(data: Partial<Banner>) {
    return this.create(API_ENDPOINTS.banner.add, data, 'banner');
  }

  async updateBanner(id: number, data: Partial<Banner>) {
    return this.update(API_ENDPOINTS.banner.update(id), data, 'banner');
  }

  async getBannerById(id: number) {
    return this.getById(API_ENDPOINTS.banner.getById(id), 'banner');
  }

  async getAllBanners(params: PaginationParams & { itemType?: 'BANNER'; status?: 'ACTIVE' | 'INACTIVE'; position?: string } = {}) {
    const queryParams: Record<string, any> = { ...params };
    return this.getAll(API_ENDPOINTS.banner.getAll, queryParams, 'banners');
  }

  async deleteBanner(id: number) {
    return this.delete(API_ENDPOINTS.banner.delete(id), 'banner');
  }
}

class BlogService extends BaseService<Blog> {
  constructor() {
    super({ baseEndpoint: '/blog', enableLogging: true });
  }

  async createBlog(data: Partial<Blog>) {
    return this.create(API_ENDPOINTS.blog.add, data, 'blog');
  }

  async updateBlog(id: number, data: Partial<Blog>) {
    return this.update(API_ENDPOINTS.blog.update(id), data, 'blog');
  }

  async getBlogById(id: number) {
    return this.getById(API_ENDPOINTS.blog.getById(id), 'blog');
  }

  async getAllBlogs(userType: string = 'ADMIN', params: PaginationParams & { itemType?: 'BLOG'; status?: 'ACTIVE' | 'INACTIVE'; priority?: string } = {}) {
    const queryParams: Record<string, any> = { ...params };
    return this.getAll(API_ENDPOINTS.blog.getAll(userType), queryParams, 'blogs');
  }

  async deleteBlog(id: number) {
    return this.delete(API_ENDPOINTS.blog.delete(id), 'blog');
  }
}

class PrescriptionService extends BaseService<Prescription> {
  constructor() {
    super({ baseEndpoint: '/prescriptions', enableLogging: true });
  }

  async createPrescription(data: Partial<Prescription>) {
    return this.create(API_ENDPOINTS.prescription.add, data, 'prescription');
  }

  async updatePrescription(id: number, data: Partial<Prescription>) {
    return this.update(API_ENDPOINTS.prescription.update(id), data, 'prescription');
  }

  async getPrescriptionById(id: number) {
    return this.getById(API_ENDPOINTS.prescription.getById(id), 'prescription');
  }

  async getAllPrescriptions(params: PaginationParams & { itemType?: 'PRESCRIPTION'; status?: string; priority?: string } = {}) {
    const queryParams: Record<string, any> = { ...params };
    return this.getAll(API_ENDPOINTS.prescription.getAll, queryParams, 'prescriptions');
  }

  async deletePrescription(id: number) {
    return this.delete(API_ENDPOINTS.prescription.delete(id), 'prescription');
  }
}

class MedicineService extends BaseService<Medicine> {
  constructor() {
    super({ baseEndpoint: '/medicines', enableLogging: true });
  }

  async createMedicine(data: Partial<Medicine>) {
    return this.create(API_ENDPOINTS.medicine.create, data, 'medicine');
  }

  async updateMedicine(id: number, data: Partial<Medicine>) {
    return this.update(API_ENDPOINTS.medicine.update(id), data, 'medicine');
  }

  async getMedicineById(id: number) {
    return this.get<Medicine>(API_ENDPOINTS.medicine.getById(id), undefined, 'medicine');
  }

  async getAllMedicines(params: PaginationParams & { sortBy?: string } = {}) {
    const queryParams: Record<string, any> = { ...params };
    return this.getAll(API_ENDPOINTS.medicine.getAll, queryParams, 'medicines');
  }

  async deleteMedicine(id: number) {
    return this.get(API_ENDPOINTS.medicine.delete(id), undefined, 'medicine deletion');
  }

  async getAllManufacturers() {
    return this.extractArray<string>(await this.get<string[]>(API_ENDPOINTS.medicine.getAllManufacturers, undefined, 'manufacturers'));
  }

  async getAllMedicineForms() {
    return this.extractArray<string>(await this.get<string[]>(API_ENDPOINTS.medicine.getAllMedicineForms, undefined, 'medicine forms'));
  }
}

class CatalogService extends BaseService<CatalogItem> {
  constructor() {
    super({ baseEndpoint: '/catalog', enableLogging: true });
  }

  // Items
  async createCatalogItem(itemType: 'PRODUCT' | 'SERVICE', data: Partial<CatalogItem>) {
    return this.create(API_ENDPOINTS.catalog.addItem(itemType), data, 'catalog item');
  }

  async filterCatalogItems(itemType: 'PRODUCT' | 'SERVICE', filters: { categoryId?: number; status?: boolean }) {
    const queryParams: Record<string, any> = { ...filters };
    return this.extractArray<CatalogItem>(await this.get<CatalogItem[]>(API_ENDPOINTS.catalog.filter(itemType), queryParams, 'catalog items'));
  }

  // Attributes
  async addMainAttributes(itemId: number, attributes: any[]) {
    return this.post(API_ENDPOINTS.catalog.addMainAttr(itemId), attributes, 'add main attributes');
  }

  async addSubAttributes(itemId: number, mainAttrId: number, attributes: any[]) {
    return this.post(API_ENDPOINTS.catalog.addSubAttr(itemId, mainAttrId), attributes, 'add sub attributes');
  }

  async updateBulkAttributes(itemId: number, attributes: any[]) {
    return this.post(API_ENDPOINTS.catalog.updateBulkAttr(itemId), attributes, 'update bulk attributes');
  }

  async updateMainAttribute(attribute: any) {
    return this.post(API_ENDPOINTS.catalog.updateMainAttr, attribute, 'update main attribute');
  }

  async updateSubAttribute(attribute: any) {
    return this.post(API_ENDPOINTS.catalog.updateSubAttr, attribute, 'update sub attribute');
  }

  async deleteMainAttribute(id: number) {
    return this.delete(API_ENDPOINTS.catalog.deleteMainAttr(id), 'main attribute');
  }

  async deleteSubAttribute(id: number) {
    return this.delete(API_ENDPOINTS.catalog.deleteSubAttr(id), 'sub attribute');
  }

  // Files
  async uploadFiles(itemId: number, files: File[], itemType: 'PRODUCT' | 'SERVICE', documentTypes: string[], forCategory: boolean = false) {
    const formData = new FormData();
    files.forEach(file => formData.append('file', file));
    formData.append('itemType', itemType);
    documentTypes.forEach(type => formData.append('documentType', type));
    formData.append('forCategory', forCategory.toString());
    return this.post(API_ENDPOINTS.catalog.uploadFile(itemId), formData, 'upload files');
  }

  async deleteFile(fileId: number) {
    return this.post(API_ENDPOINTS.catalog.deleteFile(fileId), undefined, 'delete file');
  }

  async deleteAllItemFiles(itemId: number) {
    return this.delete(API_ENDPOINTS.catalog.deleteItemFiles(itemId), 'all item files');
  }

  async deleteAllCategoryFiles(categoryId: number) {
    return this.delete(API_ENDPOINTS.catalog.deleteCategoryFiles(categoryId), 'all category files');
  }

  // Item Status
  async disableCatalogItem(itemId: number) {
    return this.post(API_ENDPOINTS.catalog.disableItem(itemId), undefined, 'disable catalog item');
  }

  async enableCatalogItem(itemId: number) {
    return this.post(API_ENDPOINTS.catalog.enableItem(itemId), undefined, 'enable catalog item');
  }

  async refreshCache(itemId: number) {
    return this.post(API_ENDPOINTS.catalog.refreshCache(itemId), undefined, 'refresh cache');
  }

  // Categories
  async getAllCategories(params: PaginationParams & { itemType?: string; status?: string; sortBy?: string; sortOrder?: string } = {}) {
    const queryParams: Record<string, any> = { ...params };
    return this.getAll(API_ENDPOINTS.catalog.categories, queryParams, 'categories');
  }

  async createCategory(data: Partial<Category>) {
    return this.create(API_ENDPOINTS.catalog.addCategory, data, 'category');
  }

  async updateCategory(categoryId: number, data: Partial<Category>) {
    return this.update(API_ENDPOINTS.catalog.updateCategory(categoryId), data, 'category');
  }

  async deleteCategory(categoryId: number) {
    return this.delete(API_ENDPOINTS.catalog.deleteCategory(categoryId), 'category');
  }

  async disableCategory(categoryId: number) {
    return this.post(API_ENDPOINTS.catalog.disableCategory(categoryId), undefined, 'disable category');
  }

  async enableCategory(categoryId: number) {
    return this.post(API_ENDPOINTS.catalog.enableCategory(categoryId), undefined, 'enable category');
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCES
// ============================================================================

export const unifiedBannerService = new BannerService();
export const unifiedBlogService = new BlogService();
export const unifiedPrescriptionService = new PrescriptionService();
export const unifiedMedicineService = new MedicineService();
export const unifiedCatalogService = new CatalogService();

// Export types
export type {
  Banner,
  Blog,
  Prescription,
  Medicine,
  CatalogItem,
  Category,
};

// Default exports for backward compatibility
export default {
  banner: unifiedBannerService,
  blog: unifiedBlogService,
  prescription: unifiedPrescriptionService,
  medicine: unifiedMedicineService,
  catalog: unifiedCatalogService,
};


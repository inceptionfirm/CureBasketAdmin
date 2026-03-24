/**
 * Centralized API Endpoints Configuration
 * All API endpoints are defined here for easy maintenance and updates
 */

export const API_ENDPOINTS = {
  // Auth endpoints
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
  },

  // User endpoints
  user: {
    getAll: '/user/getAll',
    getById: (id: string | number) => `/user/getById/${id}`,
    createAdmin: '/user/createAdmin',
    edit: (id: string | number) => `/user/edit/${id}`,
    delete: (id: string | number) => `/user/delete/${id}`,
  },

  // Banner endpoints
  banner: {
    add: '/banner/add-banner',
    update: (id: number) => `/banner/update-banner/${id}`,
    getById: (id: number) => `/banner/get-banner/${id}`,
    getAll: '/banner/get-all',
    delete: (id: number) => `/banner/delete/${id}`,
  },

  // Blog endpoints
  blog: {
    add: '/blog/add-blog',
    update: (id: number) => `/blog/update-blog/${id}`,
    getById: (id: number) => `/blog/get-blog/${id}`,
    getAll: (userType: string = 'ADMIN') => `/blog/get-all/${userType}`,
    delete: (id: number) => `/blog/delete/${id}`,
  },

  // Prescription endpoints
  prescription: {
    add: '/prescriptions/add-prescription',
    update: (id: number) => `/prescriptions/update-prescription/${id}`,
    getById: (id: number) => `/prescriptions/get-prescription/${id}`,
    getAll: '/prescriptions/get-all',
    delete: (id: number) => `/prescriptions/delete/${id}`,
  },

  // Cart / Order endpoints (CartDTOs - API not live yet)
  cart: {
    getByCustomer: (customerId: number) => `/cart/get-by-customer/${customerId}`,
    getAll: '/cart/get-all',
    getById: (id: number) => `/cart/get/${id}`,
    updateStatus: (id: number) => `/cart/update-status/${id}`,
  },

  // Customer endpoints (for cart lookup by name/mobile; view-cart uses logged-in user's token)
  customer: {
    search: '/customer/search',
    viewCart: '/customer/cart/view-cart',
  },

  // Medicine endpoints
  medicine: {
    create: '/medicines/createMedicine',
    getAll: '/medicines/getAllMedicines',
    getById: (id: number) => `/medicines/getMedicineById/${id}`,
    update: (id: number) => `/medicines/updateMedicine/${id}`,
    delete: (id: number) => `/medicines/deleteMedicine/${id}`,
    getAllManufacturers: '/medicines/getAllManufacturers',
    getAllMedicineForms: '/medicines/getAllMedicineForms',
    // Image endpoints
    uploadImage: (id: number) => `/medicines/image/upload/${id}`,
    getImage: (id: number) => `/medicines/image/${id}`, // Try this endpoint for getting image
  },

  // Catalog endpoints
  catalog: {
    // Items
    addItem: (itemType: string) => `/catalog/add-item/${itemType}`,
    filter: (itemType: string) => `/catalog/filter/${itemType}`,

    // Attributes
    addMainAttr: (itemId: number) => `/catalog/add/main-attr/${itemId}`,
    addSubAttr: (itemId: number, mainAttrId: number) => `/catalog/add/sub-attr/${itemId}/${mainAttrId}`,
    updateBulkAttr: (itemId: number) => `/catalog/update/bulk-attr/${itemId}`,
    updateMainAttr: '/catalog/update/main-attr',
    updateSubAttr: '/catalog/update/sub-attr',
    deleteMainAttr: (id: number) => `/catalog/delete/main-attr/${id}`,
    deleteSubAttr: (id: number) => `/catalog/delete/sub-attr/${id}`,

    // Files
    uploadFile: (itemId: number) => `/catalog/upload/file/${itemId}`,
    deleteFile: (fileId: number) => `/catalog/delete/file?fileId=${fileId}`,
    deleteItemFiles: (itemId: number) => `/catalog/delete/item/files/${itemId}`,
    deleteCategoryFiles: (categoryId: number) => `/catalog/delete/category/files/${categoryId}`,

    // Item status
    disableItem: (itemId: number) => `/catalog/disable/item/${itemId}`,
    enableItem: (itemId: number) => `/catalog/enable/item/${itemId}`,
    refreshCache: (itemId: number) => `/catalog/refresh/${itemId}`,

    // Categories
    categories: '/catalog/categories',
    addCategory: '/catalog/add-category',
    updateCategory: (categoryId: number) => `/catalog/update-category/${categoryId}`,
    deleteCategory: (categoryId: number) => `/catalog/delete-category/${categoryId}`,
    disableCategory: (categoryId: number) => `/catalog/disable/category/${categoryId}`,
    enableCategory: (categoryId: number) => `/catalog/enable/category/${categoryId}`,
  },

  // Permission endpoints
  permission: {
    create: '/permission/createPermission',
    update: '/permission/updatePermission',
    delete: '/permission/deletePermission',
    getAllAtOnce: '/permission/getAllPermissionsAtOnce',
    getAllInPages: '/permission/getAllPermissionsInPages',
  },

  // Permission Group endpoints
  permissionGroup: {
    create: '/permissionGroup/createPermissionGroup',
    update: '/permissionGroup/updatePermissionGroup',
    delete: '/permissionGroup/deletePermissionGroup',
    getAll: '/permissionGroup/getAllPermissionGroup',
    getAllWithPermissions: '/permissionGroup/getAllPermissionGroupWithPermissions',
  },

  // Role endpoints
  role: {
    create: '/role/createRole',
    update: '/role/updateRole',
    delete: '/role/deleteRole',
    getAll: '/role/getAllRoles',
  },

  // Business endpoints
  business: {
    create: '/admin-penal/add-business',
    update: (id: number) => `/admin-penal/update-business/${id}`,
    getById: (id: number) => `/admin-penal/get-business/${id}`,
    getAll: '/admin-penal/get-all-businesses',
    delete: (id: number) => `/admin-penal/delete-business/${id}`,
  },

  // Metadata / configuration endpoints (admin-only)
  metadata: {
    // Bank information (used in payment emails etc.)
    configureBankInfo: '/metadata/configure/bank-info',
    getBankInfo: '/metadata/get/bank-info',

    // Mail templates for different statuses (e.g. APPROVE, DISPENSED)
    configureMailInfo: (status: string) => `/metadata/configure/mail-info/${status}`,
    getMailInfo: '/mail-info',

    // Contact us information (shown on website)
    configureContactUsInfo: '/metadata/configure/contact-us',
    getContactUsInfo: '/metadata/get/contact-us',

    // Order shipping config (shipping fee, discount range, tax rate)
    configureOrderShippingConfig: '/metadata/configure/order-shipping-config',
    getOrderShippingConfig: '/metadata/get/order-shipping-config',
  },
} as const;

/**
 * API Request Methods
 */
export enum ApiMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
}

/**
 * Common API Response Structure
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Pagination Parameters
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  size?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC' | 'asc' | 'desc';
}

/**
 * Common List Response
 */
export interface ListResponse<T> {
  content?: T[];
  data?: T[];
  pageInfo?: {
    pageNumber: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
  };
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}


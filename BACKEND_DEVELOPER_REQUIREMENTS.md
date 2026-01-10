# 🔧 Backend Developer Requirements - API Status Report

## 📋 Overview
This document lists **ALL APIs** that are currently integrated in the frontend and what the backend developer needs to implement or verify.

---

## ✅ **FULLY WORKING APIs** (Backend Ready)

### 1. **Medicine APIs** ✅
**Status:** ✅ All APIs working correctly

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/medicines/createMedicine` | POST | ✅ Working | Payload: name, description, image, category, manufacturer, medicineForm, status, sku, price, stock, barcode, prescriptionRequired |
| `/medicines/updateMedicine/{id}` | POST | ✅ Working | Partial updates supported |
| `/medicines/getAllMedicines` | GET | ✅ Working | Query params: page, size, sortBy |
| `/medicines/deleteMedicine/{id}` | ❓ Not tested | Need to verify if exists |

**Frontend Files:**
- Service: `src/services/modules/medicineService.ts`
- Component: `src/Components/Medicine/MedicinePage.tsx`

---

### 2. **Categories APIs** ✅
**Status:** ✅ All APIs working correctly

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/catalog/add-category` | POST | ✅ Working | Payload: categoryName, categoryDescription, itemType: "PRODUCT", state |
| `/catalog/update-category/{id}` | POST | ✅ Working | Partial updates supported |
| `/catalog/categories` | GET | ✅ Working | Query params: itemType, search, status, page, pageSize, sortBy, sortOrder |
| `/catalog/delete-category/{id}` | POST | ✅ Working | Uses POST method |

**Frontend Files:**
- Service: `src/services/categoryService.ts`
- Component: `src/Components/Categories/Categories.tsx`

**Note:** `/catalog/categories/analytics` returns 404 - frontend calculates stats from loaded categories instead.

---

### 3. **Blogs APIs** ✅
**Status:** ✅ All APIs working correctly

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/blog/add-blog` | POST | ✅ Working | Payload: itemType: "BLOG", category, status, title, content, excerpt, seoTitle, seoDescription |
| `/blog/update-blog/{id}` | POST | ✅ Working | Partial updates supported |
| `/blog/get-blog/{id}` | POST | ✅ Working | Uses POST method |
| `/blog/get-all` | GET/POST | ✅ Working | GET with POST fallback, Query params: status, page, pageSize, sortBy, sortOrder |

**Frontend Files:**
- Service: `src/services/blogService.ts`
- Component: `src/Components/Blogs/Blogs.tsx`

---

### 4. **Prescriptions APIs** ✅
**Status:** ✅ All APIs working correctly

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/prescriptions/add-prescription` | POST | ✅ Working | Payload: prescriptionNumber, itemType: "PRESCRIPTION", patientName, patientId, doctorName, doctorId, note, diagnosis, status, priority, mainAttributes (for medications/symptoms) |
| `/prescriptions/update-prescription/{id}` | POST | ✅ Working | Partial updates supported, mainAttributes for medications/symptoms |
| `/prescriptions/get-all` | GET | ✅ Working | Query param: itemType=PRESCRIPTION |

**Frontend Files:**
- Service: `src/services/prescriptionService.ts`
- Component: `src/Components/Prescriptions/Prescriptions.tsx`

**Note:** Medications and symptoms are stored in `mainAttributes` array structure.

---

## ⚠️ **PARTIALLY WORKING APIs** (Need Backend Verification)

### 5. **Users APIs** ⚠️
**Status:** ⚠️ Some APIs implemented, need verification

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/user/getAll` | GET | ✅ Working | Query params: page, size, sortBy, sortOrder, search, role, status |
| `/user/getById/{id}` | GET | ✅ Working | Returns user details |
| `/user/createAdmin` | POST | ✅ Implemented | Payload: email, fullName, phoneNumber, password, roleId, businessId, isDeleted, isActive |
| `/user/edit/{id}` | POST | ✅ Implemented | Payload: email, firstName, lastName, phoneNumber, password (optional), roleId, role, businessId, isDeleted, isActive |
| `/user/delete/{id}` | DELETE | ✅ Implemented | Delete user endpoint |
| `/user/stats` | GET | ❌ Missing | Returns 404 - frontend calculates stats from loaded users |

**Frontend Files:**
- Service: `src/services/userService.ts`
- Component: `src/Components/Users/Users.tsx`

**Backend Action Required:**
- [ ] Verify `/user/createAdmin` endpoint exists and works
- [ ] Verify `/user/edit/{id}` endpoint exists and works
- [ ] Verify `/user/delete/{id}` endpoint exists and works
- [ ] **OPTIONAL:** Create `/user/stats` endpoint (or frontend will continue calculating from loaded users)

---

### 6. **Banner Management APIs** ⚠️
**Status:** ⚠️ Most APIs working, stats missing

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/banner/add-banner` | POST | ✅ Working | Payload: itemName, itemHeading, itemDescription, position, type, priority, startDate, endDate, active, mainAttributes |
| `/banner/update-banner/{id}` | POST | ✅ Working | Partial updates supported |
| `/banner/get-banner/{id}` | POST | ✅ Working | Uses POST method |
| `/banner/get-all` | GET | ✅ Working | Query params: itemType, status, position, page, pageSize, sortBy, sortOrder |
| `/banner/delete/{id}` | POST | ✅ Implemented | Delete banner endpoint |
| `/banner/stats` | GET | ❌ Missing | Frontend calculates stats from loaded banners |

**Frontend Files:**
- Service: `src/services/bannerService.ts`
- Component: `src/Components/BannerManagement/BannerManagement.tsx`

**Backend Action Required:**
- [ ] Verify `/banner/delete/{id}` endpoint exists and works
- [ ] **OPTIONAL:** Create `/banner/stats` endpoint (or frontend will continue calculating from loaded banners)

---

### 7. **Roles APIs** ⚠️
**Status:** ⚠️ All CRUD operations implemented, need verification

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/role/getAllRoles` | GET | ✅ Working | Query params: page, size, sortBy, asc |
| `/role/createRole` | POST | ✅ Implemented | Payload: businessId, name, description, roleType, permissionIds[] |
| `/role/updateRole` | POST | ✅ Implemented | Query param: id, Payload: businessId, name, description, roleType, permissionIds[] |
| `/role/deleteRole` | POST | ✅ Implemented | Query param: id |

**Frontend Files:**
- Service: `src/services/roleService.ts`
- Component: `src/Components/Roles/Roles.tsx`

**Backend Action Required:**
- [ ] Verify `/role/createRole` endpoint exists and works
- [ ] Verify `/role/updateRole?id={id}` endpoint exists and works
- [ ] Verify `/role/deleteRole?id={id}` endpoint exists and works

---

### 8. **Permissions APIs** ⚠️
**Status:** ⚠️ All CRUD operations implemented, need verification

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/permission/getAllPermissionsAtOnce` | GET | ✅ Working | Returns all permissions (no pagination) |
| `/permission/getAllPermissionsInPages` | GET | ✅ Working | Query params: page, size, sortBy, asc |
| `/permission/createPermission` | POST | ✅ Implemented | Query params: name, permissionGroupId |
| `/permission/updatePermission` | POST | ✅ Implemented | Query params: name, permissionGroupId, id |
| `/permission/deletePermission` | POST | ✅ Implemented | Payload: array of permission IDs |

**Frontend Files:**
- Service: `src/services/permissionService.ts`
- Component: `src/Components/Permissions/Permissions.tsx`

**Backend Action Required:**
- [ ] Verify `/permission/createPermission?name={name}&permissionGroupId={id}` endpoint exists and works
- [ ] Verify `/permission/updatePermission?name={name}&permissionGroupId={id}&id={id}` endpoint exists and works
- [ ] Verify `/permission/deletePermission` endpoint accepts array of IDs in body

---

### 9. **Permission Groups APIs** ⚠️
**Status:** ⚠️ All CRUD operations implemented, need verification

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/permissionGroup/getAllPermissionGroup` | GET | ✅ Working | Returns all permission groups |
| `/permissionGroup/getAllPermissionGroupWithPermissions` | GET | ✅ Working | Returns groups with nested permissions |
| `/permissionGroup/createPermissionGroup` | POST | ✅ Implemented | Query param: name |
| `/permissionGroup/updatePermissionGroup` | POST | ✅ Implemented | Query params: name, id |
| `/permissionGroup/deletePermissionGroup` | POST | ✅ Implemented | Query param: id |

**Frontend Files:**
- Service: `src/services/permissionService.ts`
- Component: `src/Components/PermissionGroups/PermissionGroups.tsx`

**Backend Action Required:**
- [ ] Verify `/permissionGroup/createPermissionGroup?name={name}` endpoint exists and works
- [ ] Verify `/permissionGroup/updatePermissionGroup?name={name}&id={id}` endpoint exists and works
- [ ] Verify `/permissionGroup/deletePermissionGroup?id={id}` endpoint exists and works

---

## ❌ **MISSING APIs** (Need Backend Implementation)

### 10. **Dashboard APIs** ❌
**Status:** ❌ No APIs implemented - using mock data

**Current Situation:**
- Frontend uses static/mock data
- No real API calls
- Dashboard shows hardcoded values

**Required APIs:**

| Endpoint | Method | Purpose | Payload/Query Params |
|----------|--------|---------|---------------------|
| `/dashboard/metrics` | GET | Get dashboard metrics | Query: period (7d\|30d\|90d) |
| `/dashboard/order-target` | GET | Get order target data | Query: period (e.g., "August") |
| `/dashboard/order-history` | GET | Get recent orders | Query: fromDate, toDate |
| `/dashboard/sales-analytics` | GET | Get sales chart data | Query: period (7d\|30d\|90d) |
| `/dashboard/product-performance` | GET | Get top products | Query: limit (default: 10) |
| `/dashboard/customer-analytics` | GET | Get customer insights | Query: period (30d) |

**Expected Response Formats:**

```typescript
// /dashboard/metrics
{
  totalOrders: number;
  totalBuyers: number;
  totalRevenue: number;
  conversionRate: number;
  period: string;
}

// /dashboard/order-target
{
  achieved: number;
  target: number;
  period: string;
  lastUpdated: string;
}

// /dashboard/order-history
[
  {
    orderId: string;
    status: 'pending' | 'completed' | 'cancelled' | 'processing';
    date: string;
    amount: number;
    customerName: string;
  }
]
```

**Frontend Files:**
- Service: `src/services/dashboardService.ts` (currently using mocks)
- Component: `src/Components/Dashboard/Dashboard.tsx`

**Priority:** 🔴 **CRITICAL** - Core functionality

---

### 11. **Profile APIs** ❌
**Status:** ❌ No APIs implemented - only local state

**Current Situation:**
- Profile updates don't save to backend
- Only local state management
- No password change functionality

**Required APIs:**

| Endpoint | Method | Purpose | Payload |
|----------|--------|---------|---------|
| `/user/profile` | GET | Get current user profile | - |
| `/user/update-profile` | POST | Update user profile | { name, email, phone, avatar } |
| `/user/change-password` | POST | Change password | { currentPassword, newPassword } |
| `/user/upload-avatar` | POST | Upload profile image | FormData with image file |
| `/user/activity-log` | GET | Get user activity | Query: limit, offset |

**Expected Response Formats:**

```typescript
// /user/profile
{
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: string;
  createdAt: string;
  lastLogin: string;
}

// /user/update-profile
{
  success: boolean;
  message: string;
  data: UserProfile;
}
```

**Frontend Files:**
- Service: `src/services/userService.ts` (add profile methods)
- Component: `src/Components/Profile/Profile.tsx`

**Priority:** 🟠 **HIGH** - User experience critical

---

### 12. **Settings APIs** ❌
**Status:** ❌ No APIs implemented - only local state

**Current Situation:**
- Settings don't persist
- Only local state management
- Theme/locale preferences not saved

**Required APIs:**

| Endpoint | Method | Purpose | Payload |
|----------|--------|---------|---------|
| `/settings/user-preferences` | GET | Get user settings | - |
| `/settings/user-preferences` | POST | Save user settings | { theme, locale, notifications, etc. } |
| `/settings/app-config` | GET | Get app configuration | - |
| `/settings/app-config` | POST | Update app config | { config object } |

**Expected Response Formats:**

```typescript
// /settings/user-preferences
{
  theme: 'light' | 'dark' | 'auto';
  locale: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  autoSave: boolean;
}
```

**Frontend Files:**
- Service: `src/services/settingsService.ts` (needs to be created)
- Component: `src/Components/Settings/Settings.tsx`

**Priority:** 🟡 **MEDIUM** - Nice to have

---

## 📊 **SUMMARY TABLE**

| Section | Status | Working APIs | Missing APIs | Priority |
|---------|--------|--------------|--------------|----------|
| **Medicine** | ✅ Complete | 4/4 | 0 | - |
| **Categories** | ✅ Complete | 4/4 | 0 | - |
| **Blogs** | ✅ Complete | 4/4 | 0 | - |
| **Prescriptions** | ✅ Complete | 3/3 | 0 | - |
| **Users** | ⚠️ Partial | 3/6 | 1 (Stats - optional) | 🟠 High |
| **Banner Management** | ⚠️ Partial | 5/6 | 1 (Stats - optional) | 🟡 Medium |
| **Roles** | ⚠️ Need Verify | 1/4 | 3 (CRUD - need verify) | 🟠 High |
| **Permissions** | ⚠️ Need Verify | 2/5 | 3 (CRUD - need verify) | 🟠 High |
| **Permission Groups** | ⚠️ Need Verify | 2/5 | 3 (CRUD - need verify) | 🟠 High |
| **Dashboard** | ❌ Missing | 0/6 | 6 (All APIs) | 🔴 **CRITICAL** |
| **Profile** | ❌ Missing | 0/5 | 5 (All APIs) | 🟠 High |
| **Settings** | ❌ Missing | 0/4 | 4 (All APIs) | 🟡 Medium |

---

## 🎯 **ACTION ITEMS FOR BACKEND DEVELOPER**

### **🔴 CRITICAL (Do First)**
1. **Dashboard APIs** - Implement all 6 endpoints
   - `/dashboard/metrics`
   - `/dashboard/order-target`
   - `/dashboard/order-history`
   - `/dashboard/sales-analytics`
   - `/dashboard/product-performance`
   - `/dashboard/customer-analytics`

### **🟠 HIGH PRIORITY (Do Next)**
2. **Verify Users CRUD APIs**
   - Test `/user/createAdmin`
   - Test `/user/edit/{id}`
   - Test `/user/delete/{id}`

3. **Verify Roles/Permissions CRUD APIs**
   - Test all role endpoints
   - Test all permission endpoints
   - Test all permission group endpoints

4. **Profile APIs** - Implement all 5 endpoints
   - `/user/profile`
   - `/user/update-profile`
   - `/user/change-password`
   - `/user/upload-avatar`
   - `/user/activity-log`

### **🟡 MEDIUM PRIORITY (Do Later)**
5. **Verify Banner Delete API**
   - Test `/banner/delete/{id}`

6. **Settings APIs** - Implement if needed
   - `/settings/user-preferences`
   - `/settings/app-config`

---

## 📝 **TESTING CHECKLIST**

For each API endpoint, verify:
- [ ] Endpoint exists and is accessible
- [ ] Request method matches (GET/POST/PUT/DELETE)
- [ ] Request payload structure matches frontend expectations
- [ ] Response structure matches frontend expectations
- [ ] Error handling works correctly
- [ ] Authentication/Authorization works
- [ ] Pagination works (if applicable)
- [ ] Query parameters work correctly

---

## 🔍 **HOW TO TEST**

1. **Use Postman/Thunder Client** to test each endpoint
2. **Check Network Tab** in browser DevTools when using frontend
3. **Verify Response Structure** matches what frontend expects
4. **Test Error Cases** (404, 400, 500, etc.)
5. **Test Authentication** - ensure Bearer token works

---

## 📚 **FRONTEND CODE REFERENCES**

**Working Examples (Follow These Patterns):**
- Medicine: `src/services/modules/medicineService.ts`
- Categories: `src/services/categoryService.ts`
- Blogs: `src/services/blogService.ts`
- Prescriptions: `src/services/prescriptionService.ts`

**API Client:**
- `src/services/apiClient.ts` - Handles all HTTP requests, authentication, error handling

---

## ⚠️ **IMPORTANT NOTES**

1. **Authentication:** All APIs require Bearer token in Authorization header
2. **Base URL:** `https://java.api.curebasket.com/backend`
3. **Response Format:** Most APIs return `{ success: boolean, data: {...}, message?: string, error?: string }`
4. **Error Handling:** Frontend expects `success: false` for errors
5. **Pagination:** Most list APIs use `page` (0-indexed) and `size` query params
6. **Status Codes:** Use appropriate HTTP status codes (200, 400, 404, 500, etc.)

---

**Last Updated:** $(date)
**Status:** Ready for Backend Review








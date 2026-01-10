# 📋 Missing APIs Analysis - Admin Panel

## 🎯 Overview

This document identifies which admin sections have missing or incomplete API integrations.

---

## ✅ **FULLY INTEGRATED SECTIONS** (APIs Working)

### 1. **Medicine** ✅

- ✅ Create Medicine: `POST /medicines/createMedicine`
- ✅ Update Medicine: `POST /medicines/updateMedicine/{id}`
- ✅ Get All Medicines: `GET /medicines/getAllMedicines`
- ✅ Delete Medicine: (if needed)
- **Status**: Complete

### 2. **Categories** ✅
 
- ✅ Create Category: `POST /catalog/add-category`
- ✅ Update Category: `POST /catalog/update-category/{id}`
- ✅ Get All Categories: `GET /catalog/categories`
- ✅ Delete Category: `POST /catalog/delete-category/{id}`
- **Status**: Complete

### 3. **Blogs** ✅

- ✅ Create Blog: `POST /blog/add-blog`
- ✅ Update Blog: `POST /blog/update-blog/{id}`
- ✅ Get Blog by ID: `POST /blog/get-blog/{id}`
- ✅ Get All Blogs: `GET /blog/get-all` (with POST fallback)
- **Status**: Complete (recently fixed)

### 4. **Prescriptions** ✅

- ✅ Create Prescription: `POST /prescriptions/add-prescription`
- ✅ Update Prescription: `POST /prescriptions/update-prescription/{id}`
- ✅ Get All Prescriptions: `GET /prescriptions/get-all`
- ✅ Get Prescription by ID: (if needed)
- **Status**: Complete (with mainAttributes support)

---

## ⚠️ **PARTIALLY INTEGRATED SECTIONS** (Need Verification/Completion)

### 5. **Users** ⚠️

**Current APIs:**

- ✅ Get All Users: `GET /user/getAll`
- ✅ Get User by ID: `GET /user/getById/{id}`
- ❓ Create User: Need to verify endpoint
- ❓ Update User: Need to verify endpoint
- ❓ Delete User: Need to verify endpoint
- ❓ User Stats: Need to verify endpoint

**Action Required:**

- [ ] Verify create user API endpoint
- [ ] Verify update user API endpoint
- [ ] Verify delete user API endpoint
- [ ] Verify user stats/analytics API

**Files to Check:**

- `src/services/userService.ts`
- `src/Components/Users/Users.tsx`

---

### 6. **Banner Management** ⚠️

**Current APIs:**

- ✅ Create Banner: `POST /banner/add-banner`
- ✅ Update Banner: `POST /banner/update-banner/{id}`
- ✅ Get Banner by ID: `POST /banner/get-banner/{id}`
- ✅ Get All Banners: `GET /banner/get-all`
- ❓ Delete Banner: Need to verify endpoint
- ❓ Banner Stats: Need to verify endpoint

**Action Required:**

- [ ] Verify delete banner API endpoint
- [ ] Verify banner analytics/stats API
- [ ] Test all banner operations

**Files to Check:**

- `src/services/bannerService.ts`
- `src/Components/BannerManagement/BannerManagement.tsx`

---

### 7. **Roles** ⚠️

**Current APIs:**

- ✅ Get All Roles: `GET /roles/getAll` (with pagination)
- ✅ Create Role: Need to verify endpoint
- ✅ Update Role: Need to verify endpoint
- ✅ Delete Role: Need to verify endpoint

**Action Required:**

- [ ] Verify create role API endpoint
- [ ] Verify update role API endpoint
- [ ] Verify delete role API endpoint
- [ ] Test role-permission associations

**Files to Check:**

- `src/services/roleService.ts`
- `src/Components/Roles/Roles.tsx`

---

### 8. **Permissions** ⚠️

**Current APIs:**

- ✅ Get All Permissions: `GET /permissions/getAll` (with pagination)
- ✅ Get All Permission Groups: `GET /permissions/groups`
- ✅ Create Permission: Need to verify endpoint
- ✅ Update Permission: Need to verify endpoint
- ✅ Delete Permission: Need to verify endpoint

**Action Required:**

- [ ] Verify create permission API endpoint
- [ ] Verify update permission API endpoint
- [ ] Verify delete permission API endpoint
- [ ] Test permission-group associations

**Files to Check:**

- `src/services/permissionService.ts`
- `src/Components/Permissions/Permissions.tsx`

---

### 9. **Permission Groups** ⚠️

**Current APIs:**

- ✅ Get All Permission Groups: `GET /permissions/groups`
- ✅ Create Permission Group: Need to verify endpoint
- ✅ Update Permission Group: Need to verify endpoint
- ✅ Delete Permission Group: Need to verify endpoint

**Action Required:**

- [ ] Verify create permission group API endpoint
- [ ] Verify update permission group API endpoint
- [ ] Verify delete permission group API endpoint

**Files to Check:**

- `src/services/permissionService.ts`
- `src/Components/PermissionGroups/PermissionGroups.tsx`

---

## ❌ **NO API INTEGRATION** (Using Static/Mock Data)

### 10. **Dashboard** ❌

**Current Status:**

- ❌ Using static/mock data
- ❌ No real API calls
- ❌ Dashboard metrics are hardcoded

**Missing APIs:**

- ❌ Get Dashboard Metrics: Total orders, buyers, revenue, conversion rate
- ❌ Get Order Target Data: Achieved vs target
- ❌ Get Order History: Recent orders list
- ❌ Get Sales Analytics: Charts data
- ❌ Get Product Performance: Top products
- ❌ Get Customer Analytics: Customer insights

**Action Required:**

- [ ] Create dashboard API endpoints
- [ ] Integrate real-time dashboard data
- [ ] Replace static data with API calls
- [ ] Add loading states for dashboard

**Files to Update:**

- `src/services/dashboardService.ts` (currently using mocks)
- `src/Components/Dashboard/Dashboard.tsx`

**Suggested API Endpoints:**

```
GET /dashboard/metrics?period=7d|30d|90d
GET /dashboard/order-target?period=August
GET /dashboard/order-history?fromDate=&toDate=
GET /dashboard/sales-analytics?period=7d
GET /dashboard/product-performance?limit=10
GET /dashboard/customer-analytics?period=30d
```

---

### 11. **Profile** ❌

**Current Status:**

- ❌ No backend integration
- ❌ Only local state management
- ❌ Profile update doesn't save to backend

**Missing APIs:**

- ❌ Get User Profile: Get current user profile
- ❌ Update User Profile: Update name, email, avatar
- ❌ Change Password: Update password
- ❌ Upload Profile Image: Upload avatar image
- ❌ Get Profile Activity: Recent activity log

**Action Required:**

- [ ] Create profile API endpoints
- [ ] Integrate profile update functionality
- [ ] Add image upload for avatar
- [ ] Add password change functionality

**Files to Update:**

- `src/services/userService.ts` (add profile methods)
- `src/Components/Profile/Profile.tsx`

**Suggested API Endpoints:**

```
GET /user/profile
POST /user/update-profile
POST /user/change-password
POST /user/upload-avatar
GET /user/activity-log
```

---

### 12. **Settings** ❌

**Current Status:**

- ❌ No backend integration
- ❌ Only local state management
- ❌ Settings don't persist

**Missing APIs:**

- ❌ Get Settings: Get user/app settings
- ❌ Update Settings: Save settings to backend
- ❌ Get Theme Preferences: Get theme/locale settings
- ❌ Update Theme Preferences: Save theme/locale

**Action Required:**

- [ ] Create settings API endpoints
- [ ] Integrate settings save/load
- [ ] Persist theme and locale preferences
- [ ] Add notification preferences API

**Files to Update:**

- `src/services/settingsService.ts` (create new service)
- `src/Components/Settings/Settings.tsx`

**Suggested API Endpoints:**

```
GET /settings/user-preferences
POST /settings/user-preferences
GET /settings/app-config
POST /settings/app-config
```

---

## 📊 **SUMMARY TABLE**

| Section               | Status      | APIs Integrated | Missing APIs             | Priority     |
| --------------------- | ----------- | --------------- | ------------------------ | ------------ |
| **Medicine**          | ✅ Complete | 4/4             | 0                        | -            |
| **Categories**        | ✅ Complete | 4/4             | 0                        | -            |
| **Blogs**             | ✅ Complete | 4/4             | 0                        | -            |
| **Prescriptions**     | ✅ Complete | 3/4             | 1 (Get by ID)            | Low          |
| **Users**             | ⚠️ Partial  | 2/6             | 4 (CRUD + Stats)         | **High**     |
| **Banner Management** | ⚠️ Partial  | 4/6             | 2 (Delete + Stats)       | Medium       |
| **Roles**             | ⚠️ Partial  | 1/4             | 3 (Create/Update/Delete) | **High**     |
| **Permissions**       | ⚠️ Partial  | 2/5             | 3 (Create/Update/Delete) | **High**     |
| **Permission Groups** | ⚠️ Partial  | 1/4             | 3 (Create/Update/Delete) | **High**     |
| **Dashboard**         | ❌ None     | 0/6             | 6 (All APIs)             | **Critical** |
| **Profile**           | ❌ None     | 0/5             | 5 (All APIs)             | **High**     |
| **Settings**          | ❌ None     | 0/4             | 4 (All APIs)             | Medium       |

---

## 🎯 **PRIORITY ACTION ITEMS**

### **🔴 CRITICAL (Do First)**

1. **Dashboard APIs** - Core functionality, users expect real data
   - Get dashboard metrics
   - Get order history
   - Get analytics data

### **🟠 HIGH PRIORITY (Do Next)**

2. **Users CRUD APIs** - Essential admin functionality

   - Create user
   - Update user
   - Delete user
   - User stats

3. **Profile APIs** - User experience critical

   - Update profile
   - Change password
   - Upload avatar

4. **Roles/Permissions CRUD** - Security critical
   - Create/Update/Delete roles
   - Create/Update/Delete permissions
   - Create/Update/Delete permission groups

### **🟡 MEDIUM PRIORITY (Do Later)**

5. **Banner Management** - Complete missing operations

   - Delete banner
   - Banner stats

6. **Settings APIs** - Nice to have
   - Save/load settings
   - Theme preferences

---

## 📝 **NEXT STEPS**

1. **Review this document** with backend team
2. **Prioritize APIs** based on business needs
3. **Get curl commands** for missing APIs (one by one)
4. **Integrate APIs** following the same pattern as Medicine/Categories/Blogs
5. **Test thoroughly** after each integration

---

## 🔍 **HOW TO CHECK IF API EXISTS**

For each missing API, check:

1. **Service file** - Does the method exist?
2. **Component file** - Is it being called?
3. **Network tab** - Is the API being called?
4. **Backend documentation** - Does the endpoint exist?

---

## 📚 **REFERENCE**

- **Working Examples:**

  - Medicine: `src/services/modules/medicineService.ts`
  - Categories: `src/services/categoryService.ts`
  - Blogs: `src/services/blogService.ts`
  - Prescriptions: `src/services/prescriptionService.ts`

- **Pattern to Follow:**
  1. Add method to service file
  2. Call from component
  3. Handle response mapping
  4. Update UI state
  5. Add error handling

---

**Last Updated:** $(date)
**Status:** Ready for Review

# Integrated APIs Summary

This document lists all the APIs that have been integrated into the frontend application.

## 📊 Total Count
- **Total Services**: 9
- **Total API Endpoints**: ~50+ endpoints

---

## 1. 🔐 Authentication Service (`authService.ts`)

### Endpoints:
1. **POST** `/auth/login` ✅
   - User login with email and password
   - Returns token and user data
   - Handles various response structures

2. **POST** `/admin-penal/create-superadmin/super-admin-api-key` ✅
   - Create super admin account
   - Requires API key in headers

---

## 2. 👥 User Service (`userService.ts`)

### Endpoints:
1. **GET** `/user/getAllUsers` ⚠️ (Tries multiple endpoints)
   - Get all users with pagination
   - Also tries: `/user/all`, `/user/list`, `/user/users`, `/users`
   - Returns empty list if all fail (prevents 404 errors)

2. **GET** `/users/:id` ✅
   - Get single user by ID

3. **POST** `/users` ✅
   - Create new user

4. **POST** `/user/createAdmin` ✅
   - Create admin user with role assignment
   - Used in AddUserModal

5. **PUT** `/users/:id` ✅
   - Update user details

6. **DELETE** `/users/:id` ✅
   - Delete user

7. **GET** `/users/stats` ❌ (Disabled - returns default stats)
   - Stats endpoint doesn't exist, returns calculated stats

8. **GET** `/users/roles` ✅
   - Get available roles

9. **GET** `/users/departments` ✅
   - Get available departments

10. **GET** `/users/search` ✅
    - Search users

11. **PUT** `/users/bulk-update` ✅
    - Bulk update users

12. **DELETE** `/users/bulk-delete` ✅
    - Bulk delete users

13. **GET** `/users/export` ✅
    - Export users (CSV/Excel)

14. **POST** `/users/import` ✅
    - Import users from file

---

## 3. 🏢 Business Service (`businessService.ts`)

### Endpoints:
1. **POST** `/admin-penal/add-business` ✅
   - Create new business
   - Used in AddUserModal (creates business when adding user)
   - Includes address, contact, and business details

---

## 4. 📁 Category Service (`categoryService.ts`)

### Endpoints:
1. **GET** `/catalog/categories` ✅
   - Get all categories with pagination
   - Query params: `itemType=PRODUCT`, `pageNumber`, `pageSize`, `search`, `status`, `sortBy`, `sortOrder`
   - Returns paginated list with `content` array and `pageInfo`

2. **GET** `/categories/:id` ✅
   - Get single category by ID

3. **POST** `/catalog/add-category` ✅
   - Create new category
   - Payload: `categoryName`, `categoryDescription`, `itemType`, `state`

4. **POST** `/catalog/update-category/:id` ✅
   - Update existing category
   - Payload: `categoryName`, `categoryDescription`, `itemType`, `state`

5. **POST** `/catalog/delete-category/:id` ✅
   - Delete category

6. **GET** `/catalog/categories/analytics` ⚠️ (Returns default stats on 404)
   - Get category statistics
   - Returns zero stats if endpoint doesn't exist (prevents errors)

7. **GET** `/catalog/categories` (Search) ✅
   - Search categories with query

8. **PUT** `/categories/bulk-update` ✅
   - Bulk update categories

9. **DELETE** `/categories/bulk-delete` ✅
   - Bulk delete categories

10. **PUT** `/categories/reorder` ✅
    - Reorder categories

11. **GET** `/categories/export` ✅
    - Export categories (CSV/Excel)

12. **POST** `/categories/import` ✅
    - Import categories from file

13. **POST** `/categories/:id/duplicate` ✅
    - Duplicate category

---

## 5. 🔑 Permission Service (`permissionService.ts`)

### Permission Group Endpoints:
1. **POST** `/permissionGroup/createPermissionGroup?name={name}` ✅
   - Create permission group

2. **POST** `/permissionGroup/updatePermissionGroup?name={name}&id={id}` ✅
   - Update permission group

3. **POST** `/permissionGroup/deletePermissionGroup?id={id}` ✅
   - Delete permission group

4. **GET** `/permissionGroup/getAllPermissionGroup` ✅
   - Get all permission groups

5. **GET** `/permissionGroup/getAllPermissionGroupWithPermissions` ✅
   - Get all permission groups with their permissions

### Permission Endpoints:
6. **POST** `/permission/createPermission?name={name}&permissionGroupId={id}` ✅
   - Create permission

7. **POST** `/permission/updatePermission?name={name}&permissionGroupId={id}&id={id}` ✅
   - Update permission

8. **POST** `/permission/deletePermission` ✅
   - Delete permissions (accepts array of IDs in body)

9. **GET** `/permission/getAllPermissionsAtOnce` ✅
   - Get all permissions at once

10. **GET** `/permission/getAllPermissionsInPages?page={page}&size={size}&sortBy={sortBy}&asc={asc}` ✅
    - Get paginated permissions

---

## 6. 👔 Role Service (`roleService.ts`)

### Endpoints:
1. **POST** `/role/createRole` ✅
   - Create new role with permissions
   - Payload: `businessId`, `name`, `description`, `roleType`, `permissionIds[]`

2. **POST** `/role/updateRole?id={id}` ✅
   - Update existing role
   - Payload: `businessId`, `name`, `description`, `roleType`, `permissionIds[]`

3. **POST** `/role/deleteRole?id={id}` ✅
   - Delete role

4. **GET** `/role/getAllRoles?page={page}&size={size}&sortBy={sortBy}` ✅
   - Get all roles with pagination

---

## 7. 🎨 Banner Service (`bannerService.ts`)

### Endpoints:
1. **GET** `/api/banners` ✅
   - Get all banners with filters and pagination

2. **GET** `/api/banners/:id` ✅
   - Get single banner

3. **POST** `/api/banners` ✅
   - Create new banner

4. **PUT** `/api/banners/:id` ✅
   - Update banner

5. **DELETE** `/api/banners/:id` ✅
   - Delete banner

6. **DELETE** `/api/banners/bulk` ✅
   - Bulk delete banners

7. **PUT** `/api/banners/bulk` ✅
   - Bulk update banners

8. **GET** `/api/banners/stats` ✅
   - Get banner statistics

9. **GET** `/api/banners/:id/analytics` ✅
   - Get banner analytics

10. **POST** `/api/banners/:id/activate` ✅
    - Activate banner

11. **POST** `/api/banners/:id/deactivate` ✅
    - Deactivate banner

12. **POST** `/api/banners/:id/duplicate` ✅
    - Duplicate banner

13. **GET** `/api/banners/position/:position` ✅
    - Get banners by position

14. **GET** `/api/banners/active` ✅
    - Get active banners

15. **POST** `/api/banners/:id/track-view` ✅
    - Track banner view

16. **POST** `/api/banners/:id/track-click` ✅
    - Track banner click

---

## 8. 📝 Blog Service (`blogService.ts`)

### Endpoints:
1. **GET** `/api/blogs` ✅
   - Get all blogs with filters and pagination

2. **GET** `/api/blogs/:id` ✅
   - Get single blog

3. **POST** `/api/blogs` ✅
   - Create new blog

4. **PUT** `/api/blogs/:id` ✅
   - Update blog

5. **DELETE** `/api/blogs/:id` ✅
   - Delete blog

6. **DELETE** `/api/blogs/bulk` ✅
   - Bulk delete blogs

7. **PUT** `/api/blogs/bulk` ✅
   - Bulk update blogs

8. **GET** `/api/blogs/stats` ✅
   - Get blog statistics

9. **GET** `/api/blogs/:id/analytics` ✅
   - Get blog analytics

10. **POST** `/api/blogs/:id/publish` ✅
    - Publish blog

11. **POST** `/api/blogs/:id/unpublish` ✅
    - Unpublish blog

12. **GET** `/api/blogs/popular?limit={limit}` ✅
    - Get popular blogs

13. **GET** `/api/blogs/recent?limit={limit}` ✅
    - Get recent blogs

14. **GET** `/api/blogs/search?q={query}&limit={limit}` ✅
    - Search blogs

---

## 9. 💊 Medicine Service (`modules/medicineService.ts`)

### Endpoints:
1. **GET** `/api/medicines` ✅
   - Get all medicines with pagination

2. **GET** `/api/medicines/:id` ✅
   - Get single medicine

3. **POST** `/api/medicines` ✅
   - Create new medicine

4. **PUT** `/api/medicines/:id` ✅
   - Update medicine

5. **DELETE** `/api/medicines/:id` ✅
   - Delete medicine

6. **GET** `/api/medicines/categories` ✅
   - Get medicine categories

7. **GET** `/api/medicines/brands` ✅
   - Get medicine brands

8. **GET** `/api/medicines/units` ✅
   - Get medicine units

9. **GET** `/api/medicines/search` ✅
   - Search medicines

10. **GET** `/api/medicines/low-stock` ✅
    - Get low stock medicines

11. **GET** `/api/medicines/expiring` ✅
    - Get expiring medicines

---

## 10. 📋 Prescription Service (`prescriptionService.ts`)

### Endpoints:
1. **GET** `/api/prescriptions` ✅
   - Get all prescriptions

2. **GET** `/api/prescriptions/:id` ✅
   - Get single prescription

3. **POST** `/api/prescriptions` ✅
   - Create prescription

4. **PUT** `/api/prescriptions/:id` ✅
   - Update prescription

5. **DELETE** `/api/prescriptions/:id` ✅
   - Delete prescription

6. **POST** `/api/prescriptions/:id/approve` ✅
   - Approve prescription

7. **POST** `/api/prescriptions/:id/reject` ✅
   - Reject prescription

8. **POST** `/api/prescriptions/:id/dispense` ✅
   - Dispense prescription

9. **PUT** `/api/prescriptions/bulk` ✅
   - Bulk update prescriptions

10. **DELETE** `/api/prescriptions/bulk` ✅
    - Bulk delete prescriptions

11. **GET** `/api/prescriptions/stats` ✅
    - Get prescription statistics

12. **GET** `/api/prescriptions/search` ✅
    - Search prescriptions

---

## ⚠️ Known Issues / Status

### Working Endpoints:
- ✅ Authentication (Login, Super Admin creation)
- ✅ Categories (All CRUD operations)
- ✅ Permissions (All operations)
- ✅ Permission Groups (All operations)
- ✅ Roles (All operations)
- ✅ Business Creation
- ✅ Admin User Creation

### Partially Working:
- ⚠️ User List - Endpoint not confirmed, tries multiple endpoints, returns empty if all fail
- ⚠️ Category Analytics - Returns default stats if endpoint doesn't exist (404 handled gracefully)
- ⚠️ User Stats - Disabled, calculates from loaded users

### Not Yet Integrated (Service exists but endpoints may not be implemented):
- ❓ Banner Service - Service exists but endpoints may need backend implementation
- ❓ Blog Service - Service exists but endpoints may need backend implementation
- ❓ Medicine Service - Service exists but endpoints may need backend implementation
- ❓ Prescription Service - Service exists but endpoints may need backend implementation

---

## 📝 Notes

1. **Error Handling**: Most services have graceful error handling and return empty/default data if endpoints don't exist
2. **Query Parameters**: All query parameters are properly serialized (fixed `[object Object]` issue)
3. **Response Mapping**: Services handle various backend response structures
4. **Pagination**: Most list endpoints support pagination with `page`, `pageSize`, `sortBy`, `sortOrder`
5. **Authentication**: All requests include Bearer token from `apiClient`

---

## 🔄 Next Steps

1. **Confirm User List Endpoint**: Need to verify the correct endpoint to list all users
2. **Test Banner/Blog/Medicine/Prescription APIs**: Verify if backend endpoints exist
3. **Add Permission Checks**: Implement role-based access control in UI components
4. **Error Boundaries**: Add React error boundaries for better error handling

---

**Last Updated**: Based on current codebase state
**Total Integrated Endpoints**: ~50+ endpoints across 9 services


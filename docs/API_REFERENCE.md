## FlyCanary Admin API (Super Simple Guide)

Only two things you need to build now: Login and Users.

Basics

- Base URL: `${baseURL}/${version}`. For CureBasket this app uses `https://api.curebasket.com/backend` (see `src/config/apiConfig.ts`).
- Headers: `Content-Type: application/json`, `Accept: application/json`
- Auth: send `Authorization: Bearer <token>` for all /users routes
- Standard responses:
  - Success: `{ "success": true, "data": ... }`
  - Error: `{ "success": false, "error": "message" }`

1. Login (Admin/Superadmin)

- POST `/auth/login`
- Body:

```json
{ "email": "admin@site.com", "password": "secret" }
```

- Success response:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "email": "admin@site.com",
      "name": "Admin User",
      "role": "superadmin|admin"
    },
    "token": "<jwt>"
  }
}
```

- Notes: roles are only `superadmin` and `admin`.

2. Users API

- Base: `/users`
- User object:

```json
{
  "id": "string",
  "firstName": "",
  "lastName": "",
  "email": "",
  "phone": "?",
  "role": "superadmin|admin",
  "status": "active|inactive",
  "createdAt": "ISO",
  "updatedAt": "ISO",
  "lastLogin": "ISO?",
  "profileImage": "?"
}
```

- List users
  - GET `/users?search=&role=admin&status=active&page=1&pageSize=10`
  - Response:

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "1",
        "firstName": "Jane",
        "lastName": "Doe",
        "email": "jane@site.com",
        "role": "admin",
        "status": "active",
        "createdAt": "2025-01-01T00:00:00Z",
        "updatedAt": "2025-01-02T00:00:00Z"
      }
    ],
    "pagination": { "page": 1, "pageSize": 10, "total": 1, "totalPages": 1 }
  }
}
```

- Get one user

  - GET `/users/{id}`
  - Response: `{ "success": true, "data": <User> }`

- Create user
  - POST `/users`
  - Body:

```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@site.com",
  "phone": "+1-555-0123",
  "role": "admin",
  "status": "active"
}
```

- Response: `{ "success": true, "data": <User> }`

- Update user

  - PUT `/users/{id}` with any partial fields
  - Response: `{ "success": true, "data": <User> }`

- Delete user

  - DELETE `/users/{id}`
  - Response: `{ "success": true }`

- (Optional) Stats
  - GET `/users/stats`
  - Response:

```json
{
  "success": true,
  "data": {
    "totalUsers": 10,
    "activeUsers": 8,
    "newThisMonth": 2,
    "recentLogins": 5
  }
}
```

Access control (quick)

- superadmin: full access
- admin: limited (no system-level actions)

3. Categories API

- Base: `/categories`
- Category object:

```json
{
  "id": "string",
  "name": "",
  "description": "",
  "slug": "",
  "image": "?",
  "icon": "?",
  "status": "active|inactive|draft",
  "sortOrder": 0,
  "createdAt": "ISO",
  "updatedAt": "ISO"
}
```

- List categories
  - GET `/categories?search=&status=active&page=1&pageSize=10&sortBy=name&sortOrder=asc`
  - Response:

```json
{
  "success": true,
  "data": {
    "categories": [ <Category> ],
    "pagination": { "page": 1, "pageSize": 10, "total": 1, "totalPages": 1 }
  }
}
```

- Get one category

  - GET `/categories/{id}` → `{ "success": true, "data": <Category> }`

- Create category
  - POST `/categories`
  - Body:

```json
{
  "name": "Antibiotics",
  "description": "",
  "slug": "antibiotics",
  "status": "active"
}
```

- Response: `{ "success": true, "data": <Category> }`

- Update category

  - PUT `/categories/{id}` with any partial fields
  - Response: `{ "success": true, "data": <Category> }`

- Delete category

  - DELETE `/categories/{id}` → `{ "success": true }`

- (Optional) Search and Stats
  - GET `/categories/search?q=anti&limit=10` → `[ <Category> ]`
  - GET `/categories/stats` → `{ "success": true, "data": { "totalCategories": 10, "activeCategories": 8 } }`

4. Medicines API

- Base: `/medicines`
- Medicine object:

```json
{
  "id": "string",
  "name": "",
  "description": "",
  "image": "?",
  "category": "",
  "manufacturer": "",
  "form": "",
  "status": "active|inactive|discontinued",
  "price": 0,
  "stock": 0,
  "sku": "",
  "barcode": "?",
  "prescriptionRequired": true,
  "createdAt": "ISO",
  "updatedAt": "ISO"
}
```

- List medicines
  - GET `/medicines?search=&category=&manufacturer=&status=active&form=&inStock=true&page=1&pageSize=10&sortBy=name&sortOrder=asc`
  - Response:

```json
{
  "success": true,
  "data": {
    "medicines": [ <Medicine> ],
    "pagination": { "page": 1, "pageSize": 10, "total": 1, "totalPages": 1 }
  }
}
```

- Get one medicine

  - GET `/medicines/{id}` → `{ "success": true, "data": <Medicine> }`

- Create medicine
  - POST `/medicines`
  - Body:

```json
{
  "name": "Paracetamol 500mg",
  "description": "",
  "category": "analgesics",
  "manufacturer": "Acme Pharma",
  "form": "tablet",
  "status": "active",
  "price": 25.0,
  "stock": 100,
  "sku": "PCM-500-TAB",
  "prescriptionRequired": false
}
```

- Response: `{ "success": true, "data": <Medicine> }`

- Update medicine

  - PUT `/medicines/{id}` with any partial fields
  - Response: `{ "success": true, "data": <Medicine> }`

- Delete medicine

  - DELETE `/medicines/{id}` → `{ "success": true }`

- (Optional) Lookups & actions
  - GET `/medicines/categories` → `["analgesics", "antibiotics", ... ]`
  - GET `/medicines/manufacturers` → `["Acme Pharma", ... ]`
  - GET `/medicines/forms` → `["tablet","syrup","capsule"]`
  - GET `/medicines/search?q=para&limit=10` → `[ <Medicine> ]`
  - PATCH `/medicines/{id}/stock` → Body `{ "stock": 75 }` → returns updated `<Medicine>`
  - GET `/medicines/low-stock?threshold=10` → `[ <Medicine> ]`
  - GET `/medicines/analytics` → `{ "success": true, "data": { "totalMedicines": 100, "activeMedicines": 90, "lowStockCount": 5 } }`

5. Blogs API

- Base: `/blogs`
- Blog object:

```json
{
  "id": "string",
  "title": "",
  "slug": "",
  "content": "",
  "featuredImage": "?",
  "author": { "id": "string", "name": "", "email": "" },
  "category": { "id": "string", "name": "", "slug": "" },
  "tags": [""],
  "status": "draft|published|archived",
  "publishedAt": "ISO?",
  "createdAt": "ISO",
  "updatedAt": "ISO",
  "views": 0,
  "likes": 0,
  "comments": 0
}
```

- List blogs
  - GET `/blogs?search=&status=published&category=&author=&tags=tag1,tag2&page=1&pageSize=10&sortBy=createdAt&sortOrder=desc`
  - Response:

```json
{
  "success": true,
  "data": {
    "blogs": [ <Blog> ],
    "pagination": { "page": 1, "pageSize": 10, "total": 1, "totalPages": 1 }
  }
}
```

- Get one blog

  - GET `/blogs/{id}` → `{ "success": true, "data": <Blog> }`

- Create blog
  - POST `/blogs`
  - Body:

```json
{
  "title": "How to stay healthy",
  "slug": "stay-healthy",
  "content": "...",
  "featuredImage": "?",
  "author": { "id": "u1", "name": "Admin", "email": "admin@site.com" },
  "category": { "id": "c1", "name": "Health", "slug": "health" },
  "tags": ["health"],
  "status": "draft"
}
```

- Response: `{ "success": true, "data": <Blog> }`

- Update blog

  - PUT `/blogs/{id}` with any partial fields
  - Response: `{ "success": true, "data": <Blog> }`

- Delete blog

  - DELETE `/blogs/{id}` → `{ "success": true }`

- (Optional) Insights & helpers
  - GET `/blogs/stats` → `{ "success": true, "data": { "totalBlogs": 100, "publishedBlogs": 70 } }`
  - GET `/blogs/{id}/analytics` → `{ "success": true, "data": { "views": 123, "likes": 10 } }`
  - POST `/blogs/{id}/publish` → publish
  - POST `/blogs/{id}/unpublish` → unpublish
  - GET `/blogs/popular?limit=10` → `[ <Blog> ]`
  - GET `/blogs/recent?limit=10` → `[ <Blog> ]`
  - GET `/blogs/search?q=health&limit=20` → `[ <Blog> ]`

6. Banners API

- Base: `/banners`
- Banner object:

```json
{
  "id": "string",
  "title": "",
  "description": "?",
  "image": "",
  "imageAlt": "?",
  "linkUrl": "?",
  "linkText": "?",
  "type": "hero|promotional|announcement|advertisement|notification",
  "status": "active|inactive|scheduled|expired",
  "priority": 0,
  "startDate": "ISO?",
  "endDate": "ISO?",
  "createdAt": "ISO",
  "updatedAt": "ISO",
  "createdBy": { "id": "string", "name": "", "email": "" }
}
```

- List banners
  - GET `/banners?search=&status=active&type=&page=1&pageSize=10&sortBy=createdAt&sortOrder=desc`
  - Response:

```json
{
  "success": true,
  "data": {
    "banners": [ <Banner> ],
    "pagination": { "page": 1, "pageSize": 10, "total": 1, "totalPages": 1 }
  }
}
```

- Get one banner

  - GET `/banners/{id}` → `{ "success": true, "data": <Banner> }`

- Create banner
  - POST `/banners`
  - Body:

```json
{
  "title": "Summer Sale",
  "description": "Up to 50% off",
  "image": "https://.../banner.png",
  "position": "top",
  "type": "promotional",
  "status": "active",
  "priority": 10,
  "startDate": "2025-06-01T00:00:00Z",
  "endDate": "2025-06-30T23:59:59Z"
}
```

- Response: `{ "success": true, "data": <Banner> }`

- Update banner

  - PUT `/banners/{id}` with any partial fields
  - Response: `{ "success": true, "data": <Banner> }`

- Delete banner

  - DELETE `/banners/{id}` → `{ "success": true }`

- (Optional) Insights & actions
  - GET `/banners/stats` → `{ "success": true, "data": { "totalBanners": 100, "activeBanners": 70 } }`
  - GET `/banners/{id}/analytics` → `{ "success": true, "data": { "views": 123, "clicks": 10, "ctr": 0.08 } }`
  - POST `/banners/{id}/activate` → activate
  - POST `/banners/{id}/deactivate` → deactivate
  - POST `/banners/{id}/duplicate` → returns duplicated `<Banner>`
  - GET `/banners/active` → `[ <Banner> ]`

7. Sidebar/Menu API

- Base: `/sidebar`
- Get sidebar config
  - GET `/sidebar/config`
  - Headers: `Authorization: Bearer <token>`
  - Response:

```json
{
  "success": true,
  "data": {
    "menuItems": [
      {
        "id": "dashboard",
        "title": "Dashboard",
        "icon": "📊",
        "path": "/dashboard",
        "order": 1
      }
    ],
    "userPermissions": ["users:read", "blogs:read"],
    "lastUpdated": "ISO"
  }
}
```

- (Optional, admin-only) Update config
  - POST `/sidebar/config` → Body: partial config → `{ "success": true }`

8. Dashboard API (minimal)

- Update target
  - PUT `/dashboard/order-target`
  - Body:

```json
{ "period": "August", "target": 50000 }
```

- Response:

```json
{
  "success": true,
  "data": {
    "achieved": 46732,
    "target": 50000,
    "period": "August",
    "lastUpdated": "ISO"
  }
}
9. Prescriptions API

- Base: `/prescriptions`
- Prescription object:

```json
{
  "id": "string",
  "prescriptionNumber": "",
  "patientId": "string",
  "patient": {
    "id": "string",
    "name": "",
    "email": "",
    "phone": "",
    "dateOfBirth": "ISO",
    "address": ""
  },
  "doctorId": "string",
  "doctor": {
    "id": "string",
    "name": "",
    "licenseNumber": "",
    "specialization": "",
    "phone": ""
  },
  "medications": [
    {
      "id": "string",
      "medicineId": "string",
      "medicine": {
        "id": "string",
        "name": "",
        "manufacturer": "",
        "form": ""
      },
      "dosage": "",
      "frequency": "",
      "duration": "",
      "quantity": 0,
      "instructions": "",
      "refillsAllowed": 0,
      "refillsUsed": 0
    }
  ],
  "diagnosis": "",
  "symptoms": [""],
  "notes": "",
  "status": "pending|approved|rejected|dispensed|expired",
  "priority": "low|medium|high|urgent",
  "prescribedDate": "ISO",
  "expiryDate": "ISO",
  "dispensedDate": "ISO?",
  "createdAt": "ISO",
  "updatedAt": "ISO",
  "createdBy": { "id": "string", "name": "", "email": "" }
}
```

- List prescriptions
  - GET `/prescriptions?search=&status=pending&priority=urgent&doctorId=&patientId=&page=1&pageSize=10&sortBy=createdAt&sortOrder=desc`
  - Response:

```json
{
  "success": true,
  "data": {
    "prescriptions": [ <Prescription> ],
    "pagination": { "page": 1, "pageSize": 10, "total": 1, "totalPages": 1 }
  }
}
```

- Get one prescription

  - GET `/prescriptions/{id}` → `{ "success": true, "data": <Prescription> }`

- Create prescription

  - POST `/prescriptions`
  - Body: partial prescription data (patient, doctor, medications, diagnosis, etc.)
  - Response: `{ "success": true, "data": <Prescription> }`

- Update prescription

  - PUT `/prescriptions/{id}` with any partial fields
  - Response: `{ "success": true, "data": <Prescription> }`

- Delete prescription

  - DELETE `/prescriptions/{id}` → `{ "success": true }`

- Actions

  - POST `/prescriptions/{id}/approve` → approve → returns `<Prescription>`
  - POST `/prescriptions/{id}/reject` → Body `{ "reason": "..." }` → returns `<Prescription>`
  - POST `/prescriptions/{id}/dispense` → dispense → returns `<Prescription>`

- (Optional) Stats & search
  - GET `/prescriptions/stats` → `{ "success": true, "data": { "totalPrescriptions": 100, "pendingPrescriptions": 20, "approvedPrescriptions": 60 } }`
  - GET `/prescriptions/search?q=paracetamol` → `[ <Prescription> ]`
  - PUT `/prescriptions/bulk` → Body `{ "ids": [], "updates": {} }`
  - DELETE `/prescriptions/bulk` → Body `{ "ids": [] }`

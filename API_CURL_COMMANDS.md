# API CURL Commands Reference

This document contains all the curl commands for integrating Banner, Blog, Medicine, Category, and Prescription APIs.

**Base URL:** `https://api.curebasket.com/backend`

**Note:** Replace `YOUR_AUTH_TOKEN` with your actual Bearer token in all requests.

---

## 1. BANNER APIs

### 1.1 Create Banner
```bash
curl --location 'https://api.curebasket.com/backend/banner/add-banner' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer YOUR_AUTH_TOKEN' \
--data '{
  "itemType": "BANNER",
  "position": "TOP",
  "type": "PROMOTIONAL",
  "title": "Summer Sale Banner",
  "description": "Get 50% off on all items",
  "status": "ACTIVE",
  "priority": 1
}'
```

### 1.2 Update Banner
```bash
curl --location 'https://api.curebasket.com/backend/banner/update-banner/{bannerId}' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer YOUR_AUTH_TOKEN' \
--data '{
  "itemType": "BANNER",
  "position": "MIDDLE",
  "type": "ANNOUNCEMENT",
  "title": "Updated Banner Title",
  "description": "Updated description",
  "status": "ACTIVE",
  "priority": 2
}'
```

### 1.3 Get Banner by ID
```bash
curl --location 'https://api.curebasket.com/backend/banner/get-banner/{bannerId}' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer YOUR_AUTH_TOKEN' \
--data '{}'
```

### 1.4 Get All Banners
```bash
curl --location 'https://api.curebasket.com/backend/banner/get-all?itemType=BANNER&status=ACTIVE&position=TOP&page=0&pageSize=10&sortBy=ID&sortOrder=DESC' \
--header 'Authorization: Bearer YOUR_AUTH_TOKEN'
```

### 1.5 Delete Banner
```bash
curl --location 'https://api.curebasket.com/backend/banner/delete/{bannerId}' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer YOUR_AUTH_TOKEN' \
--data '{}'
```

### 1.6 Upload Banner Image
```bash
curl --location 'https://api.curebasket.com/backend/catalog/upload/file/{bannerId}' \
--header 'Authorization: Bearer YOUR_AUTH_TOKEN' \
--form 'file=@"/path/to/image.jpg"' \
--form 'itemType="BANNER"' \
--form 'documentType="profilePic, CoverPagePic"'
```

### 1.7 Delete Banner File
```bash
curl --location 'https://api.curebasket.com/backend/catalog/delete/file?fileId={fileId}' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer YOUR_AUTH_TOKEN' \
--data '{}'
```

---

## 2. BLOG APIs

### 2.1 Create Blog
```bash
curl --location 'https://api.curebasket.com/backend/blog/add-blog' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer YOUR_AUTH_TOKEN' \
--data '{
  "itemType": "BLOG",
  "position": "",
  "type": "",
  "title": "My First Blog Post",
  "description": "This is the content of my blog post",
  "status": "DRAFT",
  "priority": 0
}'
```

### 2.2 Update Blog
```bash
curl --location 'https://api.curebasket.com/backend/blog/update-blog/{blogId}' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer YOUR_AUTH_TOKEN' \
--data '{
  "category": "wellness",
  "status": "PUBLISHED",
  "title": "Updated Blog Title",
  "content": "Updated blog content",
  "excerpt": "Short excerpt",
  "seoTitle": "SEO Title",
  "seoDescription": "SEO Description",
  "enabled": true
}'
```

**Note:** The `enabled` field is included to ensure published blogs remain enabled. If the backend doesn't accept this field, please verify with the backend team.

### 2.3 Get Blog by ID
```bash
curl --location 'https://api.curebasket.com/backend/blog/get-blog/{blogId}' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer YOUR_AUTH_TOKEN' \
--data '{}'
```

### 2.4 Get All Blogs
```bash
curl --location 'https://api.curebasket.com/backend/blog/get-all?itemType=BLOG&status=DRAFT&page=0&pageSize=10&sortBy=ID&sortOrder=DESC' \
--header 'Authorization: Bearer YOUR_AUTH_TOKEN'
```

**Note:** Status can be: `DRAFT`, `PUBLISHED`, or `ARCHIVED`

### 2.5 Delete Blog
```bash
curl --location 'https://api.curebasket.com/backend/blog/delete/{blogId}' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer YOUR_AUTH_TOKEN' \
--data '{}'
```

### 2.6 Upload Blog Image
```bash
curl --location 'https://api.curebasket.com/backend/catalog/upload/file/{blogId}' \
--header 'Authorization: Bearer YOUR_AUTH_TOKEN' \
--form 'file=@"/path/to/image.jpg"' \
--form 'itemType="BLOG"' \
--form 'documentType="thumbnail, featuredImage"'
```

### 2.7 Delete Blog File
```bash
curl --location 'https://api.curebasket.com/backend/catalog/delete/file?fileId={fileId}' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer YOUR_AUTH_TOKEN' \
--data '{}'
```

---

## 3. MEDICINE APIs

### 3.1 Create Medicine
```bash
curl --location 'https://api.curebasket.com/backend/medicines/createMedicine' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer YOUR_AUTH_TOKEN' \
--data '{
  "name": "Paracetamol 500mg",
  "genericName": "Acetaminophen",
  "manufacturer": "ABC Pharmaceuticals",
  "dosageForm": "Tablet",
  "strength": "500mg",
  "price": 50.00,
  "description": "Pain relief medicine",
  "stockQuantity": 100,
  "expiryDate": "2025-12-31",
  "sku": "MED-001",
  "category": "Pain Relief",
  "status": "ACTIVE",
  "form": "Tablet",
  "barcode": "1234567890123",
  "prescriptionRequired": false,
  "countryOfOrigin": "India"
}'
```

### 3.2 Update Medicine
```bash
curl --location 'https://api.curebasket.com/backend/medicines/updateMedicine/{medicineId}' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer YOUR_AUTH_TOKEN' \
--data '{
  "name": "Updated Medicine Name",
  "price": 55.00,
  "stockQuantity": 150
}'
```

### 3.3 Get Medicine by ID
```bash
curl --location 'https://api.curebasket.com/backend/medicines/getMedicineById/{medicineId}' \
--header 'Authorization: Bearer YOUR_AUTH_TOKEN'
```

### 3.4 Get All Medicines
```bash
curl --location 'https://api.curebasket.com/backend/medicines/getAllMedicines?page=0&size=10&sortBy=name' \
--header 'Authorization: Bearer YOUR_AUTH_TOKEN'
```

### 3.5 Delete Medicine
```bash
curl --location 'https://api.curebasket.com/backend/medicines/deleteMedicine/{medicineId}' \
--header 'Authorization: Bearer YOUR_AUTH_TOKEN'
```

### 3.6 Upload Medicine Image
```bash
curl --location 'https://api.curebasket.com/backend/medicines/image/upload/{medicineId}' \
--header 'Authorization: Bearer YOUR_AUTH_TOKEN' \
--form 'file=@"/path/to/image.jpg"'
```

**Note:** Medicine uses a separate endpoint (`/medicines/image/upload/{medicineId}`) instead of the common catalog upload endpoint.

---

## 4. CATEGORY APIs

### 4.1 Create Category
```bash
curl --location 'https://api.curebasket.com/backend/catalog/add-category' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer YOUR_AUTH_TOKEN' \
--data '{
  "categoryName": "Heart",
  "categoryDescription": "This category belongs to Heart medicines",
  "itemType": "PRODUCT",
  "state": "ACTIVE",
  "forCategory": true
}'
```

### 4.2 Update Category
```bash
curl --location 'https://api.curebasket.com/backend/catalog/update-category/{categoryId}' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer YOUR_AUTH_TOKEN' \
--data '{
  "categoryName": "Updated Category Name",
  "categoryDescription": "Updated description",
  "itemType": "PRODUCT",
  "state": "ACTIVE",
  "forCategory": true
}'
```

### 4.3 Get Category by ID
```bash
curl --location 'https://api.curebasket.com/backend/catalog/categories/{categoryId}' \
--header 'Authorization: Bearer YOUR_AUTH_TOKEN'
```

### 4.4 Get All Categories
```bash
curl --location 'https://api.curebasket.com/backend/catalog/categories?itemType=PRODUCT&status=ACTIVE&page=0&pageSize=10&sortBy=ID&sortOrder=ASC' \
--header 'Authorization: Bearer YOUR_AUTH_TOKEN'
```

**Note:** 
- `itemType` can be: `PRODUCT`, `SERVICE`, `BLOG`, or `BANNER`
- `status` can be: `ACTIVE` or `INACTIVE`

### 4.5 Delete Category
```bash
curl --location 'https://api.curebasket.com/backend/catalog/delete-category/{categoryId}' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer YOUR_AUTH_TOKEN' \
--data '{}'
```

### 4.6 Upload Category Image
```bash
curl --location 'https://api.curebasket.com/backend/catalog/upload/file/{categoryId}' \
--header 'Authorization: Bearer YOUR_AUTH_TOKEN' \
--form 'file=@"/path/to/image.jpg"' \
--form 'itemType="PRODUCT"' \
--form 'documentType="IMAGE"' \
--form 'isCategory="true"' \
--form 'forCategory="true"'
```

**Note:** 
- Use `itemType="PRODUCT"` (backend doesn't accept `CATEGORY` as itemType)
- Include both `isCategory="true"` and `forCategory="true"` flags
- This tells the backend to associate the file with a category, not a catalog item

### 4.7 Delete Category File
```bash
curl --location 'https://api.curebasket.com/backend/catalog/delete/file?fileId={fileId}' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer YOUR_AUTH_TOKEN' \
--data '{}'
```

---

## 5. PRESCRIPTION APIs

### 5.1 Create Prescription
```bash
curl --location 'https://api.curebasket.com/backend/prescriptions/add-prescription' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer YOUR_AUTH_TOKEN' \
--data '{
  "prescriptionNumber": "PRES-001",
  "itemType": "PRESCRIPTION",
  "patientName": "John Doe",
  "patientId": "PAT-123",
  "doctorName": "Dr. Smith",
  "doctorId": "DOC-456",
  "diagnosis": "Common Cold",
  "note": "Take with food",
  "status": "PENDING",
  "priority": "HIGH",
  "prescriptionDate": "2024-01-15",
  "mainAttributes": [
    {
      "name": "Medicine",
      "scale": "list",
      "value": "Paracetamol 500mg",
      "subAttributes": [
        {
          "name": "Dosage",
          "value": "1 tablet twice daily"
        }
      ]
    }
  ]
}'
```

### 5.2 Update Prescription
```bash
curl --location 'https://api.curebasket.com/backend/prescriptions/update-prescription/{prescriptionId}' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer YOUR_AUTH_TOKEN' \
--data '{
  "status": "APPROVED",
  "priority": "MEDIUM",
  "note": "Updated note"
}'
```

### 5.3 Get Prescription by ID
```bash
curl --location 'https://api.curebasket.com/backend/prescriptions/get-prescription/{prescriptionId}' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer YOUR_AUTH_TOKEN' \
--data '{}'
```

### 5.4 Get All Prescriptions
```bash
curl --location 'https://api.curebasket.com/backend/prescriptions/get-all?itemType=PRESCRIPTION&status=PENDING&priority=HIGH&page=0&pageSize=10&sortBy=ID&sortOrder=DESC' \
--header 'Authorization: Bearer YOUR_AUTH_TOKEN'
```

**Note:** 
- `status` can be: `PENDING`, `APPROVED`, `REJECTED`, `DISPENSED`, or `EXPIRED`
- `priority` can be: `HIGH`, `MEDIUM`, or `LOW`

### 5.5 Delete Prescription
```bash
curl --location 'https://api.curebasket.com/backend/prescriptions/delete/{prescriptionId}' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer YOUR_AUTH_TOKEN' \
--data '{}'
```

### 5.6 Upload Prescription File
```bash
curl --location 'https://api.curebasket.com/backend/catalog/upload/file/{prescriptionId}' \
--header 'Authorization: Bearer YOUR_AUTH_TOKEN' \
--form 'file=@"/path/to/prescription.pdf"' \
--form 'itemType="PRESCRIPTION"' \
--form 'documentType="prescriptionImage, prescriptionDocument"'
```

### 5.7 Delete Prescription File
```bash
curl --location 'https://api.curebasket.com/backend/catalog/delete/file?fileId={fileId}' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer YOUR_AUTH_TOKEN' \
--data '{}'
```

---

## Common File Upload Endpoint

Most modules (Banner, Blog, Category, Prescription) use the common catalog upload endpoint:

```
POST /catalog/upload/file/{itemId}
```

**Form Data:**
- `file`: The file to upload (can be image or document)
- `itemType`: One of `BANNER`, `BLOG`, `PRESCRIPTION`, `PRODUCT`, `MEDICINE`, `ABOUT_US`, `BANK_INFO`, `MAIL_INFO`
- `documentType`: Optional CSV string (e.g., `"profilePic, CoverPagePic"`)
- `isCategory`: Optional boolean (for category uploads)
- `forCategory`: Optional boolean (for category uploads)

**Exception:** Medicine uses a separate endpoint: `/medicines/image/upload/{medicineId}`

---

## Common File Delete Endpoint

All modules use the same endpoint to delete files:

```
POST /catalog/delete/file?fileId={fileId}
```

---

## Response Format

All APIs return responses in the following format:

**Success Response:**
```json
{
  "success": true,
  "data": {
    // Response data here
  },
  "message": "Operation successful"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error message"
}
```

**Paginated Response:**
```json
{
  "success": true,
  "data": {
    "content": [
      // Array of items
    ],
    "pageInfo": {
      "pageNumber": 0,
      "pageSize": 10,
      "totalRecords": 100,
      "totalPages": 10
    }
  }
}
```

---

## Important Notes

1. **Authentication:** All requests require a Bearer token in the Authorization header
2. **Content-Type:** Use `application/json` for JSON requests, `multipart/form-data` for file uploads
3. **Pagination:** Page numbers are 0-based (0, 1, 2, ...)
4. **Status Values:**
   - Banner/Blog: `ACTIVE`, `INACTIVE`, `DRAFT`, `PUBLISHED`, `ARCHIVED`
   - Category: `ACTIVE`, `INACTIVE`
   - Prescription: `PENDING`, `APPROVED`, `REJECTED`, `DISPENSED`, `EXPIRED`
5. **Item Types:**
   - Banner: `BANNER`
   - Blog: `BLOG`
   - Medicine: Uses separate `/medicines` endpoints
   - Category: `PRODUCT`, `SERVICE`, `BLOG`, `BANNER`
   - Prescription: `PRESCRIPTION`
6. **File Uploads:**
   - Banner, Blog, Prescription: Use `/catalog/upload/file/{itemId}`
   - Medicine: Use `/medicines/image/upload/{medicineId}`
   - Category: Use `/catalog/upload/file/{categoryId}` with `isCategory=true` and `forCategory=true`

---

## Testing Tips

1. **Get Auth Token:** First, authenticate and get your Bearer token
2. **Test GET endpoints first:** Start with listing endpoints to verify connectivity
3. **Create before Update:** Create a resource before testing update operations
4. **Check Response Structure:** Verify the response structure matches your expectations
5. **File Uploads:** Ensure file paths are correct and files exist
6. **Error Handling:** Check error responses for detailed error messages

---

## Example: Complete Workflow for Blog

```bash
# 1. Create Blog
curl --location 'https://api.curebasket.com/backend/blog/add-blog' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer YOUR_AUTH_TOKEN' \
--data '{
  "itemType": "BLOG",
  "title": "My Blog Post",
  "description": "Content here",
  "status": "DRAFT",
  "priority": 0
}'

# Response: { "success": true, "data": { "id": 73, ... } }

# 2. Upload Image (using the ID from step 1)
curl --location 'https://api.curebasket.com/backend/catalog/upload/file/73' \
--header 'Authorization: Bearer YOUR_AUTH_TOKEN' \
--form 'file=@"/path/to/image.jpg"' \
--form 'itemType="BLOG"' \
--form 'documentType="thumbnail"'

# 3. Update Blog Status
curl --location 'https://api.curebasket.com/backend/blog/update-blog/73' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer YOUR_AUTH_TOKEN' \
--data '{
  "status": "PUBLISHED"
}'

# 4. Get All Blogs
curl --location 'https://api.curebasket.com/backend/blog/get-all?itemType=BLOG&status=PUBLISHED' \
--header 'Authorization: Bearer YOUR_AUTH_TOKEN'
```

---

**Last Updated:** January 2025

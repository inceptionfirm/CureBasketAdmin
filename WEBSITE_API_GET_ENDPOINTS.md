# Website API GET Endpoints (Public-Facing)

This document contains **ONLY GET endpoints** for the public website. These endpoints are used to display content that admins have added through the admin panel.

**Base URL:** `https://java.api.curebasket.com/backend`

**Important:** 
- Only items with `status: ACTIVE` should be displayed on the website
- No authentication required for these GET endpoints (public access)
- These are read-only endpoints for displaying content

---

## 1. BANNER APIs (Website)

### 1.1 Get All Banners (Filter for Website Display)

```bash
curl --location 'https://java.api.curebasket.com/backend/banner/get-all?itemType=BANNER&page=0&pageSize=100&sortBy=priority&sortOrder=ASC' \
--header 'Accept: application/json'
```

**Important:** Website should display **ONLY 3 banners maximum** based on priority (1, 2, 3).

**Response Structure:**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 55,
        "itemType": "BANNER",
        "position": "top",
        "type": "hero",
        "title": "rfref",
        "description": "rfggregfre",
        "status": "active",
        "priority": 1,
        "files": []
      },
      {
        "id": 76,
        "itemType": "BANNER",
        "position": "Left",
        "type": "test",
        "title": "test",
        "description": "test",
        "status": "ACTIVE",
        "priority": 2,
        "files": [
          {
            "id": 12,
            "docPath": "/files/CATALOG_ITEM/76_3_Vision.png",
            "documentType": "GENERAL",
            "fileExtension": "image/png",
            "fileName": "76_3_Vision.png"
          }
        ]
      }
    ],
    "pageInfo": {
      "pageNumber": 0,
      "pageSize": 100,
      "totalRecords": 13,
      "totalPages": 1
    }
  }
}
```

**Image URL:** `https://java.api.curebasket.com{files[0].docPath}`

### 1.2 Banner Display Algorithm

The website should display **exactly 3 banners** (or fewer if less than 3 active banners exist) based on the following algorithm:

1. **Filter banners:**
   - Status must be `ACTIVE` (case-insensitive: "ACTIVE", "active", "Active" all valid)
   - Priority must be 1, 2, or 3 only
   - Must have at least one file in the `files` array (banner must have an image)

2. **Sort banners:**
   - Sort by `priority` in ascending order (1, 2, 3)
   - If multiple banners have the same priority, sort by `id` ascending

3. **Select banners:**
   - Take the first 3 banners from the filtered and sorted list
   - Display them in order: Priority 1 (1st position), Priority 2 (2nd position), Priority 3 (3rd position)

4. **Display order:**
   - 1st banner: Priority 1
   - 2nd banner: Priority 2
   - 3rd banner: Priority 3

**Example Implementation:**

```javascript
const getWebsiteBanners = (bannerResponse) => {
  if (!bannerResponse.success || !bannerResponse.data?.content) {
    return [];
  }

  const allBanners = bannerResponse.data.content;

  // Step 1: Filter banners
  const activeBanners = allBanners.filter(banner => {
    const status = String(banner.status || '').toUpperCase();
    const priority = Number(banner.priority);
    const hasImage = banner.files && banner.files.length > 0;
    
    return status === 'ACTIVE' && 
           [1, 2, 3].includes(priority) && 
           hasImage;
  });

  // Step 2: Sort by priority (ascending), then by id (ascending)
  const sortedBanners = activeBanners.sort((a, b) => {
    if (a.priority !== b.priority) {
      return a.priority - b.priority; // Sort by priority ascending
    }
    return a.id - b.id; // If same priority, sort by id ascending
  });

  // Step 3: Take only first 3 banners
  const websiteBanners = sortedBanners.slice(0, 3);

  // Step 4: Construct image URLs
  return websiteBanners.map(banner => ({
    id: banner.id,
    title: banner.title,
    description: banner.description,
    position: banner.position,
    type: banner.type,
    priority: banner.priority,
    imageUrl: banner.files[0]?.docPath
      ? `https://java.api.curebasket.com${banner.files[0].docPath}`
      : null
  }));
};

// Usage
const response = await fetch('https://java.api.curebasket.com/backend/banner/get-all?itemType=BANNER&page=0&pageSize=100&sortBy=priority&sortOrder=ASC');
const data = await response.json();
const bannersToDisplay = getWebsiteBanners(data);
// bannersToDisplay will have maximum 3 banners with priority 1, 2, 3
```

**Query Parameters:**
- `itemType`: `BANNER` (required)
- `page`: Page number (0-based, default: 0)
- `pageSize`: Use 100 to get all banners (filtering happens on frontend)
- `sortBy`: `priority` (recommended)
- `sortOrder`: `ASC` (ascending: 1, 2, 3)

**Note:** 
- Status filtering is case-insensitive ("ACTIVE", "active", "Active" all work)
- Only banners with priority 1, 2, or 3 are displayed
- Only banners with images (files array not empty) are displayed
- Maximum 3 banners are shown on the website

---

## 2. BLOG APIs (Website)

### 2.1 Get All Published Blogs
```bash
curl --location 'https://java.api.curebasket.com/backend/blog/get-all?itemType=BLOG&status=PUBLISHED&page=0&pageSize=10&sortBy=ID&sortOrder=DESC' \
--header 'Accept: application/json'
```

**Response Structure:**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 73,
        "itemType": "BLOG",
        "title": "My Blog Post",
        "description": "Blog content here",
        "status": "PUBLISHED",
        "category": "wellness",
        "files": [
          {
            "id": 9,
            "docPath": "/files/CATALOG_ITEM/73_image.png",
            "documentType": "GENERAL",
            "fileName": "image.png"
          }
        ],
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pageInfo": {
      "pageNumber": 0,
      "pageSize": 10,
      "totalRecords": 25,
      "totalPages": 3
    }
  }
}
```

**Image URL:** `https://java.api.curebasket.com{files[0].docPath}`

**Query Parameters:**
- `itemType`: `BLOG` (required)
- `status`: `PUBLISHED` (required - only show published blogs)
- `page`: Page number (0-based)
- `pageSize`: Items per page (default: 10)
- `sortBy`: `ID`, `Title`, `CreatedAt` (default: `ID`)
- `sortOrder`: `ASC` or `DESC` (default: `DESC`)

**Note:** 
- Only `PUBLISHED` blogs should be shown on the website
- `DRAFT` and `ARCHIVED` blogs should NOT be displayed

---

## 3. MEDICINE APIs (Website)

### 3.1 Get All Active Medicines
```bash
curl --location 'https://java.api.curebasket.com/backend/medicines/getAllMedicines?page=0&size=20&sortBy=name' \
--header 'Accept: application/json'
```

**Response Structure:**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 43,
        "name": "Paracetamol 500mg",
        "genericName": "Acetaminophen",
        "manufacturer": "ABC Pharmaceuticals",
        "dosageForm": "Tablet",
        "strength": "500mg",
        "price": 50.00,
        "description": "Pain relief medicine",
        "stockQuantity": 100,
        "status": "ACTIVE",
        "image": "/files/MEDICINE/43_image.jpg",
        "category": "Pain Relief"
      }
    ],
    "pageInfo": {
      "pageNumber": 0,
      "pageSize": 20,
      "totalRecords": 150,
      "totalPages": 8
    }
  }
}
```

**Image URL:** `https://java.api.curebasket.com{image}`

**Query Parameters:**
- `page`: Page number (0-based, default: 0)
- `size`: Items per page (default: 10)
- `sortBy`: `name`, `price`, `createdAt` (default: `name`)

**Filtering:**
- Filter by `status: ACTIVE` on the frontend
- Or add `status=ACTIVE` query parameter if backend supports it

---

## 4. CATEGORY APIs (Website)

### 4.1 Get All Active Categories
```bash
curl --location 'https://java.api.curebasket.com/backend/catalog/categories?itemType=PRODUCT&status=ACTIVE&page=0&pageSize=50&sortBy=ID&sortOrder=ASC' \
--header 'Accept: application/json'
```

**Response Structure:**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 8,
        "categoryName": "Heart",
        "categoryDescription": "Heart medicines category",
        "itemType": "PRODUCT",
        "state": "ACTIVE",
        "files": [
          {
            "id": 15,
            "docPath": "/files/CATEGORY/8_image.jpg",
            "documentType": "GENERAL",
            "fileName": "image.jpg"
          }
        ]
      }
    ],
    "pageInfo": {
      "pageNumber": 0,
      "pageSize": 50,
      "totalRecords": 12,
      "totalPages": 1
    }
  }
}
```

**Image URL:** `https://java.api.curebasket.com{files[0].docPath}`

**Query Parameters:**
- `itemType`: `PRODUCT` (required)
- `status`: `ACTIVE` (required - only show active categories)
- `page`: Page number (0-based)
- `pageSize`: Items per page (default: 10)
- `sortBy`: `ID`, `categoryName` (default: `ID`)
- `sortOrder`: `ASC` or `DESC` (default: `ASC`)

**Note:** 
- Only categories with `state: ACTIVE` should be displayed
- `INACTIVE` categories should NOT be shown

---

## 5. PRESCRIPTION APIs (Website)

**Note:** Prescriptions are typically not displayed on public websites. They are usually:
- Submitted by customers through the website
- Viewed only by admins in the admin panel
- Or viewed by customers in their account dashboard (requires authentication)

If you need to show prescription status to customers, use authenticated endpoints.

---

## Summary: Website GET Endpoints

| Section | Endpoint | Status Filter | Notes |
|---------|----------|---------------|-------|
| **Banners** | `/banner/get-all` | `status=ACTIVE`, priority 1-3 | Maximum 3 banners, sorted by priority |
| **Blogs** | `/blog/get-all` | `status=PUBLISHED` | Only published blogs |
| **Medicines** | `/medicines/getAllMedicines` | `status=ACTIVE` | Filter on frontend or backend |
| **Categories** | `/catalog/categories` | `status=ACTIVE` | Only active categories |

---

## Image URL Construction

All images should be constructed using the base URL:

```javascript
// For Banner, Blog, Category (from files array)
const imageUrl = `https://java.api.curebasket.com${item.files[0]?.docPath}`;

// For Medicine (direct image field)
const imageUrl = `https://java.api.curebasket.com${medicine.image}`;

// Fallback if no image
const imageUrl = item.files?.[0]?.docPath 
  ? `https://java.api.curebasket.com${item.files[0].docPath}`
  : '/default-image.jpg';
```

---

## Frontend Implementation Example

### React/JavaScript Example:

```javascript
// Fetch Website Banners (Maximum 3 banners with priority 1, 2, 3)
const fetchWebsiteBanners = async () => {
  const response = await fetch(
    'https://java.api.curebasket.com/backend/banner/get-all?itemType=BANNER&page=0&pageSize=100&sortBy=priority&sortOrder=ASC',
    {
      headers: {
        'Accept': 'application/json'
      }
    }
  );
  
  const data = await response.json();
  
  if (!data.success || !data.data?.content) {
    return [];
  }

  const allBanners = data.data.content;

  // Step 1: Filter banners
  // - Status must be ACTIVE (case-insensitive)
  // - Priority must be 1, 2, or 3
  // - Must have at least one file (image)
  const activeBanners = allBanners.filter(banner => {
    const status = String(banner.status || '').toUpperCase();
    const priority = Number(banner.priority);
    const hasImage = banner.files && banner.files.length > 0;
    
    return status === 'ACTIVE' && 
           [1, 2, 3].includes(priority) && 
           hasImage;
  });

  // Step 2: Sort by priority (ascending), then by id (ascending)
  const sortedBanners = activeBanners.sort((a, b) => {
    if (a.priority !== b.priority) {
      return a.priority - b.priority; // Sort by priority ascending (1, 2, 3)
    }
    return a.id - b.id; // If same priority, sort by id ascending
  });

  // Step 3: Take only first 3 banners
  const websiteBanners = sortedBanners.slice(0, 3);

  // Step 4: Construct image URLs
  return websiteBanners.map(banner => ({
    id: banner.id,
    title: banner.title,
    description: banner.description,
    position: banner.position,
    type: banner.type,
    priority: banner.priority,
    imageUrl: banner.files[0]?.docPath
      ? `https://java.api.curebasket.com${banner.files[0].docPath}`
      : null
  }));
};

// Fetch Published Blogs
const fetchPublishedBlogs = async (page = 0, pageSize = 10) => {
  const response = await fetch(
    `https://java.api.curebasket.com/backend/blog/get-all?itemType=BLOG&status=PUBLISHED&page=${page}&pageSize=${pageSize}&sortBy=ID&sortOrder=DESC`,
    {
      headers: {
        'Accept': 'application/json'
      }
    }
  );
  
  const data = await response.json();
  
  if (data.success && data.data.content) {
    // Only PUBLISHED blogs should be returned, but double-check
    const publishedBlogs = data.data.content.filter(
      blog => blog.status === 'PUBLISHED'
    );
    
    // Construct image URLs
    const blogsWithImages = publishedBlogs.map(blog => ({
      ...blog,
      imageUrl: blog.files?.[0]?.docPath
        ? `https://java.api.curebasket.com${blog.files[0].docPath}`
        : '/default-blog.jpg'
    }));
    
    return {
      blogs: blogsWithImages,
      pagination: data.data.pageInfo
    };
  }
  
  return { blogs: [], pagination: null };
};

// Fetch Active Medicines
const fetchActiveMedicines = async (page = 0, size = 20) => {
  const response = await fetch(
    `https://java.api.curebasket.com/backend/medicines/getAllMedicines?page=${page}&size=${size}&sortBy=name`,
    {
      headers: {
        'Accept': 'application/json'
      }
    }
  );
  
  const data = await response.json();
  
  if (data.success && data.data.content) {
    // Filter only ACTIVE medicines
    const activeMedicines = data.data.content.filter(
      medicine => medicine.status === 'ACTIVE'
    );
    
    // Construct image URLs
    const medicinesWithImages = activeMedicines.map(medicine => ({
      ...medicine,
      imageUrl: medicine.image
        ? `https://java.api.curebasket.com${medicine.image}`
        : '/default-medicine.jpg'
    }));
    
    return {
      medicines: medicinesWithImages,
      pagination: data.data.pageInfo
    };
  }
  
  return { medicines: [], pagination: null };
};

// Fetch Active Categories
const fetchActiveCategories = async () => {
  const response = await fetch(
    'https://java.api.curebasket.com/backend/catalog/categories?itemType=PRODUCT&status=ACTIVE&page=0&pageSize=50&sortBy=ID&sortOrder=ASC',
    {
      headers: {
        'Accept': 'application/json'
      }
    }
  );
  
  const data = await response.json();
  
  if (data.success && data.data.content) {
    // Filter only ACTIVE categories
    const activeCategories = data.data.content.filter(
      category => category.state === 'ACTIVE'
    );
    
    // Construct image URLs
    const categoriesWithImages = activeCategories.map(category => ({
      ...category,
      imageUrl: category.files?.[0]?.docPath
        ? `https://java.api.curebasket.com${category.files[0].docPath}`
        : '/default-category.jpg'
    }));
    
    return categoriesWithImages;
  }
  
  return [];
};
```

---

## Important Notes for Website Implementation

1. **No Authentication Required:** These GET endpoints are public and don't require Bearer tokens
2. **Banner Display Rules:**
   - Display **maximum 3 banners** on the website
   - Only banners with `status: ACTIVE` (case-insensitive)
   - Only banners with `priority: 1, 2, or 3`
   - Only banners that have images (files array not empty)
   - Sort by priority ascending (1, 2, 3)
   - Display in order: Priority 1 (1st), Priority 2 (2nd), Priority 3 (3rd)
3. **Status Filtering:** Always filter by `ACTIVE` or `PUBLISHED` status (case-insensitive for banners)
4. **Error Handling:** Implement proper error handling for failed requests
5. **Image Fallbacks:** Always provide fallback images if API doesn't return image URLs
6. **Pagination:** Implement pagination for large datasets (Blogs, Medicines)
7. **Caching:** Consider caching these responses to reduce API calls
8. **Loading States:** Show loading indicators while fetching data
9. **Empty States:** Handle cases when no active items are found

---

## Status Values Reference

| Section | Active Status | Inactive Status | Priority Range |
|---------|--------------|-----------------|----------------|
| **Banner** | `ACTIVE` (case-insensitive) | `INACTIVE`, `dd`, etc. | 1, 2, 3 only (for website) |
| **Blog** | `PUBLISHED` | `DRAFT`, `ARCHIVED` | N/A |
| **Medicine** | `ACTIVE` | `INACTIVE` | N/A |
| **Category** | `ACTIVE` | `INACTIVE` | N/A |

**Banner Priority Notes:**
- Website displays only banners with priority 1, 2, or 3
- Admin can set any priority value, but website filters to 1-3
- Banners are sorted by priority ascending (1 → 2 → 3)
- Maximum 3 banners displayed at once

---

**Last Updated:** January 2025

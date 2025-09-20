# 🏥 Backend Developer Requirements - Pharmaceutical Admin Panel

## 📋 Project Overview

We're building a **pharmaceutical e-commerce admin panel** with the following features:
- Medicine inventory management
- Order processing and tracking
- Customer management
- Prescription handling
- Analytics and reporting
- User authentication and permissions

## 🗄️ Database Schema Requirements

### **1. Users Table**
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role ENUM('admin', 'staff', 'customer') DEFAULT 'customer',
  status ENUM('active', 'inactive') DEFAULT 'active',
  avatar_url VARCHAR(500),
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### **2. Categories Table**
```sql
CREATE TABLE categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(7), -- Hex color code
  status ENUM('active', 'inactive') DEFAULT 'active',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### **3. Manufacturers Table**
```sql
CREATE TABLE manufacturers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  country VARCHAR(50),
  contact_email VARCHAR(100),
  contact_phone VARCHAR(20),
  website VARCHAR(200),
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### **4. Medicines Table**
```sql
CREATE TABLE medicines (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  sku VARCHAR(50) UNIQUE NOT NULL,
  barcode VARCHAR(50),
  price DECIMAL(10,2) NOT NULL,
  cost_price DECIMAL(10,2),
  stock INT DEFAULT 0,
  min_stock_level INT DEFAULT 10,
  category_id INT,
  manufacturer_id INT,
  image_url VARCHAR(500),
  images JSON, -- Array of image URLs
  status ENUM('active', 'inactive', 'out_of_stock') DEFAULT 'active',
  prescription_required BOOLEAN DEFAULT FALSE,
  expiry_date DATE,
  batch_number VARCHAR(50),
  weight DECIMAL(8,2), -- in grams
  dimensions VARCHAR(50), -- LxWxH
  ingredients TEXT,
  dosage_instructions TEXT,
  side_effects TEXT,
  contraindications TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id),
  FOREIGN KEY (manufacturer_id) REFERENCES manufacturers(id),
  INDEX idx_name (name),
  INDEX idx_sku (sku),
  INDEX idx_category (category_id),
  INDEX idx_status (status)
);
```

### **5. Orders Table**
```sql
CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_number VARCHAR(20) UNIQUE NOT NULL,
  customer_id INT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  shipping_amount DECIMAL(10,2) DEFAULT 0,
  final_amount DECIMAL(10,2) NOT NULL,
  status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded') DEFAULT 'pending',
  payment_method ENUM('cash', 'card', 'upi', 'netbanking', 'wallet') NOT NULL,
  payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
  payment_id VARCHAR(100),
  shipping_address JSON NOT NULL, -- Full address object
  billing_address JSON,
  prescription_required BOOLEAN DEFAULT FALSE,
  prescription_url VARCHAR(500),
  prescription_verified BOOLEAN DEFAULT FALSE,
  notes TEXT,
  tracking_number VARCHAR(100),
  estimated_delivery DATE,
  delivered_at TIMESTAMP NULL,
  cancelled_at TIMESTAMP NULL,
  cancellation_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES users(id),
  INDEX idx_customer (customer_id),
  INDEX idx_status (status),
  INDEX idx_order_number (order_number),
  INDEX idx_created_at (created_at)
);
```

### **6. Order Items Table**
```sql
CREATE TABLE order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  medicine_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (medicine_id) REFERENCES medicines(id),
  INDEX idx_order (order_id),
  INDEX idx_medicine (medicine_id)
);
```

### **7. Prescriptions Table**
```sql
CREATE TABLE prescriptions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  customer_id INT NOT NULL,
  order_id INT,
  prescription_url VARCHAR(500) NOT NULL,
  file_name VARCHAR(200),
  file_size INT,
  file_type VARCHAR(50),
  status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
  verified_by INT,
  verified_at TIMESTAMP NULL,
  rejection_reason TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES users(id),
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (verified_by) REFERENCES users(id),
  INDEX idx_customer (customer_id),
  INDEX idx_status (status)
);
```

### **8. Inventory Logs Table**
```sql
CREATE TABLE inventory_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  medicine_id INT NOT NULL,
  type ENUM('in', 'out', 'adjustment') NOT NULL,
  quantity INT NOT NULL,
  previous_stock INT NOT NULL,
  new_stock INT NOT NULL,
  reason VARCHAR(200),
  reference_id INT, -- Order ID or other reference
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (medicine_id) REFERENCES medicines(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX idx_medicine (medicine_id),
  INDEX idx_type (type),
  INDEX idx_created_at (created_at)
);
```

### **9. Notifications Table**
```sql
CREATE TABLE notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  type ENUM('order', 'prescription', 'inventory', 'system') NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  data JSON, -- Additional data
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user (user_id),
  INDEX idx_type (type),
  INDEX idx_is_read (is_read)
);
```

## 🔌 API Endpoints Requirements

### **Authentication APIs**
```typescript
POST   /api/auth/login              // Login user
POST   /api/auth/logout             // Logout user
GET    /api/auth/me                 // Get current user
POST   /api/auth/register           // Register new user
POST   /api/auth/forgot-password    // Forgot password
POST   /api/auth/reset-password     // Reset password
PUT    /api/auth/profile            // Update profile
PUT    /api/auth/change-password    // Change password
```

### **Medicines APIs**
```typescript
GET    /api/medicines                           // Get all medicines (with pagination, search, filter)
POST   /api/medicines                           // Create new medicine
GET    /api/medicines/:id                       // Get specific medicine
PUT    /api/medicines/:id                       // Update medicine
DELETE /api/medicines/:id                       // Delete medicine
POST   /api/medicines/bulk-upload               // Bulk upload medicines (CSV/Excel)
GET    /api/medicines/categories                // Get all categories
POST   /api/medicines/categories                // Create category
PUT    /api/medicines/categories/:id            // Update category
DELETE /api/medicines/categories/:id            // Delete category
GET    /api/medicines/manufacturers             // Get all manufacturers
POST   /api/medicines/manufacturers             // Create manufacturer
PUT    /api/medicines/manufacturers/:id         // Update manufacturer
DELETE /api/medicines/manufacturers/:id         // Delete manufacturer
GET    /api/medicines/low-stock                 // Get low stock medicines
PUT    /api/medicines/:id/stock                 // Update stock quantity
GET    /api/medicines/search                    // Search medicines
```

### **Orders APIs**
```typescript
GET    /api/orders                              // Get all orders (with pagination, filter)
POST   /api/orders                              // Create new order
GET    /api/orders/:id                          // Get specific order
PUT    /api/orders/:id                          // Update order
DELETE /api/orders/:id                          // Cancel order
PUT    /api/orders/:id/status                   // Update order status
GET    /api/orders/:id/items                    // Get order items
POST   /api/orders/:id/items                    // Add item to order
PUT    /api/orders/:id/items/:itemId            // Update order item
DELETE /api/orders/:id/items/:itemId            // Remove item from order
GET    /api/orders/status-counts                // Get order status counts
POST   /api/orders/:id/ship                     // Ship order
POST   /api/orders/:id/deliver                  // Mark as delivered
POST   /api/orders/:id/cancel                   // Cancel order
```

### **Customers APIs**
```typescript
GET    /api/customers                           // Get all customers (with pagination, search)
POST   /api/customers                           // Create customer
GET    /api/customers/:id                       // Get specific customer
PUT    /api/customers/:id                       // Update customer
DELETE /api/customers/:id                       // Delete customer
GET    /api/customers/:id/orders                // Get customer orders
GET    /api/customers/:id/prescriptions         // Get customer prescriptions
POST   /api/customers/:id/block                 // Block customer
POST   /api/customers/:id/unblock               // Unblock customer
GET    /api/customers/analytics                 // Get customer analytics
```

### **Prescriptions APIs**
```typescript
GET    /api/prescriptions                       // Get all prescriptions (with pagination, filter)
POST   /api/prescriptions                       // Upload prescription
GET    /api/prescriptions/:id                   // Get specific prescription
PUT    /api/prescriptions/:id/verify            // Verify prescription
PUT    /api/prescriptions/:id/reject            // Reject prescription
DELETE /api/prescriptions/:id                   // Delete prescription
GET    /api/prescriptions/status-counts         // Get prescription status counts
POST   /api/prescriptions/:id/process           // Process prescription
```

### **Analytics APIs**
```typescript
GET    /api/analytics/dashboard                 // Get dashboard statistics
GET    /api/analytics/sales                     // Get sales data
GET    /api/analytics/revenue                   // Get revenue data
GET    /api/analytics/customers                 // Get customer analytics
GET    /api/analytics/medicines                 // Get medicine analytics
GET    /api/analytics/orders                    // Get order analytics
GET    /api/analytics/prescriptions             // Get prescription analytics
GET    /api/analytics/inventory                 // Get inventory analytics
GET    /api/analytics/reports/sales             // Generate sales report
GET    /api/analytics/reports/inventory         // Generate inventory report
```

### **File Upload APIs**
```typescript
POST   /api/upload/image                        // Upload image files
POST   /api/upload/prescription                 // Upload prescription files
POST   /api/upload/bulk-medicines               // Upload bulk medicines file
GET    /api/upload/:filename                    // Get uploaded file
```

### **Notifications APIs**
```typescript
GET    /api/notifications                       // Get user notifications
PUT    /api/notifications/:id/read              // Mark notification as read
PUT    /api/notifications/read-all              // Mark all notifications as read
DELETE /api/notifications/:id                   // Delete notification
```

## 📊 API Response Format

### **Success Response**
```json
{
  "success": true,
  "data": {
    // Actual data here
  },
  "message": "Operation completed successfully",
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### **Error Response**
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    // Additional error details
  }
}
```

### **List Response (with pagination)**
```json
{
  "success": true,
  "data": [
    // Array of items
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## 🔍 Query Parameters

### **Pagination**
- `page` - Page number (default: 1)
- `limit` or `pageSize` - Items per page (default: 10)

### **Search & Filter**
- `search` - Search term
- `sortBy` - Sort field
- `sortOrder` - Sort direction (asc/desc)
- `status` - Filter by status
- `category` - Filter by category
- `dateFrom` - Filter from date
- `dateTo` - Filter to date

### **Example API Calls**
```typescript
// Get medicines with pagination and search
GET /api/medicines?page=1&limit=20&search=paracetamol&category=pain-relief&status=active

// Get orders with date filter
GET /api/orders?dateFrom=2023-12-01&dateTo=2023-12-31&status=pending

// Get customers with search
GET /api/customers?search=john&page=1&limit=10
```

## 🔐 Authentication & Authorization

### **JWT Token Authentication**
- Use JWT tokens for authentication
- Token should include user ID, role, and permissions
- Token expiry: 24 hours
- Refresh token: 7 days

### **User Roles & Permissions**
```typescript
// Admin - Full access
const adminPermissions = [
  'medicines:read', 'medicines:write', 'medicines:delete',
  'orders:read', 'orders:write', 'orders:delete',
  'customers:read', 'customers:write', 'customers:delete',
  'prescriptions:read', 'prescriptions:write', 'prescriptions:delete',
  'analytics:read', 'users:read', 'users:write'
];

// Staff - Limited access
const staffPermissions = [
  'medicines:read', 'medicines:write',
  'orders:read', 'orders:write',
  'customers:read',
  'prescriptions:read', 'prescriptions:write'
];

// Customer - Very limited access
const customerPermissions = [
  'orders:read', 'prescriptions:read', 'prescriptions:write'
];
```

## 📁 File Upload Requirements

### **Image Upload**
- Supported formats: JPG, PNG, WebP
- Max size: 5MB
- Generate thumbnails for different sizes
- Store in cloud storage (AWS S3, Cloudinary, etc.)

### **Prescription Upload**
- Supported formats: JPG, PNG, PDF
- Max size: 10MB
- Store securely with access controls

### **Bulk Upload**
- Support CSV and Excel files
- Validate data before processing
- Return detailed error report

## 🔔 Real-time Features

### **WebSocket Events**
```typescript
// Order events
'order:created' - New order created
'order:status_changed' - Order status updated
'order:cancelled' - Order cancelled

// Prescription events
'prescription:uploaded' - New prescription uploaded
'prescription:verified' - Prescription verified
'prescription:rejected' - Prescription rejected

// Inventory events
'medicine:low_stock' - Medicine stock is low
'medicine:out_of_stock' - Medicine is out of stock

// Notification events
'notification:new' - New notification
```

## 📈 Performance Requirements

### **Database Optimization**
- Use proper indexes on frequently queried columns
- Implement database connection pooling
- Use pagination for all list endpoints
- Cache frequently accessed data

### **API Performance**
- Response time < 200ms for simple queries
- Response time < 500ms for complex queries
- Implement rate limiting
- Use compression for large responses

## 🧪 Testing Requirements

### **API Testing**
- Unit tests for all endpoints
- Integration tests for database operations
- Load testing for performance
- Security testing for authentication

### **Data Validation**
- Validate all input data
- Sanitize user inputs
- Implement proper error handling
- Return meaningful error messages

## 🚀 Deployment Requirements

### **Environment Variables**
```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=pharmacy_admin
DB_USER=admin
DB_PASSWORD=password

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# File Upload
UPLOAD_PATH=/uploads
MAX_FILE_SIZE=10485760

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password

# Redis (for caching)
REDIS_HOST=localhost
REDIS_PORT=6379
```

### **Docker Support**
- Provide Dockerfile for containerization
- Include docker-compose.yml for local development
- Support for production deployment

## 📋 Priority Implementation Order

### **Phase 1 (Week 1)**
1. Database schema setup
2. User authentication APIs
3. Basic medicines CRUD APIs
4. Basic orders CRUD APIs

### **Phase 2 (Week 2)**
1. Categories and manufacturers APIs
2. Advanced medicines APIs (search, filter, bulk upload)
3. Prescriptions APIs
4. File upload functionality

### **Phase 3 (Week 3)**
1. Analytics APIs
2. Notifications system
3. Real-time features (WebSocket)
4. Performance optimization

### **Phase 4 (Week 4)**
1. Advanced filtering and search
2. Reporting APIs
3. Security hardening
4. Testing and documentation

## 📞 Contact & Support

- **Frontend Developer**: [Your Name] - [Your Email]
- **Project Repository**: [GitHub Link]
- **API Documentation**: [Swagger/Postman Collection Link]
- **Database Schema**: [SQL Dump Link]

## 📝 Additional Notes

1. **Data Security**: Implement proper data encryption and access controls
2. **Audit Logs**: Log all important operations for tracking
3. **Backup Strategy**: Implement regular database backups
4. **Monitoring**: Set up application monitoring and logging
5. **Documentation**: Maintain up-to-date API documentation

---

**This document contains all the requirements for building the backend of the pharmaceutical admin panel. Please implement the APIs according to these specifications and let me know if you have any questions!** 🚀

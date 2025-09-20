# 🏥 White-Label Pharmaceutical E-commerce Platform

## Overview

This is a **completely modular and reusable** pharmaceutical e-commerce platform designed for rapid client deployment. You can set up a new client's website and admin panel within **24 hours** by simply changing branding, configuration, and connecting to their backend API.

## 🚀 Key Features

### ✅ **One-Day Deployment**
- Automated client setup script
- Pre-built modular components
- Configurable branding system
- API abstraction layer
- Ready-to-deploy templates

### ✅ **Complete Modularity**
- **Client Configuration System**: Easy branding and feature toggles
- **Reusable Component Library**: BaseCard, DataTable, and more
- **API Abstraction**: Works with any backend
- **Theme System**: Dynamic colors, fonts, and styling
- **Module System**: Enable/disable features per client

### ✅ **Pharmaceutical-Specific Features**
- Medicine inventory management
- Prescription handling
- Doctor verification
- Insurance integration
- Stock management
- Bulk upload capabilities
- Category management
- Manufacturer tracking

## 📁 Project Structure

```
FC-FE/
├── src/
│   ├── config/
│   │   └── clientConfig.ts          # Client configuration system
│   ├── components/
│   │   ├── core/                    # Reusable components
│   │   │   ├── BaseCard.tsx
│   │   │   ├── DataTable.tsx
│   │   │   └── ...
│   │   ├── Medicine/                # Medicine module
│   │   ├── Dashboard/               # Dashboard module
│   │   ├── Orders/                  # Orders module
│   │   └── ...
│   ├── services/
│   │   ├── apiClient.ts             # Centralized API client
│   │   └── modules/                 # Module-specific services
│   │       ├── medicineService.ts
│   │       ├── orderService.ts
│   │       └── ...
│   └── ...
├── scripts/
│   └── setup-client.js              # Client setup automation
├── clients/                         # Client configurations
│   ├── curebasket/
│   │   ├── config.json
│   │   ├── .env
│   │   ├── build.sh
│   │   ├── deploy.sh
│   │   └── README.md
│   └── ...
└── docs/
    └── WHITE_LABEL_GUIDE.md
```

## 🛠️ Quick Start

### 1. **Set Up New Client** (5 minutes)

```bash
# Run the automated setup script
node scripts/setup-client.js "MediCare Plus"

# Follow the interactive prompts:
# - Domain: medicare-plus.com
# - Primary Color: #10b981
# - Features: Enable/disable as needed
# - Modules: Configure per requirements
```

### 2. **Customize Branding** (10 minutes)

```typescript
// clients/medicare-plus/config.json
{
  "branding": {
    "name": "MediCare Plus",
    "logo": "/logo.png",
    "primaryColor": "#10b981",
    "secondaryColor": "#059669",
    "accentColor": "#34d399"
  }
}
```

### 3. **Configure Backend API** (15 minutes)

```typescript
// clients/medicare-plus/config.json
{
  "api": {
    "baseURL": "https://api.medicare-plus.com",
    "endpoints": {
      "medicines": "/medicines",
      "orders": "/orders",
      "customers": "/customers"
    }
  }
}
```

### 4. **Build and Deploy** (5 minutes)

```bash
# Build the application
cd clients/medicare-plus
./build.sh

# Deploy to production
./deploy.sh
```

## 🎨 Customization System

### **Client Configuration**

Every client gets a `config.json` file that controls:

```typescript
interface ClientConfig {
  // Basic Info
  id: string;                    // "medicare-plus"
  name: string;                  // "MediCare Plus"
  domain: string;                // "medicare-plus.com"
  
  // Branding
  branding: {
    name: string;                // "MediCare Plus"
    logo: string;                // "/logo.png"
    primaryColor: string;        // "#10b981"
    secondaryColor: string;      // "#059669"
    accentColor: string;         // "#34d399"
    fontFamily: string;          // "Inter, sans-serif"
  };
  
  // Features (Enable/Disable)
  features: {
    enablePrescriptions: boolean;
    enableInsuranceIntegration: boolean;
    enableBulkUpload: boolean;
    // ... more features
  };
  
  // Modules (Show/Hide)
  modules: {
    medicines: boolean;
    orders: boolean;
    customers: boolean;
    // ... more modules
  };
  
  // API Configuration
  api: {
    baseURL: string;
    endpoints: Record<string, string>;
  };
}
```

### **Dynamic Theming**

Colors and fonts are applied globally using CSS custom properties:

```css
:root {
  --primary-color: #10b981;      /* From client config */
  --secondary-color: #059669;    /* From client config */
  --accent-color: #34d399;       /* From client config */
  --font-family: 'Inter, sans-serif';
}
```

## 🧩 Modular Components

### **BaseCard Component**

Reusable card component for all modules:

```tsx
<BaseCard
  title="Medicines"
  subtitle="Manage your medicine inventory"
  variant="elevated"
  size="lg"
  loading={loading}
  error={error}
  actions={<Button>Add Medicine</Button>}
>
  {/* Card content */}
</BaseCard>
```

### **DataTable Component**

Universal table component with built-in features:

```tsx
<DataTable
  data={medicines}
  columns={columns}
  searchable={true}
  filterable={true}
  sortable={true}
  selectable={true}
  pagination={{
    current: 1,
    pageSize: 10,
    total: 100
  }}
  onSelectionChange={handleSelection}
  onRowClick={handleRowClick}
/>
```

## 🔌 API Integration

### **Centralized API Client**

All API calls go through a single client:

```typescript
// services/apiClient.ts
const response = await apiClient.get('/medicines', { page: 1, limit: 10 });
const medicine = await apiClient.post('/medicines', medicineData);
```

### **Module-Specific Services**

Each module has its own service:

```typescript
// services/modules/medicineService.ts
const medicines = await medicineService.getMedicines({ page: 1 });
const medicine = await medicineService.createMedicine(data);
```

## 📦 Module System

### **Available Modules**

| Module | Description | Features |
|--------|-------------|----------|
| **Dashboard** | Overview and analytics | KPIs, charts, recent activity |
| **Medicines** | Medicine management | CRUD, bulk upload, categories |
| **Orders** | Order processing | Order tracking, status updates |
| **Customers** | Customer management | Profiles, order history |
| **Prescriptions** | Prescription handling | Upload, verification, processing |
| **Inventory** | Stock management | Stock levels, low stock alerts |
| **Analytics** | Business insights | Sales reports, trends |
| **Users** | User management | Roles, permissions, access control |

### **Enabling/Disabling Modules**

```typescript
// In client config
{
  "modules": {
    "medicines": true,      // Show medicines module
    "prescriptions": false, // Hide prescriptions module
    "analytics": true       // Show analytics module
  }
}
```

## 🚀 Deployment Process

### **1. Client Setup**
```bash
node scripts/setup-client.js "Client Name"
```

### **2. Configuration**
- Update `clients/{client-id}/config.json`
- Add logo and favicon files
- Configure API endpoints

### **3. Build**
```bash
cd clients/{client-id}
./build.sh
```

### **4. Deploy**
```bash
./deploy.sh
```

## 🔧 Backend Integration

### **Required API Endpoints**

Your backend needs to provide these endpoints:

```typescript
// Authentication
POST /auth/login
POST /auth/logout
GET  /auth/me

// Medicines
GET    /medicines          // List medicines
POST   /medicines          // Create medicine
GET    /medicines/:id      // Get medicine
PUT    /medicines/:id      // Update medicine
DELETE /medicines/:id      // Delete medicine
POST   /medicines/bulk-upload

// Orders
GET    /orders
POST   /orders
GET    /orders/:id
PUT    /orders/:id
DELETE /orders/:id

// Categories
GET    /categories
POST   /categories
PUT    /categories/:id
DELETE /categories/:id
```

### **API Response Format**

```typescript
{
  "success": true,
  "data": { /* actual data */ },
  "message": "Success message",
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

## 📊 Client Examples

### **CureBasket** (Current)
- **Domain**: curebasket-admin.vercel.app
- **Colors**: Blue theme (#3b82f6)
- **Features**: Full pharmaceutical suite
- **Modules**: All enabled

### **MediCare Plus** (Example)
- **Domain**: medicare-plus.com
- **Colors**: Green theme (#10b981)
- **Features**: Basic medicine management
- **Modules**: Medicines, Orders, Customers

### **PharmaCorp** (Example)
- **Domain**: pharma-corp.com
- **Colors**: Purple theme (#8b5cf6)
- **Features**: Advanced analytics
- **Modules**: All + custom reporting

## 🎯 Benefits

### **For You (Developer)**
- ✅ **One-time development** - Build once, deploy many
- ✅ **Rapid deployment** - New clients in 24 hours
- ✅ **Consistent quality** - Same high-quality code for all clients
- ✅ **Easy maintenance** - Update once, affects all clients
- ✅ **Scalable business** - Handle unlimited clients

### **For Clients**
- ✅ **Fast delivery** - Get their platform quickly
- ✅ **Custom branding** - Their colors, logo, domain
- ✅ **Flexible features** - Only pay for what they need
- ✅ **Professional quality** - Enterprise-grade platform
- ✅ **Easy updates** - Regular improvements and fixes

## 📈 Scaling Strategy

### **Phase 1: Foundation** ✅
- [x] Modular component system
- [x] Client configuration system
- [x] API abstraction layer
- [x] Basic modules (Dashboard, Medicines, Orders)

### **Phase 2: Expansion** 🚧
- [ ] Advanced modules (Analytics, Reports, Users)
- [ ] Multi-tenant architecture
- [ ] Advanced customization options
- [ ] White-label mobile app

### **Phase 3: Enterprise** 📋
- [ ] Custom module development
- [ ] Advanced integrations (ERP, CRM)
- [ ] Multi-language support
- [ ] Advanced analytics and reporting

## 🛡️ Best Practices

### **Code Organization**
- Keep components modular and reusable
- Use TypeScript for type safety
- Follow consistent naming conventions
- Document all public APIs

### **Client Management**
- Use descriptive client IDs
- Keep configurations in version control
- Document client-specific customizations
- Regular backups of client data

### **Deployment**
- Test in staging before production
- Use environment-specific configurations
- Monitor performance and errors
- Keep deployment logs

## 📞 Support

For questions or support:
- **Documentation**: Check this guide and inline comments
- **Issues**: Create GitHub issues for bugs
- **Features**: Submit feature requests
- **Custom Development**: Contact for custom modules

---

**Ready to deploy your first client? Run `node scripts/setup-client.js "Your Client Name"` and get started!** 🚀

# API Endpoint Information

## Create Super Admin Endpoint

### Endpoint Details
- **Method**: `POST`
- **Path**: `/admin-penal/create-superadmin/super-admin-api-key`
- **Full URL** (for Postman): `https://java.api.curebasket.com/backend/admin-penal/create-superadmin/super-admin-api-key`
- **Alternative** (if using localhost): `http://localhost:8080/admin-penal/create-superadmin/super-admin-api-key`

### Headers
```
Content-Type: application/json
X-API-Key: <your-api-key-here>
```

### Request Body
```json
{
  "name": "Organization Name",
  "uniqueId": "ORG123",
  "domainName": "example.store",
  "password": "securePassword123",
  "role": "SUPERADMIN",
  "tagline": "",
  "description": "",
  "isCategoryEnabled": true,
  "isSupplier": false,
  "isSeller": true,
  "isActive": true,
  "isDeleted": false,
  "isVerified": false,
  "address": {
    "firstName": "John",
    "lastName": "Doe",
    "addressLine1": "123 Main St",
    "addressLine2": "",
    "city": "City",
    "state": "State",
    "postalCode": "12345",
    "country": "INDIA",
    "emailAddress": "john@example.com",
    "phoneNumber": "1234567890"
  },
  "contact": {
    "email": "john@example.com",
    "mainPhone": "1234567890",
    "secondaryPhone": "",
    "isEmailVerified": false,
    "isMainPhoneVerified": false
  }
}
```

### Common Issues

#### Getting HTML Response Instead of JSON
If you're getting HTML (the React app's index.html) with 200 status:

1. **Wrong URL**: Make sure you're hitting the backend API URL, not the frontend URL
   - ❌ Wrong: `http://localhost:5173/admin-penal/create-superadmin/super-admin-api-key`
   - ✅ Correct: `https://java.api.curebasket.com/backend/admin-penal/create-superadmin/super-admin-api-key`

2. **Backend Route Not Configured**: The backend might not have this route configured. Check with backend team.

3. **Missing API Prefix**: Some backends require `/api` prefix
   - Try: `https://java.api.curebasket.com/backend/api/admin-penal/create-superadmin/super-admin-api-key`

4. **CORS Issue**: If testing from browser, check browser console for CORS errors.

### Testing in Postman

1. Set method to `POST`
2. URL: `https://java.api.curebasket.com/backend/admin-penal/create-superadmin/super-admin-api-key`
3. Headers:
   - `Content-Type: application/json`
   - `X-API-Key: <your-api-key>`
4. Body: Select "raw" and "JSON", paste the JSON body above
5. Send request

### Expected Response
```json
{
  "success": true,
  "message": "Super admin created successfully",
  "data": {
    // ... admin data
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message here",
  "message": "Detailed error message"
}
```


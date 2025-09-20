# Dynamic Dashboard Documentation

## Overview
This dynamic dashboard system renders categories and elements based on their active status from the backend. Only categories with active elements are displayed, and each category has its own color theme.

## Features

### 🎨 Dynamic Color-Coded Categories
- Each category has a unique color theme
- Colors are defined in the backend data
- Visual indicators show active/inactive status

### 🔄 Backend Integration
- Fetches data from `/api/categories` endpoint
- Real-time toggle of element status
- Graceful fallback to mock data if backend is unavailable

### 📱 Responsive Design
- Mobile-first approach
- Adaptive grid layout
- Touch-friendly interactions

### ⚡ Real-time Updates
- Elements can be toggled on/off
- Categories disappear when no active elements remain
- Instant UI feedback

## Backend API Structure

### Expected API Endpoints

#### GET `/api/categories`
Returns array of categories with their elements:

```json
[
  {
    "id": 1,
    "name": "Analytics",
    "color": "#3B82F6",
    "icon": "📊",
    "isActive": true,
    "elements": [
      {
        "id": 1,
        "name": "Sales Overview",
        "isActive": true
      }
    ]
  }
]
```

#### PATCH `/api/categories/:categoryId/elements/:elementId`
Toggle element active status:

```json
{
  "isActive": true
}
```

#### PATCH `/api/categories/:categoryId`
Toggle category active status:

```json
{
  "isActive": true
}
```

## Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
REACT_APP_API_URL=http://localhost:3001/api
```

### Service Configuration
The `categoryService.js` handles all API calls and provides fallback mock data for development.

## Component Structure

```
src/
├── Components/
│   ├── Dashboard/
│   │   ├── Dashboard.jsx          # Main dashboard component
│   │   ├── Dashboard.css          # Dashboard styles
│   │   ├── CategoryCard.jsx       # Individual category card
│   │   └── CategoryCard.css       # Category card styles
│   └── SideBar/
│       ├── SideBar.jsx            # Navigation sidebar
│       └── SideBar.css            # Sidebar styles
├── services/
│   └── categoryService.js         # API service layer
└── App.jsx                        # Main app component
```

## Usage

### Running the Application
```bash
npm run dev
```

### Adding New Categories
1. Update the backend API to include new categories
2. Ensure categories have `isActive: true` and at least one active element
3. Categories will automatically appear in the dashboard

### Customizing Colors
Colors are defined in the backend data. Each category should have a `color` property with a valid CSS color value.

## Key Features Explained

### Dynamic Rendering Logic
- Categories are filtered to show only those with `isActive: true`
- Within each category, only elements with `isActive: true` are displayed
- If a category has no active elements, it's hidden from the dashboard

### Color System
- Each category has a unique color defined in the backend
- Colors are used for:
  - Left border of category cards
  - Element indicators
  - Icon backgrounds
  - Hover effects

### State Management
- Local state updates immediately for better UX
- Backend calls happen asynchronously
- Error handling with retry functionality

## Development Notes

- Mock data is provided for development when backend is unavailable
- All API calls include proper error handling
- Components are fully responsive and accessible
- CSS uses modern features like CSS Grid and Flexbox

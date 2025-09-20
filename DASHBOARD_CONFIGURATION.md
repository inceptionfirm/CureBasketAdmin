# Dashboard Configuration System

## Overview
The dashboard configuration system allows you to completely customize the dashboard appearance, layout, widgets, and content for different clients. Everything is dynamic and can be changed without code modifications.

## Files Structure

```
src/
├── config/
│   └── dashboardConfig.ts          # Dashboard configuration definitions
├── contexts/
│   └── DashboardContext.tsx        # Dashboard context provider
├── styles/
│   └── dashboard.css               # Dynamic dashboard CSS variables
└── Components/
    └── Dashboard/
        └── Dashboard.tsx           # Dashboard component (to be updated)
```

## Configuration Types

### 1. Dashboard Layout
```typescript
layout: {
  gridColumns: 4,                    // Number of grid columns
  widgetSpacing: '1.5rem',          // Space between widgets
  sectionSpacing: '2rem',           // Space between sections
  cardPadding: '1.5rem',            // Card padding
  cardRadius: '12px',               // Card border radius
  cardShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'  // Card shadow
}
```

### 2. Dashboard Colors
```typescript
colors: {
  primary: '#86efac',               // Primary color
  secondary: '#bbf7d0',             // Secondary color
  accent: '#dcfce7',                // Accent color
  background: '#f8fffe',            // Background color
  surface: '#ffffff',               // Card surface color
  text: {
    primary: '#374151',             // Primary text color
    secondary: '#6b7280',           // Secondary text color
    muted: '#9ca3af'                // Muted text color
  },
  success: '#10b981',               // Success color
  warning: '#f59e0b',               // Warning color
  error: '#ef4444',                 // Error color
  info: '#3b82f6',                  // Info color
  border: '#e5e7eb'                 // Border color
}
```

### 3. Dashboard Widgets
```typescript
widgets: [
  {
    id: 'total-categories',         // Unique widget ID
    title: 'Total Categories',      // Widget title
    value: '12',                    // Widget value
    description: 'Active categories', // Widget description
    icon: '📊',                     // Widget icon
    color: '#86efac',               // Widget color
    trend: {                        // Optional trend data
      value: 12,
      direction: 'up' | 'down' | 'neutral'
    },
    visible: true                   // Widget visibility
  }
]
```

### 4. Dashboard Sections
```typescript
sections: [
  {
    id: 'overview',                 // Section ID
    title: 'Overview',              // Section title
    description: 'Key metrics',     // Section description
    visible: true,                  // Section visibility
    order: 1                        // Display order
  }
]
```

### 5. Dashboard Features
```typescript
features: {
  showWelcomeMessage: true,         // Show welcome message
  showQuickActions: true,           // Show quick actions
  showRecentActivity: false,        // Show recent activity
  showNotifications: true,          // Show notifications
  showSearchBar: true               // Show search bar
}
```

## Usage Examples

### 1. Using Dashboard Context in Components
```typescript
import { useDashboard } from '../contexts/DashboardContext';

const MyComponent = () => {
  const { config, updateConfig, updateWidget, toggleWidget } = useDashboard();
  
  // Access configuration
  const primaryColor = config.colors.primary;
  const widgets = config.widgets;
  
  // Update configuration
  updateConfig({ 
    colors: { ...config.colors, primary: '#ff0000' } 
  });
  
  // Update specific widget
  updateWidget('total-categories', { value: '15' });
  
  // Toggle widget visibility
  toggleWidget('total-categories');
};
```

### 2. Using CSS Variables
```css
.my-widget {
  background: var(--dashboard-surface);
  color: var(--dashboard-text-primary);
  border: 1px solid var(--dashboard-border);
  border-radius: var(--dashboard-card-radius);
  padding: var(--dashboard-card-padding);
  box-shadow: var(--dashboard-card-shadow);
}
```

### 3. Creating Client-Specific Configurations
```typescript
// In dashboardConfig.ts
export const dashboardClientConfigs = {
  'ecommerce-client': {
    colors: {
      primary: '#fbbf24',
      secondary: '#fde68a',
      // ... other colors
    },
    widgets: [
      {
        id: 'total-orders',
        title: 'Total Orders',
        value: '1,247',
        // ... other properties
      }
    ],
    welcomeMessage: {
      title: 'Welcome to ShopMaster!',
      subtitle: 'Monitor your e-commerce performance.'
    }
  }
};
```

## Dynamic Features

### 1. Real-time Updates
- All changes are applied immediately
- CSS variables update automatically
- No page refresh required

### 2. Client Switching
```typescript
const { switchClient } = useDashboard();
switchClient('ecommerce-client'); // Switch to e-commerce theme
```

### 3. Widget Management
```typescript
// Add new widget
const newWidget = {
  id: 'new-metric',
  title: 'New Metric',
  value: '100',
  description: 'Description',
  icon: '📈',
  color: '#3b82f6',
  visible: true
};

updateConfig({
  widgets: [...config.widgets, newWidget]
});
```

### 4. Section Management
```typescript
// Toggle section visibility
toggleSection('analytics');

// Update section
updateConfig({
  sections: config.sections.map(section => 
    section.id === 'analytics' 
      ? { ...section, title: 'New Analytics' }
      : section
  )
});
```

## Pre-configured Clients

### 1. Default (CureBasket)
- Green color scheme
- Healthcare-focused widgets
- Clean, minimal design

### 2. E-commerce Client
- Orange/yellow color scheme
- Sales and order widgets
- Business-focused metrics

### 3. Healthcare Client
- Green color scheme
- Patient and appointment widgets
- Medical practice focus

## Best Practices

1. **Use CSS Variables**: Always use CSS variables for colors and layout
2. **Consistent Naming**: Use descriptive IDs and names
3. **Responsive Design**: Test on different screen sizes
4. **Performance**: Avoid too many widgets on mobile
5. **Accessibility**: Ensure good color contrast
6. **Testing**: Test all client configurations

## Adding New Clients

1. Add configuration to `dashboardClientConfigs`
2. Define colors, widgets, and content
3. Test the configuration
4. Update documentation

## Troubleshooting

### Common Issues:
1. **Widgets not updating**: Check if `useDashboard` is used correctly
2. **Colors not changing**: Verify CSS variables are applied
3. **Layout issues**: Check grid configuration
4. **Performance**: Reduce number of widgets or optimize CSS

### Debug Tips:
1. Check browser console for errors
2. Inspect CSS variables in DevTools
3. Verify localStorage configuration
4. Test with different clients

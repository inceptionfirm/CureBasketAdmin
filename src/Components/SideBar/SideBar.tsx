import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  FileText,
  Image,
  Pill,
  FlaskConical,
  Building2,
  Truck,
  ShoppingCart,
  Package,
  User,
  Settings,
  type LucideIcon
} from 'lucide-react';
import { useConfig } from '../../contexts/ConfigContext';
import { useLocale } from '../../contexts/LocaleContext';
import { SideBarProps, SideBarItem } from '../../types';
import { sidebarService, SidebarMenuItem } from '../../services/sidebarService';
import './SideBar.css';

const SIDEBAR_ICON_MAP: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  users: Users,
  categories: FolderOpen,
  blogs: FileText,
  'banner-management': Image,
  prescriptions: Pill,
  medicine: FlaskConical,
  'bank-contact': Building2,
  'order-shipping-config': Truck,
  cart: ShoppingCart,
  dispense: Package,
  profile: User,
  settings: Settings
};

const SideBar: React.FC<SideBarProps> = ({ currentView, onViewChange, isOpen = true }) => {
  const { config } = useConfig();
  const { t } = useLocale();
  
  const [menuItems, setMenuItems] = useState<SideBarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const convertToSideBarItem = (item: SidebarMenuItem): SideBarItem => ({
    title: item.title,
    icon: item.icon,
    key: item.id,
    link: item.path,
    isActive: item.isActive !== false,
    isVisible: true,
    badge: item.badge
  });

  const loadMenuItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const dynamicItems = await sidebarService.getMenuItems();
      const convertedItems = dynamicItems.map(convertToSideBarItem);
      setMenuItems(convertedItems);
    } catch (err) {
      setError('Failed to load menu items');
      const defaultItems = sidebarService.getDefaultConfig().menuItems;
      const convertedItems = defaultItems.map(convertToSideBarItem);
      setMenuItems(convertedItems);
    } finally {
      setLoading(false);
    }
  }, [t]);

  const refreshMenuItems = useCallback(async () => {
    try {
      setLoading(true);
      await sidebarService.refreshConfig();
      const dynamicItems = await sidebarService.getMenuItems();
      const convertedItems = dynamicItems.map(convertToSideBarItem);
      setMenuItems(convertedItems);
    } catch (err) {
      setError('Failed to refresh menu items');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMenuItems();
  }, [loadMenuItems]);

  const handleItemClick = (itemKey: string) => {
    onViewChange(itemKey);
  };

  return (
    <aside className={`admin-sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="admin-sidebar-header">
        <img 
          src={config.brand.logo} 
          alt={config.brand.name} 
          className="admin-sidebar-logo"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>
      <nav className="admin-sidebar-nav">
        {loading ? (
          <div className="sidebar-loading">
            <div className="loading-spinner"></div>
            <span>Loading menu...</span>
          </div>
        ) : error ? (
          <div className="sidebar-error">
            <span>⚠️ {error}</span>
            <button onClick={refreshMenuItems} className="retry-btn">
              Retry
            </button>
          </div>
        ) : (
          <ul className="admin-sidebar-list">
            {menuItems.map((item) => {
              const IconComponent = SIDEBAR_ICON_MAP[item.key];
              return (
              <li key={item.key} className="admin-sidebar-item">
                <button
                  className={`admin-sidebar-link ${currentView === item.key ? 'active' : ''}`}
                  onClick={() => handleItemClick(item.key)}
                  type="button"
                >
                  <span className="admin-sidebar-icon">
                    {IconComponent ? (
                      <IconComponent size={20} strokeWidth={2} aria-hidden />
                    ) : (
                      item.icon
                    )}
                  </span>
                  <span className="admin-sidebar-text">{item.title}</span>
                  {item.badge && (
                    <span className="admin-sidebar-badge">
                      {item.badge}
                    </span>
                  )}
                </button>
              </li>
              );
            })}
          </ul>
        )}
      </nav>
    </aside>
  );
};

export default SideBar;
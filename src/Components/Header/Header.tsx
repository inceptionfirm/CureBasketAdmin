import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useConfig } from '../../contexts/ConfigContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useLocale } from '../../contexts/LocaleContext';
import { HeaderProps } from '../../types';
import './Header.css';

const Header: React.FC<HeaderProps> = ({ onNavigate, onToggleSidebar, sidebarOpen = true, user: propUser }) => {
  const { user, logout } = useAuth();
  const { config } = useConfig();
  const { isDark, toggleTheme } = useTheme();
  const { t, formatCurrency } = useLocale();
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async (): Promise<void> => {
    try {
      await logout();
      setShowUserMenu(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleUserMenu = (): void => {
    setShowUserMenu(!showUserMenu);
  };

  const handleNavigation = (view: string): void => {
    console.log('Header navigation clicked:', view);
    console.log('onNavigate function available:', !!onNavigate);
    
    if (onNavigate) {
      console.log('Calling onNavigate with:', view);
      onNavigate(view);
    } else {
      console.error('onNavigate function not provided to Header component');
    }
    setShowUserMenu(false);
  };


  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest('.admin-header-btn.primary')) {
        return;
      }
      
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);
      
      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  return (
    <header className={`admin-header ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <div className="admin-header-left">
        <button 
          className="admin-sidebar-toggle"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          ☰
        </button>
      </div>
      
      <div className="admin-header-right">
        {/* Icons on the RIGHT side */}
        <button 
          className="admin-header-btn theme-toggle-btn"
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? '☀️' : '🌙'}
        </button>
        
        <div className="admin-notification-container">
          <button className="admin-header-btn" aria-label="Notifications">
            🔔
          </button>
          <span className="admin-notification-badge">4</span>
        </div>
        
        <div className="user-menu-container" ref={userMenuRef}>
          <button 
            onClick={toggleUserMenu}
            className="admin-header-btn primary"
          >
            👤
          </button>
          {showUserMenu && (
            <div className="user-menu">
              <div className="user-menu-header">
                <div className="user-menu-avatar">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="user-menu-details">
                  <div className="user-menu-name">{user?.name || 'User'}</div>
                  <div className="user-menu-email">{user?.email || 'user@example.com'}</div>
                  <div className="user-menu-role">{user?.role || 'user'}</div>
                </div>
              </div>
              
              <div className="user-menu-divider"></div>
              
              <div className="user-menu-items">
                <button 
                  className="user-menu-item"
                  onClick={() => handleNavigation('profile')}
                >
                  <span className="menu-icon">👤</span>
                  {t('header.profile')}
                </button>
                <button 
                  className="user-menu-item"
                  onClick={() => handleNavigation('settings')}
                >
                  <span className="menu-icon">⚙️</span>
                  {t('header.settings')}
                </button>
                <button className="user-menu-item">
                  <span className="menu-icon">❓</span>
                  {t('header.help')}
                </button>
              </div>
              
              <div className="user-menu-divider"></div>
              
              <button 
                className="user-menu-item logout-item"
                onClick={handleLogout}
              >
                <span className="menu-icon">🚪</span>
                {t('header.signOut')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

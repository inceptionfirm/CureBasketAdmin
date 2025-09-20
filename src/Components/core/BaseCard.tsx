// Base Card Component - Reusable card component for all modules
import React from 'react';
import { clientConfigManager } from '../../config/clientConfig';
import './BaseCard.css';

export interface BaseCardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outlined' | 'elevated' | 'flat';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  error?: string;
  actions?: React.ReactNode;
  headerActions?: React.ReactNode;
  onRefresh?: () => void;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

const BaseCard: React.FC<BaseCardProps> = ({
  title,
  subtitle,
  children,
  className = '',
  variant = 'default',
  size = 'md',
  loading = false,
  error,
  actions,
  headerActions,
  onRefresh,
  collapsible = false,
  defaultCollapsed = false,
}) => {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);
  const config = clientConfigManager.getConfig();

  const handleToggleCollapse = () => {
    if (collapsible) {
      setCollapsed(!collapsed);
    }
  };

  const cardClasses = [
    'base-card',
    `base-card--${variant}`,
    `base-card--${size}`,
    loading && 'base-card--loading',
    error && 'base-card--error',
    collapsed && 'base-card--collapsed',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={cardClasses}
      style={{
        '--primary-color': config.branding.primaryColor,
        '--secondary-color': config.branding.secondaryColor,
        '--accent-color': config.branding.accentColor,
        '--background-color': config.branding.backgroundColor,
        '--text-color': config.branding.textColor,
        '--font-family': config.branding.fontFamily,
      } as React.CSSProperties}
    >
      {/* Header */}
      {(title || subtitle || headerActions || onRefresh || collapsible) && (
        <div className="base-card__header">
          <div className="base-card__header-content">
            {collapsible && (
              <button
                className="base-card__collapse-btn"
                onClick={handleToggleCollapse}
                aria-label={collapsed ? 'Expand' : 'Collapse'}
              >
                <span className={`base-card__collapse-icon ${collapsed ? 'collapsed' : ''}`}>
                  ▼
                </span>
              </button>
            )}
            
            <div className="base-card__title-section">
              {title && (
                <h3 className="base-card__title">{title}</h3>
              )}
              {subtitle && (
                <p className="base-card__subtitle">{subtitle}</p>
              )}
            </div>
          </div>

          <div className="base-card__header-actions">
            {headerActions}
            {onRefresh && (
              <button
                className="base-card__refresh-btn"
                onClick={onRefresh}
                aria-label="Refresh"
                disabled={loading}
              >
                <span className="base-card__refresh-icon">🔄</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      {!collapsed && (
        <div className="base-card__content">
          {loading && (
            <div className="base-card__loading">
              <div className="base-card__spinner"></div>
              <span>Loading...</span>
            </div>
          )}
          
          {error && (
            <div className="base-card__error">
              <span className="base-card__error-icon">⚠️</span>
              <span className="base-card__error-message">{error}</span>
            </div>
          )}
          
          {!loading && !error && children}
        </div>
      )}

      {/* Actions */}
      {actions && !collapsed && (
        <div className="base-card__actions">
          {actions}
        </div>
      )}
    </div>
  );
};

export default BaseCard;

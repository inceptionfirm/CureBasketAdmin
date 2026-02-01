import React from 'react';
import { PrescriptionStatus, getStatusConfig } from './prescriptionStatusConfig';
import './StatusBadge.css';

interface StatusBadgeProps {
  status: PrescriptionStatus;
  showIcon?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  showIcon = false,
  size = 'medium',
  className = ''
}) => {
  const config = getStatusConfig(status);

  return (
    <span
      className={`status-badge status-badge-${status} status-badge-${size} ${className}`}
      style={{
        color: config.color,
        backgroundColor: config.bgColor,
        borderColor: config.borderColor
      }}
      title={config.description}
    >
      {showIcon && config.icon && <span className="status-icon">{config.icon}</span>}
      <span className="status-label">{config.label}</span>
    </span>
  );
};

export default StatusBadge;

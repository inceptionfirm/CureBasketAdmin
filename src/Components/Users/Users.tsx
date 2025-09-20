import React from 'react';
import { useLocale } from '../../contexts/LocaleContext';
import './Users.css';

const Users: React.FC = () => {
  const { t, formatNumber } = useLocale();

  return (
    <div className="admin-main">
      <div className="page-header">
        <h1>{t('users.title')}</h1>
        <p>{t('users.subtitle')}</p>
      </div>
      
      <div className="users-content">
        <div className="users-stats">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>{t('users.totalUsers')}</h3>
              <p className="stat-number">{formatNumber(1250)}</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>{t('users.activeUsers')}</h3>
              <p className="stat-number">{formatNumber(1180)}</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🆕</div>
            <div className="stat-content">
              <h3>{t('users.newThisMonth')}</h3>
              <p className="stat-number">{formatNumber(45)}</p>
            </div>
          </div>
        </div>
        
        <div className="users-table-container">
          <div className="table-header">
            <h2>{t('users.userList')}</h2>
            <button className="btn-primary">
              {t('users.addUser')}
            </button>
          </div>
          
          <div className="table-placeholder">
            <p>{t('users.tableComingSoon')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;

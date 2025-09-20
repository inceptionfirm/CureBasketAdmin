import React from 'react';
import { useLocale } from '../../contexts/LocaleContext';
import './Blogs.css';

const Blogs: React.FC = () => {
  const { t, formatNumber } = useLocale();

  return (
    <div className="admin-main">
      <div className="page-header">
        <h1>{t('blogs.title')}</h1>
        <p>{t('blogs.subtitle')}</p>
      </div>
      
      <div className="blogs-content">
        <div className="blogs-stats">
          <div className="stat-card">
            <div className="stat-icon">📝</div>
            <div className="stat-content">
              <h3>{t('blogs.totalPosts')}</h3>
              <p className="stat-number">{formatNumber(45)}</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">👁️</div>
            <div className="stat-content">
              <h3>{t('blogs.totalViews')}</h3>
              <p className="stat-number">{formatNumber(12500)}</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <h3>{t('blogs.thisMonth')}</h3>
              <p className="stat-number">{formatNumber(8)}</p>
            </div>
          </div>
        </div>
        
        <div className="blogs-table-container">
          <div className="table-header">
            <h2>{t('blogs.postList')}</h2>
            <button className="btn-primary">
              {t('blogs.createPost')}
            </button>
          </div>
          
          <div className="table-placeholder">
            <p>{t('blogs.tableComingSoon')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blogs;

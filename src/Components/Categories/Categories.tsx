import React from 'react';
import { useLocale } from '../../contexts/LocaleContext';
import './Categories.css';

const Categories: React.FC = () => {
  const { t, formatNumber } = useLocale();

  return (
    <div className="admin-main">
      <div className="page-header">
        <h1>{t('categories.title')}</h1>
        <p>{t('categories.subtitle')}</p>
      </div>
      
      <div className="categories-content">
        <div className="categories-stats">
          <div className="stat-card">
            <div className="stat-icon">📂</div>
            <div className="stat-content">
              <h3>{t('categories.totalCategories')}</h3>
              <p className="stat-number">{formatNumber(12)}</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>{t('categories.activeCategories')}</h3>
              <p className="stat-number">{formatNumber(10)}</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-content">
              <h3>{t('categories.totalProducts')}</h3>
              <p className="stat-number">{formatNumber(1250)}</p>
            </div>
          </div>
        </div>
        
        <div className="categories-table-container">
          <div className="table-header">
            <h2>{t('categories.categoryList')}</h2>
            <button className="btn-primary">
              {t('categories.addCategory')}
            </button>
          </div>
          
          <div className="table-placeholder">
            <p>{t('categories.tableComingSoon')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;

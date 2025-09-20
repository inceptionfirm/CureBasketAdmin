import React from 'react';
import { useLocale } from '../../contexts/LocaleContext';
import './BannerManagement.css';

const BannerManagement: React.FC = () => {
  const { t, formatNumber } = useLocale();

  return (
    <div className="admin-main">
      <div className="page-header">
        <h1>{t('banner.title')}</h1>
        <p>{t('banner.subtitle')}</p>
      </div>
      
      <div className="banner-content">
        <div className="banner-stats">
          <div className="stat-card">
            <div className="stat-icon">🖼️</div>
            <div className="stat-content">
              <h3>{t('banner.totalBanners')}</h3>
              <p className="stat-number">{formatNumber(15)}</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">👁️</div>
            <div className="stat-content">
              <h3>{t('banner.totalImpressions')}</h3>
              <p className="stat-number">{formatNumber(25000)}</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>{t('banner.activeBanners')}</h3>
              <p className="stat-number">{formatNumber(8)}</p>
            </div>
          </div>
        </div>
        
        <div className="banner-table-container">
          <div className="table-header">
            <h2>{t('banner.bannerList')}</h2>
            <button className="btn-primary">
              {t('banner.createBanner')}
            </button>
          </div>
          
          <div className="table-placeholder">
            <p>{t('banner.tableComingSoon')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerManagement;

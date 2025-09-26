import React, { useState, useEffect, useCallback } from 'react';
import { useLocale } from '../../contexts/LocaleContext';
import { bannerService, Banner, BannerStats } from '../../services/bannerService';
import AddBannerModal from './AddBannerModal';
import './BannerManagement.css';
import '../../styles/global-buttons.css';

const BannerManagement: React.FC = () => {
  const { t } = useLocale();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<BannerStats>({
    totalBanners: 0,
    activeBanners: 0,
    inactiveBanners: 0,
    scheduledBanners: 0,
    expiredBanners: 0,
    totalViews: 0,
    totalClicks: 0,
    averageCtr: 0
  });
  const [isAddBannerModalOpen, setIsAddBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [positionFilter, setPositionFilter] = useState<string>('');

  const loadBanners = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock data for now - replace with actual API call later
      const mockBanners: Banner[] = [
        {
          id: '1',
          title: 'Summer Sale - 50% Off All Medicine',
          description: 'Limited time offer on all prescription medicines',
          image: '',
          imageAlt: 'Summer sale banner',
          linkUrl: '/medicines?sale=summer',
          linkText: 'Shop Now',
          position: 'top',
          type: 'promotional',
          status: 'active',
          priority: 1,
          startDate: '2024-01-15T00:00:00Z',
          endDate: '2024-03-15T00:00:00Z',
          analytics: {
            clicks: 750,
            conversions: 45,
            ctr: 5.0
          },
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z',
          createdBy: {
            id: '1',
            name: 'Admin User',
            email: 'admin@example.com'
          }
        },
        {
          id: '2',
          title: 'Free Health Consultation',
          description: 'Get expert medical advice from certified doctors',
          image: '',
          imageAlt: 'Health consultation banner',
          linkUrl: '/consultation',
          linkText: 'Book Now',
          position: 'middle',
          type: 'announcement',
          status: 'active',
          priority: 2,
          startDate: '2024-01-10T00:00:00Z',
          endDate: '2024-12-31T00:00:00Z',
          analytics: {
            clicks: 340,
            conversions: 28,
            ctr: 4.0
          },
          createdAt: '2024-01-10T14:30:00Z',
          updatedAt: '2024-01-10T14:30:00Z',
          createdBy: {
            id: '1',
            name: 'Admin User',
            email: 'admin@example.com'
          }
        },
        {
          id: '3',
          title: 'New Ayurvedic Collection',
          description: 'Discover natural healing with our premium ayurvedic medicines',
          image: '',
          imageAlt: 'Ayurvedic collection banner',
          linkUrl: '/categories/ayurvedic',
          linkText: 'Explore',
          position: 'sidebar',
          type: 'hero',
          status: 'inactive',
          priority: 3,
          startDate: '2024-01-20T00:00:00Z',
          endDate: undefined,
          analytics: {
            clicks: 128,
            conversions: 8,
            ctr: 4.0
          },
          createdAt: '2024-01-20T09:15:00Z',
          updatedAt: '2024-01-20T09:15:00Z',
          createdBy: {
            id: '2',
            name: 'Marketing Manager',
            email: 'marketing@example.com'
          }
        }
      ];
      
      setBanners(mockBanners);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load banners');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, positionFilter]);

  const loadStats = useCallback(async () => {
    try {
      // Mock stats for now - replace with actual API call later
      const mockStats: BannerStats = {
        totalBanners: 3,
        activeBanners: 2,
        inactiveBanners: 1,
        scheduledBanners: 0,
        expiredBanners: 0,
        totalClicks: 1218,
        averageCtr: 4.6
      };
      setStats(mockStats);
    } catch (err) {
      console.error('Failed to load banner stats:', err);
    }
  }, []);

  useEffect(() => {
    loadBanners();
  }, [loadBanners]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleAddBanner = async (bannerData: any) => {
    try {
      // Mock implementation - replace with actual API call later
      console.log('Adding banner:', bannerData);
      await loadBanners();
      await loadStats();
      setIsAddBannerModalOpen(false);
      setEditingBanner(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save banner');
    }
  };

  const handleEditBanner = (banner: Banner) => {
    setEditingBanner(banner);
    setIsAddBannerModalOpen(true);
  };

  const handleDeleteBanner = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      try {
        // Mock implementation - replace with actual API call later
        console.log('Deleting banner:', id);
        await loadBanners();
        await loadStats();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete banner');
      }
    }
  };

  const handleActivateBanner = async (id: string) => {
    try {
      // Mock implementation - replace with actual API call later
      console.log('Activating banner:', id);
      await loadBanners();
      await loadStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to activate banner');
    }
  };

  const handleDeactivateBanner = async (id: string) => {
    try {
      // Mock implementation - replace with actual API call later
      console.log('Deactivating banner:', id);
      await loadBanners();
      await loadStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to deactivate banner');
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  const handlePositionFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPositionFilter(e.target.value);
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      active: 'status-active',
      inactive: 'status-inactive',
      scheduled: 'status-scheduled',
      expired: 'status-expired'
    };
    
    return (
      <span className={`banner-status ${statusClasses[status as keyof typeof statusClasses] || 'status-inactive'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPositionBadge = (position: string) => {
    const positionIcons = {
      top: '⬆️',
      middle: '➡️',
      bottom: '⬇️',
      sidebar: '↗️',
      popup: '📱'
    };
    
    return (
      <span className="banner-position">
        {positionIcons[position as keyof typeof positionIcons] || '📍'} {position.charAt(0).toUpperCase() + position.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No end date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredBanners = banners.filter(banner => {
    const matchesSearch = !searchTerm || 
      banner.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      banner.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || banner.status === statusFilter;
    const matchesPosition = !positionFilter || banner.position === positionFilter;
    
    return matchesSearch && matchesStatus && matchesPosition;
  });

  if (loading) {
    return (
      <div className="banners-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading banners...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="banners-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Banner Management</h1>
          <p className="page-description">Create and manage promotional banners for your website</p>
        </div>
        <button
          className="add-button"
          onClick={() => setIsAddBannerModalOpen(true)}
        >
          <span className="button-icon">+</span>
          Add Banner
        </button>
      </div>

      <div className="stats-section">
        <div className="stat-item">
          <span className="stat-number">{stats.totalBanners}</span>
          <div className="stat-label">Total Banners</div>
        </div>
        <div className="stat-item">
          <span className="stat-number">{stats.activeBanners}</span>
          <div className="stat-label">Active</div>
        </div>
        <div className="stat-item">
          <span className="stat-number">{stats.totalClicks.toLocaleString()}</span>
          <div className="stat-label">Total Clicks</div>
        </div>
        <div className="stat-item">
          <span className="stat-number">{stats.averageCtr}%</span>
          <div className="stat-label">Avg CTR</div>
        </div>
      </div>

      <div className="search-filters">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search banners..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>
        
        <div className="filters">
          <select
            value={statusFilter}
            onChange={handleStatusFilter}
            className="filter-select"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="scheduled">Scheduled</option>
            <option value="expired">Expired</option>
          </select>

          <select
            value={positionFilter}
            onChange={handlePositionFilter}
            className="filter-select"
          >
            <option value="">All Positions</option>
            <option value="top">Top</option>
            <option value="middle">Middle</option>
            <option value="bottom">Bottom</option>
            <option value="sidebar">Sidebar</option>
            <option value="popup">Popup</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="error-state">
          <p>Error: {error}</p>
        </div>
      )}

      <div className="banners-section">
        <div className="section-header">
          <h2 className="section-title">Banner List</h2>
          <p className="section-subtitle">Manage your promotional banners and track performance</p>
        </div>

        {filteredBanners.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎯</div>
            <h3>No banners found</h3>
            <p>Start by creating your first banner to promote your products and services.</p>
            <button
              className="add-button"
              onClick={() => setIsAddBannerModalOpen(true)}
            >
              <span className="button-icon">+</span>
              Create First Banner
            </button>
          </div>
        ) : (
          <div className="banners-list">
            {filteredBanners.map((banner) => (
              <div key={banner.id} className="banner-item">
                <div className="banner-image">
                  {banner.image ? (
                    <img src={banner.image} alt={banner.imageAlt || banner.title} />
                  ) : (
                    <div className="banner-image-placeholder">🎯</div>
                  )}
                </div>
                
                <div className="banner-content">
                  <div className="banner-header">
                    <h3 className="banner-title">{banner.title}</h3>
                    {getStatusBadge(banner.status)}
                  </div>
                  
                  <p className="banner-description">{banner.description}</p>
                  
                  <div className="banner-meta">
                    <span className="banner-position-meta">{getPositionBadge(banner.position)}</span>
                    <span className="banner-type">{banner.type.charAt(0).toUpperCase() + banner.type.slice(1)}</span>
                    <span className="banner-priority">Priority: {banner.priority}</span>
                    <span className="banner-dates">
                      {formatDate(banner.startDate)} - {formatDate(banner.endDate)}
                    </span>
                  </div>
                  
                  <div className="banner-stats">
                    <span className="stat">
                      <span className="stat-icon">🖱️</span>
                      {banner.analytics?.clicks.toLocaleString()}
                    </span>
                    <span className="stat">
                      <span className="stat-icon">📊</span>
                      {banner.analytics?.ctr}% CTR
                    </span>
                    <span className="stat">
                      <span className="stat-icon">🎯</span>
                      {banner.analytics?.conversions || 0} Conversions
                    </span>
                  </div>
                </div>
                
                <div className="banner-actions">
                  <button
                    className="btn-edit"
                    onClick={() => handleEditBanner(banner)}
                  >
                    ✏️
                  </button>
                  
                  {banner.status === 'inactive' && (
                    <button
                      className="btn-save"
                      onClick={() => handleActivateBanner(banner.id)}
                      title="Activate"
                    >
                      ▶️
                    </button>
                  )}
                  
                  {banner.status === 'active' && (
                    <button
                      className="btn-cancel"
                      onClick={() => handleDeactivateBanner(banner.id)}
                      title="Deactivate"
                    >
                      ⏸️
                    </button>
                  )}
                  
                  <button
                    className="btn-delete"
                    onClick={() => handleDeleteBanner(banner.id)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddBannerModal
        isOpen={isAddBannerModalOpen}
        onClose={() => {
          setIsAddBannerModalOpen(false);
          setEditingBanner(null);
        }}
        onSubmit={handleAddBanner}
        editingBanner={editingBanner}
      />
    </div>
  );
};

export default BannerManagement;
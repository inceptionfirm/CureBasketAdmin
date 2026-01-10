import React, { useState, useEffect, useCallback } from 'react';
import { useLocale } from '../../contexts/LocaleContext';
import { bannerService, Banner as ApiBanner, BannerStats } from '../../services/bannerService';
import AddBannerModal from './AddBannerModal';
import './BannerManagement.css';
import '../../styles/global-buttons.css';

// Local Banner type for UI display (different from API Banner type)
interface Banner {
  id: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  linkUrl: string;
  linkText: string;
  position: 'top' | 'middle' | 'bottom' | 'sidebar' | 'popup';
  type: 'hero' | 'promotional' | 'announcement' | 'advertisement' | 'notification';
  status: 'active' | 'inactive' | 'scheduled' | 'expired';
  priority: number;
  startDate: string;
  endDate?: string;
  analytics?: {
    clicks: number;
    conversions: number;
    ctr: number;
  };
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
}

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

  // Helper function to map API banner to frontend format
  const mapApiBannerToFrontend = (apiBanner: ApiBanner | any): Banner => {
    // Map position from API (TOP, MIDDLE, etc.) to frontend format (top, middle, etc.)
    const positionMap: Record<string, 'top' | 'middle' | 'bottom' | 'sidebar' | 'popup'> = {
      'TOP': 'top',
      'MIDDLE': 'middle',
      'BOTTOM': 'bottom',
      'SIDEBAR': 'sidebar',
      'POPUP': 'popup'
    };
    const position = positionMap[apiBanner.position] || 'top';
    
    // Map type from API (PROMOTIONAL, etc.) to frontend format (promotional, etc.)
    const typeMap: Record<string, 'hero' | 'promotional' | 'announcement' | 'advertisement' | 'notification'> = {
      'PROMOTIONAL': 'promotional',
      'ANNOUNCEMENT': 'announcement',
      'ADVERTISEMENT': 'advertisement',
      'NOTIFICATION': 'notification'
    };
    const type = typeMap[apiBanner.type] || 'hero';
    
    // Map status from API (active boolean) to frontend format
    const status: 'active' | 'inactive' = apiBanner.active ? 'active' : 'inactive';
    
    // Map priority from API (HIGH, MEDIUM, LOW) to number
    const priorityMap: Record<string, number> = {
      'HIGH': 1,
      'MEDIUM': 2,
      'LOW': 3
    };
    const priority = priorityMap[apiBanner.priority] || 2;
    
    // Extract link URL from mainAttributes
    let linkUrl = '';
    let linkText = 'Learn More';
    if (apiBanner.mainAttributes && Array.isArray(apiBanner.mainAttributes)) {
      const linkAttr = apiBanner.mainAttributes.find((attr: any) => 
        attr.name && attr.name.toLowerCase().includes('link')
      );
      if (linkAttr) {
        linkUrl = linkAttr.value || '';
        linkText = linkAttr.name || 'Learn More';
      }
    }
    
    // Extract image from files or mainAttributes
    let image = '';
    if (apiBanner.files && Array.isArray(apiBanner.files) && apiBanner.files.length > 0) {
      const imageFile = apiBanner.files.find((f: any) => 
        f.fileUrl || f.url || (f.documentType && f.documentType === 'IMAGE')
      );
      if (imageFile) {
        image = imageFile.fileUrl || imageFile.url || '';
      }
    }
    
    return {
      id: String(apiBanner.id || ''),
      title: apiBanner.itemName || apiBanner.itemHeading || 'Untitled Banner',
      description: apiBanner.itemDescription || '',
      image: image,
      imageAlt: apiBanner.itemName || 'Banner image',
      linkUrl: linkUrl,
      linkText: linkText,
      position: position,
      type: type,
      status: status,
      priority: priority,
      startDate: apiBanner.startDate || '',
      endDate: apiBanner.endDate,
      createdAt: apiBanner.createdAt || new Date().toISOString(),
      updatedAt: apiBanner.updatedAt || apiBanner.createdAt || new Date().toISOString()
    };
  };

  const loadBanners = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📢 Loading banners from API...');
      
      // Build query parameters
      const params: any = {
        itemType: 'BANNER',
        page: 0,
        pageSize: 100,
        sortBy: 'createdAt',
        sortOrder: 'DESC'
      };
      
      // Add filters if provided
      if (statusFilter) {
        params.status = statusFilter.toUpperCase() === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE';
      }
      if (positionFilter) {
        const positionMap: Record<string, string> = {
          'top': 'TOP',
          'middle': 'MIDDLE',
          'bottom': 'BOTTOM',
          'sidebar': 'SIDEBAR',
          'popup': 'POPUP'
        };
        params.position = positionMap[positionFilter] || positionFilter.toUpperCase();
      }
      
      // Call the API
      const response = await bannerService.getAllBanners(params);
      console.log('📢 Banners API response:', response);
      
      // Map API response to frontend Banner format
      const mappedBanners: Banner[] = (response.banners || []).map(mapApiBannerToFrontend);
      
      console.log('📢 Mapped banners:', mappedBanners);
      setBanners(mappedBanners);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load banners';
      console.error('❌ Error loading banners:', err);
      setError(errorMessage);
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
      setError(null);
      console.log('📢 Banner form data received:', bannerData);
      
      // Map form data to API format
      const positionMap: Record<string, 'TOP' | 'MIDDLE' | 'BOTTOM' | 'SIDEBAR' | 'POPUP'> = {
        'top': 'TOP',
        'middle': 'MIDDLE',
        'bottom': 'BOTTOM',
        'sidebar': 'SIDEBAR',
        'popup': 'POPUP'
      };
      
      const typeMap: Record<string, 'PROMOTIONAL' | 'ANNOUNCEMENT' | 'ADVERTISEMENT' | 'NOTIFICATION'> = {
        'hero': 'PROMOTIONAL',
        'promotional': 'PROMOTIONAL',
        'announcement': 'ANNOUNCEMENT',
        'advertisement': 'ADVERTISEMENT',
        'notification': 'NOTIFICATION'
      };
      
      const priorityMap: Record<number, 'HIGH' | 'MEDIUM' | 'LOW'> = {
        1: 'LOW',
        2: 'LOW',
        3: 'LOW',
        4: 'MEDIUM',
        5: 'MEDIUM',
        6: 'MEDIUM',
        7: 'HIGH',
        8: 'HIGH',
        9: 'HIGH',
        10: 'HIGH'
      };
      
      const apiPayload = {
        id: editingBanner ? Number(editingBanner.id) : 0,
        categoryId: bannerData.categoryId ? Number(bannerData.categoryId) : undefined,
        itemName: bannerData.title || bannerData.itemName,
        itemHeading: bannerData.title || bannerData.itemHeading,
        itemDescription: bannerData.description || bannerData.itemDescription,
        position: positionMap[bannerData.position?.toLowerCase()] || 'TOP',
        type: typeMap[bannerData.type?.toLowerCase()] || 'PROMOTIONAL',
        priority: priorityMap[bannerData.priority] || 'MEDIUM',
        startDate: bannerData.startDate ? new Date(bannerData.startDate).toISOString() : undefined,
        endDate: bannerData.endDate ? new Date(bannerData.endDate).toISOString() : undefined,
        active: bannerData.status === 'active' || bannerData.active === true,
        mainAttributes: bannerData.linkUrl ? [{
          id: 0,
          name: 'Link',
          scale: 'url',
          value: bannerData.linkUrl,
          subAttributes: []
        }] : []
      };

      console.log('📢 Calling API with payload:', apiPayload);

      if (editingBanner) {
        await bannerService.updateBanner(Number(editingBanner.id), apiPayload);
      } else {
        await bannerService.createBanner(apiPayload);
      }
      
      await loadBanners();
      await loadStats();
      setIsAddBannerModalOpen(false);
      setEditingBanner(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save banner';
      console.error('❌ Error saving banner:', err);
      setError(errorMessage);
    }
  };

  const handleEditBanner = (banner: Banner) => {
    setEditingBanner(banner);
    setIsAddBannerModalOpen(true);
  };

  const handleDeleteBanner = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      try {
        setError(null);
        await bannerService.deleteBanner(Number(id));
        await loadBanners();
        await loadStats();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete banner';
        console.error('❌ Error deleting banner:', err);
        setError(errorMessage);
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
                    <div className="banner-image-placeholder">
                      <span>🎯</span>
                    </div>
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
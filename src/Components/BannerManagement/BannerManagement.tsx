import React, { useState, useEffect, useCallback } from 'react';
import { useLocale } from '../../contexts/LocaleContext';
import { bannerService, Banner as ApiBanner } from '../../services/bannerService';

interface BannerStats {
  totalBanners: number;
  activeBanners: number;
  inactiveBanners: number;
  scheduledBanners: number;
  expiredBanners: number;
}
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
  createdAt: string;
  updatedAt: string;
  createDate?: string;
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
    expiredBanners: 0
  });
  const [isAddBannerModalOpen, setIsAddBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1
  });

  // Helper function to normalize image URLs (add base URL if relative)
  // Images are served from https://api.curebasket.com (without /backend)
  // Example: "/files/CATALOG_ITEM/image.png" -> "https://api.curebasket.com/files/CATALOG_ITEM/image.png"
  const normalizeImageUrl = (imageUrl: string): string => {
    if (!imageUrl || imageUrl.trim() === '') return '';
    
    // If already absolute URL, return as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://') || imageUrl.startsWith('data:')) {
      return imageUrl;
    }
    
    // Base URL for images (without /backend)
    const imageBaseURL = 'https://api.curebasket.com';

    // If path starts with /, append directly, otherwise add /
    if (imageUrl.startsWith('/')) {
      return `${imageBaseURL}${imageUrl}`;
    }
    return `${imageBaseURL}/${imageUrl}`;
  };

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
    
    // Map ID - handle both old (id) and new (ID) field names (MUST BE FIRST)
    const bannerId = apiBanner.id || apiBanner.ID || apiBanner.bannerId || '';
    
    // Map title - handle both old (itemName/itemHeading) and new (title) field names (MUST BE SECOND)
    const bannerTitle = apiBanner.title || apiBanner.itemName || apiBanner.itemHeading || 'Untitled Banner';
    
    // Map description - handle both old (itemDescription) and new (description) field names
    const bannerDescription = apiBanner.description || apiBanner.itemDescription || '';
    
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
    
    // Extract image from multiple possible sources
    // Backend now returns images as strings directly
    let image = '';
    
    // First check direct image fields
    if (apiBanner.image) {
      image = apiBanner.image;
    } else if (apiBanner.imageUrl) {
      image = apiBanner.imageUrl;
    } else if (apiBanner.thumbnail) {
      image = apiBanner.thumbnail;
    } else if (apiBanner.fileUrl) {
      image = apiBanner.fileUrl;
    } else if (typeof apiBanner.files === 'string') {
      // If files is a string (comma-separated URLs)
      image = apiBanner.files.split(',')[0].trim();
    } else if (apiBanner.files && Array.isArray(apiBanner.files) && apiBanner.files.length > 0) {
      // API returns files array with docPath field
      // Use the first file's docPath (API structure: files[0].docPath)
      const firstFile = apiBanner.files[0];
      if (firstFile) {
        if (typeof firstFile === 'string') {
          // If file is a string, use it directly
          image = firstFile;
        } else if (firstFile.docPath) {
          // API returns docPath field (e.g., "/files/CATALOG_ITEM/image.png")
          image = firstFile.docPath;
        } else {
          // Fallback to other possible field names
          image = firstFile.fileUrl ||
            firstFile.url ||
            firstFile.file_path ||
            firstFile.path ||
            firstFile.documentUrl || '';
        }
      }
    }
    
    // Check mainAttributes for image links
    if (!image && apiBanner.mainAttributes && Array.isArray(apiBanner.mainAttributes)) {
      const imageAttr = apiBanner.mainAttributes.find((attr: any) => 
        attr.name && (
          attr.name.toLowerCase().includes('image') || 
          attr.name.toLowerCase().includes('photo') ||
          attr.name.toLowerCase().includes('picture') ||
          attr.name.toLowerCase().includes('file')
        ) && attr.value
      );
      if (imageAttr && imageAttr.value) {
        image = imageAttr.value;
      }
    }
    
    // Normalize image URL (add base URL if relative)
    image = normalizeImageUrl(image);
    
    // Log for debugging - show full banner object structure
    console.log('🖼️  Banner image extraction debug:', {
      bannerId: bannerId,
      title: bannerTitle,
      finalImageUrl: image,
      source: apiBanner.image ? 'direct.image' : 
              apiBanner.imageUrl ? 'direct.imageUrl' :
              apiBanner.fileUrl ? 'direct.fileUrl' :
              apiBanner.files ? (typeof apiBanner.files === 'string' ? 'files(string)' : 'files(array)') :
              apiBanner.mainAttributes ? 'mainAttributes' : 'none',
      rawBannerKeys: Object.keys(apiBanner),
      hasFiles: !!apiBanner.files,
      filesType: typeof apiBanner.files,
      filesValue: apiBanner.files ? (typeof apiBanner.files === 'string' ? apiBanner.files.substring(0, 100) : JSON.stringify(apiBanner.files).substring(0, 200)) : 'null'
    });
    
    // If still no image, try checking if files might be a URL string directly
    if (!image && typeof apiBanner.files === 'string' && apiBanner.files.trim().length > 0) {
      image = apiBanner.files.trim();
      image = normalizeImageUrl(image);
      console.log('🖼️  Using files as direct string URL:', image);
    }
    
    // Map status - handle both old (active boolean) and new (status string) field names
    let bannerStatus: 'active' | 'inactive' = 'inactive';
    if (apiBanner.status) {
      bannerStatus = apiBanner.status.toLowerCase() === 'active' ? 'active' : 'inactive';
    } else if (apiBanner.active !== undefined) {
      bannerStatus = apiBanner.active ? 'active' : 'inactive';
    }
    
    // Map priority - handle both old (HIGH/MEDIUM/LOW) and new (number) field names
    let bannerPriority = 2; // default
    if (typeof apiBanner.priority === 'number') {
      bannerPriority = apiBanner.priority;
    } else if (apiBanner.priority) {
      bannerPriority = priorityMap[apiBanner.priority] || 2;
    }
    
    return {
      id: String(bannerId),
      title: bannerTitle,
      description: bannerDescription,
      image: image,
      imageAlt: bannerTitle,
      linkUrl: linkUrl,
      linkText: linkText,
      position: position,
      type: type,
      status: bannerStatus,
      priority: bannerPriority,
      startDate: apiBanner.startDate || '',
      endDate: apiBanner.endDate,
      createdAt: apiBanner.createdAt || new Date().toISOString(),
      updatedAt: apiBanner.updatedAt || apiBanner.createdAt || new Date().toISOString(),
      createDate: apiBanner.createDate || apiBanner.createdAt || ''
    };
  };

  const loadBanners = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📢 Loading banners from API...');
      
      // Build query parameters
      // Backend only allows: ID, ItemType, Position, Type, Title, Description, Status, Priority
      // Fetch all banners for client-side filtering and pagination
      const params: any = {
        itemType: 'BANNER',
        page: 0,
        pageSize: 1000, // Fetch all for client-side filtering
        // Don't use sortBy: 'createdAt' - backend doesn't accept it
        // Use allowed sort fields: ID, Position, Type, Title, Description, Status, Priority
        // sortBy: 'ID', // Uncomment if you want to sort by ID
        sortOrder: 'DESC'
      };
      
      // Add filters if provided
      if (statusFilter) {
        params.status = statusFilter.toUpperCase() === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE';
      }
      
      // Call the API - fetch all banners (increase pageSize if needed)
      const response = await bannerService.getAllBanners(params);
      console.log('📢 Banners API response:', response);
      console.log('📢 Total banners from API:', response.pagination?.total || response.banners?.length);
      
      // Map API response to frontend Banner format
      const mappedBanners: Banner[] = (response.banners || []).map(mapApiBannerToFrontend);
      
      console.log('📢 Mapped banners:', mappedBanners);
      console.log('📢 Mapped banners count:', mappedBanners.length);
      console.log('📢 Pagination total:', response.pagination?.total);
      setBanners(mappedBanners);

      // Don't update pagination here - it will be updated based on filtered results
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load banners';
      console.error('❌ Error loading banners:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  const loadStats = useCallback(() => {
    try {
      // Calculate stats from actual banners loaded
      const activeCount = banners.filter(b => b.status === 'active').length;
      const inactiveCount = banners.filter(b => b.status === 'inactive').length;
      const scheduledCount = banners.filter(b => b.status === 'scheduled').length;
      const expiredCount = banners.filter(b => b.status === 'expired').length;
      
      const stats: BannerStats = {
        totalBanners: banners.length,
        activeBanners: activeCount,
        inactiveBanners: inactiveCount,
        scheduledBanners: scheduledCount,
        expiredBanners: expiredCount
      };
      setStats(stats);
    } catch (err) {
      console.error('Failed to calculate banner stats:', err);
    }
  }, [banners]);

  useEffect(() => {
    loadBanners();
  }, [loadBanners]);

  // Update stats whenever banners change
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleAddBanner = async (bannerData: any): Promise<number | null> => {
    try {
      setError(null);
      console.log('📢 Banner form data received:', bannerData);
      
      // New API structure: { itemType, position, type, title, description, status, priority }
      // Map form values to API format - capitalize position, keep type and status as-is
      const positionMap: Record<string, string> = {
        'top': 'Top',
        'middle': 'Middle',
        'bottom': 'Bottom',
        'sidebar': 'Sidebar',
        'popup': 'Popup'
      };
      
      // Map status to uppercase for API (ACTIVE/INACTIVE)
      const statusMap: Record<string, string> = {
        'active': 'ACTIVE',
        'inactive': 'INACTIVE'
      };
      
      // itemType is always hardcoded as 'BANNER' - not editable by user
      const apiPayload = {
        itemType: 'BANNER' as const, // Always 'BANNER' - hardcoded, not from form
        position: positionMap[bannerData.position] || bannerData.position || 'Left',
        type: bannerData.type || '',
        title: bannerData.title || bannerData.itemName || bannerData.itemHeading || '',
        description: bannerData.description || bannerData.itemDescription || '',
        status: statusMap[bannerData.status] || bannerData.status?.toUpperCase() || 'ACTIVE',
        priority: typeof bannerData.priority === 'number' ? bannerData.priority : (bannerData.priority ? Number(bannerData.priority) : 2),
      };

      // Ensure all required fields are present
      if (!apiPayload.title) {
        throw new Error('Title is required');
      }
      if (!apiPayload.position) {
        throw new Error('Position is required');
      }
      if (!apiPayload.type) {
        throw new Error('Type is required');
      }

      console.log('📢 Calling API with payload:', apiPayload);

      if (editingBanner) {
        const bannerId = Number(editingBanner.id);
        await bannerService.updateBanner(bannerId, apiPayload);
        return bannerId;
      } else {
        // Create banner first (without image)
        const createResult = await bannerService.createBanner(apiPayload);
        console.log('✅ Banner created successfully:', createResult);

        // Get the banner ID from response
        if (createResult.data?.id) {
          const newBannerId = Number(createResult.data.id);
          console.log('📢 New banner ID:', newBannerId);
          return newBannerId;
        } else {
          throw new Error('Banner created but no ID returned');
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save banner';
      console.error('❌ Error saving banner:', err);
      setError(errorMessage);
      throw err; // Re-throw so modal can catch it
    }
  };

  const handleImageUpload = async (bannerId: number, file: File): Promise<void> => {
    try {
      setError(null);
      console.log('📢 Uploading image for banner ID:', bannerId);

      await bannerService.uploadFiles(bannerId, [file]);
      console.log('✅ Image uploaded successfully');

      // Reload banners list after successful image upload
      await loadBanners();
      await loadStats();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload image';
      console.error('❌ Error uploading image:', err);
      setError(errorMessage);
      throw err; // Re-throw so modal can catch it
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

        // Find the banner to be deleted for stats update
        const bannerToDelete = banners.find(b => b.id === id);

        // Optimistically remove banner from UI immediately
        setBanners(prevBanners => prevBanners.filter(banner => banner.id !== id));

        // Update stats immediately based on the deleted banner's status
        if (bannerToDelete) {
          setStats(prevStats => ({
            ...prevStats,
            totalBanners: prevStats.totalBanners - 1,
            activeBanners: bannerToDelete.status === 'active'
              ? prevStats.activeBanners - 1
              : prevStats.activeBanners,
            inactiveBanners: bannerToDelete.status === 'inactive'
              ? prevStats.inactiveBanners - 1
              : prevStats.inactiveBanners,
            scheduledBanners: bannerToDelete.status === 'scheduled'
              ? prevStats.scheduledBanners - 1
              : prevStats.scheduledBanners,
            expiredBanners: bannerToDelete.status === 'expired'
              ? prevStats.expiredBanners - 1
              : prevStats.expiredBanners
          }));
        }

        // Delete from backend
        await bannerService.deleteBanner(Number(id));

        // Refresh from server to ensure consistency
        await loadBanners();
        await loadStats();
      } catch (err) {
        // If deletion fails, reload to restore the banner
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete banner';
        console.error('❌ Error deleting banner:', err);
        setError(errorMessage);
        // Reload to restore the banner in case of error
        await loadBanners();
        await loadStats();
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
    return matchesSearch && matchesStatus;
  });

  // Apply pagination to filtered results
  const paginatedBanners = filteredBanners.slice(
    (pagination.current - 1) * pagination.pageSize,
    pagination.current * pagination.pageSize
  );

  // Update pagination total based on filtered results
  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      total: filteredBanners.length,
      totalPages: Math.ceil(filteredBanners.length / prev.pageSize)
    }));
  }, [filteredBanners.length, pagination.pageSize]);

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
          <>
            {/* Pagination - Above the list */}
            {filteredBanners.length > pagination.pageSize && (
              <div className="pagination" style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px',
                padding: '20px',
                marginBottom: '20px'
              }}>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, current: prev.current - 1 }))}
                  disabled={pagination.current === 1}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    background: pagination.current === 1 ? '#f5f5f5' : 'white',
                    cursor: pagination.current === 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  Previous
                </button>
                <span style={{ padding: '0 10px' }}>
                  Page {pagination.current} of {pagination.totalPages} ({pagination.total} total)
                </span>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, current: prev.current + 1 }))}
                  disabled={pagination.current >= pagination.totalPages}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    background: pagination.current >= pagination.totalPages ? '#f5f5f5' : 'white',
                    cursor: pagination.current >= pagination.totalPages ? 'not-allowed' : 'pointer'
                  }}
                >
                  Next
                </button>
              </div>
            )}

          <div className="banners-list">
              {paginatedBanners.map((banner, index) => (
              <div key={banner.id} className="banner-item">
                  <div className="banner-number">#{(pagination.current - 1) * pagination.pageSize + index + 1}</div>
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
                    <div>
                    <h3 className="banner-title">{banner.title}</h3>
                      <span className="banner-id">ID: {banner.id}</span>
                    </div>
                    {getStatusBadge(banner.status)}
                  </div>
                  
                  <p className="banner-description">{banner.description}</p>
                  
                  <div className="banner-meta">
                    <span className="banner-position-meta">{getPositionBadge(banner.position)}</span>
                    <span className="banner-type">{banner.type.charAt(0).toUpperCase() + banner.type.slice(1)}</span>
                    <span className="banner-priority">Priority: {banner.priority}</span>
                  </div>
                  
                    {banner.createDate && (
                      <div className="banner-date">
                        <span className="date-label">Created:</span>
                        <span className="date-value">{banner.createDate}</span>
                  </div>
                    )}
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
          </>
        )}
      </div>

      <AddBannerModal
        isOpen={isAddBannerModalOpen}
        onClose={async () => {
          setIsAddBannerModalOpen(false);
          setEditingBanner(null);
          await loadBanners();
          await loadStats();
        }}
        onSubmit={handleAddBanner}
        onImageUpload={handleImageUpload}
        editingBanner={editingBanner}
      />
    </div>
  );
};

export default BannerManagement;
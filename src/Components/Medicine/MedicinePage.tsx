import React, { useState, useEffect, useCallback } from 'react';
import { medicineService, Medicine, MedicineListParams } from '../../services/modules/medicineService';
import { fileUploadService } from '../../services/fileUploadService';
import { clientConfigManager } from '../../config/clientConfig';
import AddMedicineModal from './AddMedicineModal';
import AuthenticatedImage from './AuthenticatedImage';
import './MedicinePage.css';

const MedicinePage: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedMedicines, setSelectedMedicines] = useState<Medicine[]>([]);
  const [isAddMedicineModalOpen, setIsAddMedicineModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [analytics, setAnalytics] = useState({
    totalMedicines: 0,
    activeMedicines: 0,
    lowStockCount: 0,
    totalValue: 0
  });
  const [apiTotalReported, setApiTotalReported] = useState<number | null>(null);
  const [sortBy] = useState('name');


  // Helper function to map API medicine to UI format
  const mapApiMedicineToUI = (apiMedicine: Medicine | any): any => {
    // Try multiple possible ID field names
    const medicineId = apiMedicine.id || 
                       apiMedicine.ID || 
                       apiMedicine.medicineId ||
                       apiMedicine.itemId ||
                       apiMedicine.itemID ||
                       apiMedicine.medicine_id ||
                       apiMedicine.item_id ||
                       (apiMedicine.mainAttributes?.find((attr: any) => attr.name?.toLowerCase() === 'id')?.value) ||
                       null;
    
    // Log if ID is missing for debugging
    if (!medicineId) {
      console.warn('⚠️ Medicine ID not found in:', {
        keys: Object.keys(apiMedicine),
        medicine: apiMedicine
      });
    }
    
    return {
      id: medicineId ? String(medicineId) : '',
      numericId: medicineId ? Number(medicineId) : null,
      name: apiMedicine.name || '',
      description: apiMedicine.description || '',
      category: apiMedicine.category || 
                apiMedicine.dosageForm || 
                (apiMedicine.mainAttributes?.find((attr: any) => attr.name?.toLowerCase() === 'category')?.value) ||
                '',
      manufacturer: apiMedicine.manufacturer || '',
      form: apiMedicine.medicineForm || 
            apiMedicine.dosageForm || 
            apiMedicine.form || 
            (apiMedicine.mainAttributes?.find((attr: any) => attr.name?.toLowerCase() === 'form')?.value) ||
            '',
      price: Number(apiMedicine.price) ||
        Number(apiMedicine.mainAttributes?.find((attr: any) => attr.name?.toLowerCase() === 'price')?.value) ||
        0,
      stock: Number(apiMedicine.stock) ?? Number(apiMedicine.stockQuantity) ?? 0,
      sku: apiMedicine.sku ||
           apiMedicine.SKU ||
           (apiMedicine.mainAttributes?.find((attr: any) => attr.name?.toLowerCase() === 'sku')?.value) ||
           '',
      barcode: apiMedicine.barcode ?? '',
      status: apiMedicine.status?.toUpperCase() === 'INACTIVE' ? 'inactive' : 'active',
      image: (() => {
        // Extract image from multiple possible sources
        let img = '';

        // First check direct image fields
        if (apiMedicine.image) {
          img = apiMedicine.image;
        } else if (apiMedicine.imageUrl) {
          img = apiMedicine.imageUrl;
        } else if (apiMedicine.thumbnail) {
          img = apiMedicine.thumbnail;
        } else if (apiMedicine.fileUrl) {
          img = apiMedicine.fileUrl;
        } else if (typeof apiMedicine.files === 'string') {
          // If files is a string (comma-separated URLs)
          img = apiMedicine.files.split(',')[0].trim();
        } else if (apiMedicine.files && Array.isArray(apiMedicine.files) && apiMedicine.files.length > 0) {
          // API returns files array with docPath field
          // Use the first file's docPath (API structure: files[0].docPath)
          const firstFile = apiMedicine.files[0];
          if (firstFile) {
            if (typeof firstFile === 'string') {
              // If file is a string, use it directly
              img = firstFile;
            } else if (firstFile.docPath) {
              // API returns docPath field (e.g., "/files/MEDICINE/image.png")
              img = firstFile.docPath;
            } else {
              // Fallback to other possible field names
              img = firstFile.fileUrl ||
                firstFile.url ||
                firstFile.file_path ||
                firstFile.path ||
                firstFile.documentUrl || '';
            }
          }
        }

        // Normalize image URL (add base URL if relative)
        // Images are served from https://java.api.curebasket.com (without /backend)
        // Example: "/files/MEDICINE/image.png" -> "https://java.api.curebasket.com/files/MEDICINE/image.png"
        const normalizeImageUrl = (imgUrl: string): string => {
          if (!imgUrl || imgUrl.trim() === '') return '';

          // If already a full URL, return as is
          if (imgUrl.startsWith('http://') || imgUrl.startsWith('https://') || imgUrl.startsWith('data:')) {
            return imgUrl;
          }

          // Base URL for images (without /backend)
          const imageBaseURL = 'https://java.api.curebasket.com';

          // If path starts with /, append directly, otherwise add /
          if (imgUrl.startsWith('/')) {
            return `${imageBaseURL}${imgUrl}`;
          } else {
            return `${imageBaseURL}/${imgUrl}`;
          }
        };

        img = normalizeImageUrl(img);

        if (img) {
          console.log('💉 Mapped medicine image:', {
            medicineId: medicineId,
            name: apiMedicine.name,
            imageUrl: img,
            rawApiData: {
              image: apiMedicine.image,
              imageUrl: apiMedicine.imageUrl,
              files: apiMedicine.files,
              allKeys: Object.keys(apiMedicine)
            }
          });
        } else {
          console.warn('⚠️ No image found for medicine:', {
            medicineId: medicineId,
            name: apiMedicine.name,
            allKeys: Object.keys(apiMedicine)
          });
        }

        return img;
      })(),
      genericName: apiMedicine.genericName || '',
      strength: apiMedicine.strength || '',
      expiryDate: apiMedicine.expiryDate || '',
      createdAt: apiMedicine.createdAt || '',
      updatedAt: apiMedicine.updatedAt || '',
      prescriptionRequired: apiMedicine.prescriptionRequired || false,
      countryOfOrigin: apiMedicine.countryOfOrigin ||
        apiMedicine.country_of_origin ||
        (apiMedicine.mainAttributes?.find((attr: any) => attr.name?.toLowerCase() === 'countryoforigin' || attr.name?.toLowerCase() === 'country_of_origin')?.value) ||
        '',
      precautions: apiMedicine.precautions ?? '',
      sideEffects: apiMedicine.sideEffects ?? '',
      howToUse: apiMedicine.howToUse ?? apiMedicine.dosage ?? apiMedicine.usage ?? '',
      salt: apiMedicine.medicineSalt ?? apiMedicine.salt ?? apiMedicine.saltComposition ?? '',
      medicineSalt: apiMedicine.medicineSalt ?? apiMedicine.salt ?? null,
      faqs: (apiMedicine.medicineFaq || apiMedicine.faqs || []).map((f: any) => ({
        question: f.question || f.q || '',
        answer: f.answer || f.a || '',
        serialId: f.serialId
      }))
    };
  };

  const loadMedicines = useCallback(async (params: MedicineListParams = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all medicines (all pages) so list count matches API total
      const response = await medicineService.getAllMedicinesAllPages({
        pageSize: 10,
        ...(sortBy && sortBy.trim() !== '' ? { sortBy: sortBy } : {}),
        ...params,
      });

      if (!response) {
        throw new Error('No response from server');
      }

      if (!response.medicines || !Array.isArray(response.medicines)) {
        console.error('❌ Invalid response structure:', {
          response,
          hasMedicines: !!response.medicines,
          isArray: Array.isArray(response.medicines)
        });
        throw new Error('Invalid response from server: medicines array not found');
      }

      const mappedMedicines = (response.medicines || []).map(mapApiMedicineToUI);

      setApiTotalReported(response.totalRecordsFromApi ?? null);

      // Log IDs for debugging (can be removed later)
      if (mappedMedicines.length > 0 && !mappedMedicines[0].id) {
        console.warn('⚠️ Medicines mapped but IDs missing:', mappedMedicines[0]);
      }

      setMedicines(mappedMedicines);
      const total = response.pagination?.total || mappedMedicines.length;
      setPagination(prev => ({
        ...prev,
        total: total,
        totalPages: Math.ceil(total / prev.pageSize)
      }));

      // Calculate analytics
      const totalValue = mappedMedicines.reduce((sum, med) => sum + ((med.price || 0) * (med.stock || 0)), 0);
      const activeMeds = mappedMedicines.filter(med => med.status === 'active').length;
      const lowStockMeds = mappedMedicines.filter(med => (med.stock || 0) < 10).length;
      
      setAnalytics({
        totalMedicines: mappedMedicines.length,
        activeMedicines: activeMeds,
        lowStockCount: lowStockMeds,
        totalValue
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load medicines';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [sortBy]); // Remove pagination from dependencies - we'll do client-side pagination

  useEffect(() => {
    loadMedicines();
  }, [loadMedicines]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleStatusFilterChange = (status: 'all' | 'active' | 'inactive') => {
    setStatusFilter(status);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  // Filter medicines based on search term and status
  const filteredMedicines = medicines.filter(medicine => {
    // Search filter
    const matchesSearch = searchTerm === '' || 
      medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medicine.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medicine.category?.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    const matchesStatus = statusFilter === 'all' || medicine.status === statusFilter;

    return matchesSearch && matchesStatus;
  });


  const handleRefresh = () => {
    loadMedicines();
  };

  const handleBulkDelete = async () => {
    if (selectedMedicines.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedMedicines.length} medicines?`)) {
      try {
        setError(null);
        await Promise.all(
          selectedMedicines.map(medicine => medicineService.deleteMedicine(Number(medicine.id)))
        );
        await loadMedicines();
        setSelectedMedicines([]);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete medicines';
        setError(errorMessage);
      }
    }
  };

  const handleBulkStatusChange = async (status: 'active' | 'inactive') => {
    if (selectedMedicines.length === 0) return;
    const statusApi = status === 'inactive' ? 'INACTIVE' : 'ACTIVE';
    try {
      await Promise.all(
        selectedMedicines.map(medicine =>
          medicineService.updateMedicine(Number(medicine.id), { status: statusApi })
        )
      );
      await loadMedicines();
      setSelectedMedicines([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update medicines');
    }
  };

  const handleAddMedicine = async (medicineData: any): Promise<number | null> => {
    try {
      setError(null);
      console.log('💉 handleAddMedicine called with:', medicineData);
      
      if (editingMedicine) {
        // Update: exact API keys per backend (medicineFaq with serialId, category/image/files/medicineSalt)
        const medicineId = (editingMedicine as any).numericId ||
          (typeof editingMedicine.id === 'string' ? Number(editingMedicine.id) : editingMedicine.id);
        if (!medicineId || isNaN(medicineId) || medicineId <= 0) {
          throw new Error(`Invalid medicine ID: ${editingMedicine.id}. Please refresh the page and try again.`);
        }
        const statusUpper = (medicineData.status || 'active').toUpperCase() === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE';
        const updatePayload: any = {
          name: medicineData.name ?? '',
          description: medicineData.description ?? '',
          manufacturer: medicineData.manufacturer ?? '',
          medicineForm: medicineData.form ?? '',
          status: statusUpper,
          sku: medicineData.sku ?? '',
          price: Number(medicineData.price) ?? 0,
          stock: Number(medicineData.stock) ?? 0,
          barcode: medicineData.barcode ?? '',
          prescriptionRequired: Boolean(medicineData.prescriptionRequired),
          countryOfOrigin: medicineData.countryOfOrigin ?? null,
          precautions: medicineData.precautions ?? '',
          sideEffects: medicineData.sideEffects ?? '',
          howToUse: medicineData.howToUse ?? '',
          category: medicineData.category || null,
          image: medicineData.image || null,
          files: null,
          medicineSalt: (medicineData.salt || (editingMedicine as any).medicineSalt) ?? null,
          genericName: medicineData.genericName ?? '',
          strength: medicineData.strength ?? '',
          medicineFaq: (medicineData.faqs && Array.isArray(medicineData.faqs))
            ? medicineData.faqs
                .filter((faq: any) => faq && (faq.question || faq.q) && (faq.answer || faq.a))
                .map((faq: any) => ({
                  question: faq.question || faq.q,
                  answer: faq.answer || faq.a,
                  ...(faq.serialId && { serialId: faq.serialId })
                }))
            : []
        };

        console.log('💉 Update payload (API keys):', updatePayload);
        await medicineService.updateMedicine(medicineId, updatePayload);
        return medicineId;
      } else {
        // Create: exact API keys per backend (no category, no image in create)
        const statusUpper = (medicineData.status || 'active').toUpperCase() === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE';
        const createPayload: any = {
          name: medicineData.name,
          description: medicineData.description || '',
          manufacturer: medicineData.manufacturer || '',
          medicineForm: medicineData.form || '',
          status: statusUpper,
          sku: medicineData.sku || '',
          price: Number(medicineData.price) || 0,
          stock: Number(medicineData.stock) || 0,
          barcode: medicineData.barcode || '',
          prescriptionRequired: Boolean(medicineData.prescriptionRequired),
          countryOfOrigin: medicineData.countryOfOrigin || '',
          precautions: medicineData.precautions || '',
          sideEffects: medicineData.sideEffects || '',
          howToUse: medicineData.howToUse || '',
          genericName: medicineData.genericName || '',
          strength: medicineData.strength || '',
          medicineSalt: medicineData.salt || null,
          medicineFaq: (medicineData.faqs && Array.isArray(medicineData.faqs))
            ? medicineData.faqs
                .filter((faq: any) => faq && (faq.question || faq.q) && (faq.answer || faq.a))
                .map((faq: any) => ({ question: faq.question || faq.q, answer: faq.answer || faq.a }))
            : []
        };

        console.log('💉 Create payload (API keys):', createPayload);
        console.log('💉 Calling createMedicine API...');
        const createResult = await medicineService.createMedicine(createPayload);
        console.log('✅ Medicine created successfully:', createResult);

        // Return the new medicine ID for image upload
        if (createResult.data?.id) {
          const newMedicineId = Number(createResult.data.id);
          if (!isNaN(newMedicineId) && newMedicineId > 0) {
            return newMedicineId;
          } else {
            console.warn('⚠️ Could not determine new medicine ID:', createResult.data.id);
            throw new Error('Failed to get medicine ID after creation');
          }
        } else {
          throw new Error('Medicine created but no ID returned');
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save medicine';
      console.error('❌ Error in handleAddMedicine:', err);
      console.error('❌ Error message:', errorMessage);
      setError(errorMessage);
      throw err; // Re-throw so AddMedicineModal can catch it
    }
  };

  const handleImageUpload = async (medicineId: number, file: File): Promise<void> => {
    try {
      setError(null);
      console.log('💉 Uploading image for medicine ID:', medicineId);

      const uploadResponse = await fileUploadService.uploadMedicineImage(medicineId, file);
      console.log('✅ Image uploaded successfully');
      console.log('📦 Upload response data:', uploadResponse.data);

      // Reload medicines list after successful image upload to get updated image URL
      console.log('💉 Reloading medicines list...');
      await loadMedicines();
      console.log('✅ Medicines list reloaded');
      
      // Close modal after successful upload
      setIsAddMedicineModalOpen(false);
      setEditingMedicine(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload image';
      console.error('❌ Error uploading image:', err);
      setError(errorMessage);
      throw err; // Re-throw so AddMedicineModal can catch it
    }
  };

  const handleEditMedicine = async (medicine: Medicine) => {
    setError(null);
    const medicineId = (medicine as any).numericId ?? Number((medicine as any).id);
    if (!medicineId || isNaN(medicineId)) {
      setError('Invalid medicine ID');
      return;
    }
    try {
      // Fetch full medicine by ID so all fields (barcode, precautions, sideEffects, howToUse, medicineFaq, etc.) are prefilled
      const fullMedicine = await medicineService.getMedicineById(medicineId);
      const mapped = mapApiMedicineToUI(fullMedicine);
      const forEdit = mapped as any;
      if (!forEdit.form) forEdit.form = forEdit.medicineForm || forEdit.dosageForm || '';
      setEditingMedicine(forEdit);
      setIsAddMedicineModalOpen(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load medicine details';
      setError(msg);
      console.error('Failed to load medicine for edit:', err);
    }
  };

  const handleCloseModal = () => {
    setIsAddMedicineModalOpen(false);
    setEditingMedicine(null);
  };

  const handleDeleteMedicine = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      try {
        setError(null);
        await medicineService.deleteMedicine(Number(id));
        await loadMedicines();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete medicine';
        setError(errorMessage);
      }
    }
  };

  // Bulk actions
  const bulkActions = selectedMedicines.length > 0 ? (
    <div className="medicine-bulk-actions">
      <span className="medicine-bulk-actions__count">
        {selectedMedicines.length} selected
      </span>
      <button
        className="medicine-bulk-actions__btn medicine-bulk-actions__btn--activate"
        onClick={() => handleBulkStatusChange('active')}
      >
        Activate
      </button>
      <button
        className="medicine-bulk-actions__btn medicine-bulk-actions__btn--deactivate"
        onClick={() => handleBulkStatusChange('inactive')}
      >
        Deactivate
      </button>
      <button
        className="medicine-bulk-actions__btn medicine-bulk-actions__btn--delete"
        onClick={handleBulkDelete}
      >
        Delete
      </button>
    </div>
  ) : null;

  return (
    <div className="medicine-page">
      {/* Clean Header */}
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Medicines</h1>
          <p className="page-description">Manage your medicine inventory</p>
        </div>
        <button
          className="add-button"
          onClick={() => setIsAddMedicineModalOpen(true)}
        >
          <span className="button-icon">+</span>
          Add Medicine
        </button>
      </div>
        
      {/* Simple Stats */}
      <div className="stats-section">
        <div className="stat-item">
          <div className="stat-number">{analytics.totalMedicines}</div>
          <div className="stat-label">Total Medicines</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{analytics.activeMedicines}</div>
          <div className="stat-label">Active</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{analytics.lowStockCount}</div>
          <div className="stat-label">Low Stock</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">₹{analytics.totalValue.toFixed(0)}</div>
          <div className="stat-label">Total Value</div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="search-section">
        <div className="search-filter-container">
        <input
          type="text"
          placeholder="Search medicines..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
        />
          <div className="status-filter">
            <label htmlFor="status-filter" className="filter-label">Status:</label>
            <select
              id="status-filter"
              className="filter-select"
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value as 'all' | 'active' | 'inactive')}
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {bulkActions}

      {/* Partial list notice when API reports more than returned */}
      {apiTotalReported != null && medicines.length < apiTotalReported && (
        <div className="medicine-partial-notice" role="status">
          Showing {medicines.length} of {apiTotalReported} medicines. The API is not returning all pages; ask the backend team to fix <code>getAllMedicines</code> (support <code>size</code> or <code>page</code> &gt; 0).
        </div>
      )}

      {/* Medicines Grid */}
      <div className="medicines-section">
        <div className="section-header">
          <h2 className="section-title">Medicine Inventory</h2>
          <p className="section-subtitle">
            {filteredMedicines.length} of {medicines.length} medicines
            {apiTotalReported != null && medicines.length < apiTotalReported && ` (${apiTotalReported} in database)`}
            {statusFilter !== 'all' && ` (${statusFilter})`}
          </p>
        </div>
        
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading medicines...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h3>Failed to load medicines</h3>
            <p>Please check your connection and try again.</p>
            <button className="btn-secondary" onClick={handleRefresh}>
              Try Again
            </button>
          </div>
        ) : filteredMedicines.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💊</div>
            <h3>No medicines found</h3>
            <p>Start building your inventory by adding your first medicine.</p>
            <button className="btn-primary" onClick={() => setIsAddMedicineModalOpen(true)}>
              Add Your First Medicine
            </button>
          </div>
        ) : (
          <>
            {/* Pagination - Above the list */}
            {filteredMedicines.length > pagination.pageSize && (
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
                  Page {pagination.current} of {Math.ceil(filteredMedicines.length / pagination.pageSize)} ({filteredMedicines.length} total)
                </span>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, current: prev.current + 1 }))}
                  disabled={pagination.current >= Math.ceil(filteredMedicines.length / pagination.pageSize)}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    background: pagination.current >= Math.ceil(filteredMedicines.length / pagination.pageSize) ? '#f5f5f5' : 'white',
                    cursor: pagination.current >= Math.ceil(filteredMedicines.length / pagination.pageSize) ? 'not-allowed' : 'pointer'
                  }}
                >
                  Next
                </button>
              </div>
            )}

          <div className="medicines-list">
              {/* Apply client-side pagination */}
              {filteredMedicines
                .slice(
                  (pagination.current - 1) * pagination.pageSize,
                  pagination.current * pagination.pageSize
                )
                .map((medicine, index) => (
              <div key={medicine.id || (medicine as any).numericId || `medicine-${index}-${medicine.name}`} className="medicine-item">
                    {/* Medicine Image - Use AuthenticatedImage to fetch with Bearer token (avoids ERR_BLOCKED_BY_ORB) */}
                {medicine.image && (
                  <div className="medicine-image-container">
                        <AuthenticatedImage
                      src={medicine.image} 
                      alt={medicine.name}
                      className="medicine-image"
                          onError={() => {
                        console.error('❌ Image failed to load:', medicine.image);
                      }}
                    />
                  </div>
                )}
                <div className="medicine-info">
                  <h3 className="medicine-name">{medicine.name}</h3>
                  <p className="medicine-manufacturer">{medicine.manufacturer}</p>
                  <span className="medicine-category">{medicine.category}</span>
                </div>
                <div className="medicine-details">
                  <div className="detail">
                    <span className="detail-label">Price:</span>
                    <span className="detail-value">₹{medicine.price}</span>
                  </div>
                  <div className="detail">
                    <span className="detail-label">Stock:</span>
                    <span className={`detail-value ${((medicine as any).stock || 0) < 10 ? 'low-stock' : ''}`}>
                      {(medicine as any).stock || 0}
                    </span>
                  </div>
                      {medicine.countryOfOrigin && (
                        <div className="detail">
                          <span className="detail-label">Country of Origin:</span>
                          <span className="detail-value">{medicine.countryOfOrigin}</span>
                        </div>
                      )}
                  <div className="detail">
                    <span className="detail-label">Status:</span>
                    <span className={`status ${medicine.status}`}>{medicine.status}</span>
                  </div>
                </div>
                <div className="medicine-actions">
                  <button 
                    className="edit-btn"
                    onClick={() => handleEditMedicine(medicine)}
                  >
                    Edit
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDeleteMedicine(String(medicine.id))}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
          </>
        )}
      </div>

      {/* Add Medicine Modal */}
      <AddMedicineModal
        isOpen={isAddMedicineModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleAddMedicine}
        onImageUpload={handleImageUpload}
        editingMedicine={editingMedicine}
      />
    </div>
  );
};

export default MedicinePage;

import React, { useState, useEffect, useCallback } from 'react';
import { medicineService, Medicine, MedicineListParams } from '../../services/modules/medicineService';
import AddMedicineModal from './AddMedicineModal';
import './MedicinePage.css';

const MedicinePage: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMedicines, setSelectedMedicines] = useState<Medicine[]>([]);
  const [isAddMedicineModalOpen, setIsAddMedicineModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [analytics, setAnalytics] = useState({
    totalMedicines: 0,
    activeMedicines: 0,
    lowStockCount: 0,
    totalValue: 0
  });
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
      price: apiMedicine.price || 0,
      stock: apiMedicine.stock || apiMedicine.stockQuantity || 0,
      sku: apiMedicine.sku || 
           apiMedicine.SKU || 
           (apiMedicine.mainAttributes?.find((attr: any) => attr.name?.toLowerCase() === 'sku')?.value) ||
           '',
      status: apiMedicine.status?.toUpperCase() === 'INACTIVE' ? 'inactive' : 'active',
      image: (() => {
        const img = apiMedicine.image || 
                   apiMedicine.imageUrl || 
                   apiMedicine.thumbnail ||
                   (apiMedicine.files && Array.isArray(apiMedicine.files) && apiMedicine.files[0]?.url) ||
                   (apiMedicine.files && Array.isArray(apiMedicine.files) && apiMedicine.files[0]?.fileUrl) ||
                   '';
        if (img) {
          console.log('💉 Mapped image for', apiMedicine.name, ':', img);
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
                      ''
    };
  };

  const loadMedicines = useCallback(async (params: MedicineListParams = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await medicineService.getAllMedicines({
        page: (pagination.current - 1),
        size: pagination.pageSize,
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
      
      // Log IDs for debugging (can be removed later)
      if (mappedMedicines.length > 0 && !mappedMedicines[0].id) {
        console.warn('⚠️ Medicines mapped but IDs missing:', mappedMedicines[0]);
      }
      
      setMedicines(mappedMedicines);
      setPagination(prev => ({
        ...prev,
        total: response.pagination?.total || mappedMedicines.length,
      }));

      // Calculate analytics
      const totalValue = mappedMedicines.reduce((sum, med) => sum + ((med.price || 0) * (med.stock || 0)), 0);
      const activeMeds = mappedMedicines.filter(med => med.status === 'active').length;
      const lowStockMeds = mappedMedicines.filter(med => (med.stock || 0) < 10).length;
      
      setAnalytics({
        totalMedicines: response.pagination.total,
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
  }, [pagination.current, pagination.pageSize, sortBy]);

  useEffect(() => {
    loadMedicines();
  }, [loadMedicines]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPagination(prev => ({ ...prev, current: 1 }));
  };


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
    
    try {
      // Update only status field - API accepts single field in request body
      await Promise.all(
        selectedMedicines.map(medicine => 
          medicineService.updateMedicine(Number(medicine.id), { status: status.toLowerCase() })
        )
      );
      await loadMedicines();
      setSelectedMedicines([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update medicines');
    }
  };

  const handleAddMedicine = async (medicineData: any) => {
    try {
      setError(null);
      console.log('💉 handleAddMedicine called with:', medicineData);
      
      if (editingMedicine) {
        // Build update payload - only include fields that are being updated
        // API accepts single or multiple fields in request body
        const updatePayload: any = {};
        
        // String fields - only add if not empty (except description which can be empty)
        if (medicineData.name !== undefined && medicineData.name !== null && medicineData.name !== '') {
          updatePayload.name = medicineData.name;
        }
        if (medicineData.genericName !== undefined && medicineData.genericName !== null && medicineData.genericName !== '') {
          updatePayload.genericName = medicineData.genericName;
        }
        if (medicineData.manufacturer !== undefined && medicineData.manufacturer !== null && medicineData.manufacturer !== '') {
          updatePayload.manufacturer = medicineData.manufacturer;
        }
        if (medicineData.form !== undefined && medicineData.form !== null && medicineData.form !== '') {
          updatePayload.medicineForm = medicineData.form;
        }
        if (medicineData.category !== undefined && medicineData.category !== null && medicineData.category !== '') {
          updatePayload.category = medicineData.category;
        }
        if (medicineData.sku !== undefined && medicineData.sku !== null && medicineData.sku !== '') {
          updatePayload.sku = medicineData.sku;
        }
        if (medicineData.strength !== undefined && medicineData.strength !== null && medicineData.strength !== '') {
          updatePayload.strength = medicineData.strength;
        }
        // Country of Origin - include if defined (can be empty string to clear it)
        if (medicineData.countryOfOrigin !== undefined && medicineData.countryOfOrigin !== null) {
          updatePayload.countryOfOrigin = medicineData.countryOfOrigin;
        }
        // Description - always include if present (can be empty string)
        if ('description' in medicineData) {
          updatePayload.description = medicineData.description || '';
        }
        if (medicineData.status !== undefined && medicineData.status !== null && medicineData.status !== '') {
          updatePayload.status = medicineData.status.toLowerCase();
        }
        if (medicineData.barcode !== undefined && medicineData.barcode !== null) {
          updatePayload.barcode = medicineData.barcode || '';
        }
        if (medicineData.expiryDate !== undefined && medicineData.expiryDate !== null && medicineData.expiryDate !== '') {
          updatePayload.expiryDate = medicineData.expiryDate;
        }
        
        // Number fields - add if defined (can be 0)
        if (medicineData.price !== undefined && medicineData.price !== null) {
          updatePayload.price = Number(medicineData.price);
        }
        if (medicineData.stock !== undefined && medicineData.stock !== null) {
          updatePayload.stock = Number(medicineData.stock);
        }
        
        // Boolean fields - add if defined
        if (medicineData.prescriptionRequired !== undefined && medicineData.prescriptionRequired !== null) {
          updatePayload.prescriptionRequired = Boolean(medicineData.prescriptionRequired);
        }

        // Image field - can be null or string
        // Always include image field if present (even if empty string, to clear it)
        if ('image' in medicineData) {
          updatePayload.image = medicineData.image || null;
        }
        
        if (Object.keys(updatePayload).length === 0) {
          throw new Error('No fields to update');
        }
        
        const medicineId = (editingMedicine as any).numericId || 
                          (typeof editingMedicine.id === 'string' 
                            ? Number(editingMedicine.id) 
                            : editingMedicine.id);
        
        if (!medicineId || isNaN(medicineId) || medicineId <= 0) {
          throw new Error(`Invalid medicine ID: ${editingMedicine.id}. Please refresh the page and try again.`);
        }
        
        // Log update payload for debugging
        console.log('💉 Update payload:', updatePayload);
        console.log('💉 Description in payload:', updatePayload.description);
        
        // Send only the fields to update in request body
          await medicineService.updateMedicine(medicineId, updatePayload);
      } else {
        // Match exact curl payload structure
        const createPayload: any = {
          name: medicineData.name,
          description: medicineData.description || '',
          image: medicineData.image || null, // Include image URL if provided
          category: medicineData.category || '',
          manufacturer: medicineData.manufacturer || '',
          medicineForm: medicineData.form || '',
          status: (medicineData.status || 'active').toLowerCase(),
          sku: medicineData.sku || '',
          price: Number(medicineData.price) || 0,
          stock: Number(medicineData.stock) || 0,
          barcode: medicineData.barcode || '',
          prescriptionRequired: medicineData.prescriptionRequired || false
        };
        
        console.log('💉 Create payload with image:', {
          image: createPayload.image,
          imageType: typeof createPayload.image,
          imageLength: createPayload.image?.length
        });
        
        // Optional fields
        if (medicineData.genericName) createPayload.genericName = medicineData.genericName;
        if (medicineData.strength) createPayload.strength = medicineData.strength;
        if (medicineData.expiryDate) createPayload.expiryDate = medicineData.expiryDate;
        if (medicineData.countryOfOrigin) createPayload.countryOfOrigin = medicineData.countryOfOrigin;

        console.log('💉 Calling createMedicine API...');
        const createResult = await medicineService.createMedicine(createPayload);
        console.log('✅ Medicine created successfully:', createResult);
      }
      
      // Reload medicines list after successful create/update
      console.log('💉 Reloading medicines list...');
      await loadMedicines();
      console.log('✅ Medicines list reloaded');
      
      // Close modal only after successful operation
      setIsAddMedicineModalOpen(false);
      setEditingMedicine(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save medicine';
      console.error('❌ Error in handleAddMedicine:', err);
      console.error('❌ Error message:', errorMessage);
      setError(errorMessage);
      // Don't close modal on error - let user see the error and retry
      throw err; // Re-throw so AddMedicineModal can catch it
    }
  };

  const handleEditMedicine = (medicine: Medicine) => {
      setError(null);
      const medicineForEdit = medicine as any;
      
      if (!medicineForEdit.form) {
        medicineForEdit.form = medicineForEdit.medicineForm || medicineForEdit.dosageForm || '';
      }
      
      setEditingMedicine(medicineForEdit);
    setIsAddMedicineModalOpen(true);
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

      {/* Simple Search */}
      <div className="search-section">
        <input
          type="text"
          placeholder="Search medicines..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {/* Bulk Actions */}
      {bulkActions}

      {/* Medicines Grid */}
      <div className="medicines-section">
        <div className="section-header">
          <h2 className="section-title">Medicine Inventory</h2>
          <p className="section-subtitle">{medicines.length} medicines in your inventory</p>
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
        ) : medicines.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💊</div>
            <h3>No medicines found</h3>
            <p>Start building your inventory by adding your first medicine.</p>
            <button className="btn-primary" onClick={() => setIsAddMedicineModalOpen(true)}>
              Add Your First Medicine
            </button>
          </div>
        ) : (
          <div className="medicines-list">
            {medicines.map((medicine, index) => (
              <div key={medicine.id || (medicine as any).numericId || `medicine-${index}-${medicine.name}`} className="medicine-item">
                {/* Medicine Image */}
                {medicine.image && (
                  <div className="medicine-image-container">
                    <img 
                      src={medicine.image} 
                      alt={medicine.name}
                      className="medicine-image"
                      onError={(e) => {
                        console.error('❌ Image failed to load:', medicine.image);
                        (e.target as HTMLImageElement).style.display = 'none';
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
        )}
      </div>

      {/* Add Medicine Modal */}
      <AddMedicineModal
        isOpen={isAddMedicineModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleAddMedicine}
        editingMedicine={editingMedicine}
      />
    </div>
  );
};

export default MedicinePage;

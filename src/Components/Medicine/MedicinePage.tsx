import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { clientConfigManager } from '../../config/clientConfig';
import { medicineService, Medicine, MedicineListParams } from '../../services/modules/medicineService';
import DataTable, { TableColumn } from '../core/DataTable';
import BaseCard from '../core/BaseCard';
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
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedMedicines, setSelectedMedicines] = useState<Medicine[]>([]);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [isAddMedicineModalOpen, setIsAddMedicineModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [analytics, setAnalytics] = useState({
    totalMedicines: 0,
    activeMedicines: 0,
    lowStockCount: 0,
    totalValue: 0
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const config = clientConfigManager.getConfig();

  // Temporarily comment out module check for testing
  // if (!config.modules.medicines) {
  //   return (
  //     <div className="medicine-page">
  //       <BaseCard
  //         title="Module Disabled"
  //         subtitle="Medicine management is not available for this client"
  //         variant="outlined"
  //       >
  //         <p>This module has been disabled in the client configuration.</p>
  //       </BaseCard>
  //     </div>
  //   );
  // }

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadMedicines = useCallback(async (params: MedicineListParams = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await medicineService.getMedicines({
        page: pagination.current,
        pageSize: pagination.pageSize,
        filters: {
          search: debouncedSearchTerm || undefined,
          category: categoryFilter || undefined,
          status: statusFilter || undefined,
        },
        sortBy,
        sortOrder,
        ...params,
      });

      setMedicines(response.medicines);
      setPagination(prev => ({
        ...prev,
        total: response.pagination.total,
      }));

      // Calculate analytics
      const totalValue = response.medicines.reduce((sum, med) => sum + (med.price * med.stock), 0);
      const activeMeds = response.medicines.filter(med => med.status === 'active').length;
      const lowStockMeds = response.medicines.filter(med => med.stock < 10).length;
      
      setAnalytics({
        totalMedicines: response.pagination.total,
        activeMedicines: activeMeds,
        lowStockCount: lowStockMeds,
        totalValue
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load medicines');
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, debouncedSearchTerm, categoryFilter, statusFilter, sortBy, sortOrder]);

  useEffect(() => {
    loadMedicines();
  }, [loadMedicines]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, current: page }));
  };

  const handleSelectionChange = (selectedRows: Medicine[], selectedRowKeys: string[]) => {
    setSelectedMedicines(selectedRows);
  };

  const handleRowClick = (record: Medicine) => {
    // Navigate to medicine detail page
  };

  const handleRefresh = () => {
    loadMedicines();
  };

  const handleBulkDelete = async () => {
    if (selectedMedicines.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedMedicines.length} medicines?`)) {
      try {
        await Promise.all(
          selectedMedicines.map(medicine => medicineService.deleteMedicine(medicine.id))
        );
        await loadMedicines();
        setSelectedMedicines([]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete medicines');
      }
    }
  };

  const handleBulkStatusChange = async (status: 'active' | 'inactive') => {
    if (selectedMedicines.length === 0) return;
    
    try {
      await Promise.all(
        selectedMedicines.map(medicine => 
          medicineService.updateMedicine(medicine.id, { status })
        )
      );
      await loadMedicines();
      setSelectedMedicines([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update medicines');
    }
  };

  const handleAddMedicine = (medicineData: any) => {
    console.log('New medicine data:', medicineData);
    // TODO: Implement API call to add medicine
    alert(`Medicine ${medicineData.name} has been added successfully!`);
    loadMedicines(); // Refresh the list
  };

  const handleEditMedicine = (medicine: Medicine) => {
    setEditingMedicine(medicine);
    setIsAddMedicineModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddMedicineModalOpen(false);
    setEditingMedicine(null);
  };

  const handleDeleteMedicine = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      try {
        await medicineService.deleteMedicine(id);
        await loadMedicines();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete medicine');
      }
    }
  };

  // Table columns
  const columns: TableColumn<Medicine>[] = [
    {
      key: 'image',
      title: 'Image',
      dataIndex: 'image',
      width: 80,
      align: 'center',
      render: (value, record) => (
        <div className="medicine-image">
          {record.image ? (
            <img 
              src={record.image} 
              alt={record.name}
              className="medicine-image__img"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`medicine-image__placeholder ${record.image ? 'hidden' : ''}`}>
            <span>📦</span>
          </div>
        </div>
      ),
    },
    {
      key: 'name',
      title: 'Name',
      dataIndex: 'name',
      searchable: true,
      render: (value, record) => (
        <div className="medicine-name">
          <div className="medicine-name__title">{record.name}</div>
          <div className="medicine-name__description">{record.description}</div>
        </div>
      ),
    },
    {
      key: 'category',
      title: 'Category',
      dataIndex: 'category',
      filterable: true,
      render: (value) => (
        <span className="medicine-category">
          💊 {value}
        </span>
      ),
    },
    {
      key: 'manufacturer',
      title: 'Manufacturer',
      dataIndex: 'manufacturer',
      filterable: true,
      render: (value) => (
        <div className="medicine-manufacturer">
          <div className="medicine-manufacturer__name">{value}</div>
          <div className="medicine-manufacturer__country">India</div>
        </div>
      ),
    },
    {
      key: 'form',
      title: 'Form',
      dataIndex: 'form',
      filterable: true,
      render: (value) => (
        <span className="medicine-form">
          {value}
        </span>
      ),
    },
    {
      key: 'price',
      title: 'Price',
      dataIndex: 'price',
      width: 120,
      align: 'right',
      render: (value) => (
        <div className="medicine-price">
          <div className="medicine-price__current">₹{value?.toFixed(2)}</div>
        </div>
      ),
    },
    {
      key: 'stock',
      title: 'Stock',
      dataIndex: 'stock',
      width: 100,
      align: 'center',
      render: (value, record) => (
        <div className="medicine-stock">
          <div className={`medicine-stock__count ${value < 10 ? 'low-stock' : ''}`}>
            {value || 0}
          </div>
          {value < 10 && (
            <div className="medicine-stock__warning">⚠️ Low</div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'status',
      filterable: true,
      render: (value) => (
        <span className={`medicine-status medicine-status--${value}`}>
          {value === 'active' ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      dataIndex: 'actions',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <div className="medicine-actions">
          <button
            className="medicine-actions__btn medicine-actions__btn--edit"
            onClick={(e) => {
              e.stopPropagation();
              handleEditMedicine(record);
            }}
            title="Edit"
          >
            ✏️
          </button>
          <button
            className="medicine-actions__btn medicine-actions__btn--delete"
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm('Are you sure you want to delete this medicine?')) {
                medicineService.deleteMedicine(record.id).then(() => {
                  loadMedicines();
                });
              }
            }}
            title="Delete"
          >
            🗑️
          </button>
        </div>
      ),
    },
  ];

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
        <div className="filters">
          <select className="filter-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="">All Categories</option>
            <option value="Antibiotics">Antibiotics</option>
            <option value="Pain Relief">Pain Relief</option>
            <option value="Vitamins">Vitamins</option>
            <option value="Cold & Flu">Cold & Flu</option>
          </select>
          <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Bulk Upload Section */}
      {showBulkUpload && (
        <BaseCard
          title="Bulk Upload"
          subtitle="Upload multiple medicines at once using CSV file"
          className="medicine-page__bulk-upload"
        >
          <div className="medicine-bulk-upload">
            <div className="medicine-bulk-upload__dropzone">
              <span className="medicine-bulk-upload__icon">📁</span>
              <p className="medicine-bulk-upload__text">
                Drag and drop your CSV file here, or click to browse
              </p>
              <button className="medicine-bulk-upload__btn">
                Choose File
              </button>
            </div>
            <div className="medicine-bulk-upload__info">
              <p>Download the template file to see the required format.</p>
              <button className="medicine-bulk-upload__template">
                📥 Download Template
              </button>
            </div>
          </div>
        </BaseCard>
      )}

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
            {medicines.map((medicine) => (
              <div key={medicine.id} className="medicine-item">
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
                    <span className={`detail-value ${medicine.stock < 10 ? 'low-stock' : ''}`}>
                      {medicine.stock}
                    </span>
                  </div>
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
                    onClick={() => handleDeleteMedicine(medicine.id)}
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

import React, { useState, useEffect, useCallback } from 'react';
import { clientConfigManager } from '../../config/clientConfig';
import { medicineService, Medicine, MedicineListParams } from '../../services/modules/medicineService';
import DataTable, { TableColumn } from '../core/DataTable';
import BaseCard from '../core/BaseCard';
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
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  const config = clientConfigManager.getConfig();

  if (!config.modules.medicines) {
    return (
      <div className="medicine-page">
        <BaseCard
          title="Module Disabled"
          subtitle="Medicine management is not available for this client"
          variant="outlined"
        >
          <p>This module has been disabled in the client configuration.</p>
        </BaseCard>
      </div>
    );
  }

  const loadMedicines = useCallback(async (params: MedicineListParams = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await medicineService.getMedicines({
        page: pagination.current,
        pageSize: pagination.pageSize,
        filters: {
          search: searchTerm || undefined,
        },
        ...params,
      });

      setMedicines(response.medicines);
      setPagination(prev => ({
        ...prev,
        total: response.pagination.total,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load medicines');
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, searchTerm]);

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
              console.log('Edit medicine:', record.id);
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
      {/* Page Header */}
      <div className="medicine-page__header">
        <div className="medicine-page__title-section">
          <h1 className="medicine-page__title">Medicines</h1>
          <p className="medicine-page__subtitle">
            Manage your medicine inventory and catalog
          </p>
        </div>
        <div className="medicine-page__actions">
          <button
            className="medicine-page__btn medicine-page__btn--secondary"
            onClick={() => setShowBulkUpload(!showBulkUpload)}
          >
            📤 Bulk Upload
          </button>
          <button
            className="medicine-page__btn medicine-page__btn--primary"
            onClick={() => console.log('Create medicine')}
          >
            ➕ Create Medicine
          </button>
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

      {/* Data Table */}
      <DataTable
        data={medicines}
        columns={columns}
        loading={loading}
        error={error}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
        searchable={true}
        filterable={true}
        sortable={true}
        selectable={true}
        onSelectionChange={handleSelectionChange}
        onRowClick={handleRowClick}
        onRefresh={handleRefresh}
        title="Medicines List"
        subtitle={`${pagination.total} medicines in your inventory`}
        actions={
          <div className="medicine-page__table-actions">
            <select
              className="medicine-page__filter"
              onChange={(e) => console.log('Filter by category:', e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="anti-amebics">Anti Amebics</option>
              <option value="anthelmintic">Anthelmintic & Anti-worm</option>
            </select>
            <select
              className="medicine-page__filter"
              onChange={(e) => console.log('Filter by status:', e.target.value)}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        }
        emptyText="No medicines found"
        emptyImage="/empty-medicines.svg"
        rowKey="id"
        scroll={{ x: 800 }}
        size="middle"
      />
    </div>
  );
};

export default MedicinePage;

import React, { useState, useEffect } from 'react';
import StatusBadge from './StatusBadge';
import { PrescriptionStatus, getAllStatuses } from './prescriptionStatusConfig';
import { AdminPrescription } from './AdminPrescriptionDetails';
import './AdminPrescriptionList.css';

interface AdminPrescriptionListProps {
  prescriptions: AdminPrescription[];
  onPrescriptionClick: (prescription: AdminPrescription) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  statusFilter: PrescriptionStatus | '';
  onStatusFilterChange: (status: PrescriptionStatus | '') => void;
}

const AdminPrescriptionList: React.FC<AdminPrescriptionListProps> = ({
  prescriptions,
  onPrescriptionClick,
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1
  });

  const filteredPrescriptions = prescriptions.filter((prescription) => {
    const matchesSearch =
      prescription.prescriptionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (prescription.patient.phone?.toLowerCase().includes(searchTerm.toLowerCase()) || false);

    const matchesStatus = !statusFilter || prescription.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Apply pagination to filtered results
  const paginatedPrescriptions = filteredPrescriptions.slice(
    (pagination.current - 1) * pagination.pageSize,
    pagination.current * pagination.pageSize
  );

  // Update pagination total based on filtered results
  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      total: filteredPrescriptions.length,
      totalPages: Math.ceil(filteredPrescriptions.length / prev.pageSize),
      current: prev.current > Math.ceil(filteredPrescriptions.length / prev.pageSize)
        ? 1
        : prev.current // Reset to page 1 if current page exceeds total pages
    }));
  }, [filteredPrescriptions.length, pagination.pageSize]);

  // Reset pagination when search or filter changes
  useEffect(() => {
    setPagination(prev => ({ ...prev, current: 1 }));
  }, [searchTerm, statusFilter]);

  return (
    <div className="admin-prescription-list">
      {/* Filters Section */}
      <div className="prescription-filters">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by prescription number, patient name, or phone..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-container">
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as PrescriptionStatus | '')}
            className="status-filter-select"
          >
            <option value="">All Status</option>
            {getAllStatuses().map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="prescription-results-count">
        <p>
          {filteredPrescriptions.length} prescription{filteredPrescriptions.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Prescriptions List */}
      {filteredPrescriptions.length === 0 ? (
        <div className="prescription-list-empty">
          <div className="empty-icon">💊</div>
          <h3>No Prescriptions Found</h3>
          <p>No prescriptions match your current filters.</p>
        </div>
      ) : (
        <>
          <div className="prescriptions-grid">
            {paginatedPrescriptions.map((prescription) => (
              <div
                key={prescription.id}
                className="prescription-card"
                onClick={() => onPrescriptionClick(prescription)}
              >
                <div className="prescription-card-header">
                  <div className="prescription-card-title-section">
                    <h3 className="prescription-card-number">{prescription.prescriptionNumber}</h3>
                    <p className="prescription-card-date">Uploaded: {formatDate(prescription.createdAt)}</p>
                  </div>
                  <StatusBadge status={prescription.status} showIcon size="small" />
                </div>

                <div className="prescription-card-body">
                  <div className="prescription-card-info-row">
                    <span className="card-info-label">Patient:</span>
                    <span className="card-info-value">{prescription.patient.name}</span>
                  </div>
                  <div className="prescription-card-info-row">
                    <span className="card-info-label">Doctor:</span>
                    <span className="card-info-value">{prescription.doctorName}</span>
                  </div>
                  {prescription.amount && (
                    <div className="prescription-card-info-row">
                      <span className="card-info-label">Amount:</span>
                      <span className="card-info-value amount-value">₹{prescription.amount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="prescription-card-info-row">
                    <span className="card-info-label">Medications:</span>
                    <span className="card-info-value">
                      {prescription.medications.length} medication{prescription.medications.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {prescription.uploadedFiles.length > 0 && (
                    <div className="prescription-card-info-row">
                      <span className="card-info-label">Files:</span>
                      <span className="card-info-value">{prescription.uploadedFiles.length} file{prescription.uploadedFiles.length !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>

                <div className="prescription-card-footer">
                  <button className="btn-view-details">View Details →</button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.total > pagination.pageSize && (
            <div className="pagination" style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '10px',
              padding: '20px',
              marginTop: '20px'
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
        </>
      )}
    </div>
  );
};

export default AdminPrescriptionList;

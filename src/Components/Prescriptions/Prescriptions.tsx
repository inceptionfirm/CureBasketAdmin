import React, { useState, useEffect, useCallback } from 'react';
import { useLocale } from '../../contexts/LocaleContext';
import { prescriptionService, Prescription, PrescriptionStats } from '../../services/prescriptionService';
import AddPrescriptionModal from './AddPrescriptionModal';
import './Prescriptions.css';
import '../../styles/global-buttons.css';

const Prescriptions: React.FC = () => {
  const { t } = useLocale();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<PrescriptionStats>({
    totalPrescriptions: 0,
    pendingPrescriptions: 0,
    approvedPrescriptions: 0,
    dispensedPrescriptions: 0,
    expiredPrescriptions: 0,
    urgentPrescriptions: 0,
    totalMedications: 0,
    averageProcessingTime: 0
  });
  const [isAddPrescriptionModalOpen, setIsAddPrescriptionModalOpen] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');

  const loadPrescriptions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock data for now - replace with actual API call later
      const mockPrescriptions: Prescription[] = [
        {
          id: '1',
          prescriptionNumber: 'RX-2024-001',
          patientId: 'P001',
          patient: {
            id: 'P001',
            name: 'John Smith',
            email: 'john@example.com',
            phone: '+1-555-0123',
            dateOfBirth: '1985-03-15',
            address: '123 Main St, City, State'
          },
          doctorId: 'D001',
          doctor: {
            id: 'D001',
            name: 'Dr. Sarah Johnson',
            licenseNumber: 'MD12345',
            specialization: 'Internal Medicine',
            phone: '+1-555-0456'
          },
          medications: [
            {
              id: '1',
              medicineId: 'M001',
              medicine: {
                id: 'M001',
                name: 'Amoxicillin',
                manufacturer: 'PharmaCorp',
                form: 'Capsule'
              },
              dosage: '500mg',
              frequency: 'Twice daily',
              duration: '7 days',
              quantity: 14,
              instructions: 'Take with food',
              refillsAllowed: 1,
              refillsUsed: 0
            }
          ],
          diagnosis: 'Upper respiratory infection',
          symptoms: ['cough', 'fever', 'congestion'],
          notes: 'Patient reports symptoms for 3 days',
          status: 'approved',
          priority: 'medium',
          prescribedDate: '2024-01-15T10:00:00Z',
          expiryDate: '2024-02-15T10:00:00Z',
          dispensedDate: '2024-01-15T14:30:00Z',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T14:30:00Z',
          createdBy: {
            id: '1',
            name: 'Admin User',
            email: 'admin@example.com'
          }
        },
        {
          id: '2',
          prescriptionNumber: 'RX-2024-002',
          patientId: 'P002',
          patient: {
            id: 'P002',
            name: 'Jane Doe',
            email: 'jane@example.com',
            phone: '+1-555-0789',
            dateOfBirth: '1990-07-22',
            address: '456 Oak Ave, City, State'
          },
          doctorId: 'D002',
          doctor: {
            id: 'D002',
            name: 'Dr. Michael Chen',
            licenseNumber: 'MD67890',
            specialization: 'Cardiology',
            phone: '+1-555-0321'
          },
          medications: [
            {
              id: '2',
              medicineId: 'M002',
              medicine: {
                id: 'M002',
                name: 'Lisinopril',
                manufacturer: 'MediPharm',
                form: 'Tablet'
              },
              dosage: '10mg',
              frequency: 'Once daily',
              duration: '30 days',
              quantity: 30,
              instructions: 'Take in the morning',
              refillsAllowed: 2,
              refillsUsed: 0
            }
          ],
          diagnosis: 'Hypertension',
          symptoms: ['high blood pressure', 'headaches'],
          notes: 'Regular follow-up required',
          status: 'pending',
          priority: 'high',
          prescribedDate: '2024-01-20T09:15:00Z',
          expiryDate: '2024-02-20T09:15:00Z',
          createdAt: '2024-01-20T09:15:00Z',
          updatedAt: '2024-01-20T09:15:00Z',
          createdBy: {
            id: '1',
            name: 'Admin User',
            email: 'admin@example.com'
          }
        },
        {
          id: '3',
          prescriptionNumber: 'RX-2024-003',
          patientId: 'P003',
          patient: {
            id: 'P003',
            name: 'Robert Wilson',
            email: 'robert@example.com',
            phone: '+1-555-0654',
            dateOfBirth: '1978-11-08',
            address: '789 Pine St, City, State'
          },
          doctorId: 'D001',
          doctor: {
            id: 'D001',
            name: 'Dr. Sarah Johnson',
            licenseNumber: 'MD12345',
            specialization: 'Internal Medicine',
            phone: '+1-555-0456'
          },
          medications: [
            {
              id: '3',
              medicineId: 'M003',
              medicine: {
                id: 'M003',
                name: 'Ibuprofen',
                manufacturer: 'PainRelief Inc',
                form: 'Tablet'
              },
              dosage: '400mg',
              frequency: 'Three times daily',
              duration: '5 days',
              quantity: 15,
              instructions: 'Take with food to avoid stomach upset',
              refillsAllowed: 0,
              refillsUsed: 0
            }
          ],
          diagnosis: 'Muscle strain',
          symptoms: ['muscle pain', 'inflammation'],
          notes: 'Rest and ice recommended',
          status: 'dispensed',
          priority: 'low',
          prescribedDate: '2024-01-18T16:45:00Z',
          expiryDate: '2024-02-18T16:45:00Z',
          dispensedDate: '2024-01-18T17:00:00Z',
          createdAt: '2024-01-18T16:45:00Z',
          updatedAt: '2024-01-18T17:00:00Z',
          createdBy: {
            id: '2',
            name: 'Pharmacy Staff',
            email: 'pharmacy@example.com'
          }
        }
      ];
      
      setPrescriptions(mockPrescriptions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, priorityFilter]);

  const loadStats = useCallback(async () => {
    try {
      // Mock stats for now - replace with actual API call later
      const mockStats: PrescriptionStats = {
        totalPrescriptions: 3,
        pendingPrescriptions: 1,
        approvedPrescriptions: 1,
        dispensedPrescriptions: 1,
        expiredPrescriptions: 0,
        urgentPrescriptions: 1,
        totalMedications: 3,
        averageProcessingTime: 2.5
      };
      setStats(mockStats);
    } catch (err) {
      console.error('Failed to load prescription stats:', err);
    }
  }, []);

  useEffect(() => {
    loadPrescriptions();
    loadStats();
  }, [loadPrescriptions, loadStats]);

  const handleAddPrescription = async (prescriptionData: any) => {
    try {
      // Mock implementation - replace with actual API call later
      console.log('Adding prescription:', prescriptionData);
      await loadPrescriptions();
      await loadStats();
      setIsAddPrescriptionModalOpen(false);
      setEditingPrescription(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save prescription');
    }
  };

  const handleEditPrescription = (prescription: Prescription) => {
    setEditingPrescription(prescription);
    setIsAddPrescriptionModalOpen(true);
  };

  const handleDeletePrescription = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this prescription?')) {
      try {
        // Mock implementation - replace with actual API call later
        console.log('Deleting prescription:', id);
        await loadPrescriptions();
        await loadStats();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete prescription');
      }
    }
  };

  const handleApprovePrescription = async (id: string) => {
    try {
      // Mock implementation - replace with actual API call later
      console.log('Approving prescription:', id);
      await loadPrescriptions();
      await loadStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve prescription');
    }
  };

  const handleDispensePrescription = async (id: string) => {
    try {
      // Mock implementation - replace with actual API call later
      console.log('Dispensing prescription:', id);
      await loadPrescriptions();
      await loadStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to dispense prescription');
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  const handlePriorityFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPriorityFilter(e.target.value);
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      pending: 'status-pending',
      approved: 'status-approved',
      rejected: 'status-rejected',
      dispensed: 'status-dispensed',
      expired: 'status-expired'
    };
    return statusClasses[status as keyof typeof statusClasses] || 'status-pending';
  };

  const getPriorityBadge = (priority: string) => {
    const priorityClasses = {
      low: 'priority-low',
      medium: 'priority-medium',
      high: 'priority-high',
      urgent: 'priority-urgent'
    };
    return priorityClasses[priority as keyof typeof priorityClasses] || 'priority-medium';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = prescription.prescriptionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.diagnosis.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || prescription.status === statusFilter;
    const matchesPriority = !priorityFilter || prescription.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (loading) {
    return (
      <div className="prescriptions-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading prescriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="prescriptions-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Prescriptions</h1>
          <p className="page-description">Manage patient prescriptions and medication orders</p>
        </div>
        <button
          className="add-button"
          onClick={() => setIsAddPrescriptionModalOpen(true)}
        >
          <span className="button-icon">+</span>
          Add Prescription
        </button>
      </div>

      <div className="stats-section">
        <div className="stat-item">
          <span className="stat-number">{stats.totalPrescriptions}</span>
          <div className="stat-label">Total Prescriptions</div>
        </div>
        <div className="stat-item">
          <span className="stat-number">{stats.pendingPrescriptions}</span>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-item">
          <span className="stat-number">{stats.approvedPrescriptions}</span>
          <div className="stat-label">Approved</div>
        </div>
        <div className="stat-item">
          <span className="stat-number">{stats.dispensedPrescriptions}</span>
          <div className="stat-label">Dispensed</div>
        </div>
      </div>

      <div className="search-filters">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search prescriptions..."
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
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="dispensed">Dispensed</option>
            <option value="expired">Expired</option>
          </select>
          <select
            value={priorityFilter}
            onChange={handlePriorityFilter}
            className="filter-select"
          >
            <option value="">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      <div className="prescriptions-section">
        <div className="section-header">
          <h2 className="section-title">Prescription List</h2>
          <p className="section-subtitle">
            {filteredPrescriptions.length} prescription{filteredPrescriptions.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {error && (
          <div className="error-state">
            <p>{error}</p>
            <button onClick={loadPrescriptions} className="btn-refresh">
              Try Again
            </button>
          </div>
        )}

        {filteredPrescriptions.length === 0 && !loading ? (
          <div className="empty-state">
            <div className="empty-icon">💊</div>
            <h3>No Prescriptions Found</h3>
            <p>No prescriptions match your current filters.</p>
            <button
              className="add-button"
              onClick={() => setIsAddPrescriptionModalOpen(true)}
            >
              <span className="button-icon">+</span>
              Add First Prescription
            </button>
          </div>
        ) : (
          <div className="prescriptions-list">
            {filteredPrescriptions.map((prescription) => (
              <div key={prescription.id} className="prescription-item">
                <div className="prescription-header">
                  <div className="prescription-info">
                    <h3 className="prescription-number">{prescription.prescriptionNumber}</h3>
                    <div className="prescription-badges">
                      <span className={`status-badge ${getStatusBadge(prescription.status)}`}>
                        {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
                      </span>
                      <span className={`priority-badge ${getPriorityBadge(prescription.priority)}`}>
                        {prescription.priority.charAt(0).toUpperCase() + prescription.priority.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="prescription-actions">
                    {prescription.status === 'pending' && (
                      <button
                        onClick={() => handleApprovePrescription(prescription.id)}
                        className="btn-edit"
                      >
                        Approve
                      </button>
                    )}
                    {prescription.status === 'approved' && (
                      <button
                        onClick={() => handleDispensePrescription(prescription.id)}
                        className="btn-save"
                      >
                        Dispense
                      </button>
                    )}
                    <button
                      onClick={() => handleEditPrescription(prescription)}
                      className="btn-edit"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeletePrescription(prescription.id)}
                      className="btn-delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="prescription-details">
                  <div className="detail-row">
                    <div className="detail-group">
                      <span className="detail-label">Patient:</span>
                      <span className="detail-value">{prescription.patient.name}</span>
                    </div>
                    <div className="detail-group">
                      <span className="detail-label">Doctor:</span>
                      <span className="detail-value">{prescription.doctor.name}</span>
                    </div>
                  </div>

                  <div className="detail-row">
                    <div className="detail-group">
                      <span className="detail-label">Diagnosis:</span>
                      <span className="detail-value">{prescription.diagnosis}</span>
                    </div>
                    <div className="detail-group">
                      <span className="detail-label">Medications:</span>
                      <span className="detail-value">{prescription.medications.length} medication(s)</span>
                    </div>
                  </div>

                  <div className="detail-row">
                    <div className="detail-group">
                      <span className="detail-label">Prescribed:</span>
                      <span className="detail-value">{formatDate(prescription.prescribedDate)}</span>
                    </div>
                    <div className="detail-group">
                      <span className="detail-label">Expires:</span>
                      <span className="detail-value">{formatDate(prescription.expiryDate)}</span>
                    </div>
                  </div>

                  {prescription.symptoms.length > 0 && (
                    <div className="symptoms-section">
                      <span className="detail-label">Symptoms:</span>
                      <div className="symptoms-list">
                        {prescription.symptoms.map((symptom, index) => (
                          <span key={index} className="symptom-tag">
                            {symptom}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {prescription.notes && (
                    <div className="notes-section">
                      <span className="detail-label">Notes:</span>
                      <span className="detail-value">{prescription.notes}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddPrescriptionModal
        isOpen={isAddPrescriptionModalOpen}
        onClose={() => {
          setIsAddPrescriptionModalOpen(false);
          setEditingPrescription(null);
        }}
        onSubmit={handleAddPrescription}
        editingPrescription={editingPrescription}
      />
    </div>
  );
};

export default Prescriptions;
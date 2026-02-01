import React, { useState, useEffect } from 'react';
import AdminPrescriptionList from './AdminPrescriptionList';
import AdminPrescriptionDetails, { AdminPrescription } from './AdminPrescriptionDetails';
import { PrescriptionStatus } from './prescriptionStatusConfig';
import { Medication } from './MedicationEditor';
import { prescriptionService, Prescription } from '../../services/prescriptionService';
import './Prescriptions.css';
import '../../styles/global-buttons.css';

/**
 * ADMIN PRESCRIPTION MANAGEMENT COMPONENT
 * 
 * Complete prescription lifecycle management:
 * PENDING → APPROVED → PAID → VERIFIED → DISPATCHED
 * 
 * TODO: Replace mock data with actual API calls
 * - Load prescriptions: prescriptionService.getAllPrescriptions()
 * - Update status: prescriptionService.updatePrescription(id, { status })
 * - Update medications: prescriptionService.updatePrescription(id, { mainAttributes })
 * - Update amount: prescriptionService.updatePrescription(id, { amount })
 */

const Prescriptions: React.FC = () => {
  // State management
  const [prescriptions, setPrescriptions] = useState<AdminPrescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPrescription, setSelectedPrescription] = useState<AdminPrescription | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PrescriptionStatus | ''>('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1
  });

  // Stats state
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    paid: 0,
    verified: 0,
    dispatched: 0
  });

  // Map API Prescription to AdminPrescription format
  const mapApiPrescriptionToAdmin = (apiPrescription: Prescription | any): AdminPrescription => {
    // Extract medications from mainAttributes
    const medications: Medication[] = [];
    if (apiPrescription.mainAttributes && Array.isArray(apiPrescription.mainAttributes)) {
      apiPrescription.mainAttributes.forEach((attr: any, index: number) => {
        // Check if this attribute represents a medication
        if (attr.name && (attr.name.toLowerCase().includes('medication') || attr.name.toLowerCase().includes('medicine'))) {
          // Extract medication details from subAttributes or value
          const subAttrs = attr.subAttributes || [];
          const medicineName = attr.value || attr.name || `Medicine ${index + 1}`;
          const dosage = subAttrs.find((sa: any) => sa.name?.toLowerCase().includes('dosage'))?.value || '';
          const frequency = subAttrs.find((sa: any) => sa.name?.toLowerCase().includes('frequency'))?.value || '';
          const duration = subAttrs.find((sa: any) => sa.name?.toLowerCase().includes('duration'))?.value || '';
          const quantity = subAttrs.find((sa: any) => sa.name?.toLowerCase().includes('quantity'))?.value || '';
          const instructions = subAttrs.find((sa: any) => sa.name?.toLowerCase().includes('instruction'))?.value || '';

          medications.push({
            id: String(attr.id || `med-${index}`),
            name: medicineName,
            dosage,
            frequency,
            duration,
            quantity,
            instructions
          });
        }
      });
    }
    
    // Extract uploaded files from files array
    const uploadedFiles: { type: 'pdf' | 'image'; url: string }[] = [];
    if (apiPrescription.files && Array.isArray(apiPrescription.files)) {
      apiPrescription.files.forEach((file: any) => {
        if (file.docPath) {
          const docPath = file.docPath;
          const imageBaseURL = 'https://java.api.curebasket.com';
          const fullUrl = docPath.startsWith('http') 
            ? docPath 
            : docPath.startsWith('/') 
              ? `${imageBaseURL}${docPath}` 
              : `${imageBaseURL}/${docPath}`;
          
          const fileExtension = docPath.toLowerCase().split('.').pop() || '';
          const fileType = fileExtension === 'pdf' ? 'pdf' : 'image';
          
          uploadedFiles.push({
            type: fileType,
            url: fullUrl
          });
        }
      });
    }

    // Map status from API to AdminPrescription format
    const statusMap: Record<string, PrescriptionStatus> = {
      'PENDING': 'pending',
      'APPROVED': 'approved',
      'REJECTED': 'rejected',
      'DISPENSED': 'dispatched',
      'EXPIRED': 'expired',
      'PAID': 'paid',
      'VERIFIED': 'verified'
    };
    const apiStatus = (apiPrescription.status || 'PENDING').toUpperCase();
    const mappedStatus = statusMap[apiStatus] || 'pending';

    // Extract patient info - API has patientName, might have patientId
    const patientName = apiPrescription.patientName || 'Unknown Patient';
    const patientId = apiPrescription.patientId || '';
    
    return {
      id: String(apiPrescription.id),
      prescriptionNumber: apiPrescription.prescriptionNumber || `RX-${apiPrescription.id}`,
      patient: {
        name: patientName,
        email: apiPrescription.patientEmail || undefined,
        phone: apiPrescription.patientPhone || undefined
      },
      doctorName: apiPrescription.doctorName || 'Unknown Doctor',
      diagnosis: apiPrescription.diagnosis || '',
      notes: apiPrescription.note || apiPrescription.notes || '',
      uploadedFiles,
      medications,
      amount: apiPrescription.amount || undefined,
      status: mappedStatus,
      transactionId: apiPrescription.transactionId || undefined,
      paymentScreenshot: apiPrescription.paymentScreenshot || undefined,
      createdAt: apiPrescription.createdAt || apiPrescription.prescriptionDate || new Date().toISOString()
    };
  };

  // Calculate stats from prescriptions
  const calculateStats = (prescriptions: AdminPrescription[]) => {
    return {
      total: prescriptions.length,
      pending: prescriptions.filter(p => p.status === 'pending').length,
      approved: prescriptions.filter(p => p.status === 'approved').length,
      paid: prescriptions.filter(p => p.status === 'paid').length,
      verified: prescriptions.filter(p => p.status === 'verified').length,
      dispatched: prescriptions.filter(p => p.status === 'dispatched').length
    };
  };

  // Load prescriptions from API
  useEffect(() => {
    const loadPrescriptions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('💊 Loading prescriptions from API...');
        const response = await prescriptionService.getAllPrescriptions({
        itemType: 'PRESCRIPTION',
        page: 0,
        pageSize: 100,
          sortBy: 'ID',
        sortOrder: 'DESC'
        });

        console.log('💊 API response:', response);
        const apiPrescriptions = response.prescriptions || [];
        console.log('💊 API prescriptions count:', apiPrescriptions.length);
      
        // Map API prescriptions to AdminPrescription format
        const mappedPrescriptions = apiPrescriptions.map(mapApiPrescriptionToAdmin);
      console.log('💊 Mapped prescriptions:', mappedPrescriptions);

      setPrescriptions(mappedPrescriptions);

        // Calculate stats
        const calculatedStats = calculateStats(mappedPrescriptions);
        setStats(calculatedStats);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load prescriptions';
      console.error('❌ Error loading prescriptions:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
    };

    loadPrescriptions();
  }, []);

  // Handle prescription selection
  const handlePrescriptionClick = (prescription: AdminPrescription) => {
    setSelectedPrescription(prescription);
  };

  // Handle status change
  const handleStatusChange = async (prescriptionId: string, newStatus: PrescriptionStatus) => {
    try {
      // Map AdminPrescription status to API status
      const statusMap: Record<PrescriptionStatus, string> = {
        'pending': 'PENDING',
        'approved': 'APPROVED',
        'rejected': 'REJECTED',
        'dispatched': 'DISPENSED',
        'expired': 'EXPIRED',
        'paid': 'PAID',
        'verified': 'VERIFIED'
      };
      const apiStatus = statusMap[newStatus] || 'PENDING';
      
      // Update via API
      await prescriptionService.updatePrescription(Number(prescriptionId), { 
        status: apiStatus as any 
      });
        
      // Update local state
      setPrescriptions(prev =>
        prev.map(p => (p.id === prescriptionId ? { ...p, status: newStatus } : p))
      );

      // Update selected prescription if it's the one being updated
      if (selectedPrescription?.id === prescriptionId) {
        setSelectedPrescription(prev => prev ? { ...prev, status: newStatus } : null);
        }
        
      // Recalculate stats
      const updatedPrescriptions = prescriptions.map(p =>
        p.id === prescriptionId ? { ...p, status: newStatus } : p
      );
      setStats(calculateStats(updatedPrescriptions));
    } catch (err) {
      console.error('❌ Error updating prescription status:', err);
      alert('Failed to update prescription status. Please try again.');
    }
  };

  // Map medications to mainAttributes format for API
  const mapMedicationsToMainAttributes = (medications: Medication[]) => {
    return medications.map((med, index) => ({
      name: `Medication ${index + 1}`,
      scale: 'list',
      value: med.name || '',
      subAttributes: [
        { name: 'Dosage', value: med.dosage || '' },
        { name: 'Frequency', value: med.frequency || '' },
        { name: 'Duration', value: med.duration || '' },
        { name: 'Quantity', value: med.quantity || '' },
        { name: 'Instructions', value: med.instructions || '' }
      ].filter(sa => sa.value) // Only include non-empty subAttributes
    }));
  };

  // Handle medications change
  const handleMedicationsChange = async (prescriptionId: string, medications: Medication[]) => {
    try {
      // Map medications to mainAttributes format
      const mainAttributes = mapMedicationsToMainAttributes(medications);
      
      // Update via API
      await prescriptionService.updatePrescription(Number(prescriptionId), { 
        mainAttributes 
      });

      // Update local state
      setPrescriptions(prev =>
        prev.map(p => (p.id === prescriptionId ? { ...p, medications } : p))
      );

      // Update selected prescription if it's the one being updated
      if (selectedPrescription?.id === prescriptionId) {
        setSelectedPrescription(prev => prev ? { ...prev, medications } : null);
      }
    } catch (err) {
      console.error('❌ Error updating medications:', err);
      alert('Failed to update medications. Please try again.');
    }
  };

  // Handle amount change
  const handleAmountChange = async (prescriptionId: string, amount: number) => {
    try {
      // Update via API
      await prescriptionService.updatePrescription(Number(prescriptionId), { 
        amount 
      });

      // Update local state
      setPrescriptions(prev =>
        prev.map(p => (p.id === prescriptionId ? { ...p, amount } : p))
      );

      // Update selected prescription if it's the one being updated
      if (selectedPrescription?.id === prescriptionId) {
        setSelectedPrescription(prev => prev ? { ...prev, amount } : null);
      }
    } catch (err) {
      console.error('❌ Error updating amount:', err);
      alert('Failed to update amount. Please try again.');
    }
  };

  // Close detail modal
  const handleCloseDetails = () => {
    setSelectedPrescription(null);
  };

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
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Prescription Management</h1>
          <p className="page-description">Manage customer prescriptions from upload to dispatch</p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-section">
        <div className="stat-item">
          <span className="stat-number">{stats.total}</span>
          <div className="stat-label">Total</div>
        </div>
        <div className="stat-item">
          <span className="stat-number">{stats.pending}</span>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-item">
          <span className="stat-number">{stats.approved}</span>
          <div className="stat-label">Approved</div>
        </div>
        <div className="stat-item">
          <span className="stat-number">{stats.paid}</span>
          <div className="stat-label">Paid</div>
        </div>
        <div className="stat-item">
          <span className="stat-number">{stats.verified}</span>
          <div className="stat-label">Verified</div>
        </div>
        <div className="stat-item">
          <span className="stat-number">{stats.dispatched}</span>
          <div className="stat-label">Dispatched</div>
        </div>
      </div>

      {/* Error State */}
        {error && (
          <div className="error-state">
            <p>{error}</p>
          <button onClick={() => window.location.reload()} className="btn-refresh">
              Try Again
            </button>
          </div>
        )}

      {/* Prescription List */}
      {!error && (
        <AdminPrescriptionList
          prescriptions={prescriptions}
          onPrescriptionClick={handlePrescriptionClick}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />
                    )}

      {/* Prescription Details Modal */}
      {selectedPrescription && (
        <AdminPrescriptionDetails
          prescription={selectedPrescription}
          onStatusChange={handleStatusChange}
          onMedicationsChange={handleMedicationsChange}
          onAmountChange={handleAmountChange}
          onClose={handleCloseDetails}
      />
      )}
    </div>
  );
};

export default Prescriptions;

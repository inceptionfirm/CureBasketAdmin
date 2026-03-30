import React, { useState, useEffect } from 'react';
import AdminPrescriptionList from './AdminPrescriptionList';
import AdminPrescriptionDetails, { AdminPrescription } from './AdminPrescriptionDetails';
import { PrescriptionStatus } from './prescriptionStatusConfig';
import { Medication } from './MedicationEditor';
import { prescriptionService, Prescription } from '../../services/prescriptionService';
import { medicineService } from '../../services/modules/medicineService';
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

  // Medicines list for search/autocomplete (loaded once, stored in state)
  const [medicinesForSearch, setMedicinesForSearch] = useState<Array<{ id: number; name: string; manufacturer?: string }>>([]);

  // Map API Prescription to AdminPrescription format
  const mapApiPrescriptionToAdmin = (apiPrescription: Prescription | any): AdminPrescription => {
    // Extract medications from mainAttributes
    const medications: Medication[] = [];
    const isMedicationAttr = (attr: any): boolean => {
      const n = (attr?.name || '').toLowerCase();
      if (n.includes('medication') || n.includes('medicine')) return true;
      if (typeof attr?.medicineId === 'number' && attr.medicineId > 0) return true;
      if (attr?.medicine && typeof attr.medicine === 'object') return true;
      const subs = attr?.subAttributes || [];
      return subs.some(
        (sa: any) =>
          String(sa?.name || '')
            .toLowerCase()
            .match(/dosage|quantity|frequency/) && (sa?.value != null && String(sa.value).trim() !== '')
      );
    };

    if (apiPrescription.mainAttributes && Array.isArray(apiPrescription.mainAttributes)) {
      apiPrescription.mainAttributes.forEach((attr: any, index: number) => {
        if (!isMedicationAttr(attr)) return;
        const subAttrs = attr.subAttributes || [];
        const medicineName =
          attr.value ||
          attr.medicine?.name ||
          attr.name ||
          `Medicine ${index + 1}`;
        const dosage = subAttrs.find((sa: any) => sa.name?.toLowerCase().includes('dosage'))?.value || '';
        const frequency = subAttrs.find((sa: any) => sa.name?.toLowerCase().includes('frequency'))?.value || '';
        const duration = subAttrs.find((sa: any) => sa.name?.toLowerCase().includes('duration'))?.value || '';
        const quantity = subAttrs.find((sa: any) => sa.name?.toLowerCase().includes('quantity'))?.value || '';
        const instructions = subAttrs.find((sa: any) => sa.name?.toLowerCase().includes('instruction'))?.value || '';
        const medicineId =
          typeof attr.medicineId === 'number'
            ? attr.medicineId
            : typeof attr.medicine?.id === 'number'
              ? attr.medicine.id
              : undefined;

        medications.push({
          id: String(attr.id || attr.serialId || `med-${index}`),
          name: medicineName,
          medicineId,
          dosage,
          frequency,
          duration,
          quantity,
          instructions,
        } as Medication);
      });
    }

    const apiMedicinesFlat = apiPrescription.medicines || apiPrescription.mappedMedicines || apiPrescription.mappedmedicines;
    if (Array.isArray(apiMedicinesFlat) && medications.length === 0) {
      apiMedicinesFlat.forEach((m: any, index: number) => {
        medications.push({
          id: String(m.id ?? m.serialId ?? `med-${index}`),
          name: m.name || m.medicineName || 'Medicine',
          medicineId: typeof m.medicineId === 'number' ? m.medicineId : m.medicine?.id,
          dosage: m.dosage ?? '',
          frequency: m.frequency ?? '',
          duration: m.duration ?? '',
          quantity: m.quantity != null ? String(m.quantity) : '',
          instructions: m.instructions ?? '',
        } as Medication);
      });
    }
    
    // Extract uploaded files from files array
    const uploadedFiles: { type: 'pdf' | 'image'; url: string }[] = [];
    if (apiPrescription.files && Array.isArray(apiPrescription.files)) {
      apiPrescription.files.forEach((file: any) => {
        if (file.docPath) {
          const docPath = file.docPath;
          const imageBaseURL = 'https://api.curebasket.com';
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
    const statusMap: Record<string, string> = {
      PENDING: 'pending',
      APPROVED: 'approved',
      REJECTED: 'pending',
      DISPENSED: 'dispatched',
      EXPIRED: 'expired',
      PAID: 'paid',
      VERIFIED: 'verified',
    };
    const apiStatus = (apiPrescription.status || 'PENDING').toUpperCase();
    const mappedStatus = (statusMap[apiStatus] || 'pending') as PrescriptionStatus;

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
      amount:
        apiPrescription.amount != null && Number(apiPrescription.amount) > 0
          ? Number(apiPrescription.amount)
          : apiPrescription.totalAmount != null && Number(apiPrescription.totalAmount) > 0
            ? Number(apiPrescription.totalAmount)
            : undefined,
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

  // Load medicines for autocomplete (stored in state for search)
  useEffect(() => {
    const loadMedicines = async () => {
      try {
        const res = await medicineService.getAllMedicinesAllPages({ pageSize: 20 });
        const list = (res.medicines || []).map((m: any) => ({
          id: m.id ?? m.ID ?? m.medicineId ?? 0,
          name: m.name || '',
          manufacturer: m.manufacturer || undefined,
        })).filter((m) => m.id && m.name);
        setMedicinesForSearch(list);
      } catch {
        setMedicinesForSearch([]);
      }
    };
    loadMedicines();
  }, []);

  // Handle prescription selection
  const handlePrescriptionClick = (prescription: AdminPrescription) => {
    setSelectedPrescription(prescription);
  };

  // Handle status change
  const handleStatusChange = async (prescriptionId: string, newStatus: PrescriptionStatus) => {
    try {
      // Map AdminPrescription status to API status
      const statusMap: Partial<Record<PrescriptionStatus, string>> = {
        pending: 'PENDING',
        approved: 'APPROVED',
        dispatched: 'DISPENSED',
        paid: 'PAID',
        verified: 'VERIFIED',
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

  const buildMapMedicinePayload = (medications: Medication[]) => {
    const uuidLike = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return medications
      .filter((med): med is Medication & { medicineId: number } =>
        typeof med.medicineId === 'number' && med.medicineId > 0
      )
      .map((med) => ({
        ...(med.id && uuidLike.test(String(med.id)) && { serialId: med.id }),
        medicineId: med.medicineId!,
        dosage: med.dosage ?? '',
        frequency: med.frequency ?? '',
        quantity: String(med.quantity ?? '')
      }));
  };

  const [savingMedications, setSavingMedications] = useState(false);
  const [saveMedicinesError, setSaveMedicinesError] = useState<string | null>(null);

  const handleSaveMedications = async (prescriptionId: string) => {
    const meds = selectedPrescription?.id === prescriptionId ? selectedPrescription.medications : prescriptions.find((p) => p.id === prescriptionId)?.medications;
    if (!meds?.length) {
      setSaveMedicinesError('Add at least one medication first.');
      return;
    }
    const mapPayload = buildMapMedicinePayload(meds);
    if (mapPayload.length === 0) {
      setSaveMedicinesError('Select a medicine from the list for each row to save.');
      return;
    }
    setSavingMedications(true);
    setSaveMedicinesError(null);
    try {
      const prescriptionIdNum = Number(prescriptionId);
      // Single save request: map-medicine only (do not call update-prescription with mainAttributes).
      const result = await prescriptionService.mapMedicineInPrescription(prescriptionIdNum, mapPayload);
      // Use prescription from response if present, otherwise fetch once for amount.
      let updated: Prescription | undefined = result?.data as Prescription | undefined;
      const hasPrescription = updated && typeof updated === 'object' && 'id' in updated;
      if (!hasPrescription) {
        updated = await prescriptionService.getPrescriptionById(prescriptionIdNum);
      }
      const mapped = mapApiPrescriptionToAdmin(updated);
      // If API shape doesn't populate medications, keep rows we just saved (otherwise Approve stays disabled).
      let medications = mapped.medications;
      if (medications.length === 0 && meds.length > 0) {
        medications = meds.filter((m) => m.medicineId != null && m.medicineId > 0);
      }
      const merged = { ...mapped, medications };
      setPrescriptions(prev => prev.map(p => (p.id === prescriptionId ? merged : p)));
      if (selectedPrescription?.id === prescriptionId) {
        setSelectedPrescription(merged);
      }
    } catch (err) {
      let msg = err instanceof Error ? err.message : String(err);
      if (typeof msg !== 'string' || msg.includes('[object Object]')) {
        msg = (err as any)?.message ?? (err as any)?.error ?? 'Some error occurred.';
        if (Array.isArray(msg)) {
          msg = msg.map((e: any) => (e?.message ?? e)).join('; ');
        } else if (typeof msg !== 'string') {
          msg = 'Some error occurred.';
        }
      }
      if (typeof msg === 'string' && (msg.includes('.java') || msg.includes(' at ') || msg.includes('lineNumber') || msg.length > 150)) {
        msg = 'Some error occurred.';
      }
      setSaveMedicinesError(msg.trim() || 'Some error occurred.');
      console.error('❌ Save medications error:', err);
    } finally {
      setSavingMedications(false);
    }
  };

  // Handle medications change: only update local state. No API call when adding/editing medicines in prescription details.
  const handleMedicationsChange = (prescriptionId: string, medications: Medication[]) => {
    const current = prescriptions.find((p) => p.id === prescriptionId);
    const sameAsCurrent =
      current &&
      current.medications.length === medications.length &&
      JSON.stringify(current.medications) === JSON.stringify(medications);
    if (sameAsCurrent) return;

    setPrescriptions(prev =>
      prev.map(p => (p.id === prescriptionId ? { ...p, medications } : p))
    );
    if (selectedPrescription?.id === prescriptionId) {
      setSelectedPrescription(prev => (prev ? { ...prev, medications } : null));
    }
  };

  // Handle amount change (only call API when amount actually changed, not on view details).
  // After saving amount, approve prescription so backend can send approve email to customer.
  const handleAmountChange = async (prescriptionId: string, amount: number) => {
    const current = prescriptions.find((p) => p.id === prescriptionId);
    if (current && current.amount === amount) {
      return;
    }

    try {
      await prescriptionService.updatePrescription(Number(prescriptionId), { amount });

      setPrescriptions(prev =>
        prev.map(p => (p.id === prescriptionId ? { ...p, amount } : p))
      );

      if (selectedPrescription?.id === prescriptionId) {
        setSelectedPrescription(prev => prev ? { ...prev, amount } : null);
      }

      // Approve prescription after saving amount so backend sends approve email to customer
      if (current?.status === 'pending') {
        await handleStatusChange(prescriptionId, 'approved');
      }
    } catch (err) {
      console.error('❌ Error updating amount:', err);
      alert('Failed to update amount. Please try again.');
    }
  };

  const handleCloseDetails = () => {
    setSaveMedicinesError(null);
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
          onSaveMedications={handleSaveMedications}
          savingMedications={savingMedications}
          saveMedicinesError={saveMedicinesError}
          onAmountChange={handleAmountChange}
          onClose={handleCloseDetails}
          medicineOptions={medicinesForSearch}
        />
      )}
    </div>
  );
};

export default Prescriptions;

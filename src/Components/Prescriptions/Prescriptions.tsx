import React, { useState, useEffect, useCallback } from 'react';
import { useLocale } from '../../contexts/LocaleContext';
import { prescriptionService, Prescription as ApiPrescription, PrescriptionStats } from '../../services/prescriptionService';
import AddPrescriptionModal from './AddPrescriptionModal';
import './Prescriptions.css';
import '../../styles/global-buttons.css';

// Local Prescription type for UI display (different from API Prescription type)
interface Prescription {
  id: string;
  prescriptionNumber: string;
  patientId: string;
  patient: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    dateOfBirth?: string;
    address?: string;
  };
  doctorId: string;
  doctor: {
    id: string;
    name: string;
    licenseNumber?: string;
    specialization?: string;
    phone?: string;
  };
  medications: Array<{
    id: string;
    medicineId: string;
    medicine: {
      id: string;
      name: string;
      manufacturer?: string;
      form?: string;
    };
    dosage?: string;
    frequency?: string;
    duration?: string;
    quantity?: number;
    instructions?: string;
    refillsAllowed?: number;
    refillsUsed?: number;
  }>;
  diagnosis: string;
  symptoms: string[];
  notes: string;
  status: 'pending' | 'approved' | 'rejected' | 'dispensed' | 'expired';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  prescribedDate: string;
  expiryDate: string;
  dispensedDate?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
  mainAttributes?: Array<{
    id?: number;
    name: string;
    scale?: string | null;
    value?: string;
    subAttributes?: Array<{
      id?: number;
      name: string;
      value: string;
    }>;
  }>;
  patientName?: string;
  doctorName?: string;
  note?: string;
}

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

  // Helper function to map API prescription to UI format
  const mapApiPrescriptionToUI = (apiPrescription: ApiPrescription | any): Prescription & { mainAttributes?: ApiPrescription['mainAttributes'] } => {
    // Map status from API (PENDING, APPROVED, etc.) to UI format (pending, approved, etc.)
    const statusMap: Record<string, 'pending' | 'approved' | 'rejected' | 'dispensed' | 'expired'> = {
      'PENDING': 'pending',
      'APPROVED': 'approved',
      'REJECTED': 'rejected',
      'DISPENSED': 'dispensed',
      'EXPIRED': 'expired'
    };
    const status = statusMap[apiPrescription.status] || 'pending';
    
    // Map priority from API (HIGH, MEDIUM, LOW) to UI format (high, medium, low)
    const priorityMap: Record<string, 'low' | 'medium' | 'high' | 'urgent'> = {
      'LOW': 'low',
      'MEDIUM': 'medium',
      'HIGH': 'high'
    };
    const priority = priorityMap[apiPrescription.priority] || 'medium';
    
    // Extract medications from mainAttributes
    let medications: Prescription['medications'] = [];
    if (apiPrescription.mainAttributes && Array.isArray(apiPrescription.mainAttributes)) {
      const medicinesAttr = apiPrescription.mainAttributes.find((attr: any) => 
        attr.name && (attr.name.toLowerCase().includes('medicine') || attr.name.toLowerCase().includes('medication'))
      );
      if (medicinesAttr && medicinesAttr.subAttributes && Array.isArray(medicinesAttr.subAttributes)) {
        medications = medicinesAttr.subAttributes.map((subAttr: any, index: number) => {
          // Parse value like "500mg - Twice daily" or just use name and value
          const valueParts = subAttr.value ? subAttr.value.split(' - ') : [];
          return {
            id: String(subAttr.id || index),
            medicineId: String(subAttr.id || index),
            medicine: {
              id: String(subAttr.id || index),
              name: subAttr.name || 'Unknown Medicine',
              manufacturer: '',
              form: ''
            },
            dosage: valueParts[0] || '',
            frequency: valueParts[1] || '',
            duration: '',
            quantity: 0,
            instructions: '',
            refillsAllowed: 0,
            refillsUsed: 0
          };
        });
      }
    }
    
    // Extract symptoms from mainAttributes
    const symptoms = apiPrescription.mainAttributes && Array.isArray(apiPrescription.mainAttributes)
      ? extractSymptomsFromMainAttributes(apiPrescription.mainAttributes)
      : [];
    
    // Calculate expiry date (30 days from prescription date by default)
    const prescriptionDate = apiPrescription.prescriptionDate ? new Date(apiPrescription.prescriptionDate) : new Date();
    const expiryDate = new Date(prescriptionDate);
    expiryDate.setDate(expiryDate.getDate() + 30); // Default 30 days
    
    return {
      id: String(apiPrescription.id || ''),
      prescriptionNumber: apiPrescription.prescriptionNumber || '',
      patientId: apiPrescription.patientId || '',
      mainAttributes: apiPrescription.mainAttributes || [],
      patient: {
        id: apiPrescription.patientId || '',
        name: apiPrescription.patientName || 'Unknown Patient'
      },
      doctorId: apiPrescription.doctorId || '',
      doctor: {
        id: apiPrescription.doctorId || '',
        name: apiPrescription.doctorName || 'Unknown Doctor'
      },
      medications: medications,
      diagnosis: apiPrescription.diagnosis || '',
      symptoms: symptoms, // Extracted from mainAttributes
      notes: apiPrescription.note || '',
      status: status,
      priority: priority,
      prescribedDate: apiPrescription.prescriptionDate || prescriptionDate.toISOString(),
      expiryDate: expiryDate.toISOString(),
      dispensedDate: status === 'dispensed' ? apiPrescription.updatedAt : undefined,
      createdAt: apiPrescription.createdAt || new Date().toISOString(),
      updatedAt: apiPrescription.updatedAt || apiPrescription.createdAt || new Date().toISOString()
    } as Prescription & { mainAttributes?: ApiPrescription['mainAttributes'] };
  };

  const loadPrescriptions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('💊 Loading prescriptions from API...');
      
      // Build query parameters
      // Note: Backend only allows these sortBy values: ID, ItemType, PrescriptionNumber, PatientName, PatientId, DoctorName, DoctorId, Note, Diagnosis, Status, Priority
      const params: any = {
        itemType: 'PRESCRIPTION',
        page: 0,
        pageSize: 100,
        sortBy: 'ID', // Changed from 'prescriptionDate' - backend doesn't support it
        sortOrder: 'DESC'
      };
      
      // Add filters if provided
      if (statusFilter) {
        const statusMap: Record<string, string> = {
          'pending': 'PENDING',
          'approved': 'APPROVED',
          'rejected': 'REJECTED',
          'dispensed': 'DISPENSED',
          'expired': 'EXPIRED'
        };
        params.status = statusMap[statusFilter] || statusFilter.toUpperCase();
      }
      if (priorityFilter) {
        const priorityMap: Record<string, string> = {
          'low': 'LOW',
          'medium': 'MEDIUM',
          'high': 'HIGH'
        };
        params.priority = priorityMap[priorityFilter] || priorityFilter.toUpperCase();
      }
      
      // Call the API
      const response = await prescriptionService.getAllPrescriptions(params);
      console.log('💊 Prescriptions API response:', response);
      
      // Map API response to UI format
      const mappedPrescriptions: Prescription[] = (response.prescriptions || []).map(mapApiPrescriptionToUI);
      
      console.log('💊 Mapped prescriptions:', mappedPrescriptions);
      setPrescriptions(mappedPrescriptions);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load prescriptions';
      console.error('❌ Error loading prescriptions:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, priorityFilter]);

  const loadStats = useCallback(async () => {
    try {
      // Fetch all prescriptions to calculate stats dynamically
      const response = await prescriptionService.getAllPrescriptions({
        itemType: 'PRESCRIPTION',
        page: 0,
        pageSize: 1000, // Fetch large batch to calculate accurate stats
        sortBy: 'ID',
        sortOrder: 'DESC'
      });

      const prescriptionsList = response.prescriptions || [];
      const totalPrescriptions = response.pagination?.total || prescriptionsList.length;

      // Calculate status counts
      let pendingPrescriptions = 0;
      let approvedPrescriptions = 0;
      let dispensedPrescriptions = 0;
      let expiredPrescriptions = 0;
      let urgentPrescriptions = 0;
      let totalMedications = 0;

      prescriptionsList.forEach((prescription: any) => {
        const status = prescription.status?.toUpperCase() || 'PENDING';
        if (status === 'PENDING') pendingPrescriptions++;
        else if (status === 'APPROVED') approvedPrescriptions++;
        else if (status === 'DISPENSED') dispensedPrescriptions++;
        else if (status === 'EXPIRED') expiredPrescriptions++;

        const priority = prescription.priority?.toUpperCase() || 'MEDIUM';
        if (priority === 'HIGH' || priority === 'URGENT') urgentPrescriptions++;

        // Count medications from mainAttributes
        // Medications are stored as mainAttributes with names like "Medication 1", "Medication 2", etc.
        if (prescription.mainAttributes && Array.isArray(prescription.mainAttributes)) {
          prescription.mainAttributes.forEach((attr: any) => {
            if (attr.name && (attr.name.toLowerCase().includes('medicine') || attr.name.toLowerCase().includes('medication'))) {
              // Count each medication mainAttribute as 1 medication
              totalMedications += 1;
            }
          });
        }
      });

      const calculatedStats: PrescriptionStats = {
        totalPrescriptions,
        pendingPrescriptions,
        approvedPrescriptions,
        dispensedPrescriptions,
        expiredPrescriptions,
        urgentPrescriptions,
        totalMedications,
        averageProcessingTime: 0 // Can be calculated if needed
      };

      console.log('📊 Prescription Stats Calculated:', calculatedStats);
      setStats(calculatedStats);
    } catch (err) {
      console.error('Failed to load prescription stats:', err);
      // Set default values on error
      setStats({
        totalPrescriptions: 0,
        pendingPrescriptions: 0,
        approvedPrescriptions: 0,
        dispensedPrescriptions: 0,
        expiredPrescriptions: 0,
        urgentPrescriptions: 0,
        totalMedications: 0,
        averageProcessingTime: 0
      });
    }
  }, []);

  useEffect(() => {
    loadPrescriptions();
    loadStats();
  }, [loadPrescriptions, loadStats]);

  // Helper function to map symptoms to mainAttributes structure
  const mapSymptomsToMainAttributes = (symptoms: string[]): any[] => {
    if (!symptoms || symptoms.length === 0) {
      return [];
    }
    
    // Store symptoms as a single mainAttribute with subAttributes for each symptom
    return [{
      name: 'Symptoms',
      value: symptoms.join(', '), // Combined value
      scale: null,
      subAttributes: symptoms.map((symptom, index) => ({
        name: `Symptom ${index + 1}`,
        value: symptom
      }))
    }];
  };

  // Helper function to extract symptoms from mainAttributes
  const extractSymptomsFromMainAttributes = (mainAttributes: any[]): string[] => {
    if (!mainAttributes || !Array.isArray(mainAttributes)) {
      return [];
    }
    
    const symptomsAttr = mainAttributes.find((attr: any) => 
      attr.name && attr.name.toLowerCase().includes('symptom')
    );
    
    if (symptomsAttr && symptomsAttr.subAttributes && Array.isArray(symptomsAttr.subAttributes)) {
      return symptomsAttr.subAttributes.map((subAttr: any) => subAttr.value || '').filter(Boolean);
    }
    
    // Fallback: try to extract from value if it's a comma-separated string
    if (symptomsAttr && symptomsAttr.value) {
      return symptomsAttr.value.split(',').map((s: string) => s.trim()).filter(Boolean);
    }
    
    return [];
  };

  // Helper function to map form medications to mainAttributes structure
  // Matches curl structure: { name: "Medication 1", value: "paracetamol", scale: null, subAttributes: [...] }
  const mapMedicationsToMainAttributes = (medications: any[]): any[] => {
    if (!medications || medications.length === 0) {
      return [];
    }
    
    return medications.map((med, index) => {
      const subAttributes: any[] = [];
      
      // Add Frequency if present
      if (med.frequency && med.frequency.trim()) {
        subAttributes.push({
          name: 'Frequency',
          value: med.frequency.trim()
        });
      }
      
      // Add Duration if present
      if (med.duration && med.duration.trim()) {
        subAttributes.push({
          name: 'Duration',
          value: med.duration.trim()
        });
      }
      
      // Add Dosage if present
      if (med.dosage && med.dosage.trim()) {
        subAttributes.push({
          name: 'Dosage',
          value: med.dosage.trim()
        });
      }
      
      // Add Refills Allowed if present
      if (med.refillsAllowed !== undefined && med.refillsAllowed !== null) {
        // Format refills: if it's a number, convert to string; if it's a string, use as is
        let refillsValue = String(med.refillsAllowed);
        if (med.refillsAllowed === 0) {
          refillsValue = 'No: only monthly'; // Default format from curl example
        }
        subAttributes.push({
          name: 'Refills Allowed',
          value: refillsValue
        });
      }
      
      // Add Quantity if present
      if (med.quantity !== undefined && med.quantity !== null) {
        subAttributes.push({
          name: 'Quantity',
          value: String(med.quantity)
        });
      }
      
      // Get medicine name: use med.name, med.medicine?.name, or med.medicineId as fallback
      const medicineName = med.name || med.medicine?.name || med.medicineId || `Medicine ${index + 1}`;
      
      return {
        name: `Medication ${index + 1}`, // Label like "Medication 1", "Medication 2"
        value: medicineName, // Actual medicine name (paracetamol, crosin, etc.)
        scale: null,
        subAttributes: subAttributes.length > 0 ? subAttributes : []
      };
    });
  };

  const handleAddPrescription = async (prescriptionData: any) => {
    try {
      setError(null);
      
      // Map form data to API format
      const statusMap: Record<string, 'PENDING' | 'APPROVED' | 'REJECTED' | 'DISPENSED' | 'EXPIRED'> = {
        'pending': 'PENDING',
        'approved': 'APPROVED',
        'rejected': 'REJECTED',
        'dispensed': 'DISPENSED',
        'expired': 'EXPIRED'
      };
      
      const priorityMap: Record<string, 'HIGH' | 'MEDIUM' | 'LOW'> = {
        'low': 'LOW',
        'medium': 'MEDIUM',
        'high': 'HIGH'
      };
      
      // Use mainAttributes directly from form data (dynamic approach)
      const mainAttributes = prescriptionData.mainAttributes && prescriptionData.mainAttributes.length > 0
        ? prescriptionData.mainAttributes
        : undefined;
      
      if (editingPrescription) {
        console.log('💊 Updating prescription, form data:', prescriptionData);
        // For update: build payload with only fields that are being updated
        // API accepts single field or all fields at once
        const updatePayload: any = {};
        
        // Prescription number
        if (prescriptionData.prescriptionNumber !== undefined && prescriptionData.prescriptionNumber !== null && prescriptionData.prescriptionNumber !== '') {
          updatePayload.prescriptionNumber = prescriptionData.prescriptionNumber;
        }
        
        // Patient name - only if explicitly provided in form
        if (prescriptionData.patientName !== undefined && prescriptionData.patientName !== null && prescriptionData.patientName !== '') {
          updatePayload.patientName = prescriptionData.patientName;
        }
        
        // Patient ID - can be empty string, only if provided
        if (prescriptionData.patientId !== undefined && prescriptionData.patientId !== null) {
          updatePayload.patientId = prescriptionData.patientId || '';
        }
        
        // Doctor name - only if explicitly provided in form
        if (prescriptionData.doctorName !== undefined && prescriptionData.doctorName !== null && prescriptionData.doctorName !== '') {
          updatePayload.doctorName = prescriptionData.doctorName;
        }
        
        // Doctor ID - can be empty string, only if provided
        if (prescriptionData.doctorId !== undefined && prescriptionData.doctorId !== null) {
          updatePayload.doctorId = prescriptionData.doctorId || '';
        }
        
        // Note - can be empty string
        if ('note' in prescriptionData || 'notes' in prescriptionData) {
          updatePayload.note = prescriptionData.notes || prescriptionData.note || '';
        }
        
        // Diagnosis - can be empty string
        if ('diagnosis' in prescriptionData) {
          updatePayload.diagnosis = prescriptionData.diagnosis || '';
        }
        
        // Status
        if (prescriptionData.status !== undefined && prescriptionData.status !== null && prescriptionData.status !== '') {
          updatePayload.status = statusMap[prescriptionData.status.toLowerCase()] || 'PENDING';
        }
        
        // Priority
        if (prescriptionData.priority !== undefined && prescriptionData.priority !== null && prescriptionData.priority !== '') {
          updatePayload.priority = priorityMap[prescriptionData.priority.toLowerCase()] || 'MEDIUM';
        }
        
        // PrescriptionDate - if provided, send in ISO 8601 format
        if (prescriptionData.prescribedDate && prescriptionData.prescribedDate.trim()) {
          // Handle date input format (YYYY-MM-DD) by appending time to ensure correct parsing
          const dateStr = prescriptionData.prescribedDate.includes('T') 
            ? prescriptionData.prescribedDate 
            : `${prescriptionData.prescribedDate}T00:00:00`;
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            updatePayload.prescriptionDate = date.toISOString();
          } else {
            console.warn('Invalid prescribedDate format:', prescriptionData.prescribedDate);
          }
        }
        
        // ExpiryDate - if provided, send in ISO 8601 format
        // Note: Backend may or may not accept this field - adding it if provided in form
        if (prescriptionData.expiryDate && prescriptionData.expiryDate.trim()) {
          // Handle date input format (YYYY-MM-DD) by appending time to ensure correct parsing
          const dateStr = prescriptionData.expiryDate.includes('T') 
            ? prescriptionData.expiryDate 
            : `${prescriptionData.expiryDate}T00:00:00`;
          const expiryDate = new Date(dateStr);
          if (!isNaN(expiryDate.getTime())) {
            updatePayload.expiryDate = expiryDate.toISOString();
          } else {
            console.warn('Invalid expiryDate format:', prescriptionData.expiryDate);
          }
        }
        
        // MainAttributes - always send if they exist (even if empty array, to update the list)
        // This ensures medications are properly updated
        if (mainAttributes !== undefined) {
          updatePayload.mainAttributes = mainAttributes;
          console.log('💊 Update Prescription - mainAttributes being sent:', JSON.stringify(mainAttributes, null, 2));
        }
        
        if (Object.keys(updatePayload).length === 0) {
          throw new Error('No fields to update');
        }
        
        console.log('💊 Prescription Update Payload:', JSON.stringify(updatePayload, null, 2));
        await prescriptionService.updatePrescription(Number(editingPrescription.id), updatePayload);
      } else {
        // For create: send all required fields matching curl structure exactly
        const createPayload: any = {
          prescriptionNumber: prescriptionData.prescriptionNumber,
          itemType: 'PRESCRIPTION',
          patientName: prescriptionData.patientName || 
                       (prescriptionData.patient?.name) || 
                       'Patient',
          patientId: prescriptionData.patientId || '',
          doctorName: prescriptionData.doctorName || 
                      (prescriptionData.doctor?.name) || 
                      'Doctor',
          doctorId: prescriptionData.doctorId || '',
          note: prescriptionData.notes || prescriptionData.note || '',
          diagnosis: prescriptionData.diagnosis || '',
          status: (statusMap[prescriptionData.status?.toLowerCase()] || 'PENDING') as 'PENDING' | 'APPROVED' | 'REJECTED' | 'DISPENSED' | 'EXPIRED',
          priority: (priorityMap[prescriptionData.priority?.toLowerCase()] || 'MEDIUM') as 'HIGH' | 'MEDIUM' | 'LOW'
        };
        
        // Add prescriptionDate if provided (ISO 8601 format)
        if (prescriptionData.prescribedDate && prescriptionData.prescribedDate.trim()) {
          // Handle date input format (YYYY-MM-DD) by appending time to ensure correct parsing
          const dateStr = prescriptionData.prescribedDate.includes('T') 
            ? prescriptionData.prescribedDate 
            : `${prescriptionData.prescribedDate}T00:00:00`;
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            createPayload.prescriptionDate = date.toISOString();
          } else {
            console.warn('Invalid prescribedDate format:', prescriptionData.prescribedDate);
          }
        }
        
        // Add expiryDate if provided (ISO 8601 format)
        // Note: Backend may or may not accept this field - adding it if provided in form
        if (prescriptionData.expiryDate && prescriptionData.expiryDate.trim()) {
          // Handle date input format (YYYY-MM-DD) by appending time to ensure correct parsing
          const dateStr = prescriptionData.expiryDate.includes('T') 
            ? prescriptionData.expiryDate 
            : `${prescriptionData.expiryDate}T00:00:00`;
          const expiryDate = new Date(dateStr);
          if (!isNaN(expiryDate.getTime())) {
            createPayload.expiryDate = expiryDate.toISOString();
          } else {
            console.warn('Invalid expiryDate format:', prescriptionData.expiryDate);
          }
        }
        
        // Add mainAttributes if they exist
        if (mainAttributes && mainAttributes.length > 0) {
          createPayload.mainAttributes = mainAttributes;
          console.log('💊 Create Prescription - mainAttributes being sent:', JSON.stringify(mainAttributes, null, 2));
        } else {
          console.log('💊 Create Prescription - No mainAttributes');
        }
        
        console.log('💊 Create Prescription - Full Payload:', JSON.stringify(createPayload, null, 2));
        await prescriptionService.createPrescription(createPayload);
      }
      
      await loadPrescriptions();
      await loadStats();
      setIsAddPrescriptionModalOpen(false);
      setEditingPrescription(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save prescription';
      console.error('❌ Error saving prescription:', err);
      setError(errorMessage);
    }
  };

  const handleEditPrescription = async (prescription: Prescription) => {
    try {
      setError(null);
      setLoading(true);
      console.log('💊 Fetching full prescription details for edit, ID:', prescription.id);
      
      // Fetch full prescription details from API using getById
      const fullPrescriptionDetails = await prescriptionService.getPrescriptionById(Number(prescription.id));
      console.log('💊 Full prescription details fetched:', fullPrescriptionDetails);
      
      // Map API prescription to UI format
      const mappedPrescription = mapApiPrescriptionToUI(fullPrescriptionDetails);
      console.log('💊 Mapped prescription for edit:', mappedPrescription);
      
      setEditingPrescription(mappedPrescription);
      setIsAddPrescriptionModalOpen(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load prescription details';
      console.error('❌ Error fetching prescription details:', err);
      setError(errorMessage);
      // Fallback: use the prescription from the list if API call fails
    setEditingPrescription(prescription);
    setIsAddPrescriptionModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePrescription = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this prescription?')) {
      try {
        setError(null);
        await prescriptionService.deletePrescription(Number(id));
        await loadPrescriptions();
        await loadStats();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete prescription';
        console.error('❌ Error deleting prescription:', err);
        setError(errorMessage);
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
          <h1 className="page-title">Prescriptions</h1>
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
                  <table className="prescription-details-table">
                    <tbody>
                      {/* Patient - only show if exists */}
                      {(prescription.patient?.name || prescription.patientName) && (
                        <tr>
                          <td className="detail-label">Patient:</td>
                          <td className="detail-value">{prescription.patient?.name || prescription.patientName}</td>
                          {/* Doctor - only show if exists */}
                          {(prescription.doctor?.name || prescription.doctorName) && (
                            <>
                              <td className="detail-label">Doctor:</td>
                              <td className="detail-value">{prescription.doctor?.name || prescription.doctorName}</td>
                            </>
                          )}
                        </tr>
                      )}
                      
                      {/* If only Doctor exists (no Patient), show it alone */}
                      {!(prescription.patient?.name || prescription.patientName) && (prescription.doctor?.name || prescription.doctorName) && (
                        <tr>
                          <td className="detail-label">Doctor:</td>
                          <td className="detail-value" colSpan={3}>{prescription.doctor?.name || prescription.doctorName}</td>
                        </tr>
                      )}
                      
                      {/* Prescription Number - always show */}
                      <tr>
                        <td className="detail-label">Prescription #:</td>
                        <td className="detail-value">{prescription.prescriptionNumber}</td>
                        {/* Status - always show */}
                        <td className="detail-label">Status:</td>
                        <td className="detail-value" style={{ textTransform: 'capitalize' }}>{prescription.status}</td>
                      </tr>
                      
                      {/* Diagnosis - only show if exists */}
                      {prescription.diagnosis && (
                        <tr>
                          <td className="detail-label">Diagnosis:</td>
                          <td className="detail-value">{prescription.diagnosis}</td>
                          {/* Medications count */}
                          {(() => {
                            const medicationCount = prescription.mainAttributes 
                              ? prescription.mainAttributes.filter(attr => 
                                  attr.name && (attr.name.toLowerCase().startsWith('medication') || attr.name.toLowerCase().includes('medicine'))
                                ).length
                              : prescription.medications.length;
                            if (medicationCount > 0) {
                              return (
                                <>
                                  <td className="detail-label">Medications:</td>
                                  <td className="detail-value">{medicationCount} medication{medicationCount !== 1 ? 's' : ''}</td>
                                </>
                              );
                            }
                            return null;
                          })()}
                        </tr>
                      )}
                      
                      {/* Medications - show alone if no diagnosis */}
                      {!prescription.diagnosis && (() => {
                        const medicationCount = prescription.mainAttributes 
                          ? prescription.mainAttributes.filter(attr => 
                              attr.name && (attr.name.toLowerCase().startsWith('medication') || attr.name.toLowerCase().includes('medicine'))
                            ).length
                          : prescription.medications.length;
                        if (medicationCount > 0) {
                          return (
                            <tr>
                              <td className="detail-label">Medications:</td>
                              <td className="detail-value" colSpan={3}>{medicationCount} medication{medicationCount !== 1 ? 's' : ''}</td>
                            </tr>
                          );
                        }
                        return null;
                      })()}
                      
                      {/* Prescribed Date - only show if exists */}
                      {prescription.prescribedDate && (
                        <tr>
                          <td className="detail-label">Prescribed:</td>
                          <td className="detail-value">{formatDate(prescription.prescribedDate)}</td>
                          {/* Expiry Date - only show if exists */}
                          {prescription.expiryDate && (
                            <>
                              <td className="detail-label">Expires:</td>
                              <td className="detail-value">{formatDate(prescription.expiryDate)}</td>
                            </>
                          )}
                        </tr>
                      )}
                      
                      {/* Expiry Date alone if no Prescribed Date */}
                      {!prescription.prescribedDate && prescription.expiryDate && (
                        <tr>
                          <td className="detail-label">Expires:</td>
                          <td className="detail-value" colSpan={3}>{formatDate(prescription.expiryDate)}</td>
                        </tr>
                      )}
                      
                      {/* Symptoms - only show if exists */}
                      {prescription.symptoms && prescription.symptoms.length > 0 && (
                        <tr>
                          <td className="detail-label">Symptoms:</td>
                          <td className="detail-value" colSpan={3}>
                      <div className="symptoms-list">
                        {prescription.symptoms.map((symptom, index) => (
                          <span key={index} className="symptom-tag">
                            {symptom}
                          </span>
                        ))}
                      </div>
                          </td>
                        </tr>
                      )}
                      
                      {/* Notes - only show if exists */}
                      {(prescription.notes || prescription.note) && (
                        <tr>
                          <td className="detail-label">Notes:</td>
                          <td className="detail-value" colSpan={3}>{prescription.notes || prescription.note}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
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
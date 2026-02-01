import React, { useState, useEffect } from 'react';
import { PrescriptionMainAttribute } from '../../services/prescriptionService';
import './AddPrescriptionModal.css';

// Local types for UI (matching Prescriptions component)
interface PrescriptionMedication {
  id?: string;
  medicineId?: string;
  name: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  quantity?: number;
  instructions?: string;
}

interface Prescription {
  id: string;
  prescriptionNumber: string;
  patientId: string;
  doctorId: string;
  diagnosis: string;
  symptoms: string[];
  notes: string;
  status: 'pending' | 'approved' | 'rejected' | 'dispensed' | 'expired';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  prescribedDate: string;
  expiryDate: string;
  medications: PrescriptionMedication[];
}

export interface AddPrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (prescriptionData: any) => Promise<void>;
  editingPrescription?: (Prescription & { mainAttributes?: PrescriptionMainAttribute[] }) | null;
}

// User-friendly medication interface
interface Medication {
  id: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: string;
  instructions: string;
  [key: string]: any; // Allow additional dynamic fields
}

export interface PrescriptionFormData {
  prescriptionNumber: string;
  patientId: string;
  doctorId: string;
  diagnosis: string;
  notes: string;
  status: 'pending' | 'approved' | 'rejected' | 'dispensed' | 'expired';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  prescribedDate: string;
  expiryDate: string;
  medications: Medication[];
}

interface PrescriptionFormErrors {
  prescriptionNumber?: string;
  patientId?: string;
  doctorId?: string;
  diagnosis?: string;
  notes?: string;
  status?: string;
  priority?: string;
  prescribedDate?: string;
  expiryDate?: string;
  medications?: string; // Error message for medications validation
}

const AddPrescriptionModal: React.FC<AddPrescriptionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingPrescription
}) => {
  const [formData, setFormData] = useState<PrescriptionFormData>({
    prescriptionNumber: '',
    patientId: '',
    doctorId: '',
    diagnosis: '',
    notes: '',
    status: 'pending',
    priority: 'medium',
    prescribedDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    medications: []
  });

  const [errors, setErrors] = useState<PrescriptionFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper function to convert mainAttributes to user-friendly medications
  // Based on API structure: Each medication is a mainAttribute with name like "Medication 1", 
  // value = medicine name, and subAttributes contain Dosage, Frequency, Duration, Quantity, etc.
  const mainAttributesToMedications = (mainAttributes?: PrescriptionMainAttribute[]): Medication[] => {
    if (!mainAttributes || !Array.isArray(mainAttributes)) {
      return [];
    }

    console.log('💊 Converting mainAttributes to medications:', JSON.stringify(mainAttributes, null, 2));

    const medications: Medication[] = [];
    
    mainAttributes.forEach((attr, index) => {
      // Check if this attribute represents a medication (name like "Medication 1", "Medication 2", etc.)
      const isMedication = attr.name && (
        attr.name.toLowerCase().startsWith('medication') || 
        attr.name.toLowerCase().includes('medicine')
      );
      
      // Always extract if it's a medication attribute
      if (isMedication) {
        // Medicine name is in the mainAttribute.value
        const medicineName = attr.value || '';
        
        // Handle subAttributes - backend may return null instead of empty array
        const subAttrs = (attr.subAttributes && Array.isArray(attr.subAttributes)) ? attr.subAttributes : [];
        
        // Extract fields from subAttributes (case-sensitive matching as per API)
        // Use exact name matching (capitalized) as shown in API example
        const dosage = subAttrs.find(sa => sa.name === 'Dosage')?.value || '';
        const frequency = subAttrs.find(sa => sa.name === 'Frequency')?.value || '';
        const duration = subAttrs.find(sa => sa.name === 'Duration')?.value || '';
        const quantity = subAttrs.find(sa => sa.name === 'Quantity')?.value || '';
        const instructions = subAttrs.find(sa => sa.name === 'Instructions')?.value || '';
        
        // Store all other subAttributes as dynamic fields (like "Refills Allowed")
        const otherFields = Object.fromEntries(
          subAttrs
            .filter(sa => !['Dosage', 'Frequency', 'Duration', 'Quantity', 'Instructions'].includes(sa.name || ''))
            .map(sa => [sa.name || `field_${Date.now()}`, sa.value || ''])
        );
        
        const medication = {
          id: String(attr.id || Date.now() + index),
          medicineName,
          dosage,
          frequency,
          duration,
          quantity,
          instructions,
          ...otherFields
        };
        
        console.log(`💊 Extracted medication ${index + 1}:`, medication);
        
        medications.push(medication);
      }
    });

    console.log('💊 Total medications extracted:', medications.length);
    return medications;
  };

  useEffect(() => {
    if (editingPrescription) {
      console.log('💊 AddPrescriptionModal - Editing prescription:', editingPrescription);
      
      // Convert mainAttributes to medications for display
      const medications = editingPrescription.mainAttributes 
        ? mainAttributesToMedications(editingPrescription.mainAttributes)
        : [];
      
      // Handle expiry date - API doesn't return it, so calculate 30 days from prescription date
      const prescriptionDate = editingPrescription.prescribedDate 
        ? new Date(editingPrescription.prescribedDate) 
        : new Date();
      const calculatedExpiryDate = new Date(prescriptionDate);
      calculatedExpiryDate.setDate(calculatedExpiryDate.getDate() + 30); // Default 30 days
      
      setFormData({
        prescriptionNumber: editingPrescription.prescriptionNumber,
        patientId: editingPrescription.patientId,
        doctorId: editingPrescription.doctorId,
        diagnosis: editingPrescription.diagnosis,
        notes: editingPrescription.notes,
        status: editingPrescription.status,
        priority: editingPrescription.priority,
        prescribedDate: editingPrescription.prescribedDate 
          ? editingPrescription.prescribedDate.split('T')[0] 
          : new Date().toISOString().split('T')[0],
        expiryDate: editingPrescription.expiryDate 
          ? editingPrescription.expiryDate.split('T')[0]
          : calculatedExpiryDate.toISOString().split('T')[0],
        medications
      });
      
      console.log('💊 AddPrescriptionModal - Form data set with medications:', medications.length);
    } else {
      setFormData({
        prescriptionNumber: '',
        patientId: '',
        doctorId: '',
        diagnosis: '',
        notes: '',
        status: 'pending',
        priority: 'medium',
        prescribedDate: new Date().toISOString().split('T')[0],
        expiryDate: '',
        medications: []
      });
    }
    setErrors({});
  }, [editingPrescription, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name as keyof PrescriptionFormErrors]) {
      setErrors((prev: PrescriptionFormErrors) => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  // Helper function to convert medications to mainAttributes for backend
  // Matches API structure exactly: name="Medication 1", value=medicine name, subAttributes=[Dosage, Frequency, etc.]
  const medicationsToMainAttributes = (medications: Medication[]): PrescriptionMainAttribute[] => {
    const mainAttrs = medications.map((med, index) => {
      const subAttributes: any[] = [];
      
      // Add standard fields as subAttributes (exact capitalized names as per API)
      if (med.dosage && med.dosage.trim()) {
        subAttributes.push({ name: 'Dosage', value: med.dosage.trim() });
      }
      if (med.frequency && med.frequency.trim()) {
        subAttributes.push({ name: 'Frequency', value: med.frequency.trim() });
      }
      if (med.duration && med.duration.trim()) {
        subAttributes.push({ name: 'Duration', value: med.duration.trim() });
      }
      if (med.quantity && med.quantity.trim()) {
        subAttributes.push({ name: 'Quantity', value: med.quantity.trim() });
      }
      if (med.instructions && med.instructions.trim()) {
        subAttributes.push({ name: 'Instructions', value: med.instructions.trim() });
    }
      
      // Add any additional dynamic fields (like "Refills Allowed")
      Object.keys(med).forEach(key => {
        if (!['id', 'medicineName', 'dosage', 'frequency', 'duration', 'quantity', 'instructions'].includes(key)) {
          if (med[key] && String(med[key]).trim()) {
            subAttributes.push({ name: key, value: String(med[key]).trim() });
          }
        }
      });
      
      return {
        name: `Medication ${index + 1}`,
        scale: null, // API uses null, not 'list'
        value: med.medicineName || '',
        subAttributes: subAttributes.length > 0 ? subAttributes : [] // Always send array, never null
      };
    });
    
    console.log('💊 Converted medications to mainAttributes:', JSON.stringify(mainAttrs, null, 2));
    return mainAttrs;
  };

  const handleAddMedication = () => {
    const newMedication: Medication = {
      id: Date.now().toString(),
      medicineName: '',
      dosage: '',
      frequency: '',
      duration: '',
      quantity: '',
      instructions: ''
    };

    setFormData(prev => ({
      ...prev,
      medications: [...prev.medications, newMedication]
    }));
  };

  const handleMedicationChange = (index: number, field: keyof Medication, value: any) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.map((med, i) => 
        i === index ? { ...med, [field]: value } : med
      )
    }));
  };

  const handleRemoveMedication = (index: number) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: PrescriptionFormErrors = {};

    if (!formData.prescriptionNumber.trim()) {
      newErrors.prescriptionNumber = 'Prescription number is required';
    }

    if (!formData.patientId.trim()) {
      newErrors.patientId = 'Patient is required';
    }

    if (!formData.doctorId.trim()) {
      newErrors.doctorId = 'Doctor is required';
    }

    if (!formData.diagnosis.trim()) {
      newErrors.diagnosis = 'Diagnosis is required';
    }

    if (!formData.expiryDate) {
      newErrors.expiryDate = 'Expiry date is required';
    }

    // Medications validation: Only required for CREATE, not for UPDATE
    if (!editingPrescription && formData.medications.length === 0) {
      newErrors.medications = 'At least one medication is required';
    }

    // Validate each medication has a medicine name
    formData.medications.forEach((med, index) => {
      if (!med.medicineName || !med.medicineName.trim()) {
        newErrors.medications = `Medication ${index + 1} must have a medicine name`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Convert medications to mainAttributes before submitting
      const formDataWithMainAttributes = {
        ...formData,
        mainAttributes: medicationsToMainAttributes(formData.medications)
      };
      
      await onSubmit(formDataWithMainAttributes);
      onClose();
    } catch (error) {
      console.error('Error submitting prescription:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      prescriptionNumber: '',
      patientId: '',
      doctorId: '',
      diagnosis: '',
      notes: '',
      status: 'pending',
      priority: 'medium',
      prescribedDate: new Date().toISOString().split('T')[0],
      expiryDate: '',
      medications: []
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="prescription-modal-overlay" onClick={handleClose}>
      <div className="prescription-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="prescription-modal-header">
          <div className="header-content">
            <span className="header-icon">💊</span>
            <h2 className="prescription-modal-title">
              {editingPrescription ? 'Edit Prescription' : 'Add New Prescription'}
            </h2>
          </div>
          <button
            className="prescription-modal-close-btn"
            onClick={handleClose}
            type="button"
          >
            ✕
          </button>
        </div>

        <form className="prescription-modal-form" onSubmit={handleSubmit}>
          <div className="prescription-form-content">
            <div className="prescription-form-section">
              <h3 className="section-title">
                <span className="section-icon">📋</span>
                Prescription Details
              </h3>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Prescription Number *</label>
                  <input
                    type="text"
                    name="prescriptionNumber"
                    value={formData.prescriptionNumber}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter prescription number"
                  />
                  {errors.prescriptionNumber && (
                    <span className="error-message">{errors.prescriptionNumber}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Priority *</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Patient ID *</label>
                  <input
                    type="text"
                    name="patientId"
                    value={formData.patientId}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter patient ID"
                  />
                  {errors.patientId && (
                    <span className="error-message">{errors.patientId}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Doctor ID *</label>
                  <input
                    type="text"
                    name="doctorId"
                    value={formData.doctorId}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter doctor ID"
                  />
                  {errors.doctorId && (
                    <span className="error-message">{errors.doctorId}</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Diagnosis *</label>
                <textarea
                  name="diagnosis"
                  value={formData.diagnosis}
                  onChange={handleInputChange}
                  className="form-textarea"
                  rows={3}
                  placeholder="Enter diagnosis"
                />
                {errors.diagnosis && (
                  <span className="error-message">{errors.diagnosis}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="form-textarea"
                  rows={3}
                  placeholder="Enter additional notes"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Prescribed Date *</label>
                  <input
                    type="date"
                    name="prescribedDate"
                    value={formData.prescribedDate}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Expiry Date *</label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                  {errors.expiryDate && (
                    <span className="error-message">{errors.expiryDate}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="prescription-form-section">
              <h3 className="section-title">
                <span className="section-icon">💊</span>
                Medications
              </h3>

              <div className="medications-header">
                <button
                  type="button"
                  onClick={handleAddMedication}
                  className="add-medication-btn"
                >
                  <span className="button-icon">+</span>
                  Add Medication
                </button>
              </div>

              {formData.medications.map((medication, index) => (
                <div key={medication.id} className="medication-item">
                  <div className="medication-header">
                    <h4>Medication {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => handleRemoveMedication(index)}
                      className="remove-medication-btn"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Medicine Name *</label>
                      <input
                        type="text"
                        value={medication.medicineName}
                        onChange={(e) => handleMedicationChange(index, 'medicineName', e.target.value)}
                        className="form-input"
                        placeholder="e.g., Paracetamol"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Dosage</label>
                      <input
                        type="text"
                        value={medication.dosage}
                        onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                        className="form-input"
                        placeholder="e.g., 500mg"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Frequency</label>
                      <input
                        type="text"
                        value={medication.frequency}
                        onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                        className="form-input"
                        placeholder="e.g., Twice daily"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Duration</label>
                      <input
                        type="text"
                        value={medication.duration}
                        onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                        className="form-input"
                        placeholder="e.g., 7 days"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Quantity</label>
                      <input
                        type="text"
                        value={medication.quantity}
                        onChange={(e) => handleMedicationChange(index, 'quantity', e.target.value)}
                        className="form-input"
                        placeholder="e.g., 10 tablets"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Instructions</label>
                      <input
                        type="text"
                        value={medication.instructions}
                        onChange={(e) => handleMedicationChange(index, 'instructions', e.target.value)}
                        className="form-input"
                        placeholder="e.g., Take after meals"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {errors.medications && (
                <span className="error-message">{errors.medications}</span>
              )}
            </div>
          </div>

          <div className="prescription-modal-footer">
            <button
              type="button"
              onClick={handleClose}
              className="btn-cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-save"
            >
              {isSubmitting ? 'Saving...' : editingPrescription ? 'Update Prescription' : 'Create Prescription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPrescriptionModal;

import React, { useState, useEffect } from 'react';
import { Prescription, PrescriptionMedication } from '../../services/prescriptionService';
import './AddPrescriptionModal.css';

export interface AddPrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (prescriptionData: any) => Promise<void>;
  editingPrescription?: Prescription | null;
}

export interface PrescriptionFormData {
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
    symptoms: [],
    notes: '',
    status: 'pending',
    priority: 'medium',
    prescribedDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    medications: []
  });

  const [errors, setErrors] = useState<Partial<PrescriptionFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [symptomInput, setSymptomInput] = useState('');

  useEffect(() => {
    if (editingPrescription) {
      setFormData({
        prescriptionNumber: editingPrescription.prescriptionNumber,
        patientId: editingPrescription.patientId,
        doctorId: editingPrescription.doctorId,
        diagnosis: editingPrescription.diagnosis,
        symptoms: editingPrescription.symptoms,
        notes: editingPrescription.notes,
        status: editingPrescription.status,
        priority: editingPrescription.priority,
        prescribedDate: editingPrescription.prescribedDate.split('T')[0],
        expiryDate: editingPrescription.expiryDate.split('T')[0],
        medications: editingPrescription.medications
      });
    } else {
      setFormData({
        prescriptionNumber: '',
        patientId: '',
        doctorId: '',
        diagnosis: '',
        symptoms: [],
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
    
    if (errors[name as keyof PrescriptionFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleAddSymptom = () => {
    if (symptomInput.trim() && !formData.symptoms.includes(symptomInput.trim())) {
      setFormData(prev => ({
        ...prev,
        symptoms: [...prev.symptoms, symptomInput.trim()]
      }));
      setSymptomInput('');
    }
  };

  const handleRemoveSymptom = (symptom: string) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.filter(s => s !== symptom)
    }));
  };

  const handleAddMedication = () => {
    const newMedication: PrescriptionMedication = {
      id: Date.now().toString(),
      medicineId: '',
      medicine: {
        id: '',
        name: '',
        manufacturer: '',
        form: ''
      },
      dosage: '',
      frequency: '',
      duration: '',
      quantity: 1,
      instructions: '',
      refillsAllowed: 0,
      refillsUsed: 0
    };

    setFormData(prev => ({
      ...prev,
      medications: [...prev.medications, newMedication]
    }));
  };

  const handleMedicationChange = (index: number, field: keyof PrescriptionMedication, value: any) => {
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
    const newErrors: Partial<PrescriptionFormData> = {};

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

    if (formData.medications.length === 0) {
      newErrors.medications = 'At least one medication is required';
    }

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
      await onSubmit(formData);
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
      symptoms: [],
      notes: '',
      status: 'pending',
      priority: 'medium',
      prescribedDate: new Date().toISOString().split('T')[0],
      expiryDate: '',
      medications: []
    });
    setErrors({});
    setSymptomInput('');
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
                <label className="form-label">Symptoms</label>
                <div className="symptom-input-container">
                  <input
                    type="text"
                    value={symptomInput}
                    onChange={(e) => setSymptomInput(e.target.value)}
                    className="form-input"
                    placeholder="Enter symptom"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSymptom())}
                  />
                  <button
                    type="button"
                    onClick={handleAddSymptom}
                    className="add-symptom-btn"
                  >
                    Add
                  </button>
                </div>
                {formData.symptoms.length > 0 && (
                  <div className="symptom-list">
                    {formData.symptoms.map((symptom, index) => (
                      <span key={index} className="symptom-item">
                        {symptom}
                        <button
                          type="button"
                          onClick={() => handleRemoveSymptom(symptom)}
                          className="remove-symptom-btn"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
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
                      <label className="form-label">Medicine ID</label>
                      <input
                        type="text"
                        value={medication.medicineId}
                        onChange={(e) => handleMedicationChange(index, 'medicineId', e.target.value)}
                        className="form-input"
                        placeholder="Enter medicine ID"
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
                        type="number"
                        value={medication.quantity}
                        onChange={(e) => handleMedicationChange(index, 'quantity', parseInt(e.target.value) || 1)}
                        className="form-input"
                        min="1"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Refills Allowed</label>
                      <input
                        type="number"
                        value={medication.refillsAllowed}
                        onChange={(e) => handleMedicationChange(index, 'refillsAllowed', parseInt(e.target.value) || 0)}
                        className="form-input"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Instructions</label>
                    <textarea
                      value={medication.instructions}
                      onChange={(e) => handleMedicationChange(index, 'instructions', e.target.value)}
                      className="form-textarea"
                      rows={2}
                      placeholder="Enter medication instructions"
                    />
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

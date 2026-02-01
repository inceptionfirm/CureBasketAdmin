import React, { useState } from 'react';
import './MedicationEditor.css';

export interface Medication {
  id?: string;
  name: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
}

interface MedicationEditorProps {
  medications: Medication[];
  onMedicationsChange: (medications: Medication[]) => void;
  editable?: boolean;
  className?: string;
}

const MedicationEditor: React.FC<MedicationEditorProps> = ({
  medications,
  onMedicationsChange,
  editable = true,
  className = ''
}) => {
  const [localMedications, setLocalMedications] = useState<Medication[]>(medications);

  const handleAddMedication = () => {
    const newMedication: Medication = {
      id: `med-${Date.now()}`,
      name: '',
      dosage: '',
      frequency: '',
      duration: ''
    };
    const updated = [...localMedications, newMedication];
    setLocalMedications(updated);
    onMedicationsChange(updated);
  };

  const handleRemoveMedication = (id: string) => {
    const updated = localMedications.filter(med => med.id !== id);
    setLocalMedications(updated);
    onMedicationsChange(updated);
  };

  const handleMedicationChange = (id: string, field: keyof Medication, value: string) => {
    const updated = localMedications.map(med =>
      med.id === id ? { ...med, [field]: value } : med
    );
    setLocalMedications(updated);
    onMedicationsChange(updated);
  };

  if (!editable && localMedications.length === 0) {
    return (
      <div className={`medication-editor ${className}`}>
        <div className="medication-empty">
          <p>No medications added yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`medication-editor ${className}`}>
      <div className="medication-editor-header">
        <h3 className="medication-editor-title">Medications</h3>
        {editable && (
          <button
            type="button"
            onClick={handleAddMedication}
            className="btn-add-medication"
            title="Add medication"
          >
            <span className="button-icon">+</span>
            Add Medication
          </button>
        )}
      </div>

      {localMedications.length === 0 ? (
        <div className="medication-empty">
          <p>No medications added. Click "Add Medication" to add medicines.</p>
        </div>
      ) : (
        <div className="medications-list">
          {localMedications.map((medication, index) => (
            <div key={medication.id || index} className="medication-item">
              <div className="medication-item-header">
                <span className="medication-number">Medication {index + 1}</span>
                {editable && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMedication(medication.id!)}
                    className="btn-remove-medication"
                    title="Remove medication"
                  >
                    ×
                  </button>
                )}
              </div>

              <div className="medication-fields">
                <div className="medication-field medication-field-full">
                  <label className="medication-label">
                    Medicine Name <span className="required">*</span>
                  </label>
                  {editable ? (
                    <input
                      type="text"
                      value={medication.name}
                      onChange={(e) => handleMedicationChange(medication.id!, 'name', e.target.value)}
                      placeholder="e.g., Paracetamol 500mg"
                      className="medication-input"
                      required
                    />
                  ) : (
                    <div className="medication-value">{medication.name || '—'}</div>
                  )}
                </div>

                <div className="medication-field">
                  <label className="medication-label">Dosage</label>
                  {editable ? (
                    <input
                      type="text"
                      value={medication.dosage || ''}
                      onChange={(e) => handleMedicationChange(medication.id!, 'dosage', e.target.value)}
                      placeholder="e.g., 500mg"
                      className="medication-input"
                    />
                  ) : (
                    <div className="medication-value">{medication.dosage || '—'}</div>
                  )}
                </div>

                <div className="medication-field">
                  <label className="medication-label">Frequency</label>
                  {editable ? (
                    <input
                      type="text"
                      value={medication.frequency || ''}
                      onChange={(e) => handleMedicationChange(medication.id!, 'frequency', e.target.value)}
                      placeholder="e.g., Twice daily"
                      className="medication-input"
                    />
                  ) : (
                    <div className="medication-value">{medication.frequency || '—'}</div>
                  )}
                </div>

                <div className="medication-field">
                  <label className="medication-label">Duration</label>
                  {editable ? (
                    <input
                      type="text"
                      value={medication.duration || ''}
                      onChange={(e) => handleMedicationChange(medication.id!, 'duration', e.target.value)}
                      placeholder="e.g., 7 days"
                      className="medication-input"
                    />
                  ) : (
                    <div className="medication-value">{medication.duration || '—'}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MedicationEditor;

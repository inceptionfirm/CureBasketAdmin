import React, { useState, useEffect, useRef, useCallback } from 'react';
import './MedicationEditor.css';

export interface Medication {
  id?: string;
  name: string;
  /** Catalog medicine ID for map-medicine API */
  medicineId?: number;
  dosage?: string;
  frequency?: string;
  duration?: string;
  /** Quantity for map-medicine API */
  quantity?: string;
  instructions?: string;
}

export interface MedicineOption {
  id: number;
  name: string;
  manufacturer?: string;
}

interface MedicationEditorProps {
  medications: Medication[];
  onMedicationsChange: (medications: Medication[]) => void;
  editable?: boolean;
  className?: string;
  /** Loaded medicines for search/autocomplete (stored in parent state) */
  medicineOptions?: MedicineOption[];
  /** Called when user clicks Save medicine (only when editable) */
  onSaveMedications?: () => void;
  saving?: boolean;
}

const MedicationEditor: React.FC<MedicationEditorProps> = ({
  medications,
  onMedicationsChange,
  editable = true,
  className = '',
  medicineOptions = [],
  onSaveMedications,
  saving = false,
}) => {
  const [localMedications, setLocalMedications] = useState<Medication[]>(medications);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setLocalMedications(medications);
  }, [medications]);

  const getFilteredMedicines = useCallback(
    (query: string): MedicineOption[] => {
      if (!query.trim()) return medicineOptions.slice(0, 15);
      const q = query.trim().toLowerCase();
      return medicineOptions
        .filter(
          (m) =>
            m.name.toLowerCase().includes(q) ||
            (m.manufacturer && m.manufacturer.toLowerCase().includes(q))
        )
        .slice(0, 15);
    },
    [medicineOptions]
  );

  const handleAddMedication = () => {
    const newMedication: Medication = {
      id: `med-${Date.now()}`,
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      quantity: ''
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

  const handleMedicationChange = (id: string, field: keyof Medication, value: string | number | undefined) => {
    const updated = localMedications.map(med =>
      med.id === id ? { ...med, [field]: value } : med
    );
    setLocalMedications(updated);
    onMedicationsChange(updated);
  };

  const handleSelectMedicine = (medicationId: string, option: MedicineOption) => {
    const updated = localMedications.map((med) =>
      med.id === medicationId ? { ...med, name: option.name, medicineId: option.id } : med
    );
    setLocalMedications(updated);
    onMedicationsChange(updated);
    setOpenDropdownId(null);
  };

  const handleNameFocus = (id: string) => {
    setOpenDropdownId(id);
  };

  const handleNameBlur = () => {
    setTimeout(() => setOpenDropdownId(null), 200);
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
        <>
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
                    <div className="medication-autocomplete" ref={openDropdownId === medication.id ? dropdownRef : undefined}>
                      <input
                        type="text"
                        value={medication.name}
                        onChange={(e) => handleMedicationChange(medication.id!, 'name', e.target.value)}
                        onFocus={() => handleNameFocus(medication.id!)}
                        onBlur={handleNameBlur}
                        placeholder="Search or type medicine name..."
                        className="medication-input"
                        required
                        autoComplete="off"
                      />
                      {medicineOptions.length > 0 && openDropdownId === medication.id && (
                        <div className="medication-autocomplete-dropdown">
                          {getFilteredMedicines(medication.name).length === 0 ? (
                            <div className="medication-autocomplete-item medication-autocomplete-empty">
                              No matching medicine. Type to search or enter manually.
                            </div>
                          ) : (
                            getFilteredMedicines(medication.name).map((opt) => (
                              <button
                                key={opt.id}
                                type="button"
                                className="medication-autocomplete-item"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  handleSelectMedicine(medication.id!, opt);
                                }}
                              >
                                <span className="medication-autocomplete-name">{opt.name}</span>
                                {opt.manufacturer && (
                                  <span className="medication-autocomplete-meta"> · {opt.manufacturer}</span>
                                )}
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
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

                <div className="medication-field">
                  <label className="medication-label">Quantity</label>
                  {editable ? (
                    <input
                      type="text"
                      value={medication.quantity || ''}
                      onChange={(e) => handleMedicationChange(medication.id!, 'quantity', e.target.value)}
                      placeholder="e.g., 30"
                      className="medication-input"
                    />
                  ) : (
                    <div className="medication-value">{medication.quantity || '—'}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
          </div>
          {editable && onSaveMedications && (
            <div className="medication-editor-save">
              <button
                type="button"
                onClick={onSaveMedications}
                className="btn-save-medication"
                disabled={saving || localMedications.length === 0}
              >
                {saving ? 'Mapping…' : 'Map medicines'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MedicationEditor;

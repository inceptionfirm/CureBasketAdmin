import React, { useState, useEffect } from 'react';
import { PrescriptionMainAttribute, PrescriptionSubAttribute } from '../../services/prescriptionService';
import './DynamicAttributesForm.css';

interface DynamicAttributesFormProps {
  mainAttributes: PrescriptionMainAttribute[];
  onChange: (attributes: PrescriptionMainAttribute[]) => void;
  disabled?: boolean;
}

const DynamicAttributesForm: React.FC<DynamicAttributesFormProps> = ({
  mainAttributes,
  onChange,
  disabled = false
}) => {
  const [attributes, setAttributes] = useState<PrescriptionMainAttribute[]>(mainAttributes || []);

  useEffect(() => {
    setAttributes(mainAttributes || []);
  }, [mainAttributes]);

  const handleAttributeChange = (index: number, field: keyof PrescriptionMainAttribute, value: any) => {
    const updated = [...attributes];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    setAttributes(updated);
    onChange(updated);
  };

  const handleSubAttributeChange = (
    mainIndex: number,
    subIndex: number,
    field: keyof PrescriptionSubAttribute,
    value: string
  ) => {
    const updated = [...attributes];
    if (!updated[mainIndex].subAttributes) {
      updated[mainIndex].subAttributes = [];
    }
    updated[mainIndex].subAttributes = [...(updated[mainIndex].subAttributes || [])];
    updated[mainIndex].subAttributes[subIndex] = {
      ...updated[mainIndex].subAttributes[subIndex],
      [field]: value
    };
    setAttributes(updated);
    onChange(updated);
  };

  const addMainAttribute = () => {
    const newAttribute: PrescriptionMainAttribute = {
      name: '',
      scale: null,
      value: '',
      subAttributes: []
    };
    const updated = [...attributes, newAttribute];
    setAttributes(updated);
    onChange(updated);
  };

  const removeMainAttribute = (index: number) => {
    const updated = attributes.filter((_, i) => i !== index);
    setAttributes(updated);
    onChange(updated);
  };

  const addSubAttribute = (mainIndex: number) => {
    const updated = [...attributes];
    if (!updated[mainIndex].subAttributes) {
      updated[mainIndex].subAttributes = [];
    }
    updated[mainIndex].subAttributes = [
      ...(updated[mainIndex].subAttributes || []),
      { name: '', value: '' }
    ];
    setAttributes(updated);
    onChange(updated);
  };

  const removeSubAttribute = (mainIndex: number, subIndex: number) => {
    const updated = [...attributes];
    if (updated[mainIndex].subAttributes) {
      updated[mainIndex].subAttributes = updated[mainIndex].subAttributes.filter((_, i) => i !== subIndex);
      setAttributes(updated);
      onChange(updated);
    }
  };

  return (
    <div className="dynamic-attributes-form">
      <div className="attributes-header">
        <h4 className="attributes-title">
          <span className="attributes-icon">📝</span>
          Main Attributes
        </h4>
        {!disabled && (
          <button
            type="button"
            onClick={addMainAttribute}
            className="btn-add-attribute"
            title="Add Main Attribute"
          >
            + Add Attribute
          </button>
        )}
      </div>

      {attributes.length === 0 ? (
        <div className="no-attributes">
          <p>No attributes added. Click "Add Attribute" to add one.</p>
        </div>
      ) : (
        <div className="attributes-list">
          {attributes.map((attr, mainIndex) => (
            <div key={mainIndex} className="main-attribute-card">
              <div className="main-attribute-header">
                <span className="attribute-number">Attribute {mainIndex + 1}</span>
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => removeMainAttribute(mainIndex)}
                    className="btn-remove-attribute"
                    title="Remove Attribute"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="main-attribute-fields">
                <div className="attribute-field-group">
                  <label className="attribute-label">
                    Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    value={attr.name || ''}
                    onChange={(e) => handleAttributeChange(mainIndex, 'name', e.target.value)}
                    className="attribute-input"
                    placeholder="e.g., Medicines, Symptoms, Notes"
                    disabled={disabled}
                    required
                  />
                </div>

                <div className="attribute-field-group">
                  <label className="attribute-label">Scale (Optional)</label>
                  <input
                    type="text"
                    value={attr.scale || ''}
                    onChange={(e) => handleAttributeChange(mainIndex, 'scale', e.target.value || null)}
                    className="attribute-input"
                    placeholder="e.g., list, grams, url, minutes, or leave empty"
                    disabled={disabled}
                  />
                </div>

                <div className="attribute-field-group">
                  <label className="attribute-label">Value (Optional)</label>
                  <input
                    type="text"
                    value={attr.value || ''}
                    onChange={(e) => handleAttributeChange(mainIndex, 'value', e.target.value)}
                    className="attribute-input"
                    placeholder="e.g., Paracetamol, Vitamin C"
                    disabled={disabled}
                  />
                </div>
              </div>

              <div className="sub-attributes-section">
                <div className="sub-attributes-header">
                  <h5 className="sub-attributes-title">Sub Attributes</h5>
                  {!disabled && (
                    <button
                      type="button"
                      onClick={() => addSubAttribute(mainIndex)}
                      className="btn-add-sub-attribute"
                      title="Add Sub Attribute"
                    >
                      + Add Sub Attribute
                    </button>
                  )}
                </div>

                {attr.subAttributes && attr.subAttributes.length > 0 ? (
                  <div className="sub-attributes-list">
                    {attr.subAttributes.map((subAttr, subIndex) => (
                      <div key={subIndex} className="sub-attribute-item">
                        <div className="sub-attribute-fields">
                          <input
                            type="text"
                            value={subAttr.name || ''}
                            onChange={(e) => handleSubAttributeChange(mainIndex, subIndex, 'name', e.target.value)}
                            className="sub-attribute-input"
                            placeholder="Sub attribute name"
                            disabled={disabled}
                          />
                          <input
                            type="text"
                            value={subAttr.value || ''}
                            onChange={(e) => handleSubAttributeChange(mainIndex, subIndex, 'value', e.target.value)}
                            className="sub-attribute-input"
                            placeholder="Sub attribute value"
                            disabled={disabled}
                          />
                        </div>
                        {!disabled && (
                          <button
                            type="button"
                            onClick={() => removeSubAttribute(mainIndex, subIndex)}
                            className="btn-remove-sub-attribute"
                            title="Remove Sub Attribute"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-sub-attributes">
                    <p>No sub attributes. Click "Add Sub Attribute" to add one.</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DynamicAttributesForm;


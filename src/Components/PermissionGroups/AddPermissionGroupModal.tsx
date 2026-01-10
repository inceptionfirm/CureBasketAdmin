import React, { useState, useEffect } from 'react';
import { PermissionGroup } from '../../services/permissionService';
import './AddPermissionGroupModal.css';

interface AddPermissionGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  editingGroup?: PermissionGroup | null;
}

const AddPermissionGroupModal: React.FC<AddPermissionGroupModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingGroup
}) => {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingGroup) {
      setName(editingGroup.name);
    } else {
      setName('');
    }
    setError(null);
  }, [editingGroup, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (error) {
      setError(null);
    }
  };

  const validateForm = (): boolean => {
    if (!name.trim()) {
      setError('Group name is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(name.trim());
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setName('');
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="group-modal-overlay" onClick={handleClose}>
      <div className="group-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="group-modal-header">
          <div className="header-left">
            <span className="header-icon">📦</span>
            <h2 className="group-modal-title">
              {editingGroup ? 'Edit Permission Group' : 'Add New Permission Group'}
            </h2>
          </div>
          <button 
            className="group-modal-close-btn"
            onClick={handleClose}
          >
            ✕
          </button>
        </div>

        <form className="group-modal-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h3 className="section-title">
              <span className="section-icon">📋</span>
              Group Information
            </h3>

            <div className="form-group">
              <label className="form-label">
                Group Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={name}
                onChange={handleInputChange}
                className={`form-input ${error ? 'error' : ''}`}
                placeholder="Enter permission group name"
              />
              {error && <div className="error-message">{error}</div>}
            </div>
          </div>

          <div className="group-modal-footer">
            <button
              type="button"
              className="btn-cancel"
              onClick={handleClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-add"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  {editingGroup ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                <>
                  <span>+</span>
                  {editingGroup ? 'Update Group' : 'Add Group'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPermissionGroupModal;


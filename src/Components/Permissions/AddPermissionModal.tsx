import React, { useState, useEffect } from 'react';
import { Permission, PermissionGroup } from '../../services/permissionService';
import './AddPermissionModal.css';

interface AddPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (permissionData: { name: string; permissionGroupId: number }) => void;
  editingPermission?: Permission | null;
  permissionGroups: PermissionGroup[];
}

interface PermissionFormData {
  name: string;
  permissionGroupId: number;
}

const AddPermissionModal: React.FC<AddPermissionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingPermission,
  permissionGroups
}) => {
  const [formData, setFormData] = useState<PermissionFormData>({
    name: '',
    permissionGroupId: 0,
  });

  const [errors, setErrors] = useState<Partial<PermissionFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingPermission) {
      setFormData({
        name: editingPermission.name,
        permissionGroupId: editingPermission.permissionGroupId,
      });
    } else {
      setFormData({
        name: '',
        permissionGroupId: permissionGroups.length > 0 ? permissionGroups[0].id : 0,
      });
    }
    setErrors({});
  }, [editingPermission, isOpen, permissionGroups]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'permissionGroupId' ? Number(value) : value
    }));
    
    if (errors[name as keyof PermissionFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<PermissionFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Permission name is required';
    }

    if (!formData.permissionGroupId || formData.permissionGroupId === 0) {
      newErrors.permissionGroupId = 'Permission group is required';
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
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      permissionGroupId: permissionGroups.length > 0 ? permissionGroups[0].id : 0,
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="permission-modal-overlay" onClick={handleClose}>
      <div className="permission-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="permission-modal-header">
          <div className="header-left">
            <span className="header-icon">🔐</span>
            <h2 className="permission-modal-title">
              {editingPermission ? 'Edit Permission' : 'Add New Permission'}
            </h2>
          </div>
          <button 
            className="permission-modal-close-btn"
            onClick={handleClose}
          >
            ✕
          </button>
        </div>

        <form className="permission-modal-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h3 className="section-title">
              <span className="section-icon">📋</span>
              Permission Information
            </h3>

            <div className="form-group">
              <label className="form-label">
                Permission Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`form-input ${errors.name ? 'error' : ''}`}
                placeholder="Enter permission name"
              />
              {errors.name && <div className="error-message">{errors.name}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Permission Group *
              </label>
              <select
                id="permissionGroupId"
                name="permissionGroupId"
                value={formData.permissionGroupId}
                onChange={handleInputChange}
                className={`form-select ${errors.permissionGroupId ? 'error' : ''}`}
              >
                <option value={0}>Select a permission group</option>
                {permissionGroups.map(group => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
              {errors.permissionGroupId && <div className="error-message">{errors.permissionGroupId}</div>}
            </div>
          </div>

          <div className="permission-modal-footer">
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
                  {editingPermission ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                <>
                  <span>+</span>
                  {editingPermission ? 'Update Permission' : 'Add Permission'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPermissionModal;


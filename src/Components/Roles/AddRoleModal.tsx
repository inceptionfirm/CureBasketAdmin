import React, { useState, useEffect } from 'react';
import { Role, CreateRolePayload } from '../../services/roleService';
import { Permission } from '../../services/permissionService';
import './AddRoleModal.css';

interface AddRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (roleData: CreateRolePayload) => void;
  editingRole?: Role | null;
  permissions: Permission[];
}

interface RoleFormData {
  businessId: number;
  name: string;
  description: string;
  roleType: 'USER' | 'ADMIN' | 'SUPERADMIN';
  permissionIds: number[];
}

const AddRoleModal: React.FC<AddRoleModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingRole,
  permissions
}) => {
  const [formData, setFormData] = useState<RoleFormData>({
    businessId: 1, // Default business ID - should be fetched from auth context
    name: '',
    description: '',
    roleType: 'USER',
    permissionIds: [],
  });

  const [errors, setErrors] = useState<Partial<RoleFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [groupedPermissions, setGroupedPermissions] = useState<Record<number, Permission[]>>({});

  useEffect(() => {
    if (editingRole) {
      setFormData({
        businessId: editingRole.businessId,
        name: editingRole.name,
        description: editingRole.description || '',
        roleType: editingRole.roleType,
        permissionIds: editingRole.permissionIds || [],
      });
    } else {
      setFormData({
        businessId: 1,
        name: '',
        description: '',
        roleType: 'USER',
        permissionIds: [],
      });
    }
    setErrors({});
  }, [editingRole, isOpen]);

  useEffect(() => {
    // Group permissions by permissionGroupId
    const grouped: Record<number, Permission[]> = {};
    permissions.forEach(permission => {
      const groupId = permission.permissionGroupId;
      if (!grouped[groupId]) {
        grouped[groupId] = [];
      }
      grouped[groupId].push(permission);
    });
    setGroupedPermissions(grouped);
  }, [permissions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'businessId' ? Number(value) : value
    }));
    
    if (errors[name as keyof RoleFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handlePermissionToggle = (permissionId: number) => {
    setFormData(prev => {
      const isSelected = prev.permissionIds.includes(permissionId);
      return {
        ...prev,
        permissionIds: isSelected
          ? prev.permissionIds.filter(id => id !== permissionId)
          : [...prev.permissionIds, permissionId]
      };
    });
  };

  const handleSelectAllInGroup = (groupPermissions: Permission[]) => {
    const allSelected = groupPermissions.every(p => formData.permissionIds.includes(p.id));
    setFormData(prev => ({
      ...prev,
      permissionIds: allSelected
        ? prev.permissionIds.filter(id => !groupPermissions.some(p => p.id === id))
        : [...new Set([...prev.permissionIds, ...groupPermissions.map(p => p.id)])]
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<RoleFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Role name is required';
    }

    if (!formData.businessId || formData.businessId <= 0) {
      newErrors.businessId = 'Business ID is required';
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
      await onSubmit({
        businessId: formData.businessId,
        name: formData.name.trim(),
        description: formData.description.trim(),
        roleType: formData.roleType,
        permissionIds: formData.permissionIds,
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      businessId: 1,
      name: '',
      description: '',
      roleType: 'USER',
      permissionIds: [],
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="role-modal-overlay" onClick={handleClose}>
      <div className="role-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="role-modal-header">
          <div className="header-left">
            <span className="header-icon">👤</span>
            <h2 className="role-modal-title">
              {editingRole ? 'Edit Role' : 'Add New Role'}
            </h2>
          </div>
          <button 
            className="role-modal-close-btn"
            onClick={handleClose}
          >
            ✕
          </button>
        </div>

        <form className="role-modal-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h3 className="section-title">
              <span className="section-icon">📋</span>
              Role Information
            </h3>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Role Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`form-input ${errors.name ? 'error' : ''}`}
                  placeholder="Enter role name"
                />
                {errors.name && <div className="error-message">{errors.name}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Role Type *
                </label>
                <select
                  id="roleType"
                  name="roleType"
                  value={formData.roleType}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="SUPERADMIN">SUPERADMIN</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Business ID *
              </label>
              <input
                type="number"
                id="businessId"
                name="businessId"
                value={formData.businessId}
                onChange={handleInputChange}
                className={`form-input ${errors.businessId ? 'error' : ''}`}
                placeholder="Enter business ID"
                min="1"
              />
              {errors.businessId && <div className="error-message">{errors.businessId}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="form-textarea"
                placeholder="Enter role description"
                rows={3}
              />
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">
              <span className="section-icon">🔐</span>
              Permissions
              <span className="permissions-count-badge">
                {formData.permissionIds.length} selected
              </span>
            </h3>

            <div className="permissions-container">
              {Object.entries(groupedPermissions).map(([groupId, groupPermissions]) => (
                <div key={groupId} className="permission-group-section">
                  <div className="permission-group-header">
                    <h4 className="group-name">
                      Group {groupId}
                    </h4>
                    <button
                      type="button"
                      className="select-all-btn"
                      onClick={() => handleSelectAllInGroup(groupPermissions)}
                    >
                      {groupPermissions.every(p => formData.permissionIds.includes(p.id))
                        ? 'Deselect All'
                        : 'Select All'}
                    </button>
                  </div>
                  <div className="permissions-grid">
                    {groupPermissions.map((permission) => (
                      <label key={permission.id} className="permission-checkbox">
                        <input
                          type="checkbox"
                          checked={formData.permissionIds.includes(permission.id)}
                          onChange={() => handlePermissionToggle(permission.id)}
                        />
                        <span className="permission-label">{permission.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              {permissions.length === 0 && (
                <div className="no-permissions-message">
                  No permissions available. Please create permissions first.
                </div>
              )}
            </div>
          </div>

          <div className="role-modal-footer">
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
                  {editingRole ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                <>
                  <span>+</span>
                  {editingRole ? 'Update Role' : 'Add Role'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRoleModal;


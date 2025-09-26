import React, { useState } from 'react';
import './AddUserModal.css';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: UserFormData) => void;
}

interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  status: 'active' | 'inactive';
  dateOfBirth: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  emergencyContact: string;
  emergencyPhone: string;
  notes: string;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<UserFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    status: 'active',
    dateOfBirth: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    emergencyContact: '',
    emergencyPhone: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Partial<UserFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof UserFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<UserFormData> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.role.trim()) {
      newErrors.role = 'Role is required';
    }

    if (!formData.department.trim()) {
      newErrors.department = 'Department is required';
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      onSubmit(formData);
      handleClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: '',
      department: '',
      status: 'active',
      dateOfBirth: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      emergencyContact: '',
      emergencyPhone: '',
      notes: ''
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            <span className="modal-icon">👤</span>
            Add New User
          </h2>
          <button className="modal-close-btn" onClick={handleClose}>
            ✕
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-sections">
            {/* Personal Information Section */}
            <div className="form-section">
              <h3 className="section-title">
                <span className="section-icon">👤</span>
                Personal Information
              </h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName" className="form-label">
                    First Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`form-input ${errors.firstName ? 'error' : ''}`}
                    placeholder="Enter first name"
                  />
                  {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="lastName" className="form-label">
                    Last Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`form-input ${errors.lastName ? 'error' : ''}`}
                    placeholder="Enter last name"
                  />
                  {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Email Address <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`form-input ${errors.email ? 'error' : ''}`}
                    placeholder="Enter email address"
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="phone" className="form-label">
                    Phone Number <span className="required">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`form-input ${errors.phone ? 'error' : ''}`}
                    placeholder="Enter phone number"
                  />
                  {errors.phone && <span className="error-message">{errors.phone}</span>}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="dateOfBirth" className="form-label">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="status" className="form-label">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Professional Information Section */}
            <div className="form-section">
              <h3 className="section-title">
                <span className="section-icon">💼</span>
                Professional Information
              </h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="role" className="form-label">
                    Role <span className="required">*</span>
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className={`form-select ${errors.role ? 'error' : ''}`}
                  >
                    <option value="">Select a role</option>
                    <option value="admin">Administrator</option>
                    <option value="manager">Manager</option>
                    <option value="employee">Employee</option>
                    <option value="intern">Intern</option>
                    <option value="contractor">Contractor</option>
                  </select>
                  {errors.role && <span className="error-message">{errors.role}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="department" className="form-label">
                    Department <span className="required">*</span>
                  </label>
                  <select
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className={`form-select ${errors.department ? 'error' : ''}`}
                  >
                    <option value="">Select a department</option>
                    <option value="engineering">Engineering</option>
                    <option value="marketing">Marketing</option>
                    <option value="sales">Sales</option>
                    <option value="hr">Human Resources</option>
                    <option value="finance">Finance</option>
                    <option value="operations">Operations</option>
                    <option value="support">Customer Support</option>
                  </select>
                  {errors.department && <span className="error-message">{errors.department}</span>}
                </div>
              </div>
            </div>

            {/* Address Information Section */}
            <div className="form-section">
              <h3 className="section-title">
                <span className="section-icon">📍</span>
                Address Information
              </h3>
              <div className="form-group">
                <label htmlFor="address" className="form-label">
                  Street Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter street address"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city" className="form-label">
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter city"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="state" className="form-label">
                    State/Province
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter state/province"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="zipCode" className="form-label">
                    ZIP/Postal Code
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter ZIP/postal code"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="country" className="form-label">
                    Country
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter country"
                  />
                </div>
              </div>
            </div>

            {/* Emergency Contact Section */}
            <div className="form-section">
              <h3 className="section-title">
                <span className="section-icon">🚨</span>
                Emergency Contact
              </h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="emergencyContact" className="form-label">
                    Emergency Contact Name
                  </label>
                  <input
                    type="text"
                    id="emergencyContact"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter emergency contact name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="emergencyPhone" className="form-label">
                    Emergency Contact Phone
                  </label>
                  <input
                    type="tel"
                    id="emergencyPhone"
                    name="emergencyPhone"
                    value={formData.emergencyPhone}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter emergency contact phone"
                  />
                </div>
              </div>
            </div>

            {/* Additional Notes Section */}
            <div className="form-section">
              <h3 className="section-title">
                <span className="section-icon">📝</span>
                Additional Notes
              </h3>
              <div className="form-group">
                <label htmlFor="notes" className="form-label">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="form-textarea"
                  placeholder="Enter any additional notes or comments"
                  rows={4}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  Adding User...
                </>
              ) : (
                <>
                  <span className="btn-icon">➕</span>
                  Add User
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;

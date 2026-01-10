import React, { useEffect, useState } from 'react';
import './AddUserModal.css';
import { BusinessPayload } from '../../services/businessService';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: BusinessPayload) => Promise<void>;
}

type FormErrors = Record<string, string>;

const defaultFormState: BusinessPayload = {
  name: '',
  tagline: '',
  description: '',
  isCategoryEnabled: true,
  isSupplier: false,
  isSeller: true,
  isActive: true,
  isDeleted: false,
  isVerified: false,
  uniqueId: '',
  domainName: '',
  password: '',
  address: {
    firstName: '',
    lastName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    emailAddress: '',
    phoneNumber: '',
  },
  contact: {
    email: '',
    mainPhone: '',
    secondaryPhone: '',
    isEmailVerified: false,
    isMainPhoneVerified: false,
  },
};

const createDefaultFormState = (): BusinessPayload => ({
  ...defaultFormState,
  address: { ...defaultFormState.address },
  contact: { ...defaultFormState.contact },
  });

const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<BusinessPayload>(() => createDefaultFormState());
  const [errors, setErrors] = useState<FormErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(createDefaultFormState());
      setErrors({});
      setGeneralError(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const resetForm = () => {
    setFormData(createDefaultFormState());
    setErrors({});
    setGeneralError(null);
  };

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }
    resetForm();
    onClose();
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;

    setFormData(prev => {
      if (name.startsWith('address.')) {
        const key = name.replace('address.', '') as keyof BusinessPayload['address'];
        return {
          ...prev,
          address: {
            ...prev.address,
            [key]: value,
          },
        };
      }

      if (name.startsWith('contact.')) {
        const key = name.replace('contact.', '') as keyof BusinessPayload['contact'];
        return {
      ...prev,
          contact: {
            ...prev.contact,
            [key]: value,
          },
        };
      }

      return {
        ...prev,
        [name]: value,
      } as BusinessPayload;
    });

    setErrors(prev => {
      if (!(name in prev)) {
        return prev;
      }
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;

    setFormData(prev => {
      if (name.startsWith('contact.')) {
        const key = name.replace('contact.', '') as keyof BusinessPayload['contact'];
        return {
          ...prev,
          contact: {
            ...prev.contact,
            [key]: checked,
          },
        };
      }

      return {
        ...prev,
        [name]: checked,
      } as BusinessPayload;
    });
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Business name is required';
    }
    if (!formData.uniqueId.trim()) {
      newErrors.uniqueId = 'Unique ID is required';
    }
    if (!formData.domainName.trim()) {
      newErrors.domainName = 'Domain name is required';
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }
    if (!formData.contact.email.trim()) {
      newErrors['contact.email'] = 'Contact email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact.email)) {
      newErrors['contact.email'] = 'Enter a valid contact email';
    }
    if (!formData.contact.mainPhone.trim()) {
      newErrors['contact.mainPhone'] = 'Main phone is required';
    }
    if (!formData.address.firstName.trim()) {
      newErrors['address.firstName'] = 'First name is required';
    }
    if (!formData.address.lastName.trim()) {
      newErrors['address.lastName'] = 'Last name is required';
    }
    if (!formData.address.emailAddress.trim()) {
      newErrors['address.emailAddress'] = 'Address email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.address.emailAddress)) {
      newErrors['address.emailAddress'] = 'Enter a valid email';
    }
    if (!formData.address.phoneNumber.trim()) {
      newErrors['address.phoneNumber'] = 'Phone number is required';
    }
    if (!formData.address.addressLine1.trim()) {
      newErrors['address.addressLine1'] = 'Address line 1 is required';
    }
    if (!formData.address.city.trim()) {
      newErrors['address.city'] = 'City is required';
    }
    if (!formData.address.state.trim()) {
      newErrors['address.state'] = 'State is required';
    }
    if (!formData.address.postalCode.trim()) {
      newErrors['address.postalCode'] = 'Postal code is required';
    }
    if (!formData.address.country.trim()) {
      newErrors['address.country'] = 'Country is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log('📝 Form submitted, validating...');
    
    if (!validateForm()) {
      console.warn('❌ Form validation failed');
      return;
    }

    console.log('✅ Form validated, submitting...', formData);
    setIsSubmitting(true);
    setGeneralError(null);

    try {
      console.log('🔄 Calling onSubmit callback...');
      await onSubmit(formData);
      console.log('✅ onSubmit completed successfully');
      resetForm();
      onClose();
    } catch (error) {
      console.error('❌ onSubmit failed:', error);
      const message = error instanceof Error ? error.message : 'Failed to create business';
      setGeneralError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-container" onClick={event => event.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            <span className="modal-icon">🏢</span>
            Add New Business
          </h2>
          <button className="modal-close-btn" onClick={handleClose} aria-label="Close">
            ✕
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-sections">
            {generalError && (
              <div className="error-message" style={{ marginBottom: '16px' }}>
                {generalError}
              </div>
            )}

            <div className="form-section">
              <h3 className="section-title">
                <span className="section-icon">🏷️</span>
                Business Details
              </h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">
                    Business Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`form-input ${errors.name ? 'error' : ''}`}
                    placeholder="Enter business name"
                  />
                  {errors.name && <span className="error-message">{errors.name}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="uniqueId" className="form-label">
                    Unique ID <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="uniqueId"
                    name="uniqueId"
                    value={formData.uniqueId}
                    onChange={handleInputChange}
                    className={`form-input ${errors.uniqueId ? 'error' : ''}`}
                    placeholder="Enter unique identifier"
                  />
                  {errors.uniqueId && <span className="error-message">{errors.uniqueId}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="domainName" className="form-label">
                    Domain Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="domainName"
                    name="domainName"
                    value={formData.domainName}
                    onChange={handleInputChange}
                    className={`form-input ${errors.domainName ? 'error' : ''}`}
                    placeholder="e.g. flycanary.store"
                  />
                  {errors.domainName && <span className="error-message">{errors.domainName}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="password" className="form-label">
                    Password <span className="required">*</span>
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`form-input ${errors.password ? 'error' : ''}`}
                    placeholder="Enter password"
                  />
                  {errors.password && <span className="error-message">{errors.password}</span>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="tagline" className="form-label">
                  Tagline
                </label>
                <input
                  type="text"
                  id="tagline"
                  name="tagline"
                  value={formData.tagline}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter tagline"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description" className="form-label">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="form-textarea"
                  placeholder="Enter business description"
                  rows={3}
                />
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">
                <span className="section-icon">📞</span>
                Contact Information
              </h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="contact.email" className="form-label">
                    Contact Email <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    id="contact.email"
                    name="contact.email"
                    value={formData.contact.email}
                    onChange={handleInputChange}
                    className={`form-input ${errors['contact.email'] ? 'error' : ''}`}
                    placeholder="Enter contact email"
                  />
                  {errors['contact.email'] && <span className="error-message">{errors['contact.email']}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="contact.mainPhone" className="form-label">
                    Main Phone <span className="required">*</span>
                  </label>
                  <input
                    type="tel"
                    id="contact.mainPhone"
                    name="contact.mainPhone"
                    value={formData.contact.mainPhone}
                    onChange={handleInputChange}
                    className={`form-input ${errors['contact.mainPhone'] ? 'error' : ''}`}
                    placeholder="Enter main phone number"
                  />
                  {errors['contact.mainPhone'] && (
                    <span className="error-message">{errors['contact.mainPhone']}</span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="contact.secondaryPhone" className="form-label">
                    Secondary Phone
                  </label>
                  <input
                    type="tel"
                    id="contact.secondaryPhone"
                    name="contact.secondaryPhone"
                    value={formData.contact.secondaryPhone}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter secondary phone number"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    <input
                      type="checkbox"
                      name="contact.isEmailVerified"
                      checked={formData.contact.isEmailVerified}
                      onChange={handleCheckboxChange}
                    />
                    Email Verified
                  </label>
                </div>
                <div className="form-group">
                  <label className="form-label">
                    <input
                      type="checkbox"
                      name="contact.isMainPhoneVerified"
                      checked={formData.contact.isMainPhoneVerified}
                      onChange={handleCheckboxChange}
                    />
                    Phone Verified
                  </label>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">
                <span className="section-icon">📍</span>
                Address Details
              </h3>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="address.firstName" className="form-label">
                    First Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="address.firstName"
                    name="address.firstName"
                    value={formData.address.firstName}
                    onChange={handleInputChange}
                    className={`form-input ${errors['address.firstName'] ? 'error' : ''}`}
                    placeholder="Enter first name"
                  />
                  {errors['address.firstName'] && <span className="error-message">{errors['address.firstName']}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="address.lastName" className="form-label">
                    Last Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="address.lastName"
                    name="address.lastName"
                    value={formData.address.lastName}
                    onChange={handleInputChange}
                    className={`form-input ${errors['address.lastName'] ? 'error' : ''}`}
                    placeholder="Enter last name"
                  />
                  {errors['address.lastName'] && <span className="error-message">{errors['address.lastName']}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="address.emailAddress" className="form-label">
                    Email Address <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    id="address.emailAddress"
                    name="address.emailAddress"
                    value={formData.address.emailAddress}
                    onChange={handleInputChange}
                    className={`form-input ${errors['address.emailAddress'] ? 'error' : ''}`}
                    placeholder="Enter email address"
                  />
                  {errors['address.emailAddress'] && (
                    <span className="error-message">{errors['address.emailAddress']}</span>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="address.phoneNumber" className="form-label">
                    Phone Number <span className="required">*</span>
                  </label>
                  <input
                    type="tel"
                    id="address.phoneNumber"
                    name="address.phoneNumber"
                    value={formData.address.phoneNumber}
                    onChange={handleInputChange}
                    className={`form-input ${errors['address.phoneNumber'] ? 'error' : ''}`}
                    placeholder="Enter phone number"
                  />
                  {errors['address.phoneNumber'] && (
                    <span className="error-message">{errors['address.phoneNumber']}</span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="address.addressLine1" className="form-label">
                    Address Line 1 <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="address.addressLine1"
                    name="address.addressLine1"
                    value={formData.address.addressLine1}
                    onChange={handleInputChange}
                    className={`form-input ${errors['address.addressLine1'] ? 'error' : ''}`}
                    placeholder="Building, street, area"
                  />
                  {errors['address.addressLine1'] && (
                    <span className="error-message">{errors['address.addressLine1']}</span>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="address.addressLine2" className="form-label">
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    id="address.addressLine2"
                    name="address.addressLine2"
                    value={formData.address.addressLine2}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Apartment, suite, etc."
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="address.city" className="form-label">
                    City <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="address.city"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleInputChange}
                    className={`form-input ${errors['address.city'] ? 'error' : ''}`}
                    placeholder="Enter city"
                  />
                  {errors['address.city'] && <span className="error-message">{errors['address.city']}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="address.state" className="form-label">
                    State <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="address.state"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleInputChange}
                    className={`form-input ${errors['address.state'] ? 'error' : ''}`}
                    placeholder="Enter state"
                  />
                  {errors['address.state'] && <span className="error-message">{errors['address.state']}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="address.postalCode" className="form-label">
                    Postal Code <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="address.postalCode"
                    name="address.postalCode"
                    value={formData.address.postalCode}
                    onChange={handleInputChange}
                    className={`form-input ${errors['address.postalCode'] ? 'error' : ''}`}
                    placeholder="Enter postal code"
                  />
                  {errors['address.postalCode'] && (
                    <span className="error-message">{errors['address.postalCode']}</span>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="address.country" className="form-label">
                    Country <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="address.country"
                    name="address.country"
                    value={formData.address.country}
                    onChange={handleInputChange}
                    className={`form-input ${errors['address.country'] ? 'error' : ''}`}
                    placeholder="Enter country"
                  />
                  {errors['address.country'] && <span className="error-message">{errors['address.country']}</span>}
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">
                <span className="section-icon">⚙️</span>
                Features & Status
              </h3>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    <input
                      type="checkbox"
                      name="isCategoryEnabled"
                      checked={formData.isCategoryEnabled}
                      onChange={handleCheckboxChange}
                    />
                    Categories Enabled
                  </label>
                </div>
                <div className="form-group">
                  <label className="form-label">
                    <input
                      type="checkbox"
                      name="isSupplier"
                      checked={formData.isSupplier}
                      onChange={handleCheckboxChange}
                    />
                    Supplier
                  </label>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    <input
                      type="checkbox"
                      name="isSeller"
                      checked={formData.isSeller}
                      onChange={handleCheckboxChange}
                    />
                    Seller
                  </label>
                </div>
                <div className="form-group">
                  <label className="form-label">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleCheckboxChange}
                    />
                    Active
                  </label>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    <input
                      type="checkbox"
                      name="isVerified"
                      checked={formData.isVerified}
                      onChange={handleCheckboxChange}
                    />
                    Verified
                  </label>
                </div>
                <div className="form-group">
                  <label className="form-label">
                    <input
                      type="checkbox"
                      name="isDeleted"
                      checked={formData.isDeleted}
                      onChange={handleCheckboxChange}
                    />
                    Mark as Deleted
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  Creating...
                </>
              ) : (
                <>
                  <span className="btn-icon">➕</span>
                  Create Business
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

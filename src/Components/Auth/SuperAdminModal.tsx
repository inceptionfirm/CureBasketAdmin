import React, { useState } from 'react';
import authService, { SuperAdminPayload } from '../../services/authService';
import './SuperAdminModal.css';

interface SuperAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (email: string) => void;
}

interface SuperAdminFormState {
  // Essential user-facing fields only
  name: string;
  password: string;
  address: {
    firstName: string;
    lastName: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  contact: {
    email: string;
    mainPhone: string;
    secondaryPhone: string;
  };
}

const defaultFormState: SuperAdminFormState = {
  name: '',
  password: '',
  address: {
    firstName: '',
    lastName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'INDIA',
  },
  contact: {
    email: '',
    mainPhone: '',
    secondaryPhone: '',
  },
};

const createInitialFormState = (): SuperAdminFormState => ({
  ...defaultFormState,
  address: { ...defaultFormState.address },
  contact: { ...defaultFormState.contact },
});

const SuperAdminModal: React.FC<SuperAdminModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formState, setFormState] = useState<SuperAdminFormState>(() => createInitialFormState());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) {
    return null;
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;

    if (name.startsWith('address.')) {
      const addressKey = name.replace('address.', '') as keyof SuperAdminFormState['address'];
      setFormState(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressKey]: value,
        },
      }));
      return;
    }

    if (name.startsWith('contact.')) {
      const contactKey = name.replace('contact.', '') as keyof SuperAdminFormState['contact'];
      setFormState(prev => ({
        ...prev,
        contact: {
          ...prev.contact,
          [contactKey]: value,
        },
      }));
      return;
    }

        setFormState(prev => ({
          ...prev,
          [name]: value,
        }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Basic validation
    if (!formState.contact.email.trim()) {
      setError('Contact email is required.');
      return;
    }

    if (!formState.password.trim()) {
      setError('Password is required.');
      return;
    }

    if (!formState.name.trim()) {
      setError('Organization name is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Auto-generate fields from user input
      const generateUniqueId = (name: string): string => {
        // Generate unique ID from organization name (uppercase, remove spaces/special chars, max 10 chars)
        return name
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, '')
          .substring(0, 10) || 'ORG' + Date.now().toString().slice(-6);
      };

      const generateDomainName = (email: string): string => {
        // Extract domain from email or use default
        const emailDomain = email.split('@')[1];
        return emailDomain ? emailDomain.split('.')[0] + '.store' : 'flycanary.store';
      };

      // Build payload with only necessary fields matching backend API requirements
      const payload: SuperAdminPayload = {
        name: formState.name,
        uniqueId: generateUniqueId(formState.name),
        domainName: generateDomainName(formState.contact.email),
        password: formState.password,
        role: 'SUPERADMIN',
        tagline: '',
        description: '',
        isCategoryEnabled: true,
        isSupplier: false,
        isSeller: true,
        isActive: true,
        isDeleted: false,
        isVerified: false,
        address: {
          firstName: formState.address.firstName,
          lastName: formState.address.lastName,
          addressLine1: formState.address.addressLine1,
          addressLine2: formState.address.addressLine2 || '',
          city: formState.address.city,
          state: formState.address.state,
          postalCode: formState.address.postalCode,
          country: formState.address.country,
          emailAddress: formState.contact.email,
          phoneNumber: formState.contact.mainPhone,
        },
        contact: {
          email: formState.contact.email,
          mainPhone: formState.contact.mainPhone,
          secondaryPhone: formState.contact.secondaryPhone || '',
          isEmailVerified: false,
          isMainPhoneVerified: false,
        },
      };

      // Get API key from environment variable (set by backend team)
      const apiKey = import.meta.env.VITE_SUPER_ADMIN_API_KEY || '';
      
      if (!apiKey) {
        setError('API key not configured. Please contact support.');
        setIsSubmitting(false);
        return;
      }

      const result = await authService.createSuperAdmin(payload, apiKey);

      if (!result.success) {
        throw new Error(result.message || 'Failed to create super admin');
      }

      const message = result.message || 'Super admin created successfully. You can now log in.';
      setSuccessMessage(message);
      onSuccess?.(payload.contact.email);
      setFormState(createInitialFormState());
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'Failed to create super admin';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormState(createInitialFormState());
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="super-admin-modal__overlay" onClick={handleClose}>
      <div className="super-admin-modal__container" onClick={event => event.stopPropagation()}>
        <div className="super-admin-modal__header">
          <h2>Sign Up</h2>
          <button className="super-admin-modal__close" onClick={handleClose} aria-label="Close">
            ×
          </button>
        </div>

        <form className="super-admin-modal__form" onSubmit={handleSubmit}>
          {error && <div className="super-admin-modal__alert super-admin-modal__alert--error">{error}</div>}
          {successMessage && <div className="super-admin-modal__alert super-admin-modal__alert--success">{successMessage}</div>}

          <section className="super-admin-modal__section">
            <h3>Basic Information</h3>
            <div className="super-admin-modal__grid">
              <label className="super-admin-modal__field">
                <span>First Name</span>
                <input
                  type="text"
                  name="address.firstName"
                  value={formState.address.firstName}
                  onChange={handleInputChange}
                  placeholder="Enter first name"
                  required
                />
              </label>
              <label className="super-admin-modal__field">
                <span>Last Name</span>
                <input
                  type="text"
                  name="address.lastName"
                  value={formState.address.lastName}
                  onChange={handleInputChange}
                  placeholder="Enter last name"
                  required
                />
              </label>
              <label className="super-admin-modal__field">
                <span>Mobile</span>
                <input
                  type="tel"
                  name="contact.mainPhone"
                  value={formState.contact.mainPhone}
                  onChange={handleInputChange}
                  placeholder="Enter mobile number"
                  required
                />
              </label>
              <label className="super-admin-modal__field">
                <span>Email</span>
                <input
                  type="email"
                  name="contact.email"
                  value={formState.contact.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                  required
                />
              </label>
              <label className="super-admin-modal__field">
                <span>Password</span>
                <input
                  type="password"
                  name="password"
                  value={formState.password}
                  onChange={handleInputChange}
                  placeholder="Create a secure password"
                  required
                  minLength={6}
                />
              </label>
              <label className="super-admin-modal__field">
                <span>Organization Name</span>
                <input
                  type="text"
                  name="name"
                  value={formState.name}
                  onChange={handleInputChange}
                  placeholder="Enter organization name"
                  required
                />
              </label>
            </div>
          </section>

  <section className="super-admin-modal__section">
            <h3>Address</h3>
            <div className="super-admin-modal__grid">
              <label className="super-admin-modal__field">
                <span>Address Line 1</span>
                <input
                  type="text"
                  name="address.addressLine1"
                  value={formState.address.addressLine1}
                  onChange={handleInputChange}
                  placeholder="Enter address line 1"
                  required
                />
              </label>
              <label className="super-admin-modal__field">
                <span>Address Line 2 (Optional)</span>
                <input
                  type="text"
                  name="address.addressLine2"
                  value={formState.address.addressLine2}
                  onChange={handleInputChange}
                />
              </label>
              <label className="super-admin-modal__field">
                <span>City</span>
                <input
                  type="text"
                  name="address.city"
                  value={formState.address.city}
                  onChange={handleInputChange}
                  required
                />
              </label>
              <label className="super-admin-modal__field">
                <span>State</span>
                <input
                  type="text"
                  name="address.state"
                  value={formState.address.state}
                  onChange={handleInputChange}
                  required
                />
              </label>
              <label className="super-admin-modal__field">
                <span>Postal Code</span>
                <input
                  type="text"
                  name="address.postalCode"
                  value={formState.address.postalCode}
                  onChange={handleInputChange}
                  required
                />
              </label>
              <label className="super-admin-modal__field">
                <span>Country</span>
                <input
                  type="text"
                  name="address.country"
                  value={formState.address.country}
                  onChange={handleInputChange}
                  required
                />
              </label>
            </div>
          </section>


          <div className="super-admin-modal__footer">
            <button type="button" className="super-admin-modal__button super-admin-modal__button--secondary" onClick={handleClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="super-admin-modal__button super-admin-modal__button--primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SuperAdminModal;


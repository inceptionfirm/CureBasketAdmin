import React, { useState, useEffect } from 'react';
import { Medicine } from '../../services/modules/medicineService';
import './AddMedicineModal.css';

interface AddMedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (medicineData: MedicineFormData) => void;
  editingMedicine?: Medicine | null;
}

interface MedicineFormData {
  name: string;
  description: string;
  category: string;
  manufacturer: string;
  form: string;
  price: number;
  stock: number;
  sku: string;
  status: 'active' | 'inactive';
  prescriptionRequired: boolean;
  image: string;
  barcode?: string;
  countryOfOrigin?: string;
}

const AddMedicineModal: React.FC<AddMedicineModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editingMedicine 
}) => {
  const [formData, setFormData] = useState<MedicineFormData>({
    name: '',
    description: '',
    category: '',
    manufacturer: '',
    form: '',
    price: 0,
    stock: 0,
    sku: '',
    status: 'active',
    prescriptionRequired: false,
    image: '',
    countryOfOrigin: ''
  });

  const [errors, setErrors] = useState<Partial<MedicineFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  // Simplified categories and forms
  const categories = [
    'Antibiotics', 'Pain Relief', 'Vitamins', 'Cold & Flu', 'Digestive',
    'Heart Health', 'Diabetes', 'Skin Care', 'Eye Care', 'Other'
  ];

  const forms = [
    'Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Drops', 'Other'
  ];

  useEffect(() => {
    // Clear errors when modal opens or editingMedicine changes
    setSubmitError(null);
    setErrors({});
    
    if (editingMedicine) {
      console.log('💉 AddMedicineModal: Populating form with editingMedicine:', editingMedicine);
      console.log('💉 AddMedicineModal: Category:', editingMedicine.category);
      console.log('💉 AddMedicineModal: Form:', editingMedicine.form);
      console.log('💉 AddMedicineModal: SKU:', editingMedicine.sku);
      console.log('💉 AddMedicineModal: Country of Origin:', editingMedicine.countryOfOrigin || (editingMedicine as any).countryOfOrigin);
      
      // Ensure form is set from medicineForm, dosageForm, or form
      const formValue = editingMedicine.form || (editingMedicine as any).medicineForm || (editingMedicine as any).dosageForm || '';
      
      // Get countryOfOrigin from multiple possible locations
      const countryOfOriginValue = editingMedicine.countryOfOrigin || 
                                   (editingMedicine as any).countryOfOrigin || 
                                   (editingMedicine as any).country_of_origin ||
                                   '';
      
      setFormData({
        name: editingMedicine.name || '',
        description: editingMedicine.description || '',
        category: editingMedicine.category || '',
        manufacturer: editingMedicine.manufacturer || '',
        form: formValue,
        price: editingMedicine.price || 0,
        stock: (editingMedicine as any).stock || 0,
        sku: editingMedicine.sku || '',
        status: (editingMedicine.status === 'inactive' ? 'inactive' : 'active') as 'active' | 'inactive',
        prescriptionRequired: editingMedicine.prescriptionRequired || false,
        image: editingMedicine.image || '',
        countryOfOrigin: countryOfOriginValue
      });
      
      console.log('💉 AddMedicineModal: Form data set:', {
        category: editingMedicine.category || '',
        form: editingMedicine.form || '',
        sku: editingMedicine.sku || ''
      });
    } else {
      // Reset form when not editing
      setFormData({
        name: '',
        description: '',
        category: '',
        manufacturer: '',
        form: '',
        price: 0,
        stock: 0,
        sku: '',
        status: 'active',
        prescriptionRequired: false,
        image: '',
        countryOfOrigin: ''
      });
    }
  }, [editingMedicine, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) || 0 : value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof MedicineFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (JPG, PNG, GIF, etc.)');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      setSelectedFile(file);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      
      // Clear URL input when file is selected
      setFormData(prev => ({
        ...prev,
        image: ''
      }));
    }
  };

  const handleRemoveFile = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setSelectedFile(null);
    setImagePreview('');
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<MedicineFormData> = {};

    if (!formData.name.trim()) newErrors.name = 'Medicine name is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.manufacturer.trim()) newErrors.manufacturer = 'Manufacturer is required';
    if (!formData.form) newErrors.form = 'Form is required';
    if (formData.price <= 0) newErrors.price = 'Price must be greater than 0';
    if (formData.stock < 0) newErrors.stock = 'Stock cannot be negative';
    if (!formData.sku.trim()) newErrors.sku = 'SKU is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setSubmitError(null);
    
    if (!validateForm()) {
      console.log('❌ Form validation failed');
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('💉 Submitting medicine form:', formData);
      // Await the onSubmit call - it's async and handles the API call
      await onSubmit(formData);
      console.log('✅ Medicine form submitted successfully');
      // Only close modal if submission was successful
      handleClose();
    } catch (error) {
      console.error('❌ Error submitting medicine form:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save medicine. Please try again.';
      setSubmitError(errorMessage);
      // Don't close modal on error - let user see the error and retry
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Clean up file preview URL
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    
    setFormData({
      name: '',
      description: '',
      category: '',
      manufacturer: '',
      form: '',
      price: 0,
      stock: 0,
      sku: '',
      status: 'active',
      prescriptionRequired: false,
      image: '',
      countryOfOrigin: ''
    });
    setErrors({});
    setSelectedFile(null);
    setImagePreview('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="medicine-modal-overlay" onClick={handleClose}>
      <div className="medicine-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="medicine-modal-header">
          <h2 className="medicine-modal-title">
            <span className="medicine-modal-icon">💊</span>
            {editingMedicine ? 'Edit Medicine' : 'Add New Medicine'}
          </h2>
          <button className="medicine-modal-close-btn" onClick={handleClose}>
            ✕
          </button>
        </div>

        <form className="medicine-modal-form" onSubmit={handleSubmit}>
          <div className="medicine-form-content">
            <div className="medicine-form-section">
              <h3 className="section-title">
                <span className="section-icon">📋</span>
                Medicine Information
              </h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">
                    Medicine Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`form-input ${errors.name ? 'error' : ''}`}
                    placeholder="Enter medicine name"
                  />
                  {errors.name && <span className="error-message">{errors.name}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="sku" className="form-label">
                    SKU <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="sku"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    className={`form-input ${errors.sku ? 'error' : ''}`}
                    placeholder="Enter SKU"
                  />
                  {errors.sku && <span className="error-message">{errors.sku}</span>}
                </div>
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
                  placeholder="Enter medicine description"
                  rows={3}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category" className="form-label">
                    Category <span className="required">*</span>
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`form-select ${errors.category ? 'error' : ''}`}
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {errors.category && <span className="error-message">{errors.category}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="manufacturer" className="form-label">
                    Manufacturer <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="manufacturer"
                    name="manufacturer"
                    value={formData.manufacturer}
                    onChange={handleInputChange}
                    className={`form-input ${errors.manufacturer ? 'error' : ''}`}
                    placeholder="Enter manufacturer name"
                  />
                  {errors.manufacturer && <span className="error-message">{errors.manufacturer}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="countryOfOrigin" className="form-label">
                    Country of Origin
                  </label>
                  <input
                    type="text"
                    id="countryOfOrigin"
                    name="countryOfOrigin"
                    value={formData.countryOfOrigin || ''}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter country of origin"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="form" className="form-label">
                    Form <span className="required">*</span>
                  </label>
                  <select
                    id="form"
                    name="form"
                    value={formData.form}
                    onChange={handleInputChange}
                    className={`form-select ${errors.form ? 'error' : ''}`}
                  >
                    <option value="">Select Form</option>
                    {forms.map((form) => (
                      <option key={form} value={form}>{form}</option>
                    ))}
                  </select>
                  {errors.form && <span className="error-message">{errors.form}</span>}
                </div>
              </div>

              <div className="form-row">
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

            <div className="medicine-form-section">
              <h3 className="section-title">
                <span className="section-icon">💰</span>
                Pricing & Stock
              </h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="price" className="form-label">
                    Price (₹) <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className={`form-input ${errors.price ? 'error' : ''}`}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                  {errors.price && <span className="error-message">{errors.price}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="stock" className="form-label">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    id="stock"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    className={`form-input ${errors.stock ? 'error' : ''}`}
                    placeholder="0"
                    min="0"
                  />
                  {errors.stock && <span className="error-message">{errors.stock}</span>}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Medicine Image
                </label>
                
                {/* Image Preview */}
                {(imagePreview || formData.image) && (
                  <div className="image-preview-container">
                    <img 
                      src={imagePreview || formData.image} 
                      alt="Medicine preview" 
                      className="image-preview"
                    />
                    <button 
                      type="button" 
                      className="remove-image-btn"
                      onClick={handleRemoveFile}
                    >
                      ✕
                    </button>
                  </div>
                )}
                
                {/* File Upload Area */}
                <div className="file-upload-container">
                  <div className="file-upload-area">
                    <input
                      type="file"
                      id="file-upload"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="file-input"
                    />
                    <label htmlFor="file-upload" className="file-upload-label">
                      <span className="upload-icon">📷</span>
                      <span className="upload-text">
                        {selectedFile ? 'Change Image' : 'Choose Image File'}
                      </span>
                      <span className="upload-hint">JPG, PNG, GIF (max 5MB)</span>
                    </label>
                  </div>
                  
                  <div className="upload-divider">
                    <span>OR</span>
                  </div>
                  
                  <div className="url-input-container">
                    <input
                      type="url"
                      id="image"
                      name="image"
                      value={formData.image}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Enter image URL"
                      disabled={!!selectedFile}
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="prescriptionRequired"
                    checked={formData.prescriptionRequired}
                    onChange={handleInputChange}
                    className="checkbox-input"
                  />
                  <span className="checkbox-text">Prescription Required</span>
                </label>
              </div>
            </div>
          </div>

          {/* Error message */}
          {submitError && (
            <div style={{ padding: '10px', margin: '10px 20px', background: '#fee', color: '#c33', borderRadius: '4px', border: '1px solid #fcc' }}>
              <strong>Error:</strong> {submitError}
            </div>
          )}
          
          {/* Footer buttons */}
          <div style={{ padding: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #e0e0e0', marginTop: '20px' }}>
            <button type="button" onClick={handleClose} style={{ padding: '10px 20px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} style={{ padding: '10px 20px', background: '#4caf50', color: 'white', border: 'none', borderRadius: '4px', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}>
              {isSubmitting ? (
                <>
                  <span>{editingMedicine ? 'Updating...' : 'Creating...'}</span>
                </>
              ) : (
                <>
                  {editingMedicine ? 'Update Medicine' : 'Add Medicine'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMedicineModal;

import React, { useState, useEffect } from 'react';
import './AddCategoryModal.css';
import '../../styles/global-buttons.css';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  status: 'active' | 'inactive' | 'draft';
  sortOrder: number;
}

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (categoryData: any) => Promise<number | null>; // Returns category ID
  onImageUpload?: (categoryId: number, file: File) => Promise<void>; // Separate image upload
  editingCategory?: Category | null;
}

type ItemTypeOption = 'PRODUCT' | 'SERVICE';
type CategoryState = 'ACTIVE' | 'INACTIVE' | 'DRAFT';

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  status: CategoryState;
  sortOrder: number;
  image: string;
  itemType: ItemTypeOption;
}

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onImageUpload,
  editingCategory
}) => {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    slug: '',
    description: '',
    status: 'ACTIVE',
    sortOrder: 0,
    image: '',
    itemType: 'PRODUCT'
  });

  const [errors, setErrors] = useState<Partial<CategoryFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [categorySaved, setCategorySaved] = useState(false);
  const [savedCategoryId, setSavedCategoryId] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    if (editingCategory) {
      setFormData({
        name: editingCategory.name,
        slug: editingCategory.slug,
        description: editingCategory.description || '',
        status: editingCategory.status.toUpperCase() as CategoryState,
        sortOrder: editingCategory.sortOrder,
        image: editingCategory.image || '',
        itemType: 'PRODUCT'
      });
      if (editingCategory.image) {
        setImagePreview(editingCategory.image);
      }
    } else {
      resetForm();
    }
    setErrors({});
  }, [editingCategory, isOpen]);

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      status: 'ACTIVE',
      sortOrder: 0,
      image: '',
      itemType: 'PRODUCT'
    });
    setErrors({});
    setSelectedFile(null);
    setImagePreview('');
    setCategorySaved(false);
    setSavedCategoryId(null);
    setSubmitError(null);
    setIsSavingCategory(false);
    setIsUploadingImage(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      if (name === 'status' || name === 'itemType') {
        return {
          ...prev,
          [name]: value.toUpperCase() as CategoryFormData[keyof CategoryFormData],
        };
      }

      // Auto-generate slug from name when name changes
      if (name === 'name') {
        const autoSlug = value
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '');
        return {
          ...prev,
          [name]: value,
          slug: autoSlug,
        };
      }

      return {
        ...prev,
        [name]: value,
      };
    });

    if (errors[name as keyof CategoryFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<CategoryFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    }

    // Auto-generate slug if empty (backend doesn't require it, but we validate it if provided)
    if (!formData.slug.trim() && formData.name.trim()) {
      const autoSlug = formData.name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      setFormData(prev => ({ ...prev, slug: autoSlug }));
    }

    // Slug validation is optional - backend generates it from name
    // But if slug is provided, validate it
    if (formData.slug.trim() && !/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug must contain only lowercase letters, numbers, and hyphens';
    }

    if (formData.sortOrder < 0) {
      newErrors.sortOrder = 'Sort order must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Prevent default form submission - we use handleSaveDetails and handleSaveAll instead
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'Image size should be less than 5MB' }));
        return;
      }

      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, image: 'Please select a valid image file' }));
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
      };
      reader.readAsDataURL(file);

      if (errors.image) {
        setErrors(prev => ({ ...prev, image: undefined }));
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setImagePreview('');
    setFormData(prev => ({ ...prev, image: '' }));
  };

  const handleSaveDetails = async () => {
    console.log('📦 handleSaveDetails called');
    console.log('📦 Form data:', formData);

    if (!validateForm()) {
      console.error('❌ Form validation failed');
      console.log('📦 Validation errors:', errors);
      return;
    }

    console.log('✅ Form validation passed');
    setIsSavingCategory(true);
    setSubmitError(null);

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        itemType: formData.itemType,
        status: formData.status
      };

      console.log('📦 Calling onSubmit with payload:', payload);
      const categoryId = await onSubmit(payload);
      console.log('📦 onSubmit returned categoryId:', categoryId);

      if (categoryId) {
        console.log('✅ Category saved successfully with ID:', categoryId);
        setSavedCategoryId(categoryId);
        setCategorySaved(true);
      } else {
        console.error('❌ Category ID not returned from onSubmit');
        throw new Error('Failed to save category details - ID not returned');
      }
    } catch (error) {
      console.error('❌ Error saving category:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save category';
      setSubmitError(errorMessage);
      // Don't reset isSavingCategory here - let user see the error
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleSaveAll = async () => {
    console.log('📦 handleSaveAll called:', {
      categorySaved,
      savedCategoryId,
      selectedFile: selectedFile?.name,
      hasOnImageUpload: !!onImageUpload
    });

    if (!categorySaved || !savedCategoryId) {
      console.log('📦 Details not saved yet, calling handleSaveDetails...');
      await handleSaveDetails();
      return;
    }

    // Upload image if file is selected
    if (selectedFile && onImageUpload && savedCategoryId) {
      console.log('📦 Uploading image:', {
        categoryId: savedCategoryId,
        fileName: selectedFile.name,
        fileSize: selectedFile.size
      });
      setIsUploadingImage(true);
      setSubmitError(null);
      try {
        await onImageUpload(savedCategoryId, selectedFile);
        console.log('✅ Image uploaded successfully, closing modal...');
        resetForm();
        onClose();
      } catch (error) {
        console.error('❌ Error uploading image:', error);
        setSubmitError(error instanceof Error ? error.message : 'Failed to upload image');
        setIsUploadingImage(false);
      }
    } else if (!selectedFile) {
      // No image selected, just close
      console.log('📦 No image selected, closing modal...');
      onClose();
      resetForm();
    } else if (!onImageUpload) {
      console.error('❌ onImageUpload prop not provided');
      setSubmitError('Image upload handler not available. Please refresh the page.');
      setIsUploadingImage(false);
    } else {
      console.error('❌ Missing required data for image upload:', {
        hasSelectedFile: !!selectedFile,
        hasOnImageUpload: !!onImageUpload,
        savedCategoryId
      });
      setSubmitError('Unable to upload image. Missing required data.');
      setIsUploadingImage(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="category-modal-overlay" onClick={handleClose}>
      <div className="category-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="category-modal-header">
          <div className="header-left">
            <span className="header-icon">📁</span>
            <h2 className="category-modal-title">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h2>
          </div>
          <button
            className="category-modal-close-btn"
            onClick={handleClose}
            type="button"
            aria-label="Close modal"
            style={{
              background: 'white',
              border: '2px solid white',
              color: '#dc2626',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '1.25rem',
              fontWeight: 'bold',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
              zIndex: 10000,
              position: 'relative',
              flexShrink: 0,
              opacity: 1,
              visibility: 'visible'
            }}
          >
            ✕
          </button>
        </div>

        <form className="category-modal-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h3 className="section-title">
              <span className="section-icon">📋</span>
              Category Information
            </h3>

            <div className="form-group">
              <label className="form-label">
                Category Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`form-input ${errors.name ? 'error' : ''}`}
                placeholder="Enter category name"
              />
              {errors.name && <div className="error-message">{errors.name}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Slug *
              </label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                className={`form-input ${errors.slug ? 'error' : ''}`}
                placeholder="Enter category slug"
              />
              {errors.slug && <div className="error-message">{errors.slug}</div>}
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
                placeholder="Enter category description"
                rows={3}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="DRAFT">Draft</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Item Type
                </label>
                <select
                  id="itemType"
                  name="itemType"
                  value={formData.itemType}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="PRODUCT">Product</option>
                  <option value="SERVICE">Service</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Sort Order
              </label>
              <input
                type="number"
                id="sortOrder"
                name="sortOrder"
                value={formData.sortOrder}
                onChange={handleInputChange}
                className={`form-input ${errors.sortOrder ? 'error' : ''}`}
                placeholder="Enter sort order"
                min="0"
              />
              {errors.sortOrder && <div className="error-message">{errors.sortOrder}</div>}
            </div>

            {/* Image Section - Moved to bottom after all details */}
          </div>

          {/* Save Details Button - Above Image Section */}
          {!categorySaved && !editingCategory && (
            <div style={{
              marginBottom: '2rem',
              padding: '1rem',
              background: '#f9fafb',
              border: '2px dashed #e5e7eb',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <p style={{
                margin: '0 0 1rem 0',
                fontSize: '0.875rem',
                color: '#6b7280'
              }}>
                Save category details first to enable image upload
              </p>
              <button
                type="button"
                onClick={handleSaveDetails}
                disabled={isSavingCategory}
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 2rem',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: isSavingCategory ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)'
                }}
                onMouseEnter={(e) => {
                  if (!isSavingCategory) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(16, 185, 129, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(16, 185, 129, 0.2)';
                }}
              >
                {isSavingCategory ? (
                  <>
                    <span className="spinner"></span>
                    Saving Details...
                  </>
                ) : (
                  <>
                    <span>💾</span>
                    Save Details
                  </>
                )}
              </button>
            </div>
          )}

          {categorySaved && !editingCategory && (
            <div style={{
              padding: '10px 15px',
              background: '#d1fae5',
              border: '1px solid #10b981',
              borderRadius: '6px',
              color: '#065f46',
              fontSize: '0.875rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>✓</span>
              <span>Category details saved! You can now upload an image.</span>
            </div>
          )}

          <div className="form-section">
            <h3 className="section-title">
              <span className="section-icon">🖼️</span>
              Category Image
            </h3>

            {(imagePreview || formData.image) && (
              <div className="image-preview-container" style={{
                marginBottom: '15px',
                position: 'relative',
                display: 'inline-block'
              }}>
                <img
                  src={imagePreview || formData.image}
                  alt="Category preview"
                  style={{
                    maxWidth: '200px',
                    maxHeight: '200px',
                    borderRadius: '8px',
                    objectFit: 'cover'
                  }}
                />
                {!editingCategory && selectedFile && (
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    style={{
                      position: 'absolute',
                      top: '-10px',
                      right: '-10px',
                      background: '#ff4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            )}

            {editingCategory ? (
              // When editing, show image inputs as disabled (read-only)
              <div className="file-upload-container" style={{
                opacity: 0.5,
                pointerEvents: 'none',
                cursor: 'not-allowed'
              }}>
                <div className="file-upload-area">
                  <input
                    type="file"
                    id="file-upload"
                    accept="image/*"
                    disabled={true}
                    className="file-input"
                  />
                  <label htmlFor="file-upload" className="file-upload-label" style={{
                    cursor: 'not-allowed'
                  }}>
                    <span className="upload-icon">📷</span>
                    <span className="upload-text">Choose Category Image</span>
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
                    disabled={true}
                    style={{ opacity: 0.6, cursor: 'not-allowed' }}
                  />
                </div>
              </div>
            ) : (
              // When creating new category, show upload options
              <>
                <div className="file-upload-container">
                  <div className="file-upload-area" style={{
                    opacity: categorySaved ? 1 : 0.6,
                    pointerEvents: categorySaved ? 'auto' : 'none'
                  }}>
                    <input
                      type="file"
                      id="file-upload"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="file-input"
                      disabled={!categorySaved}
                    />
                    <label htmlFor="file-upload" className="file-upload-label" style={{
                      cursor: categorySaved ? 'pointer' : 'not-allowed'
                    }}>
                      <span className="upload-icon">📷</span>
                      <span className="upload-text">
                        {selectedFile ? 'Change Image' : categorySaved ? 'Choose Category Image' : 'Save details first'}
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
                {errors.image && <span className="error-message">{errors.image}</span>}
              </>
            )}
          </div>

          {submitError && (
            <div className="error-alert" style={{
              padding: '12px',
              background: '#fee',
              border: '1px solid #fcc',
              borderRadius: '6px',
              color: '#c33',
              marginBottom: '15px'
            }}>
              {submitError}
            </div>
          )}
        </form>

        <div className="category-modal-footer">
          <button
            type="button"
            className="btn-cancel"
            onClick={handleClose}
          >
            Cancel
          </button>
          {categorySaved && (
            <button
              type="button"
              className="btn-add"
              onClick={handleSaveAll}
              disabled={isUploadingImage}
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: isUploadingImage ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s'
              }}
            >
              {isUploadingImage ? (
                <>
                  <span className="spinner"></span>
                  Uploading Image...
                </>
              ) : (
                <>
                  <span>✓</span>
                  {selectedFile ? 'Save All & Upload Image' : editingCategory ? 'Update Category' : 'Save All'}
                </>
              )}
            </button>
          )}
          {editingCategory && !categorySaved && (
            <button
              type="button"
              className="btn-add"
              onClick={handleSaveDetails}
              disabled={isSavingCategory}
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: isSavingCategory ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s'
              }}
            >
              {isSavingCategory ? (
                <>
                  <span className="spinner"></span>
                  Updating...
                </>
              ) : (
                <>
                  <span>💾</span>
                  Update Category
                </>
              )}
            </button>
          )}
          {!editingCategory && !categorySaved && (
            <button
              type="button"
              className="btn-add"
              onClick={handleSaveDetails}
              disabled={isSavingCategory}
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: isSavingCategory ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s'
              }}
            >
              {isSavingCategory ? (
                <>
                  <span className="spinner"></span>
                  Saving...
                </>
              ) : (
                <>
                  <span>💾</span>
                  Save Details
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddCategoryModal;

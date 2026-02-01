import React, { useState, useEffect } from 'react';
import { useLocale } from '../../contexts/LocaleContext';
import './AddBannerModal.css';

// Local Banner type for UI (matches BannerManagement component)
interface Banner {
  id: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  linkUrl: string;
  linkText: string;
  position: 'top' | 'middle' | 'bottom' | 'sidebar' | 'popup';
  type: 'hero' | 'promotional' | 'announcement' | 'advertisement' | 'notification';
  status: 'active' | 'inactive' | 'scheduled' | 'expired';
  priority: number;
  startDate: string;
  endDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AddBannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BannerFormData) => Promise<number | null>; // Returns banner ID
  onImageUpload?: (bannerId: number, file: File) => Promise<void>; // Separate image upload
  editingBanner?: Banner | null;
}

interface BannerFormData {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  position: string;
  type: string;
  status: string;
  priority: number;
}

const AddBannerModal: React.FC<AddBannerModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onImageUpload,
  editingBanner
}) => {
  const { t } = useLocale();

  const [formData, setFormData] = useState<BannerFormData>({
    title: '',
    description: '',
    image: '',
    imageAlt: '',
    position: 'top',
    type: 'hero',
    status: 'active',
    priority: 1
  });

  const [errors, setErrors] = useState<Partial<BannerFormData>>({});
  const [isSavingBanner, setIsSavingBanner] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [bannerSaved, setBannerSaved] = useState(false);
  const [savedBannerId, setSavedBannerId] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    if (editingBanner) {
      setFormData({
        title: editingBanner.title || '',
        description: editingBanner.description || '',
        image: editingBanner.image || '',
        imageAlt: editingBanner.imageAlt || '',
        position: editingBanner.position || 'Left',
        type: editingBanner.type || '',
        status: editingBanner.status === 'active' || editingBanner.status === 'inactive' ? editingBanner.status : 'active',
        priority: [1, 2, 3].includes(editingBanner.priority) ? editingBanner.priority : 1
      });
      if (editingBanner.image) {
        setImagePreview(editingBanner.image);
      }
    } else {
      resetForm();
    }
  }, [editingBanner, isOpen]);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image: '',
      imageAlt: '',
      position: 'Left',
      type: '',
      status: 'active',
      priority: 1
    });
    setErrors({});
    setSelectedFile(null);
    setImagePreview('');
    setBannerSaved(false);
    setSavedBannerId(null);
    setSubmitError(null);
    setIsSavingBanner(false);
    setIsUploadingImage(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: name === 'priority' ? parseInt(value) || 1 : value
    }));

    if (errors[name as keyof BannerFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
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
        setFormData(prev => ({ ...prev, image: result }));
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

    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const validateForm = (skipImage: boolean = false): boolean => {
    const newErrors: any = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    // Don't require image when saving details first (image will be uploaded later)
    if (!skipImage && !formData.image.trim() && !selectedFile) {
      newErrors.image = 'Image is required';
    }

    if (!formData.position || (typeof formData.position === 'string' && !formData.position.trim())) {
      newErrors.position = 'Position is required';
    }

    if (!formData.type || (typeof formData.type === 'string' && !formData.type.trim())) {
      newErrors.type = 'Type is required';
    }

    if (![1, 2, 3].includes(formData.priority)) {
      newErrors.priority = 'Priority must be 1, 2, or 3';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveDetails = async () => {
    // Clear previous errors
    setSubmitError(null);

    // Validate form but skip image requirement (image will be uploaded later)
    const isValid = validateForm(true);
    console.log('📢 Form validation result:', isValid, 'Form data:', formData);

    if (!isValid) {
      console.error('❌ Form validation failed:', errors);
      return;
    }

    setIsSavingBanner(true);

    try {
      console.log('📢 Saving banner details - Form data:', formData);
      console.log('📢 Calling onSubmit with formData...');

      // Save banner details first (all details including seoTitle, seoDescription if any)
      const bannerId = await onSubmit(formData);

      console.log('📢 onSubmit returned bannerId:', bannerId);

      if (bannerId) {
        setSavedBannerId(bannerId);
        setBannerSaved(true);
        console.log('✅ Banner details saved successfully with ID:', bannerId);
      } else {
        throw new Error('Failed to get banner ID after save');
      }
    } catch (error) {
      console.error('❌ Error saving banner details:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save banner details. Please try again.';
      setSubmitError(errorMessage);
    } finally {
      setIsSavingBanner(false);
    }
  };

  const handleSaveAll = async () => {
    if (!savedBannerId) {
      setSubmitError('Please save details first');
      return;
    }

    setSubmitError(null);

    // When editing, skip image upload (images are frozen and cannot be updated)
    if (editingBanner) {
      console.log('📢 Editing mode - skipping image upload (images are frozen)');
      handleClose();
      return;
    }

    // If no image selected, just close modal
    if (!selectedFile || !onImageUpload) {
      handleClose();
      return;
    }

    setIsUploadingImage(true);

    try {
      // Upload image if file is selected (only for new banners)
      console.log('📢 Uploading image for banner ID:', savedBannerId);
      await onImageUpload(savedBannerId, selectedFile);
      console.log('✅ Image uploaded successfully');

      // Close modal after successful upload
      handleClose();
    } catch (error) {
      console.error('❌ Error uploading image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload image. Please try again.';
      setSubmitError(errorMessage);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleClose = () => {
    if (imagePreview && !formData.image.startsWith('http')) {
      URL.revokeObjectURL(imagePreview);
    }
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="banner-modal-overlay" onClick={handleClose}>
      <div className="banner-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="banner-modal-header">
          <div className="header-icon">🎯</div>
          <h2 className="banner-modal-title">
            {editingBanner ? 'Edit Banner' : 'Add New Banner'}
          </h2>
          <button
            type="button"
            className="banner-modal-close-btn"
            onClick={handleClose}
          >
            ✕
          </button>
        </div>

        <form className="banner-modal-form" onSubmit={(e) => e.preventDefault()}>
          <div className="banner-form-content">
            <div className="banner-form-section">
              <h3 className="section-title">
                <span className="section-icon">📝</span>
                Banner Information
              </h3>

              <div className="form-group">
                <label htmlFor="title" className="form-label">
                  Banner Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`form-input ${errors.title ? 'error' : ''}`}
                  placeholder="Enter banner title"
                />
                {errors.title && <span className="error-message">{errors.title}</span>}
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
                  placeholder="Enter banner description"
                  rows={3}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="itemType" className="form-label">
                    Item Type
                  </label>
                  <input
                    type="text"
                    id="itemType"
                    name="itemType"
                    value="BANNER"
                    readOnly
                    disabled
                    className="form-input"
                    style={{
                      background: '#f5f5f5',
                      cursor: 'not-allowed',
                      color: '#666'
                    }}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="position" className="form-label">
                    Position *
                  </label>
                  <input
                    type="text"
                    id="position"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className={`form-input ${errors.position ? 'error' : ''}`}
                    placeholder="e.g., Left, Top, Middle"
                  />
                  {errors.position && <span className="error-message">{errors.position}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="type" className="form-label">
                    Type *
                  </label>
                  <input
                    type="text"
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className={`form-input ${errors.type ? 'error' : ''}`}
                    placeholder="e.g., example, promotional, hero"
                  />
                  {errors.type && <span className="error-message">{errors.type}</span>}
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

                <div className="form-group">
                  <label htmlFor="priority" className="form-label">
                    Priority
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className={`form-input ${errors.priority ? 'error' : ''}`}
                  >
                    <option value="1">1 (First Position)</option>
                    <option value="2">2 (Second Position)</option>
                    <option value="3">3 (Third Position)</option>
                  </select>
                  {errors.priority && <span className="error-message">{errors.priority}</span>}
                </div>
              </div>
            </div>

            {/* Save Details Button - Before Image Section */}
            <div style={{ padding: '20px', borderTop: '1px solid #e0e0e0', borderBottom: '1px solid #e0e0e0', margin: '20px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={handleSaveDetails}
                  disabled={isSavingBanner || bannerSaved}
                  style={{
                    padding: '12px 30px',
                    background: bannerSaved ? '#81c784' : '#4caf50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: (isSavingBanner || bannerSaved) ? 'not-allowed' : 'pointer',
                    opacity: bannerSaved ? 0.7 : 1,
                    fontSize: '16px',
                    fontWeight: '500',
                    boxShadow: bannerSaved ? 'none' : '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  {isSavingBanner ? (
                    <span>💾 Saving Details...</span>
                  ) : bannerSaved ? (
                    <span>✅ Details Saved</span>
                  ) : (
                    <span>💾 Save Details</span>
                  )}
                </button>
              </div>
            </div>

            {/* Image Section - Moved to bottom after all details */}
            <div className="banner-form-section">
              <h3 className="section-title">
                <span className="section-icon">🖼️</span>
                Banner Image
              </h3>

              {(imagePreview || formData.image) && (
                <div className="image-preview-container">
                  <img
                    src={imagePreview || formData.image}
                    alt="Banner preview"
                    className="image-preview"
                  />
                  {!editingBanner && (
                    <button
                      type="button"
                      className="remove-image-btn"
                      onClick={handleRemoveFile}
                    >
                      ✕
                    </button>
                  )}
                </div>
              )}

              {editingBanner ? (
                // When editing, show image inputs as disabled (read-only)
                <div className="file-upload-container">
                  <div className="file-upload-area" style={{
                    opacity: 0.5,
                    pointerEvents: 'none',
                    cursor: 'not-allowed'
                  }}>
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
                      <span className="upload-text">Choose Banner Image</span>
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
                // When creating new banner, show upload options
                <>
                  <div className="file-upload-container">
                    <div className="file-upload-area" style={{
                      opacity: bannerSaved ? 1 : 0.6,
                      pointerEvents: bannerSaved ? 'auto' : 'none'
                    }}>
                      <input
                        type="file"
                        id="file-upload"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="file-input"
                        disabled={!bannerSaved}
                      />
                      <label htmlFor="file-upload" className="file-upload-label" style={{
                        cursor: bannerSaved ? 'pointer' : 'not-allowed'
                      }}>
                        <span className="upload-icon">📷</span>
                        <span className="upload-text">
                          {selectedFile ? 'Change Image' : bannerSaved ? 'Choose Banner Image' : 'Save details first'}
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

              <div className="form-group">
                <label htmlFor="imageAlt" className="form-label">
                  Image Alt Text
                </label>
                <input
                  type="text"
                  id="imageAlt"
                  name="imageAlt"
                  value={formData.imageAlt}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter alt text for accessibility"
                />
              </div>
            </div>
          </div>

          {/* Error message */}
          {submitError && (
            <div style={{ padding: '10px', margin: '10px 20px', background: '#fee', color: '#c33', borderRadius: '4px', border: '1px solid #fcc' }}>
              <strong>Error:</strong> {submitError}
            </div>
          )}

          <div className="banner-modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={handleClose}
              className="btn-cancel"
              disabled={isSavingBanner || isUploadingImage}
            >
              Cancel
            </button>

            {/* Save All Button - Uploads image and completes (or just closes when editing) */}
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={!bannerSaved || isUploadingImage}
              style={{
                padding: '10px 20px',
                background: (!bannerSaved || isUploadingImage) ? '#ccc' : '#2196f3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: (!bannerSaved || isUploadingImage) ? 'not-allowed' : 'pointer'
              }}
            >
              {isUploadingImage ? (
                <span>📤 Uploading Image...</span>
              ) : !bannerSaved ? (
                <span>💾 Save Details First</span>
              ) : editingBanner ? (
                <span>✅ Update Banner</span>
              ) : (
                <span>💾 {selectedFile ? 'Save All' : 'Complete'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBannerModal;

import React, { useState, useEffect } from 'react';
import { useLocale } from '../../contexts/LocaleContext';
import { Banner } from '../../services/bannerService';
import './AddBannerModal.css';

interface AddBannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BannerFormData) => void;
  editingBanner?: Banner | null;
}

interface BannerFormData {
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
  endDate: string;
}

const AddBannerModal: React.FC<AddBannerModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingBanner
}) => {
  const { t } = useLocale();
  
  const [formData, setFormData] = useState<BannerFormData>({
    title: '',
    description: '',
    image: '',
    imageAlt: '',
    linkUrl: '',
    linkText: '',
    position: 'top',
    type: 'hero',
    status: 'active',
    priority: 1,
    startDate: '',
    endDate: ''
  });

  const [errors, setErrors] = useState<Partial<BannerFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    if (editingBanner) {
      setFormData({
        title: editingBanner.title || '',
        description: editingBanner.description || '',
        image: editingBanner.image || '',
        imageAlt: editingBanner.imageAlt || '',
        linkUrl: editingBanner.linkUrl || '',
        linkText: editingBanner.linkText || '',
        position: editingBanner.position || 'top',
        type: editingBanner.type || 'hero',
        status: editingBanner.status || 'active',
        priority: editingBanner.priority || 1,
        startDate: editingBanner.startDate ? editingBanner.startDate.split('T')[0] : '',
        endDate: editingBanner.endDate ? editingBanner.endDate.split('T')[0] : ''
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
      linkUrl: '',
      linkText: '',
      position: 'top',
      type: 'hero',
      status: 'active',
      priority: 1,
      startDate: '',
      endDate: ''
    });
    setErrors({});
    setSelectedFile(null);
    setImagePreview('');
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

  const validateForm = (): boolean => {
    const newErrors: Partial<BannerFormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.image.trim()) {
      newErrors.image = 'Image is required';
    }

    if (!formData.position) {
      newErrors.position = 'Position is required';
    }

    if (!formData.type) {
      newErrors.type = 'Type is required';
    }

    if (formData.priority < 1 || formData.priority > 10) {
      newErrors.priority = 'Priority must be between 1 and 10';
    }

    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = 'End date must be after start date';
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
      handleClose();
    } catch (error) {
      console.error('Error submitting banner:', error);
    } finally {
      setIsSubmitting(false);
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

        <form className="banner-modal-form" onSubmit={handleSubmit}>
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
                  <label htmlFor="position" className="form-label">
                    Position *
                  </label>
                  <select
                    id="position"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className={`form-select ${errors.position ? 'error' : ''}`}
                  >
                    <option value="top">Top</option>
                    <option value="middle">Middle</option>
                    <option value="bottom">Bottom</option>
                    <option value="sidebar">Sidebar</option>
                    <option value="popup">Popup</option>
                  </select>
                  {errors.position && <span className="error-message">{errors.position}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="type" className="form-label">
                    Type *
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className={`form-select ${errors.type ? 'error' : ''}`}
                  >
                    <option value="hero">Hero</option>
                    <option value="promotional">Promotional</option>
                    <option value="announcement">Announcement</option>
                    <option value="advertisement">Advertisement</option>
                    <option value="notification">Notification</option>
                  </select>
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
                    <option value="scheduled">Scheduled</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="priority" className="form-label">
                    Priority (1-10)
                  </label>
                  <input
                    type="number"
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className={`form-input ${errors.priority ? 'error' : ''}`}
                    min="1"
                    max="10"
                  />
                  {errors.priority && <span className="error-message">{errors.priority}</span>}
                </div>
              </div>
            </div>

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
                  <button 
                    type="button" 
                    className="remove-image-btn"
                    onClick={handleRemoveFile}
                  >
                    ✕
                  </button>
                </div>
              )}
              
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
                      {selectedFile ? 'Change Image' : 'Choose Banner Image'}
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

            <div className="banner-form-section">
              <h3 className="section-title">
                <span className="section-icon">🔗</span>
                Link & Scheduling
              </h3>

              <div className="form-group">
                <label htmlFor="linkUrl" className="form-label">
                  Link URL
                </label>
                <input
                  type="url"
                  id="linkUrl"
                  name="linkUrl"
                  value={formData.linkUrl}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="https://example.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="linkText" className="form-label">
                  Link Text
                </label>
                <input
                  type="text"
                  id="linkText"
                  name="linkText"
                  value={formData.linkText}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Click here"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="startDate" className="form-label">
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="endDate" className="form-label">
                    End Date
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className={`form-input ${errors.endDate ? 'error' : ''}`}
                  />
                  {errors.endDate && <span className="error-message">{errors.endDate}</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="banner-modal-footer">
            <button
              type="button"
              onClick={handleClose}
              className="btn-cancel"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-add"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : editingBanner ? 'Update Banner' : 'Create Banner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBannerModal;

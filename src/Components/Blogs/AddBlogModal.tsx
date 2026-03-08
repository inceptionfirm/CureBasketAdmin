import React, { useState, useEffect } from 'react';
import { useLocale } from '../../contexts/LocaleContext';
import { categoryService, Category } from '../../services/categoryService';
import './AddBlogModal.css';

// Local Blog type for editing (matches what Blogs component uses)
interface EditingBlog {
  id: string | number;
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  featuredImage?: string;
  category?: {
    id: string;
    name?: string;
  };
  tags?: string[];
  status?: 'draft' | 'published' | 'archived';
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  // Also support API Blog format
  itemName?: string;
  itemHeading?: string;
  itemDescription?: string;
  author?: string | { id?: string; name?: string; email?: string; avatar?: string };
  categoryId?: number | string;
  [key: string]: any; // Allow additional properties
}

interface AddBlogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BlogFormData) => Promise<number | null>; // Returns blog ID
  onImageUpload?: (blogId: number, file: File) => Promise<void>; // Separate image upload
  editingBlog?: EditingBlog | null;
}

interface BlogFormData {
  title: string;
  category: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  content: string;
  excerpt: string;
  seoTitle: string;
  seoDescription: string;
}

const AddBlogModal: React.FC<AddBlogModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onImageUpload,
  editingBlog
}) => {
  const { t } = useLocale();

  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    category: '',
    status: 'DRAFT',
    content: '',
    excerpt: '',
    seoTitle: '',
    seoDescription: ''
  });

  const [errors, setErrors] = useState<Partial<BlogFormData>>({});
  const [isSavingBlog, setIsSavingBlog] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [blogSaved, setBlogSaved] = useState(false);
  const [savedBlogId, setSavedBlogId] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [hasExistingImage, setHasExistingImage] = useState<boolean>(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Fetch categories from API
  useEffect(() => {
    const loadCategories = async () => {
      if (!isOpen) return; // Only fetch when modal is open

      try {
        setLoadingCategories(true);
        const response = await categoryService.getCategories({
          page: 0,
          pageSize: 100,
          filters: {
            status: 'active' // Only fetch active categories
          }
        });

        console.log('📝 AddBlogModal: Fetched categories:', response.categories);
        setCategories(response.categories || []);
      } catch (error) {
        console.error('❌ AddBlogModal: Failed to load categories:', error);
        // Fallback to empty array if API fails
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  useEffect(() => {
    if (editingBlog) {
      // Support both local Blog format and API Blog format
      // Check multiple possible fields for content
      const content = editingBlog.content ||
        (editingBlog as any).itemDescription ||
        editingBlog.excerpt ||
        '';
      const excerpt = editingBlog.excerpt ||
        (editingBlog as any).itemDescription ||
        editingBlog.content ||
        '';

      console.log('📝 Populating form for editing:', {
        editingBlog,
        content,
        excerpt,
        itemDescription: (editingBlog as any).itemDescription
      });

      // Map status to uppercase
      let status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' = 'DRAFT';
      if (editingBlog.status) {
        const statusUpper = String(editingBlog.status).toUpperCase();
        if (statusUpper === 'PUBLISHED') {
          status = 'PUBLISHED';
        } else if (statusUpper === 'ARCHIVED') {
          status = 'ARCHIVED';
        } else {
          status = 'DRAFT';
        }
      }

      setFormData({
        title: editingBlog.title || (editingBlog as any).itemName || '',
        category: editingBlog.category?.name || String((editingBlog as any).category || ''),
        status: status,
        content: content,
        excerpt: excerpt,
        seoTitle: editingBlog.seoTitle || '',
        seoDescription: editingBlog.seoDescription || ''
      });
      if (editingBlog.featuredImage) {
        setImagePreview(editingBlog.featuredImage);
        setHasExistingImage(true); // Mark that there's an existing image from API
      } else {
        setImagePreview('');
        setHasExistingImage(false);
      }
    } else {
      resetForm();
    }
  }, [editingBlog, isOpen]);

  const resetForm = () => {
    setFormData({
      title: '',
      category: '',
      status: 'DRAFT',
      content: '',
      excerpt: '',
      seoTitle: '',
      seoDescription: ''
    });
    setErrors({});
    setSelectedFile(null);
    setImagePreview('');
    setHasExistingImage(false);
    setBlogSaved(false);
    setSavedBlogId(null);
    setSubmitError(null);
    setIsSavingBlog(false);
    setIsUploadingImage(false);
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setFormData(prev => {
      const newData = { ...prev, [name]: value };

      if (name === 'title' && !editingBlog && !newData.seoTitle) {
        newData.seoTitle = value;
      }

      return newData;
    });

    if (errors[name as keyof BlogFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setSubmitError('Image size should be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        setSubmitError('Please select a valid image file');
        return;
      }

      setSelectedFile(file);
      setHasExistingImage(false); // New file selected, so existing image is being replaced
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setImagePreview('');
    setHasExistingImage(false);

    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleReplaceImage = () => {
    // Trigger file input click to allow selecting a new image
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };


  const validateForm = (): boolean => {
    const newErrors: Partial<BlogFormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }

    if (!formData.excerpt.trim()) {
      newErrors.excerpt = 'Excerpt is required';
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    console.log('📝 Form validation result:', isValid, 'Errors:', newErrors);
    return isValid;
  };

  const handleSaveDetails = async () => {
    // Clear previous errors
    setSubmitError(null);

    console.log('📝 Form submit triggered');
    console.log('📝 Form data:', formData);
    console.log('📝 Editing blog?', editingBlog ? 'Yes' : 'No');

    const isValid = validateForm();
    console.log('📝 Form validation result:', isValid);

    // For updates, allow submission even if validation fails
    // The parent component will handle missing content by using editingBlog data
    if (!isValid && !editingBlog) {
      console.log('❌ Blocking submission for new blog due to validation errors');
      return;
    } else if (!isValid && editingBlog) {
      console.log('⚠️ Validation failed but allowing submission (editing mode - will use editingBlog data)');
    }

    setIsSavingBlog(true);

    try {
      console.log('📝 Saving blog details:', formData);
      // Save blog details first (all details including seoTitle, seoDescription)
      const blogId = await onSubmit(formData);

      if (blogId) {
        setSavedBlogId(blogId);
        setBlogSaved(true);
        console.log('✅ Blog details saved successfully with ID:', blogId);
      } else {
        throw new Error('Failed to get blog ID after save');
      }
    } catch (error) {
      console.error('❌ Error saving blog details:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save blog details. Please try again.';
      setSubmitError(errorMessage);
    } finally {
      setIsSavingBlog(false);
    }
  };

  const handleSaveAll = async () => {
    if (!savedBlogId) {
      setSubmitError('Please save details first');
      return;
    }

    setSubmitError(null);

    // If no image selected, just close modal
    if (!selectedFile || !onImageUpload) {
      handleClose();
      return;
    }

    setIsUploadingImage(true);

    try {
      // Upload image if file is selected
      console.log('📝 Uploading image for blog ID:', savedBlogId);
      await onImageUpload(savedBlogId, selectedFile);
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
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="blog-modal-overlay" onClick={handleClose}>
      <div className="blog-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="blog-modal-header">
          <div className="header-icon">📝</div>
          <h2 className="blog-modal-title">
            {editingBlog ? 'Edit Blog Post' : 'Add New Blog Post'}
          </h2>
          <button
            type="button"
            className="blog-modal-close-btn"
            onClick={handleClose}
          >
            ✕
          </button>
        </div>

        <form className="blog-modal-form" onSubmit={(e) => e.preventDefault()}>
          <div className="blog-form-content">
            <div className="blog-form-section">
              <h3 className="section-title">
                <span className="section-icon">📄</span>
                Blog Information
              </h3>

              <div className="form-group">
                <label htmlFor="title" className="form-label">
                  Blog Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`form-input ${errors.title ? 'error' : ''}`}
                  placeholder="Enter blog title"
                />
                {errors.title && <span className="error-message">{errors.title}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category" className="form-label">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="form-select"
                    disabled={loadingCategories}
                  >
                    <option value="">
                      {loadingCategories ? 'Loading categories...' : 'Select Category'}
                    </option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
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
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="excerpt" className="form-label">
                  Excerpt *
                </label>
                <textarea
                  id="excerpt"
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  className={`form-textarea ${errors.excerpt ? 'error' : ''}`}
                  placeholder="Write a brief excerpt of the blog post..."
                  rows={3}
                />
                {errors.excerpt && <span className="error-message">{errors.excerpt}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="content" className="form-label">
                  Content *
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  className={`form-textarea ${errors.content ? 'error' : ''}`}
                  placeholder="Write the full blog content..."
                  rows={8}
                />
                {errors.content && <span className="error-message">{errors.content}</span>}
              </div>
            </div>

            <div className="blog-form-section">
              <h3 className="section-title">
                <span className="section-icon">🔍</span>
                SEO Settings
              </h3>

              <div className="form-group">
                <label htmlFor="seoTitle" className="form-label">
                  SEO Title
                </label>
                <input
                  type="text"
                  id="seoTitle"
                  name="seoTitle"
                  value={formData.seoTitle}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="SEO optimized title"
                />
              </div>

              <div className="form-group">
                <label htmlFor="seoDescription" className="form-label">
                  SEO Description
                </label>
                <textarea
                  id="seoDescription"
                  name="seoDescription"
                  value={formData.seoDescription}
                  onChange={handleInputChange}
                  className="form-textarea"
                  placeholder="SEO meta description"
                  rows={3}
                />
              </div>
            </div>

            {/* Save Details Button - Before Image Section */}
            <div style={{ padding: '20px', borderTop: '1px solid #e0e0e0', borderBottom: '1px solid #e0e0e0', margin: '20px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={handleSaveDetails}
                  disabled={isSavingBlog || blogSaved}
                  style={{
                    padding: '12px 30px',
                    background: blogSaved ? '#81c784' : '#4caf50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: (isSavingBlog || blogSaved) ? 'not-allowed' : 'pointer',
                    opacity: blogSaved ? 0.7 : 1,
                    fontSize: '16px',
                    fontWeight: '500',
                    boxShadow: blogSaved ? 'none' : '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  {isSavingBlog ? (
                    <span>💾 Saving Details...</span>
                  ) : blogSaved ? (
                    <span>✅ Details Saved</span>
                  ) : (
                    <span>💾 Save Details</span>
                  )}
                </button>
              </div>
            </div>

            {/* Image Section - Moved to bottom after all details */}
            <div className="blog-form-section">
              <h3 className="section-title">
                <span className="section-icon">🖼️</span>
                Featured Image
              </h3>

              {imagePreview && (
                <div className="image-preview-container">
                  <img
                    src={imagePreview}
                    alt="Featured image preview"
                    className="image-preview"
                  />
                  <div className="image-preview-actions">
                    {hasExistingImage && !selectedFile && (
                      <button
                        type="button"
                        className="replace-image-btn"
                        onClick={handleReplaceImage}
                        disabled={!blogSaved}
                      >
                        🔄 Replace Image
                      </button>
                    )}
                    <button
                      type="button"
                      className="remove-image-btn"
                      onClick={handleRemoveFile}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}

              <div className="file-upload-container">
                <div className="file-upload-area" style={{
                  opacity: blogSaved ? 1 : 0.6,
                  pointerEvents: blogSaved ? 'auto' : 'none'
                }}>
                  <input
                    type="file"
                    id="file-upload"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="file-input"
                    disabled={!blogSaved}
                  />
                  <label htmlFor="file-upload" className="file-upload-label" style={{
                    cursor: blogSaved ? 'pointer' : 'not-allowed'
                  }}>
                    <span className="upload-icon">📷</span>
                    <span className="upload-text">
                      {selectedFile
                        ? 'Change Image'
                        : hasExistingImage && blogSaved
                          ? 'Replace Image'
                          : blogSaved
                            ? 'Choose Featured Image'
                            : 'Save details first'}
                    </span>
                    <span className="upload-hint">JPG, PNG, GIF (max 5MB)</span>
                  </label>
                </div>

                <div className="upload-divider">
                  <span>OR</span>
                </div>

              </div>
            </div>
          </div>

          {/* Error message */}
          {submitError && (
            <div style={{ padding: '10px', margin: '10px 20px', background: '#fee', color: '#c33', borderRadius: '4px', border: '1px solid #fcc' }}>
              <strong>Error:</strong> {submitError}
            </div>
          )}

          <div className="blog-modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={handleClose}
              className="btn-cancel"
              disabled={isSavingBlog || isUploadingImage}
            >
              Cancel
            </button>

            {/* Save All Button - Uploads image and completes */}
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={!blogSaved || isUploadingImage}
              style={{
                padding: '10px 20px',
                background: (!blogSaved || isUploadingImage) ? '#ccc' : '#2196f3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: (!blogSaved || isUploadingImage) ? 'not-allowed' : 'pointer'
              }}
            >
              {isUploadingImage ? (
                <span>📤 Uploading Image...</span>
              ) : !blogSaved ? (
                <span>💾 Save Details First</span>
              ) : (
                <span>💾 {editingBlog ? 'Update Blog' : (selectedFile ? 'Save All' : 'Complete')}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBlogModal;

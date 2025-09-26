import React, { useState, useEffect } from 'react';
import { useLocale } from '../../contexts/LocaleContext';
import { Blog } from '../../services/blogService';
import './AddBlogModal.css';

interface AddBlogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BlogFormData) => void;
  editingBlog?: Blog | null;
}

interface BlogFormData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  categoryId: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
}

const AddBlogModal: React.FC<AddBlogModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingBlog
}) => {
  const { t } = useLocale();
  
  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    featuredImage: '',
    categoryId: '',
    tags: [],
    status: 'draft',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: []
  });

  const [errors, setErrors] = useState<Partial<BlogFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (editingBlog) {
      setFormData({
        title: editingBlog.title || '',
        slug: editingBlog.slug || '',
        content: editingBlog.content || '',
        excerpt: editingBlog.excerpt || '',
        featuredImage: editingBlog.featuredImage || '',
        categoryId: editingBlog.category?.id || '',
        tags: editingBlog.tags || [],
        status: editingBlog.status || 'draft',
        seoTitle: editingBlog.seoTitle || '',
        seoDescription: editingBlog.seoDescription || '',
        seoKeywords: editingBlog.seoKeywords || []
      });
      if (editingBlog.featuredImage) {
        setImagePreview(editingBlog.featuredImage);
      }
    } else {
      resetForm();
    }
  }, [editingBlog, isOpen]);

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      featuredImage: '',
      categoryId: '',
      tags: [],
      status: 'draft',
      seoTitle: '',
      seoDescription: '',
      seoKeywords: []
    });
    setErrors({});
    setSelectedFile(null);
    setImagePreview('');
    setTagInput('');
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      if (name === 'title' && !editingBlog) {
        newData.slug = generateSlug(value);
        if (!newData.seoTitle) {
          newData.seoTitle = value;
        }
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
        setErrors(prev => ({ ...prev, featuredImage: 'Image size should be less than 5MB' }));
        return;
      }

      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, featuredImage: 'Please select a valid image file' }));
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        setFormData(prev => ({ ...prev, featuredImage: result }));
      };
      reader.readAsDataURL(file);
      
      if (errors.featuredImage) {
        setErrors(prev => ({ ...prev, featuredImage: undefined }));
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setImagePreview('');
    setFormData(prev => ({ ...prev, featuredImage: '' }));
    
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleTagAdd = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeywordAdd = () => {
    if (tagInput.trim() && !formData.seoKeywords.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        seoKeywords: [...prev.seoKeywords, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<BlogFormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }

    if (!formData.excerpt.trim()) {
      newErrors.excerpt = 'Excerpt is required';
    }

    if (!formData.categoryId.trim()) {
      newErrors.categoryId = 'Category is required';
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
      console.error('Error submitting blog:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (imagePreview && !formData.featuredImage.startsWith('http')) {
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

        <form className="blog-modal-form" onSubmit={handleSubmit}>
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

              <div className="form-group">
                <label htmlFor="slug" className="form-label">
                  URL Slug *
                </label>
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  className={`form-input ${errors.slug ? 'error' : ''}`}
                  placeholder="blog-url-slug"
                />
                {errors.slug && <span className="error-message">{errors.slug}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="categoryId" className="form-label">
                    Category *
                  </label>
                  <select
                    id="categoryId"
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    className={`form-select ${errors.categoryId ? 'error' : ''}`}
                  >
                    <option value="">Select Category</option>
                    <option value="health">Health</option>
                    <option value="wellness">Wellness</option>
                    <option value="medicine">Medicine</option>
                    <option value="news">News</option>
                    <option value="tips">Tips</option>
                  </select>
                  {errors.categoryId && <span className="error-message">{errors.categoryId}</span>}
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
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
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
                <span className="section-icon">🖼️</span>
                Featured Image
              </h3>

              {(imagePreview || formData.featuredImage) && (
                <div className="image-preview-container">
                  <img 
                    src={imagePreview || formData.featuredImage} 
                    alt="Featured image preview" 
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
                      {selectedFile ? 'Change Image' : 'Choose Featured Image'}
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
                    id="featuredImage"
                    name="featuredImage"
                    value={formData.featuredImage}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter image URL"
                    disabled={!!selectedFile}
                  />
                </div>
              </div>
              {errors.featuredImage && <span className="error-message">{errors.featuredImage}</span>}
            </div>

            <div className="blog-form-section">
              <h3 className="section-title">
                <span className="section-icon">🏷️</span>
                Tags & SEO
              </h3>

              <div className="form-group">
                <label className="form-label">Tags</label>
                <div className="tag-input-container">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleTagAdd())}
                    className="form-input"
                    placeholder="Add a tag and press Enter"
                  />
                  <button
                    type="button"
                    onClick={handleTagAdd}
                    className="add-tag-btn"
                  >
                    Add
                  </button>
                </div>
                
                <div className="tags-list">
                  {formData.tags.map((tag, index) => (
                    <span key={index} className="tag">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleTagRemove(tag)}
                        className="tag-remove"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>

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
          </div>

          <div className="blog-modal-footer">
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
              {isSubmitting ? 'Saving...' : editingBlog ? 'Update Blog' : 'Create Blog'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBlogModal;

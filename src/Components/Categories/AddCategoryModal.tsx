import React, { useState, useEffect } from 'react';
import './AddCategoryModal.css';
import '../../styles/global-buttons.css';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentCategory?: string;
  image?: string;
  status: 'active' | 'inactive' | 'draft';
  sortOrder: number;
}

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (categoryData: any) => void;
  editingCategory?: Category | null;
}

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  parentCategory: string;
  status: 'active' | 'inactive' | 'draft';
  sortOrder: number;
  image: string;
}

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingCategory
}) => {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    slug: '',
    description: '',
    parentCategory: '',
    status: 'active',
    sortOrder: 0,
    image: ''
  });

  const [errors, setErrors] = useState<Partial<CategoryFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingCategory) {
      setFormData({
        name: editingCategory.name,
        slug: editingCategory.slug,
        description: editingCategory.description || '',
        parentCategory: editingCategory.parentCategory || '',
        status: editingCategory.status,
        sortOrder: editingCategory.sortOrder,
        image: editingCategory.image || ''
      });
    } else {
      setFormData({
        name: '',
        slug: '',
        description: '',
        parentCategory: '',
        status: 'active',
        sortOrder: 0,
        image: ''
      });
    }
    setErrors({});
  }, [editingCategory, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
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

    if (!formData.slug.trim()) {
      newErrors.slug = 'Category slug is required';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
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
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      parentCategory: '',
      status: 'active',
      sortOrder: 0,
      image: ''
    });
    setErrors({});
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
                  Parent Category
                </label>
                <select
                  id="parentCategory"
                  name="parentCategory"
                  value={formData.parentCategory}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="">Select Parent Category</option>
                  <option value="electronics">Electronics</option>
                  <option value="clothing">Clothing</option>
                  <option value="books">Books</option>
                  <option value="home">Home & Garden</option>
                </select>
              </div>

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
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="draft">Draft</option>
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

            <div className="form-group">
              <label className="form-label">
                Category Image URL
              </label>
              <input
                type="url"
                id="image"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter image URL"
              />
            </div>
          </div>

          <div className="category-modal-footer">
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
                  {editingCategory ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                <>
                  <span>+</span>
                  {editingCategory ? 'Update Category' : 'Add Category'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCategoryModal;

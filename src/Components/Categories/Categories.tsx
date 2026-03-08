import React, { useState, useEffect, useCallback } from 'react';
import { useLocale } from '../../contexts/LocaleContext';
import { categoryService } from '../../services/categoryService';
import AddCategoryModal from './AddCategoryModal';
import './Categories.css';
import '../../styles/global-buttons.css';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  status: 'active' | 'inactive' | 'draft';
  sortOrder: number;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

interface CategoryStats {
  totalCategories: number;
  activeCategories: number;
  inactiveCategories: number;
  draftCategories: number;
}

const Categories: React.FC = () => {
  const { t } = useLocale();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<CategoryStats>({
    totalCategories: 0,
    activeCategories: 0,
    inactiveCategories: 0,
    draftCategories: 0
  });
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1
  });

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Try page 0 first (0-indexed, common in backends)
      // If empty, try page 1 (1-indexed, as shown in curl)
      let response = await categoryService.getCategories({
        page: 0, // Try 0-indexed first
        pageSize: 100,
        filters: {
          search: searchTerm || undefined,
          status: statusFilter || undefined
        }
      });

      console.log('📦 Categories component - First attempt (page 0):', response);
      console.log('📦 Categories component - Response.categories length:', response.categories?.length);
      console.log('📦 Categories component - Pagination total:', response.pagination?.total);

      // If content is empty but total > 0, try page 1 (1-indexed)
      if ((!response.categories || response.categories.length === 0) && response.pagination?.total > 0) {
        console.log('📦 Categories component - Content empty but total > 0, trying page 1...');
        response = await categoryService.getCategories({
          page: 1, // Try 1-indexed
          pageSize: 100,
          filters: {
            search: searchTerm || undefined,
            status: statusFilter || undefined
          }
        });
        console.log('📦 Categories component - Second attempt (page 1):', response);
      }

      if (!response || !response.categories) {
        console.error('❌ Invalid response structure:', response);
        throw new Error('Invalid response from server: categories array not found');
      }

      if (!Array.isArray(response.categories)) {
        console.error('❌ Categories is not an array:', response.categories);
        throw new Error('Invalid response: categories is not an array');
      }

      console.log('📦 Setting categories:', response.categories.length, 'categories');
      console.log('📦 Sample category with image:', response.categories.find(c => c.image));
      console.log('📦 Categories with images:', response.categories.filter(c => c.image).map(c => ({ id: c.id, name: c.name, image: c.image })));
      setCategories(response.categories);

      // Calculate stats from categories data (analytics endpoint doesn't exist)
      const totalCategories = response.pagination?.total || response.categories.length;
      const activeCategories = response.categories.filter(c => c.status === 'active').length;
      const inactiveCategories = response.categories.filter(c => c.status === 'inactive').length;
      const draftCategories = response.categories.filter(c => c.status === 'draft').length;

      console.log('📦 Calculated stats:', { totalCategories, activeCategories, inactiveCategories, draftCategories });

      setStats({
        totalCategories,
        activeCategories,
        inactiveCategories,
        draftCategories
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load categories';
      console.error('❌ Error loading categories:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleAddCategory = async (categoryData: any): Promise<number | null> => {
    try {
      setError(null);
      console.log('📦 handleAddCategory called with:', categoryData);
      console.log('📦 Editing category:', editingCategory);

      let categoryId: number | null = null;

      if (editingCategory) {
        // Map form data to API format for update
        const updatePayload = {
          name: categoryData.name,
          description: categoryData.description,
          itemType: categoryData.itemType || 'PRODUCT',
          status: categoryData.status || 'ACTIVE'
        };
        console.log('📦 Calling updateCategory with:', updatePayload);
        const updatedCategory = await categoryService.updateCategory(editingCategory.id, updatePayload);
        console.log('📦 updateCategory response:', updatedCategory);
        categoryId = updatedCategory?.id ? Number(updatedCategory.id) : Number(editingCategory.id);
        console.log('📦 Extracted categoryId from update:', categoryId);
        
        // Reload categories immediately after update to show changes without refresh
        console.log('📦 Reloading categories after update...');
        await loadCategories();
      } else {
        // Map form data to API format for create
        const createPayload = {
          name: categoryData.name,
          description: categoryData.description || '',
          itemType: categoryData.itemType || 'PRODUCT',
          status: categoryData.status || 'ACTIVE'
        };
        console.log('📦 Calling createCategory with:', createPayload);
        const newCategory = await categoryService.createCategory(createPayload);
        console.log('📦 createCategory response:', newCategory);
        categoryId = newCategory?.id ? Number(newCategory.id) : null;
        console.log('📦 Extracted categoryId from create:', categoryId);

        if (!categoryId) {
          console.error('❌ Category ID is null after creation');
          throw new Error('Category created but ID not returned');
        }
        
        // Reload categories immediately after create to show new category
        console.log('📦 Reloading categories after create...');
        await loadCategories();
      }

      console.log('✅ handleAddCategory returning categoryId:', categoryId);
      return categoryId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save category';
      console.error('❌ Error in handleAddCategory:', err);
      setError(errorMessage);
      throw err;
    }
  };

  const handleImageUpload = async (categoryId: number, file: File): Promise<void> => {
    try {
      setError(null);
      console.log('📦 Uploading image for category ID:', categoryId);
      console.log('📦 File details:', {
        name: file.name,
        size: file.size,
        type: file.type
      });

      const result = await categoryService.uploadFiles(categoryId, [file]);
      console.log('✅ Image upload result:', result);

      if (!result.success) {
        throw new Error(result.message || 'Failed to upload image');
      }

      console.log('✅ Image uploaded successfully');
      await loadCategories();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload image';
      console.error('❌ Error uploading image:', err);
      setError(errorMessage);
      throw err;
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsAddCategoryModalOpen(true);
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await categoryService.deleteCategory(id);
        await loadCategories();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete category');
      }
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPagination(prev => ({ ...prev, current: 1 })); // Reset to first page on search
  };

  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      active: 'status-active',
      inactive: 'status-inactive',
      draft: 'status-draft'
    };

    return (
      <span className={`category-status ${statusClasses[status as keyof typeof statusClasses]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredCategories = (categories ?? []).filter(category => {
    const matchesSearch = !searchTerm ||
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category.slug && category.slug.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = !statusFilter || category.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Apply pagination to filtered results
  const paginatedCategories = filteredCategories.slice(
    (pagination.current - 1) * pagination.pageSize,
    pagination.current * pagination.pageSize
  );

  // Update pagination total based on filtered results
  useEffect(() => {
    const total = filteredCategories.length;
    const totalPages = Math.ceil(total / pagination.pageSize);
    setPagination(prev => ({
      ...prev,
      total,
      totalPages: totalPages > 0 ? totalPages : 1
    }));
  }, [filteredCategories.length, pagination.pageSize]);

  console.log('📦 Filtered categories:', {
    totalCategories: categories.length,
    filteredCount: filteredCategories.length,
    searchTerm,
    statusFilter,
    categories: categories.map(c => ({ id: c.id, name: c.name, status: c.status }))
  });

  return (
    <div className="categories-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Categories</h1>
          <p className="page-description">Manage product categories and organize your inventory</p>
        </div>
        <button
          className="add-button"
          onClick={() => setIsAddCategoryModalOpen(true)}
        >
          <span className="button-icon">+</span>
          Add Category
        </button>
      </div>

      <div className="stats-section">
        <div className="stat-item">
          <span className="stat-number">{stats.totalCategories}</span>
          <div className="stat-label">Total Categories</div>
        </div>
        <div className="stat-item">
          <span className="stat-number">{stats.activeCategories}</span>
          <div className="stat-label">Active</div>
        </div>
        <div className="stat-item">
          <span className="stat-number">{stats.inactiveCategories}</span>
          <div className="stat-label">Inactive</div>
        </div>
        <div className="stat-item">
          <span className="stat-number">{stats.draftCategories}</span>
          <div className="stat-label">Draft</div>
        </div>
      </div>

      <div className="categories-container">
        <div className="table-header">
          <h2 className="table-title">All Categories</h2>
        </div>

        <div className="search-filters">
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
          <select
            value={statusFilter}
            onChange={handleStatusFilter}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <div>Loading categories...</div>
          </div>
        ) : error ? (
          <div className="empty-state">
            <div className="empty-state-icon">⚠️</div>
            <div className="empty-state-title">Error</div>
            <div className="empty-state-description">{error}</div>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📁</div>
            <div className="empty-state-title">No categories found</div>
            <div className="empty-state-description">
              {searchTerm || statusFilter
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by adding your first category'
              }
            </div>
          </div>
        ) : (
          <>
            <table className="categories-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Slug</th>
                  <th>Products</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCategories.map((category) => (
                  <tr key={category.id}>
                    <td>
                      <div className="category-image">
                        {category.image && category.image.trim() !== '' ? (
                          <img
                            src={category.image}
                            alt={category.name}
                            className="category-image-preview"
                            onError={(e) => {
                              console.error('❌ Failed to load category image:', category.image, 'for category:', category.name);
                              const target = e.target as HTMLImageElement;
                              const parent = target.parentElement;
                              if (parent) {
                                // Hide the broken image
                                target.style.display = 'none';
                                // Show placeholder if not already present
                                if (!parent.querySelector('.category-image-placeholder')) {
                                  const placeholder = document.createElement('span');
                                  placeholder.className = 'category-image-placeholder';
                                  placeholder.textContent = '📁';
                                  parent.appendChild(placeholder);
                                }
                              }
                            }}
                            onLoad={() => {
                              console.log('✅ Successfully loaded category image:', category.image, 'for category:', category.name);
                            }}
                          />
                        ) : (
                          <span className="category-image-placeholder">📁</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="category-name">{category.name}</div>
                    </td>
                    <td>
                      <div className="category-slug">{category.slug}</div>
                    </td>
                    <td>
                      <div className="category-name">{category.productCount}</div>
                    </td>
                    <td>
                      {getStatusBadge(category.status)}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-edit"
                          onClick={() => handleEditCategory(category)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDeleteCategory(category.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, current: Math.max(1, prev.current - 1) }))}
                  disabled={pagination.current === 1}
                >
                  Previous
                </button>
                <span>
                  Page {pagination.current} of {pagination.totalPages} ({pagination.total} total)
                </span>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, current: Math.min(prev.totalPages, prev.current + 1) }))}
                  disabled={pagination.current >= pagination.totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <AddCategoryModal
        isOpen={isAddCategoryModalOpen}
        onClose={async () => {
          setIsAddCategoryModalOpen(false);
          setEditingCategory(null);
          // Reload categories when modal closes to ensure UI is up-to-date
          // This handles cases where details were saved but no image was uploaded
          await loadCategories();
        }}
        onSubmit={handleAddCategory}
        onImageUpload={handleImageUpload}
        editingCategory={editingCategory}
      />
    </div>
  );
};

export default Categories;

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
  parentCategory?: string;
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

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await categoryService.getCategories({
        page: 1,
        pageSize: 100,
        filters: {
          search: searchTerm || undefined,
          status: statusFilter || undefined
        }
      });
      
      setCategories(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  const loadStats = useCallback(async () => {
    try {
      const analytics = await categoryService.getCategoryAnalytics();
      setStats({
        totalCategories: analytics.totalCategories,
        activeCategories: analytics.activeCategories,
        inactiveCategories: analytics.inactiveCategories,
        draftCategories: analytics.draftCategories
      });
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, []);

  useEffect(() => {
    loadCategories();
    loadStats();
  }, [loadCategories, loadStats]);

  const handleAddCategory = async (categoryData: any) => {
    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, categoryData);
      } else {
        await categoryService.createCategory(categoryData);
      }
      await loadCategories();
      await loadStats();
      setIsAddCategoryModalOpen(false);
      setEditingCategory(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save category');
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
        await loadStats();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete category');
      }
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
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

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || category.status === statusFilter;
    return matchesSearch && matchesStatus;
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
          <table className="categories-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Slug</th>
                <th>Parent</th>
                <th>Products</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((category) => (
                <tr key={category.id}>
                  <td>
                    <div className="category-image">
                      {category.image ? (
                        <img 
                          src={category.image} 
                          alt={category.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }}
                        />
                      ) : (
                        '📁'
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
                    <div className="category-slug">
                      {category.parentCategory || 'Root'}
                    </div>
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
        )}
      </div>

      <AddCategoryModal
        isOpen={isAddCategoryModalOpen}
        onClose={() => {
          setIsAddCategoryModalOpen(false);
          setEditingCategory(null);
        }}
        onSubmit={handleAddCategory}
        editingCategory={editingCategory}
      />
    </div>
  );
};

export default Categories;

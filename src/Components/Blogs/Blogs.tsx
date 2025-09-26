import React, { useState, useEffect, useCallback } from 'react';
import { useLocale } from '../../contexts/LocaleContext';
import { blogService, Blog, BlogStats } from '../../services/blogService';
import AddBlogModal from './AddBlogModal';
import './Blogs.css';
import '../../styles/global-buttons.css';

const Blogs: React.FC = () => {
  const { t } = useLocale();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<BlogStats>({
    totalBlogs: 0,
    publishedBlogs: 0,
    draftBlogs: 0,
    archivedBlogs: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0
  });
  const [isAddBlogModalOpen, setIsAddBlogModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  const loadBlogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock data for now - replace with actual API call later
      const mockBlogs: Blog[] = [
        {
          id: '1',
          title: 'Understanding Diabetes Management',
          slug: 'understanding-diabetes-management',
          content: 'Comprehensive guide to managing diabetes through proper medication and lifestyle changes...',
          excerpt: 'Learn about effective diabetes management strategies including medication, diet, and exercise.',
          featuredImage: '',
          author: {
            id: '1',
            name: 'Dr. Sarah Johnson',
            email: 'sarah@example.com',
            avatar: ''
          },
          category: {
            id: 'health',
            name: 'Health',
            slug: 'health'
          },
          tags: ['diabetes', 'health', 'medication'],
          status: 'published',
          publishedAt: '2024-01-15T10:00:00Z',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z',
          views: 1250,
          likes: 45,
          comments: 12,
          seoTitle: 'Diabetes Management Guide',
          seoDescription: 'Complete guide to diabetes management',
          seoKeywords: ['diabetes', 'health', 'medication']
        },
        {
          id: '2',
          title: 'Essential Vitamins for Daily Health',
          slug: 'essential-vitamins-daily-health',
          content: 'Discover the most important vitamins your body needs daily and how to get them...',
          excerpt: 'A comprehensive guide to essential vitamins and their benefits for overall health.',
          featuredImage: '',
          author: {
            id: '2',
            name: 'Dr. Michael Chen',
            email: 'michael@example.com',
            avatar: ''
          },
          category: {
            id: 'wellness',
            name: 'Wellness',
            slug: 'wellness'
          },
          tags: ['vitamins', 'nutrition', 'wellness'],
          status: 'published',
          publishedAt: '2024-01-10T14:30:00Z',
          createdAt: '2024-01-10T14:30:00Z',
          updatedAt: '2024-01-10T14:30:00Z',
          views: 890,
          likes: 32,
          comments: 8,
          seoTitle: 'Essential Vitamins Guide',
          seoDescription: 'Learn about essential vitamins for health',
          seoKeywords: ['vitamins', 'nutrition', 'health']
        },
        {
          id: '3',
          title: 'Medication Safety Tips',
          slug: 'medication-safety-tips',
          content: 'Important safety guidelines for taking medications properly...',
          excerpt: 'Essential safety tips for medication management and storage.',
          featuredImage: '',
          author: {
            id: '1',
            name: 'Dr. Sarah Johnson',
            email: 'sarah@example.com',
            avatar: ''
          },
          category: {
            id: 'medicine',
            name: 'Medicine',
            slug: 'medicine'
          },
          tags: ['medication', 'safety', 'tips'],
          status: 'draft',
          publishedAt: undefined,
          createdAt: '2024-01-20T09:15:00Z',
          updatedAt: '2024-01-20T09:15:00Z',
          views: 0,
          likes: 0,
          comments: 0,
          seoTitle: 'Medication Safety Guide',
          seoDescription: 'Safety tips for medication use',
          seoKeywords: ['medication', 'safety', 'health']
        }
      ];
      
      setBlogs(mockBlogs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load blogs');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, categoryFilter]);

  const loadStats = useCallback(async () => {
    try {
      // Mock stats for now - replace with actual API call later
      const mockStats: BlogStats = {
        totalBlogs: 3,
        publishedBlogs: 2,
        draftBlogs: 1,
        archivedBlogs: 0,
        totalViews: 2140,
        totalLikes: 77,
        totalComments: 20
      };
      setStats(mockStats);
    } catch (err) {
      console.error('Failed to load blog stats:', err);
    }
  }, []);

  useEffect(() => {
    loadBlogs();
  }, [loadBlogs]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleAddBlog = async (blogData: any) => {
    try {
      // Mock implementation - replace with actual API call later
      console.log('Adding blog:', blogData);
      await loadBlogs();
      await loadStats();
      setIsAddBlogModalOpen(false);
      setEditingBlog(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save blog');
    }
  };

  const handleEditBlog = (blog: Blog) => {
    setEditingBlog(blog);
    setIsAddBlogModalOpen(true);
  };

  const handleDeleteBlog = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      try {
        // Mock implementation - replace with actual API call later
        console.log('Deleting blog:', id);
        await loadBlogs();
        await loadStats();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete blog');
      }
    }
  };

  const handlePublishBlog = async (id: string) => {
    try {
      // Mock implementation - replace with actual API call later
      console.log('Publishing blog:', id);
      await loadBlogs();
      await loadStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish blog');
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  const handleCategoryFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategoryFilter(e.target.value);
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      published: 'status-published',
      draft: 'status-draft',
      archived: 'status-archived'
    };
    
    return (
      <span className={`blog-status ${statusClasses[status as keyof typeof statusClasses] || 'status-draft'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = !searchTerm || 
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || blog.status === statusFilter;
    const matchesCategory = !categoryFilter || blog.category.id === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  if (loading) {
    return (
      <div className="blogs-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading blogs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="blogs-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Blog Management</h1>
          <p className="page-description">Create and manage your blog content</p>
        </div>
        <button
          className="add-button"
          onClick={() => setIsAddBlogModalOpen(true)}
        >
          <span className="button-icon">+</span>
          Add Blog Post
        </button>
      </div>
      
      <div className="stats-section">
        <div className="stat-item">
          <span className="stat-number">{stats.totalBlogs}</span>
          <div className="stat-label">Total Posts</div>
        </div>
        <div className="stat-item">
          <span className="stat-number">{stats.publishedBlogs}</span>
          <div className="stat-label">Published</div>
        </div>
        <div className="stat-item">
          <span className="stat-number">{stats.draftBlogs}</span>
          <div className="stat-label">Drafts</div>
        </div>
        <div className="stat-item">
          <span className="stat-number">{stats.totalViews}</span>
          <div className="stat-label">Total Views</div>
            </div>
          </div>
          
      <div className="search-filters">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search blogs..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>
        
        <div className="filters">
          <select
            value={statusFilter}
            onChange={handleStatusFilter}
            className="filter-select"
          >
            <option value="">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>

          <select
            value={categoryFilter}
            onChange={handleCategoryFilter}
            className="filter-select"
          >
            <option value="">All Categories</option>
            <option value="health">Health</option>
            <option value="wellness">Wellness</option>
            <option value="medicine">Medicine</option>
            <option value="news">News</option>
            <option value="tips">Tips</option>
          </select>
            </div>
          </div>
          
      {error && (
        <div className="error-state">
          <p>Error: {error}</p>
            </div>
      )}

      <div className="blogs-section">
        <div className="section-header">
          <h2 className="section-title">Blog Posts</h2>
          <p className="section-subtitle">Manage your blog content and track performance</p>
        </div>
        
        {filteredBlogs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>No blog posts found</h3>
            <p>Start by creating your first blog post to engage with your audience.</p>
            <button
              className="add-button"
              onClick={() => setIsAddBlogModalOpen(true)}
            >
              <span className="button-icon">+</span>
              Create First Blog Post
            </button>
          </div>
        ) : (
          <div className="blogs-list">
            {filteredBlogs.map((blog) => (
              <div key={blog.id} className="blog-item">
                <div className="blog-image">
                  {blog.featuredImage ? (
                    <img src={blog.featuredImage} alt={blog.title} />
                  ) : (
                    <div className="blog-image-placeholder">📝</div>
                  )}
                </div>
                
                <div className="blog-content">
                  <div className="blog-header">
                    <h3 className="blog-title">{blog.title}</h3>
                    {getStatusBadge(blog.status)}
                  </div>
                  
                  <p className="blog-excerpt">{blog.excerpt}</p>
                  
                  <div className="blog-meta">
                    <span className="blog-author">By {blog.author.name}</span>
                    <span className="blog-category">{blog.category.name}</span>
                    <span className="blog-date">
                      {blog.publishedAt ? formatDate(blog.publishedAt) : formatDate(blog.createdAt)}
                    </span>
                  </div>
                  
                  <div className="blog-stats">
                    <span className="stat">
                      <span className="stat-icon">👁️</span>
                      {blog.views}
                    </span>
                    <span className="stat">
                      <span className="stat-icon">❤️</span>
                      {blog.likes}
                    </span>
                    <span className="stat">
                      <span className="stat-icon">💬</span>
                      {blog.comments}
                    </span>
                  </div>
                </div>
                
                <div className="blog-actions">
                  <button
                    className="btn-edit"
                    onClick={() => handleEditBlog(blog)}
                  >
                    ✏️
                  </button>
                  
                  {blog.status === 'draft' && (
                    <button
                      className="btn-save"
                      onClick={() => handlePublishBlog(blog.id)}
                      title="Publish"
                    >
                      📤
                    </button>
                  )}
                  
                  <button
                    className="btn-delete"
                    onClick={() => handleDeleteBlog(blog.id)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddBlogModal
        isOpen={isAddBlogModalOpen}
        onClose={() => {
          setIsAddBlogModalOpen(false);
          setEditingBlog(null);
        }}
        onSubmit={handleAddBlog}
        editingBlog={editingBlog}
      />
    </div>
  );
};

export default Blogs;

import React, { useState, useEffect, useCallback } from 'react';
import { blogService } from '../../services/blogService';
import AddBlogModal from './AddBlogModal';
import './Blogs.css';
import '../../styles/global-buttons.css';

// Local Blog type for UI display (different from API Blog type)
interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  author: {
    id: string;
    name: string;
    email: string;
    avatar: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  views: number;
  likes: number;
  comments: number;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
}

interface BlogStats {
  totalBlogs: number;
  publishedBlogs: number;
  draftBlogs: number;
  archivedBlogs: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
}

const Blogs: React.FC = () => {
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

  // Helper function to map API blog to frontend format
  const mapApiBlogToFrontend = (apiBlog: any): Blog => {
    // Debug: Log the API blog data to see what fields are available
    console.log('📝 Mapping API blog:', {
      id: apiBlog.id,
      itemName: apiBlog.itemName,
      itemHeading: apiBlog.itemHeading,
      itemDescription: apiBlog.itemDescription,
      fullBlog: apiBlog
    });
    
    // Map status from API (DRAFT, PUBLISHED, ARCHIVED) to frontend format (draft, published, archived)
    let status: 'draft' | 'published' | 'archived' = 'draft';
    if (apiBlog.status) {
      const statusUpper = String(apiBlog.status).toUpperCase();
      if (statusUpper === 'PUBLISHED') {
        status = 'published';
      } else if (statusUpper === 'ARCHIVED') {
        status = 'archived';
      } else {
        status = 'draft';
      }
    } else if (apiBlog.active === true) {
      status = 'published';
    }
    
    // Map title - check multiple possible fields from API
    const title = apiBlog.itemName || 
                  apiBlog.itemHeading || 
                  apiBlog.title || 
                  apiBlog.name || 
                  'Untitled';
    
    // Map slug/heading
    const slug = apiBlog.itemHeading || 
                 apiBlog.slug || 
                 apiBlog.itemName?.toLowerCase().replace(/\s+/g, '-') || 
                 title?.toLowerCase().replace(/\s+/g, '-') || 
                 '';
    
    console.log('📝 Mapped title:', title, 'from itemName:', apiBlog.itemName, 'itemHeading:', apiBlog.itemHeading);
    
    // Map image - check multiple possible fields
    // API might return images in: imageUrl, image, thumbnail, featuredImage, files array, or mainAttributes
    let featuredImage = '';
    if (apiBlog.imageUrl) {
      featuredImage = apiBlog.imageUrl;
    } else if (apiBlog.image) {
      featuredImage = apiBlog.image;
    } else if (apiBlog.thumbnail) {
      featuredImage = apiBlog.thumbnail;
    } else if (apiBlog.featuredImage) {
      featuredImage = apiBlog.featuredImage;
    } else if (apiBlog.files && Array.isArray(apiBlog.files) && apiBlog.files.length > 0) {
      // Check if files array has image URLs
      const imageFile = apiBlog.files.find((f: any) => 
        f.url || f.fileUrl || f.documentUrl || (f.documentType && f.documentType === 'IMAGE')
      );
      if (imageFile) {
        featuredImage = imageFile.url || imageFile.fileUrl || imageFile.documentUrl || '';
      }
    } else if (apiBlog.mainAttributes && Array.isArray(apiBlog.mainAttributes)) {
      // Check mainAttributes for image links
      const imageAttr = apiBlog.mainAttributes.find((attr: any) => 
        attr.name && (attr.name.toLowerCase().includes('image') || attr.name.toLowerCase().includes('photo'))
      );
      if (imageAttr && imageAttr.value) {
        featuredImage = imageAttr.value;
      }
    }
    
    console.log('📝 Mapped image:', featuredImage, 'from API blog:', {
      imageUrl: apiBlog.imageUrl,
      image: apiBlog.image,
      files: apiBlog.files,
      mainAttributes: apiBlog.mainAttributes
    });
    
    // Map API blog format to frontend Blog format
    return {
      id: String(apiBlog.id || ''),
      title: title,
      slug: slug,
      content: apiBlog.itemDescription || apiBlog.content || '',
      excerpt: apiBlog.itemDescription || apiBlog.excerpt || '',
      featuredImage: featuredImage,
      author: {
        id: '1',
        name: apiBlog.author || 'Admin',
        email: '',
        avatar: ''
      },
      category: {
        id: String(apiBlog.categoryId || ''),
        name: 'Uncategorized',
        slug: 'uncategorized'
      },
      tags: Array.isArray(apiBlog.tags) ? apiBlog.tags : [],
      status: status,
      publishedAt: apiBlog.publishDate,
      createdAt: apiBlog.createdAt || new Date().toISOString(),
      updatedAt: apiBlog.updatedAt || apiBlog.createdAt || new Date().toISOString(),
      views: 0,
      likes: 0,
      comments: 0,
      seoTitle: apiBlog.itemName || '',
      seoDescription: apiBlog.itemDescription || '',
      seoKeywords: apiBlog.tags || []
    };
  };

  const loadBlogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📝 Loading blogs from API...');
      
      // Build query parameters
      // Note: sortBy allowed values: ID, ItemType, Category, Status, Title, Content, Excerpt, SEO_Title, SEO_Description
      // Backend requires status parameter - based on API docs example: status=ACTIVE
      // But backend error says "Type" - might be expecting status or type parameter
      const params: any = {
        itemType: 'BLOG',
        page: 0, // 0-indexed
        pageSize: 100, // Get more blogs
        sortBy: 'ID', // Use ID instead of publishDate (not supported)
        sortOrder: 'DESC'
      };
      
      // Backend REQUIRES status/type parameter - cannot be omitted
      // When "All Statuses" is selected (empty filter), fetch all statuses and combine them
      if (!statusFilter || statusFilter.trim() === '') {
        // Fetch blogs with all statuses and combine them
        console.log('📝 No status filter - fetching all statuses (DRAFT, PUBLISHED, ARCHIVED)');
        
        try {
          const allBlogs: Blog[] = [];
          
          // Fetch DRAFT blogs
          const draftParams = { ...params, status: 'DRAFT', type: 'DRAFT' };
          const draftResponse = await blogService.getAllBlogs('ADMIN', draftParams);
          if (draftResponse.blogs) {
            allBlogs.push(...draftResponse.blogs.map(mapApiBlogToFrontend));
          }
          
          // Fetch PUBLISHED blogs
          const publishedParams = { ...params, status: 'PUBLISHED', type: 'PUBLISHED' };
          const publishedResponse = await blogService.getAllBlogs('ADMIN', publishedParams);
          if (publishedResponse.blogs) {
            allBlogs.push(...publishedResponse.blogs.map(mapApiBlogToFrontend));
          }
          
          // Fetch ARCHIVED blogs
          const archivedParams = { ...params, status: 'ARCHIVED', type: 'ARCHIVED' };
          const archivedResponse = await blogService.getAllBlogs('ADMIN', archivedParams);
          if (archivedResponse.blogs) {
            allBlogs.push(...archivedResponse.blogs.map(mapApiBlogToFrontend));
          }
          
          // Sort by ID descending (newest first)
          allBlogs.sort((a, b) => {
            const aId = parseInt(a.id) || 0;
            const bId = parseInt(b.id) || 0;
            return bId - aId;
          });
          
          console.log('📝 Combined blogs from all statuses:', allBlogs.length);
          setBlogs(allBlogs);
          return; // Exit early since we've handled the "all statuses" case
        } catch (err) {
          console.error('❌ Error fetching all statuses:', err);
          // Fall through to single status fetch as fallback
        }
      }
      
      // Single status filter selected - map frontend status to backend format
      let statusValue: string = 'DRAFT'; // Default
      if (statusFilter && statusFilter.trim() !== '') {
        const statusUpper = statusFilter.toUpperCase();
        if (statusUpper === 'PUBLISHED' || statusUpper === 'PUBLISH') {
          statusValue = 'PUBLISHED';
        } else if (statusUpper === 'ARCHIVED') {
          statusValue = 'ARCHIVED';
        } else if (statusUpper === 'DRAFT') {
          statusValue = 'DRAFT';
        }
      }
      
      // Backend requires both 'status' and 'type' parameters (error mentions "Type")
      params.status = statusValue;
      params.type = statusValue;
      
      if (categoryFilter) {
        params.categoryId = categoryFilter;
      }
      
      // Remove any null/undefined/empty values to prevent sending them as query params
      Object.keys(params).forEach(key => {
        if (params[key] === null || params[key] === undefined || params[key] === '') {
          delete params[key];
        }
      });
      
      console.log('📝 Blog list query params (final):', params);
      console.log('📝 Status value being sent:', params.status);
      
      // Call the API
      const response = await blogService.getAllBlogs('ADMIN', params);
      console.log('📝 Blogs API response:', response);
      
      // Check if response has blogs array, if not, use empty array
      const blogsArray = response.blogs || [];
      console.log('📝 Blogs array from response:', blogsArray);
      
      // Map API response to frontend Blog format using helper function
      const mappedBlogs: Blog[] = blogsArray.map(mapApiBlogToFrontend);
      
      console.log('📝 Mapped blogs:', mappedBlogs);
      setBlogs(mappedBlogs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load blogs');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, categoryFilter]);

  const loadStats = useCallback(async () => {
    try {
      // Fetch blogs from all statuses to calculate stats dynamically
      const allBlogs: Blog[] = [];
      
      try {
        // Fetch DRAFT blogs
        const draftParams = { itemType: 'BLOG', page: 0, pageSize: 1000, status: 'DRAFT', type: 'DRAFT', sortBy: 'ID', sortOrder: 'DESC' };
        const draftResponse = await blogService.getAllBlogs('ADMIN', draftParams);
        if (draftResponse.blogs) {
          allBlogs.push(...draftResponse.blogs.map(mapApiBlogToFrontend));
        }
        
        // Fetch PUBLISHED blogs
        const publishedParams = { itemType: 'BLOG', page: 0, pageSize: 1000, status: 'PUBLISHED', type: 'PUBLISHED', sortBy: 'ID', sortOrder: 'DESC' };
        const publishedResponse = await blogService.getAllBlogs('ADMIN', publishedParams);
        if (publishedResponse.blogs) {
          allBlogs.push(...publishedResponse.blogs.map(mapApiBlogToFrontend));
        }
        
        // Fetch ARCHIVED blogs
        const archivedParams = { itemType: 'BLOG', page: 0, pageSize: 1000, status: 'ARCHIVED', type: 'ARCHIVED', sortBy: 'ID', sortOrder: 'DESC' };
        const archivedResponse = await blogService.getAllBlogs('ADMIN', archivedParams);
        if (archivedResponse.blogs) {
          allBlogs.push(...archivedResponse.blogs.map(mapApiBlogToFrontend));
        }
      } catch (fetchError) {
        console.error('Error fetching blogs for stats:', fetchError);
      }
      
      // Calculate stats from fetched blogs
      let publishedBlogs = 0;
      let draftBlogs = 0;
      let archivedBlogs = 0;
      let totalViews = 0;
      let totalLikes = 0;
      let totalComments = 0;
      
      allBlogs.forEach((blog) => {
        const status = blog.status?.toLowerCase() || '';
        if (status === 'published') publishedBlogs++;
        else if (status === 'draft') draftBlogs++;
        else if (status === 'archived') archivedBlogs++;
        
        totalViews += blog.views || 0;
        totalLikes += blog.likes || 0;
        totalComments += blog.comments || 0;
      });
      
      const calculatedStats: BlogStats = {
        totalBlogs: allBlogs.length,
        publishedBlogs,
        draftBlogs,
        archivedBlogs,
        totalViews,
        totalLikes,
        totalComments
      };
      
      console.log('📝 Blog Stats Calculated:', calculatedStats);
      setStats(calculatedStats);
    } catch (err) {
      console.error('Failed to load blog stats:', err);
      // Set default values on error
      setStats({
        totalBlogs: 0,
        publishedBlogs: 0,
        draftBlogs: 0,
        archivedBlogs: 0,
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // mapApiBlogToFrontend is stable, no need to include in deps

  useEffect(() => {
    loadBlogs();
  }, [loadBlogs]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleAddBlog = async (blogData: any) => {
    try {
      setError(null);

      // Map status to backend format: DRAFT, PUBLISHED, ARCHIVED
      let status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' = 'DRAFT';
      if (blogData.status) {
        const statusStr = String(blogData.status).trim().toUpperCase();
        if (statusStr === 'PUBLISHED' || statusStr === 'PUBLISH') {
          status = 'PUBLISHED';
        } else if (statusStr === 'ARCHIVED') {
          status = 'ARCHIVED';
        } else {
          status = 'DRAFT';
        }
      }
      
      if (editingBlog) {
        // For update: build payload with only fields that are being updated
        const updatePayload: any = {};
        
        if (blogData.itemType !== undefined) updatePayload.itemType = blogData.itemType || 'BLOG';
        if (blogData.category !== undefined) updatePayload.category = blogData.category;
        if (blogData.status !== undefined) updatePayload.status = status;
        if (blogData.title !== undefined) updatePayload.title = blogData.title;
        if (blogData.content !== undefined) updatePayload.content = blogData.content;
        if (blogData.excerpt !== undefined) updatePayload.excerpt = blogData.excerpt;
        if (blogData.seoTitle !== undefined) updatePayload.seoTitle = blogData.seoTitle;
        if (blogData.seoDescription !== undefined) updatePayload.seoDescription = blogData.seoDescription;
        
        // Handle legacy field mappings for update
        if (blogData.itemName !== undefined && !updatePayload.title) {
          updatePayload.title = blogData.itemName;
        }
        if (blogData.itemDescription !== undefined && !updatePayload.content) {
          updatePayload.content = blogData.itemDescription;
        }
        if (blogData.categoryId !== undefined && !updatePayload.category) {
          updatePayload.category = blogData.categoryId.toString();
        }
        
        // Remove empty/null values
        Object.keys(updatePayload).forEach(key => {
          if (updatePayload[key] === null || updatePayload[key] === undefined || updatePayload[key] === '') {
            delete updatePayload[key];
          }
        });
        
        if (Object.keys(updatePayload).length === 0) {
          throw new Error('No fields to update');
        }
        
        const blogId = typeof editingBlog.id === 'string' ? Number(editingBlog.id) : editingBlog.id;
        await blogService.updateBlog(blogId, updatePayload);
      } else {
        // For create: send all required fields matching curl structure exactly
        // Map form fields to API payload structure
        const createPayload: any = {
          itemType: 'BLOG',
          category: blogData.category || blogData.categoryId || '',
          status: status,
          title: blogData.title || blogData.itemName || '',
          content: blogData.content || blogData.itemDescription || '',
          excerpt: blogData.excerpt || '',
          seoTitle: blogData.seoTitle || blogData.title || '',
          seoDescription: blogData.seoDescription || blogData.excerpt || ''
        };
        
        console.log('📝 Blog create - Form data received:', blogData);
        console.log('📝 Blog create - Mapped payload before cleanup:', createPayload);
        
        // Remove only null/undefined values, but keep empty strings for optional fields
        // Required fields: itemType, status, title - always keep these
        Object.keys(createPayload).forEach(key => {
          // Always keep required fields
          if (key === 'itemType' || key === 'status' || key === 'title') {
            return;
          }
          // Remove null/undefined, but keep empty strings for optional fields
          if (createPayload[key] === null || createPayload[key] === undefined) {
            delete createPayload[key];
          }
        });
        
        console.log('📝 Blog create - Final payload:', JSON.stringify(createPayload, null, 2));
        
        // Validate required fields
        if (!createPayload.title) {
          throw new Error('Blog title is required');
        }
        
        await blogService.createBlog(createPayload);
      }
      
      await loadBlogs();
      await loadStats();
      setIsAddBlogModalOpen(false);
      setEditingBlog(null);
    } catch (err: any) {
      console.error('❌ Error saving blog - Full error:', err);
      
      // Extract detailed error message
      let errorMessage = 'Failed to save blog';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (err?.error) {
        errorMessage = err.error;
      } else if (err?.message) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      // Check if there's a response with error details
      if (err?.data) {
        const errorData = err.data;
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      }
      
      console.error('❌ Error message to display:', errorMessage);
      setError(errorMessage);
      
      // Don't close modal on error so user can fix and retry
      // setIsAddBlogModalOpen(false);
      // setEditingBlog(null);
    }
  };

  const handleEditBlog = (blog: Blog) => {
    setEditingBlog(blog);
    setIsAddBlogModalOpen(true);
  };

  const handleDeleteBlog = async (id: string | number) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      try {
        setError(null);
        const blogId = typeof id === 'string' ? Number(id) : id;
        await blogService.deleteBlog(blogId);
        await loadBlogs();
        await loadStats();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete blog';
        console.error('❌ Error deleting blog:', err);
        setError(errorMessage);
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

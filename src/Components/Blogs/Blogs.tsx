import React, { useState, useEffect, useCallback } from 'react';
import { blogService } from '../../services/blogService';
import { catalogService } from '../../services/catalogService';
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
  enabled?: boolean; // Added to track enabled status
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
}

interface BlogStats {
  totalBlogs: number;
  publishedBlogs: number;
  draftBlogs: number;
  archivedBlogs: number;
}

const Blogs: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<BlogStats>({
    totalBlogs: 0,
    publishedBlogs: 0,
    draftBlogs: 0,
    archivedBlogs: 0
  });
  const [isAddBlogModalOpen, setIsAddBlogModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1
  });

  // Helper function to calculate stats from blogs array
  const calculateStats = useCallback((blogsArray: Blog[]) => {
    let publishedBlogs = 0;
    let draftBlogs = 0;
    let archivedBlogs = 0;

    blogsArray.forEach((blog) => {
      const status = blog.status?.toLowerCase() || '';
      if (status === 'published') publishedBlogs++;
      else if (status === 'draft') draftBlogs++;
      else if (status === 'archived') archivedBlogs++;
    });

    const calculatedStats: BlogStats = {
      totalBlogs: blogsArray.length,
      publishedBlogs,
      draftBlogs,
      archivedBlogs
    };

    console.log('📝 Blog Stats Calculated:', calculatedStats);
    setStats(calculatedStats);
  }, []);

  // Helper function to map API blog to frontend format
  const mapApiBlogToFrontend = (apiBlog: any): Blog => {
    // Debug: Log the API blog data to see what fields are available
    console.log('📝 Mapping API blog:', {
      id: apiBlog.id,
      title: apiBlog.title,
      content: apiBlog.content,
      excerpt: apiBlog.excerpt,
      category: apiBlog.category,
      status: apiBlog.status,
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
    // API might return: title, itemName, itemHeading, name
    const title = apiBlog.title ||
      apiBlog.itemName ||
      apiBlog.itemHeading ||
      apiBlog.name ||
      'Untitled';

    // Map slug/heading
    const slug = apiBlog.itemHeading ||
      apiBlog.slug ||
      apiBlog.itemName?.toLowerCase().replace(/\s+/g, '-') ||
      title?.toLowerCase().replace(/\s+/g, '-') ||
      '';

    // console.log('📝 Mapped title:', title, 'from itemName:', apiBlog.itemName, 'itemHeading:', apiBlog.itemHeading);

    // Map image - check multiple possible fields
    // API might return images in: image, imageUrl, thumbnail, featuredImage, fileUrl, files array, or mainAttributes
    // Extract image from multiple possible sources
    let featuredImage = '';

    // First check direct image fields (in order of priority)
    if (apiBlog.image) {
      featuredImage = apiBlog.image;
    } else if (apiBlog.imageUrl) {
      featuredImage = apiBlog.imageUrl;
    } else if (apiBlog.thumbnail) {
      featuredImage = apiBlog.thumbnail;
    } else if (apiBlog.featuredImage) {
      featuredImage = apiBlog.featuredImage;
    } else if (apiBlog.fileUrl) {
      featuredImage = apiBlog.fileUrl;
    } else if (typeof apiBlog.files === 'string') {
      // If files is a string (comma-separated URLs)
      featuredImage = apiBlog.files.split(',')[0].trim();
    } else if (apiBlog.files && Array.isArray(apiBlog.files) && apiBlog.files.length > 0) {
      // API returns files array with docPath field
      // Use the first file's docPath (API structure: files[0].docPath)
      // Priority: docPath > fileUrl > url > file_path > path > documentUrl
      const firstFile = apiBlog.files[0];
      if (firstFile) {
        if (typeof firstFile === 'string') {
          // If file is a string, use it directly
          featuredImage = firstFile;
        } else if (firstFile.docPath) {
          // API returns docPath field (e.g., "/files/CATALOG_ITEM/image.png" or full URL)
          featuredImage = firstFile.docPath;
          console.log('📝 Found image in files[0].docPath:', featuredImage);
        } else {
          // Fallback to other possible field names
          featuredImage = firstFile.fileUrl ||
            firstFile.url ||
            firstFile.file_path ||
            firstFile.path ||
            firstFile.documentUrl || '';
          if (featuredImage) {
            console.log('📝 Found image in files[0] fallback field:', featuredImage);
          }
        }
      }
    } else if (apiBlog.mainAttributes && Array.isArray(apiBlog.mainAttributes)) {
      // Check mainAttributes for image links
      const imageAttr = apiBlog.mainAttributes.find((attr: any) =>
        attr.name && (
          attr.name.toLowerCase().includes('image') ||
          attr.name.toLowerCase().includes('photo') ||
          attr.name.toLowerCase().includes('picture') ||
          attr.name.toLowerCase().includes('file')
        ) && attr.value
      );
      if (imageAttr && imageAttr.value) {
        featuredImage = imageAttr.value;
      }
    }

    // Normalize image URL (add base URL if relative)
    // Images are served from https://api.curebasket.com (without /backend)
    // Example: "/files/CATALOG_ITEM/image.png" -> "https://api.curebasket.com/files/CATALOG_ITEM/image.png"
    const normalizeImageUrl = (imgUrl: string): string => {
      if (!imgUrl || imgUrl.trim() === '') {
        console.log('⚠️ Empty image URL, returning empty string');
        return '';
      }

      // If already a full URL, return as is
      if (imgUrl.startsWith('http://') || imgUrl.startsWith('https://') || imgUrl.startsWith('data:')) {
        console.log('✅ Image URL is already full URL:', imgUrl);
        return imgUrl;
      }

      // Base URL for images (without /backend)
      const imageBaseURL = 'https://api.curebasket.com';

      // If path starts with /, append directly, otherwise add /
      const normalized = imgUrl.startsWith('/')
        ? `${imageBaseURL}${imgUrl}`
        : `${imageBaseURL}/${imgUrl}`;

      console.log('📝 Normalized image URL:', imgUrl, '->', normalized);
      return normalized;
    };

    // Normalize the image URL to full URL
    featuredImage = normalizeImageUrl(featuredImage);

    // Debug log to verify image URLs
    console.log('📝 Blog image mapped:', {
      blogId: apiBlog.id || apiBlog.ID,
      originalImage: apiBlog.image || apiBlog.imageUrl || apiBlog.files?.[0]?.docPath || apiBlog.files?.[0] || 'none',
      filesArray: apiBlog.files,
      normalizedUrl: featuredImage,
      source: apiBlog.image ? 'image' : apiBlog.imageUrl ? 'imageUrl' : apiBlog.files ? 'files' : apiBlog.mainAttributes ? 'attributes' : 'none'
    });

    // Map content and excerpt - API returns these directly
    const content = apiBlog.content || apiBlog.itemDescription || '';
    const excerpt = apiBlog.excerpt || apiBlog.itemDescription || content.substring(0, 150) || '';

    // Map category - API returns category as string
    const categoryName = apiBlog.category || apiBlog.categoryName || 'Uncategorized';
    const categoryId = String(apiBlog.categoryId || apiBlog.id || '');

    // Map API blog format to frontend Blog format
    return {
      id: String(apiBlog.id || ''),
      title: title,
      slug: slug,
      content: content,
      excerpt: excerpt,
      featuredImage: featuredImage,
      author: {
        id: String(apiBlog.authorId || apiBlog.userId || '1'),
        name: apiBlog.author || apiBlog.authorName || 'Admin',
        email: apiBlog.authorEmail || '',
        avatar: apiBlog.authorAvatar || ''
      },
      category: {
        id: categoryId,
        name: categoryName,
        slug: categoryName.toLowerCase().replace(/\s+/g, '-')
      },
      tags: Array.isArray(apiBlog.tags) ? apiBlog.tags : (apiBlog.tags ? [apiBlog.tags] : []),
      status: status,
      enabled: apiBlog.enabled !== undefined ? apiBlog.enabled : true, // Default to true if not specified
      publishedAt: apiBlog.publishDate || apiBlog.publishedAt,
      createdAt: apiBlog.createdAt || apiBlog.createdDate || new Date().toISOString(),
      updatedAt: apiBlog.updatedAt || apiBlog.updatedDate || apiBlog.createdAt || new Date().toISOString(),
      seoTitle: apiBlog.seoTitle || apiBlog.seo_title || title,
      seoDescription: apiBlog.seoDescription || apiBlog.seo_description || excerpt,
      seoKeywords: Array.isArray(apiBlog.seoKeywords) ? apiBlog.seoKeywords : (apiBlog.tags || [])
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
            const publishedBlogs = publishedResponse.blogs.map(mapApiBlogToFrontend);
            allBlogs.push(...publishedBlogs);

            // Log warning if some published blogs are missing (enabled: false)
            if (publishedResponse.pagination && publishedResponse.pagination.total > publishedBlogs.length) {
              const missingCount = publishedResponse.pagination.total - publishedBlogs.length;
              console.warn(`⚠️ Warning: ${missingCount} published blog(s) are disabled (enabled: false) and will NOT appear on the website. Total published: ${publishedResponse.pagination.total}, Returned: ${publishedBlogs.length}`);
            }
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
          console.log('📝 Sample blog after mapping:', allBlogs[0]);
          if (allBlogs.length > 0) {
            setBlogs(allBlogs);
            console.log('✅ Blogs set in state:', allBlogs.length);
          } else {
            console.warn('⚠️ No blogs to set');
            setBlogs([]);
          }
          setLoading(false);

          // Calculate stats from the loaded blogs (no need to fetch again)
          calculateStats(allBlogs);

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

      console.log('📝 Mapped blogs count:', mappedBlogs.length);
      console.log('📝 Sample mapped blog:', mappedBlogs[0]);
      setBlogs(mappedBlogs);

      // Calculate stats from loaded blogs
      calculateStats(mappedBlogs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load blogs');
    } finally {
      setLoading(false);
    }
  }, []); // Only load once on mount - filtering is done client-side

  // Removed loadStats function - stats are now calculated directly from loaded blogs
  // This eliminates duplicate API calls

  useEffect(() => {
    loadBlogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Load blogs only once on mount - stats will be calculated from loaded blogs

  // Remove separate loadStats call on mount - stats are now calculated from loaded blogs
  // loadStats will only be called when explicitly needed (e.g., after operations)

  const handleAddBlog = async (blogData: any): Promise<number | null> => {
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

        // CRITICAL: Always set enabled to true when updating, especially for published blogs
        // Check both the NEW status (if being changed) and the CURRENT status (from editingBlog)
        // Handle both lowercase and uppercase status values
        const currentStatusRaw = editingBlog.status || '';
        const currentStatus = String(currentStatusRaw).toUpperCase();
        const newStatus = status || currentStatus;
        const isPublished = newStatus === 'PUBLISHED' || currentStatus === 'PUBLISHED';

        console.log('📝 Blog update - Status check:', {
          editingBlogId: editingBlog.id,
          currentStatusRaw,
          currentStatus,
          newStatus,
          status,
          isPublished,
          currentEnabled: (editingBlog as any).enabled,
          editingBlogFull: editingBlog
        });

        // ALWAYS include enabled field for published blogs - even if no other fields are being updated
        // This ensures published blogs stay enabled
        if (isPublished) {
          updatePayload.enabled = true;
          console.log('📝 Blog is PUBLISHED - FORCING enabled: true');
        } else {
          // For DRAFT/ARCHIVED, preserve existing enabled status or default to true
          const currentEnabled = (editingBlog as any).enabled;
          updatePayload.enabled = currentEnabled !== undefined ? currentEnabled : true;
          console.log('📝 Blog is not PUBLISHED - setting enabled:', updatePayload.enabled);
        }

        // IMPORTANT: If blog is published but enabled is false, ALWAYS send enabled: true
        // This fixes existing disabled published blogs
        if (currentStatus === 'PUBLISHED' && (editingBlog as any).enabled === false) {
          updatePayload.enabled = true;
          console.log('📝 FIXING: Published blog with enabled=false - forcing enabled: true');
        }

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

        // Remove empty/null values (but keep enabled field even if it's false)
        Object.keys(updatePayload).forEach(key => {
          if (key === 'enabled') {
            // Always keep enabled field - don't delete it
            return;
          }
          if (updatePayload[key] === null || updatePayload[key] === undefined || updatePayload[key] === '') {
            delete updatePayload[key];
          }
        });

        // IMPORTANT: Even if no other fields are being updated, if blog is published and disabled,
        // we MUST send enabled: true to fix it
        if (Object.keys(updatePayload).length === 0) {
          // Check if we need to fix enabled status
          const currentStatusRaw = editingBlog.status || '';
          const currentStatus = String(currentStatusRaw).toUpperCase();
          if (currentStatus === 'PUBLISHED' && (editingBlog as any).enabled === false) {
            updatePayload.enabled = true;
            console.log('📝 No other fields to update, but fixing enabled status for published blog');
          } else {
            throw new Error('No fields to update');
          }
        }

        const blogId = typeof editingBlog.id === 'string' ? Number(editingBlog.id) : editingBlog.id;

        // Log the final payload before sending
        console.log('📝 Blogs.tsx - Final update payload before sending:', JSON.stringify(updatePayload, null, 2));
        console.log('📝 Blogs.tsx - Payload includes enabled?', 'enabled' in updatePayload, 'Value:', updatePayload.enabled);
        console.log('📝 Blogs.tsx - Updating blog ID:', blogId);

        const updateResult = await blogService.updateBlog(blogId, updatePayload);
        console.log('📝 Blogs.tsx - Update result:', updateResult);

        // WORKAROUND: If status is PUBLISHED, make a separate API call to enable the blog
        // The backend might not accept enabled field in update endpoint, so we use catalog service
        if (isPublished) {
          try {
            console.log('📝 Blogs.tsx - Enabling blog via catalog service (workaround for backend issue)...');
            await catalogService.enableCatalogItem(blogId);
            console.log('✅ Blogs.tsx - Blog enabled successfully via catalog service');
          } catch (enableError) {
            console.warn('⚠️ Blogs.tsx - Failed to enable blog via catalog service:', enableError);
            // Don't throw error - the update might have succeeded even if enable failed
            // This is a workaround, so we don't want to block the update
          }
        }

        // Reload blogs immediately after update to reflect changes
        await loadBlogs();

        return blogId;
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
          seoTitle: blogData.seoTitle || '', // Use actual seoTitle from form, not fallback
          seoDescription: blogData.seoDescription || '' // Use actual seoDescription from form, not fallback
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

        // Create blog first (without image)
        const createResult = await blogService.createBlog(createPayload);
        console.log('✅ Blog created successfully:', createResult);

        // Get the blog ID from response
        if (createResult.data?.id) {
          const newBlogId = Number(createResult.data.id);
          console.log('📝 New blog ID:', newBlogId);
          return newBlogId;
        } else {
          throw new Error('Blog created but no ID returned');
        }
      }
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
      throw err; // Re-throw so modal can catch it
    }
  };

  const handleImageUpload = async (blogId: number, file: File): Promise<void> => {
    try {
      setError(null);
      console.log('📝 Uploading image for blog ID:', blogId);

      await blogService.uploadFiles(blogId, [file]);
      console.log('✅ Image uploaded successfully');

      // Reload blogs list after successful image upload
      await loadBlogs();
      // Stats are calculated in loadBlogs, no need to call loadStats separately
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload image';
      console.error('❌ Error uploading image:', err);
      setError(errorMessage);
      throw err; // Re-throw so modal can catch it
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
        // Stats are calculated in loadBlogs, no need to call loadStats separately
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
      // Stats are calculated in loadBlogs, no need to call loadStats separately
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish blog');
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
    if (!blog || !blog.title) return false;

    const matchesSearch = !searchTerm ||
      (blog.title && blog.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (blog.excerpt && blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase()));

    // Map frontend status to match API status format
    let blogStatus = blog.status?.toLowerCase() || '';
    let filterStatus = statusFilter?.toLowerCase() || '';

    const matchesStatus = !statusFilter || blogStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Apply pagination to filtered results
  const paginatedBlogs = filteredBlogs.slice(
    (pagination.current - 1) * pagination.pageSize,
    pagination.current * pagination.pageSize
  );

  // Update pagination total based on filtered results
  useEffect(() => {
    const total = filteredBlogs.length;
    const totalPages = Math.ceil(total / pagination.pageSize);
    console.log('📝 Blog pagination update:', { total, totalPages, pageSize: pagination.pageSize, shouldShow: total > pagination.pageSize });
    setPagination(prev => ({
      ...prev,
      total,
      totalPages
    }));
  }, [filteredBlogs.length, pagination.pageSize]);

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

      {loading && (
        <div style={{ padding: '1rem', textAlign: 'center', background: 'white', margin: '1rem', borderRadius: '8px' }}>
          <p>Loading blogs...</p>
        </div>
      )}

      <div className="stats-section">
        <div className="stat-item">
          <span className="stat-number">{loading ? '...' : stats.totalBlogs}</span>
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
          <span className="stat-number">{stats.archivedBlogs}</span>
          <div className="stat-label">Archived</div>
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

        </div>
      </div>

      {error && (
        <div className="error-state" style={{
          padding: '1rem',
          margin: '1rem',
          background: '#fee',
          color: '#c33',
          borderRadius: '8px',
          border: '1px solid #fcc'
        }}>
          <p><strong>Error:</strong> {error}</p>
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
          <>
            {/* Pagination - Above the list */}
            {filteredBlogs.length > pagination.pageSize && (
              <div className="pagination" style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px',
                padding: '20px',
                marginBottom: '20px'
              }}>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, current: prev.current - 1 }))}
                  disabled={pagination.current === 1}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    background: pagination.current === 1 ? '#f5f5f5' : 'white',
                    cursor: pagination.current === 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  Previous
                </button>
                <span style={{ padding: '0 10px' }}>
                  Page {pagination.current} of {pagination.totalPages} ({pagination.total} total)
                </span>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, current: prev.current + 1 }))}
                  disabled={pagination.current >= pagination.totalPages}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    background: pagination.current >= pagination.totalPages ? '#f5f5f5' : 'white',
                    cursor: pagination.current >= pagination.totalPages ? 'not-allowed' : 'pointer'
                  }}
                >
                  Next
                </button>
              </div>
            )}

            <div className="blogs-list">
              {paginatedBlogs.map((blog) => (
                <div key={blog.id} className="blog-item">
                  <div className="blog-image">
                    {blog.featuredImage && blog.featuredImage.trim() !== '' ? (
                      <img
                        src={blog.featuredImage}
                        alt={blog.title}
                        style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          console.error('❌ Image failed to load:', blog.featuredImage, 'for blog:', blog.title);
                          const target = e.currentTarget;
                          target.style.display = 'none';
                          // Show placeholder if image fails
                          const placeholder = target.parentElement?.querySelector('.blog-image-placeholder') as HTMLElement;
                          if (placeholder) {
                            placeholder.style.display = 'flex';
                          }
                        }}
                        onLoad={(e) => {
                          console.log('✅ Image loaded successfully:', blog.featuredImage, 'for blog:', blog.title);
                          // Hide placeholder when image loads
                          const placeholder = e.currentTarget.parentElement?.querySelector('.blog-image-placeholder') as HTMLElement;
                          if (placeholder) {
                            placeholder.style.display = 'none';
                          }
                        }}
                      />
                    ) : null}
                    <div className="blog-image-placeholder" style={{ display: blog.featuredImage && blog.featuredImage.trim() !== '' ? 'none' : 'flex' }}>📝</div>
                  </div>

                  <div className="blog-content">
                    <div className="blog-header">
                      <h3 className="blog-title">{blog.title}</h3>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        {getStatusBadge(blog.status)}
                        {blog.status === 'published' && blog.enabled === false && (
                          <span
                            style={{
                              padding: '0.25rem 0.75rem',
                              borderRadius: '20px',
                              fontSize: '0.75rem',
                              fontWeight: '500',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              background: '#fee',
                              color: '#c33',
                              border: '1px solid #fcc'
                            }}
                            title="This blog is published but disabled. It will NOT appear on the website."
                          >
                            ⚠️ Disabled
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="blog-excerpt">{blog.excerpt}</p>

                    <div className="blog-meta">
                      <span className="blog-author">By {blog.author.name}</span>
                      <span className="blog-category">{blog.category.name}</span>
                      <span className="blog-date">
                        {blog.publishedAt ? formatDate(blog.publishedAt) : formatDate(blog.createdAt)}
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
          </>
        )}
      </div>

      <AddBlogModal
        isOpen={isAddBlogModalOpen}
        onClose={async () => {
          setIsAddBlogModalOpen(false);
          setEditingBlog(null);
          await loadBlogs();
          // Stats are calculated in loadBlogs, no need to call loadStats separately
        }}
        onSubmit={handleAddBlog}
        onImageUpload={handleImageUpload}
        editingBlog={editingBlog}
      />
    </div>
  );
};

export default Blogs;

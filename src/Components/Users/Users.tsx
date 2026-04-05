import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocale } from '../../contexts/LocaleContext';
import { User, UserStats, userService, mapApiRoleToBucket } from '../../services/userService';
import { useAuth } from '../../contexts/AuthContext';
import AddUserModal from './AddUserModal';
import EditUserModal from './EditUserModal';
import DataTable, { TableColumn } from '../core/DataTable';
import businessService, { BusinessPayload } from '../../services/businessService';
import './Users.css';

type RoleFilter = 'all' | 'admin' | 'customer';

const Users: React.FC = () => {
  const { t, formatNumber } = useLocale();
  const { user: currentUser } = useAuth();
  
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    newThisMonth: 0,
    recentLogins: 0
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 100,
    total: 0,
    totalPages: 1,
  });
  const [searchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [apiUserTotal, setApiUserTotal] = useState(0);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Use static data for now - no complex service layer needed

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch users from API
      const response = await userService.getUsers({
        page: pagination.current,
        pageSize: pagination.pageSize,
        filters: debouncedSearchTerm ? {
          search: debouncedSearchTerm,
        } : undefined
      });

      const mappedUsers: User[] = (response.users || []).map((user: any) => {
        const fullName = (user.fullName || '').trim();
        const nameParts = fullName.split(/\s+/).filter(Boolean);
        const firstName =
          (user.firstName != null && String(user.firstName).trim()) ||
          nameParts[0] ||
          '';
        const lastName =
          (user.lastName != null && String(user.lastName).trim()) ||
          nameParts.slice(1).join(' ') ||
          '';

        const apiRole = user.role || '';
        const normalizedRole = mapApiRoleToBucket(apiRole);
        const status = user.active === true ? 'active' : 'inactive';

        return {
          id: String(user.id || ''),
          firstName,
          lastName,
          email: user.email || '',
          phone: user.phone || user.phoneNumber || '',
          role: normalizedRole,
          apiRole,
          roleId: user.roleId,
          businessId: user.businessId,
          status: status as 'active' | 'inactive',
          profileImage: user.profileImage || user.profile_image || '',
          lastLogin: user.lastLogin || user.last_login || '',
          createdAt: user.createdAt || user.created_at || '',
          updatedAt: user.updatedAt || user.updated_at || '',
        };
      });

      setUsers(mappedUsers);
      const listTotal = response.pagination?.total ?? mappedUsers.length;
      setApiUserTotal(listTotal);
      setPagination(prev => {
        const newTotal = listTotal;
        const newTotalPages = response.pagination?.totalPages || Math.max(1, Math.ceil(newTotal / prev.pageSize));
        
        // Only update if values actually changed to prevent infinite loops
        if (prev.total === newTotal && prev.totalPages === newTotalPages) {
          return prev; // Return same reference if nothing changed
        }
        
        return {
        ...prev,
          total: newTotal,
          totalPages: newTotalPages
        };
      });
      
    } catch (err) {
      console.error('Error loading users:', err);
      setError(err instanceof Error ? err.message : 'Failed to load users');
      // Fallback to empty array on error
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, debouncedSearchTerm]);

  const loadStats = useCallback(async () => {
    try {
      // Calculate stats from loaded users instead of API call
      // (Stats endpoint doesn't exist - avoiding 404 errors)
      const activeCount = users.filter(u => u.status === 'active').length;
      const now = new Date();
      const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      
      const newThisMonth = users.filter(u => {
        if (!u.createdAt) return false;
        const created = new Date(u.createdAt);
        return created >= oneMonthAgo;
      }).length;

      const newStats = {
        totalUsers: apiUserTotal,
        activeUsers: activeCount,
        newThisMonth: newThisMonth,
        recentLogins: users.filter(u => u.lastLogin).length
      };

      // Only update if stats actually changed
      setStats(prev => {
        if (prev.totalUsers === newStats.totalUsers &&
            prev.activeUsers === newStats.activeUsers &&
            prev.newThisMonth === newStats.newThisMonth &&
            prev.recentLogins === newStats.recentLogins) {
          return prev; // Return same reference if nothing changed
        }
        return newStats;
      });
    } catch (err) {
      console.error('Failed to calculate user stats:', err);
      // Fallback stats
      setStats(prev => {
        const fallbackStats = {
          totalUsers: apiUserTotal,
          activeUsers: users.filter(u => u.status === 'active').length,
          newThisMonth: 0,
          recentLogins: 0
        };
        
        // Only update if changed
        if (prev.totalUsers === fallbackStats.totalUsers &&
            prev.activeUsers === fallbackStats.activeUsers &&
            prev.newThisMonth === fallbackStats.newThisMonth &&
            prev.recentLogins === fallbackStats.recentLogins) {
          return prev;
        }
        return fallbackStats;
      });
    }
  }, [users, apiUserTotal]);

  // Load users on mount and when pagination/search changes
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);
  
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleAddUser = async (businessData: BusinessPayload): Promise<void> => {
    try {
      console.log('🏢 Creating business...', businessData);
      
      // Step 1: Create the business
      const businessResult = await businessService.createBusiness(businessData);
      console.log('✅ Business created:', businessResult);
      
      // Step 2: Extract businessId from response
      const businessId = businessResult.businessId;
      
      if (!businessId) {
        console.warn('⚠️ Business created but no businessId returned. Cannot create user.');
        alert('Business created successfully, but could not determine business ID to create user.');
        await loadUsers();
        return;
      }
      
      // Step 3: Create a user/admin for this business
      // Use the contact email and address info to create the user
      try {
        // Backend expects fullName, not firstName/lastName separately
        const fullName = `${businessData.address.firstName} ${businessData.address.lastName}`.trim();
        
        const userPayload = {
          email: businessData.contact.email || businessData.address.emailAddress,
          fullName: fullName, // Backend uses fullName
          phoneNumber: businessData.contact.mainPhone || businessData.address.phoneNumber,
          password: businessData.password,
          roleId: 2, // Default role ID (you may need to adjust this based on your role system)
          businessId: businessId,
          isDeleted: false,
          isActive: businessData.isActive,
        };
        
        console.log('👤 Creating user/admin...', userPayload);
        const userResult = await userService.createAdmin(userPayload);
        console.log('✅ User created:', userResult);
        
        alert('User and business created successfully!');
      } catch (userError) {
        console.error('❌ Failed to create user:', userError);
        // Business was created but user creation failed
        alert(`Business created successfully (ID: ${businessId}), but failed to create user: ${userError instanceof Error ? userError.message : 'Unknown error'}`);
      }
      
      // Step 4: Refresh the user list
      await loadUsers();
    } catch (error) {
      console.error('❌ Failed to create business/user:', error);
      const message = error instanceof Error ? error.message : 'Failed to create business';
      alert(`Error: ${message}`);
      throw error; // Re-throw to show error in modal
    }
  };

  const handleOpenAddUserModal = () => {
    setIsAddUserModalOpen(true);
  };

  const handleCloseAddUserModal = () => {
    setIsAddUserModalOpen(false);
  };

  const handleSelectionChange = (selectedRows: User[]) => {
    setSelectedUsers(selectedRows);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditModalOpen(true);
  };

  const displayedUsers = useMemo(() => {
    if (roleFilter === 'admin') {
      return users.filter((u) => u.role === 'admin' || u.role === 'superadmin');
    }
    if (roleFilter === 'customer') {
      return users.filter((u) => u.role === 'customer');
    }
    return users;
  }, [users, roleFilter]);

  const tablePagination = useMemo(
    () => ({
      ...pagination,
      total: roleFilter === 'all' ? pagination.total : displayedUsers.length,
    }),
    [pagination, roleFilter, displayedUsers.length]
  );

  const handleDeleteUser = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        // Remove from local state (simulating API call)
        setUsers(prev => prev.filter(user => user.id !== id));
        setStats(prev => ({
          ...prev,
          totalUsers: prev.totalUsers - 1
        }));
      } catch (err) {
        alert(`Failed to delete user: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedUsers.length} users?`)) {
      try {
        // Remove from local state (simulating API call)
        const selectedIds = selectedUsers.map(u => u.id);
        setUsers(prev => prev.filter(user => !selectedIds.includes(user.id)));
        setStats(prev => ({
          ...prev,
          totalUsers: prev.totalUsers - selectedUsers.length
        }));
        setSelectedUsers([]);
      } catch (err) {
        alert(`Failed to delete users: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }
  };

  const handleBulkStatusChange = async (status: 'active' | 'inactive') => {
    if (selectedUsers.length === 0) return;
    
    try {
      // Update local state (simulating API call)
      const selectedIds = selectedUsers.map(u => u.id);
      setUsers(prev => prev.map(user => 
        selectedIds.includes(user.id) ? { ...user, status } : user
      ));
      
      // Update stats
      const currentActiveCount = users.filter(u => u.status === 'active').length;
      const newActiveCount = status === 'active' 
        ? currentActiveCount + selectedUsers.length
        : currentActiveCount - selectedUsers.length;
        
      setStats(prev => ({
        ...prev,
        activeUsers: Math.max(0, newActiveCount)
      }));
      
      setSelectedUsers([]);
    } catch (err) {
      alert(`Failed to update users: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const columns: TableColumn<User>[] = [
    {
      key: 'profileImage',
      title: 'Avatar',
      dataIndex: 'profileImage',
      width: 60,
      align: 'center',
      render: (_, record) => (
        <div className="user-avatar">
          {record.profileImage ? (
            <img 
              src={record.profileImage} 
              alt={`${record.firstName} ${record.lastName}`}
              className="user-avatar__img"
            />
          ) : (
            <div className="user-avatar__placeholder">
              {(
                record.firstName && record.lastName
                  ? `${record.firstName[0]}${record.lastName[0]}`
                  : (record.email || 'U').slice(0, 2)
              ).toUpperCase()}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'name',
      title: 'Name',
      dataIndex: 'firstName',
      searchable: true,
      render: (_, record) => (
        <div className="user-name">
          <div className="user-name__full">{record.firstName} {record.lastName}</div>
          <div className="user-name__email">{record.email}</div>
        </div>
      ),
    },
    {
      key: 'role',
      title: 'Role',
      dataIndex: 'role',
      filterable: true,
      render: (_, record) => (
        <span className="user-role" title={record.apiRole}>
          {record.apiRole || record.role}
        </span>
      ),
    },
    {
      key: 'phone',
      title: 'Phone',
      dataIndex: 'phone',
      render: (value) => (
        <span className="user-phone">
          {value}
        </span>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'status',
      filterable: true,
      render: (value) => (
        <span className={`user-status user-status--${value}`}>
          {value === 'active' ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'lastLogin',
      title: 'Last Login',
      dataIndex: 'lastLogin',
      render: (value) => (
        <span className="user-last-login">
          {value ? new Date(value).toLocaleDateString() : 'Never'}
        </span>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      dataIndex: 'actions',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <div className="user-actions">
          <button
            className="user-actions__btn user-actions__btn--edit"
            onClick={(e) => {
              e.stopPropagation();
              handleEditUser(record);
            }}
            title="Edit"
          >
            ✏️
          </button>
          {currentUser?.role === 'superadmin' && (
            <button
              className="user-actions__btn user-actions__btn--delete"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteUser(record.id);
              }}
              title="Delete"
            >
              🗑️
            </button>
          )}
        </div>
      ),
    },
  ];

  const bulkActions = selectedUsers.length > 0 ? (
    <div className="user-bulk-actions">
      <span className="user-bulk-actions__count">
        {selectedUsers.length} selected
      </span>
      <button
        className="user-bulk-actions__btn user-bulk-actions__btn--activate"
        onClick={() => handleBulkStatusChange('active')}
      >
        Activate
      </button>
      <button
        className="user-bulk-actions__btn user-bulk-actions__btn--deactivate"
        onClick={() => handleBulkStatusChange('inactive')}
      >
        Deactivate
      </button>
      {currentUser?.role === 'superadmin' && (
        <button
          className="user-bulk-actions__btn user-bulk-actions__btn--delete"
          onClick={handleBulkDelete}
        >
          Delete
        </button>
      )}
    </div>
  ) : null;

  return (
    <div className="admin-main">
      <div className="page-header">
        <h1>{t('users.title')}</h1>
        <p>{t('users.subtitle')}</p>
      </div>
      
      <div className="users-content">
        <div className="users-stats">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>{t('users.totalUsers')}</h3>
              <p className="stat-number">{formatNumber(stats.totalUsers)}</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>{t('users.activeUsers')}</h3>
              <p className="stat-number">{formatNumber(stats.activeUsers)}</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🆕</div>
            <div className="stat-content">
              <h3>{t('users.newThisMonth')}</h3>
              <p className="stat-number">{formatNumber(stats.newThisMonth)}</p>
            </div>
          </div>
        </div>
        
        <div className="users-table-container">
          <div className="table-header">
            <h2>{t('users.userList')}</h2>
            <button className="btn-primary" onClick={handleOpenAddUserModal}>
              <span className="btn-icon">➕</span>
              {t('users.addUser')}
            </button>
          </div>
          
          {bulkActions}

          <div className="users-role-filter" role="group" aria-label="Filter by role">
            <span className="users-role-filter__label">Show:</span>
            <button
              type="button"
              className={`users-role-filter__btn ${roleFilter === 'all' ? 'users-role-filter__btn--active' : ''}`}
              onClick={() => setRoleFilter('all')}
            >
              All users
            </button>
            <button
              type="button"
              className={`users-role-filter__btn ${roleFilter === 'admin' ? 'users-role-filter__btn--active' : ''}`}
              onClick={() => setRoleFilter('admin')}
            >
              Admin
            </button>
            <button
              type="button"
              className={`users-role-filter__btn ${roleFilter === 'customer' ? 'users-role-filter__btn--active' : ''}`}
              onClick={() => setRoleFilter('customer')}
            >
              Customer
            </button>
          </div>
          
          <DataTable
            data={displayedUsers}
            columns={columns}
            loading={loading}
            error={error || undefined}
            pagination={tablePagination}
            onSelectionChange={handleSelectionChange}
            rowKey="id"
            selectable
            searchable
          />
        </div>
      </div>

      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={handleCloseAddUserModal}
        onSubmit={handleAddUser}
      />

      <EditUserModal
        user={editingUser}
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditingUser(null);
        }}
        onSaved={loadUsers}
      />
    </div>
  );
};

export default Users;

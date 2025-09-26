import React, { useState, useEffect, useCallback } from 'react';
import { useLocale } from '../../contexts/LocaleContext';
import { useError, useLoading } from '../../hooks/useErrorHandling';
import { createEnhancedService } from '../../services/dynamicService';
import { User, UserListParams, UserStats } from '../../services/userService';
import AddUserModal from './AddUserModal';
import DataTable, { TableColumn } from '../core/DataTable';
import './Users.css';

interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  status: 'active' | 'inactive';
  dateOfBirth: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  emergencyContact: string;
  emergencyPhone: string;
  notes: string;
}

const Users: React.FC = () => {
  const { t, formatNumber } = useLocale();
  const { addError } = useError();
  const { setLoading: setGlobalLoading, isLoading } = useLoading();
  
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    newThisMonth: 0,
    totalDepartments: 0,
    recentLogins: 0
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  // Create dynamic user service
  const dynamicUserService = createEnhancedService<User>(
    { endpoint: '/api/users' },
    (error) => addError(error),
    (loading) => setGlobalLoading('users', loading)
  );

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadUsers = useCallback(async (params: UserListParams = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock data for development - will be replaced with real API when available
      const mockUsers: User[] = [
        {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '+1-555-0123',
          role: 'Admin',
          department: 'IT',
          status: 'active',
          profileImage: '',
          lastLogin: '2024-01-20T10:30:00Z',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-20T10:30:00Z'
        },
        {
          id: '2',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          phone: '+1-555-0124',
          role: 'Manager',
          department: 'Sales',
          status: 'active',
          profileImage: '',
          lastLogin: '2024-01-19T15:45:00Z',
          createdAt: '2024-01-02T00:00:00Z',
          updatedAt: '2024-01-19T15:45:00Z'
        },
        {
          id: '3',
          firstName: 'Bob',
          lastName: 'Johnson',
          email: 'bob.johnson@example.com',
          phone: '+1-555-0125',
          role: 'Employee',
          department: 'Marketing',
          status: 'inactive',
          profileImage: '',
          lastLogin: '2024-01-15T09:20:00Z',
          createdAt: '2024-01-03T00:00:00Z',
          updatedAt: '2024-01-15T09:20:00Z'
        }
      ];

      // Use dynamic service to fetch users
      const response = await dynamicUserService.getListWithLoading({
        page: pagination.current,
        pageSize: pagination.pageSize,
        search: debouncedSearchTerm || undefined,
        ...params,
      }, mockUsers);

      setUsers(response.items);
      setPagination(prev => ({
        ...prev,
        total: response.pagination.total,
        totalPages: response.pagination.totalPages
      }));
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, debouncedSearchTerm, dynamicUserService]);

  const loadStats = useCallback(async () => {
    try {
      // Mock stats for development
      const mockStats: UserStats = {
        totalUsers: 3,
        activeUsers: 2,
        newThisMonth: 1,
        totalDepartments: 3,
        recentLogins: 2
      };

      // Use dynamic service to fetch stats
      const statsData = await dynamicUserService.getStats(mockStats);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load user stats:', err);
    }
  }, [dynamicUserService]);

  useEffect(() => {
    loadUsers();
    loadStats();
  }, [loadUsers, loadStats]);

  const handleAddUser = async (userData: UserFormData) => {
    try {
      // Mock user creation for development
      const mockNewUser: User = {
        id: Date.now().toString(),
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        role: userData.role,
        department: userData.department,
        status: userData.status,
        profileImage: '',
        lastLogin: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Use dynamic service to create user
      await dynamicUserService.createWithLoading(userData as any, mockNewUser);
      await loadUsers();
      await loadStats();
      alert(`User ${userData.firstName} ${userData.lastName} has been added successfully!`);
    } catch (err) {
      alert(`Failed to add user: ${err instanceof Error ? err.message : 'Unknown error'}`);
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
    // TODO: Implement edit user modal
    console.log('Edit user:', user);
  };

  const handleDeleteUser = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userService.deleteUser(id);
        await loadUsers();
        await loadStats();
      } catch (err) {
        alert(`Failed to delete user: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedUsers.length} users?`)) {
      try {
        await userService.bulkDeleteUsers(selectedUsers.map(u => u.id));
        await loadUsers();
        await loadStats();
        setSelectedUsers([]);
      } catch (err) {
        alert(`Failed to delete users: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }
  };

  const handleBulkStatusChange = async (status: 'active' | 'inactive') => {
    if (selectedUsers.length === 0) return;
    
    try {
      await userService.bulkUpdateUsers(selectedUsers.map(u => u.id), { status });
      await loadUsers();
      await loadStats();
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
              {record.firstName.charAt(0)}{record.lastName.charAt(0)}
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
      render: (value) => (
        <span className="user-role">
          {value}
        </span>
      ),
    },
    {
      key: 'department',
      title: 'Department',
      dataIndex: 'department',
      filterable: true,
      render: (value) => (
        <span className="user-department">
          {value}
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
      <button
        className="user-bulk-actions__btn user-bulk-actions__btn--delete"
        onClick={handleBulkDelete}
      >
        Delete
      </button>
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
          
          <DataTable
            data={users}
            columns={columns}
            loading={loading}
            error={error || undefined}
            pagination={pagination}
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
    </div>
  );
};

export default Users;

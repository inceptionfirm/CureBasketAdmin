import React, { useState, useEffect, useCallback } from 'react';
import { useLocale } from '../../contexts/LocaleContext';
import { User, UserStats } from '../../services/userService';
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
  const [searchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

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
      
      // Static data for development - no API calls needed
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
          updatedAt: '2024-01-20T10:30:00Z',
          dateOfBirth: '1990-01-01',
          address: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA',
          emergencyContact: 'Jane Doe',
          emergencyPhone: '+1-555-0124',
          notes: 'Admin user'
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
          updatedAt: '2024-01-19T15:45:00Z',
          dateOfBirth: '1985-05-15',
          address: '456 Oak Ave',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90210',
          country: 'USA',
          emergencyContact: 'John Smith',
          emergencyPhone: '+1-555-0125',
          notes: 'Sales manager'
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
          updatedAt: '2024-01-15T09:20:00Z',
          dateOfBirth: '1992-12-10',
          address: '789 Pine St',
          city: 'Chicago',
          state: 'IL',
          zipCode: '60601',
          country: 'USA',
          emergencyContact: 'Mary Johnson',
          emergencyPhone: '+1-555-0126',
          notes: 'Marketing employee'
        }
      ];

      // Filter users based on search term
      let filteredUsers = mockUsers;
      if (debouncedSearchTerm) {
        filteredUsers = mockUsers.filter(user => 
          user.firstName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          user.lastName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        );
      }

      setUsers(filteredUsers);
      setPagination(prev => ({
        ...prev,
        total: filteredUsers.length,
        totalPages: Math.ceil(filteredUsers.length / prev.pageSize)
      }));
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, debouncedSearchTerm]);

  const loadStats = useCallback(async () => {
    try {
      // Static stats for development
      const mockStats: UserStats = {
        totalUsers: 3,
        activeUsers: 2,
        newThisMonth: 1,
        totalDepartments: 3,
        recentLogins: 2
      };

      setStats(mockStats);
    } catch (err) {
      console.error('Failed to load user stats:', err);
    }
  }, []);

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
        lastLogin: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        dateOfBirth: userData.dateOfBirth,
        address: userData.address,
        city: userData.city,
        state: userData.state,
        zipCode: userData.zipCode,
        country: userData.country,
        emergencyContact: userData.emergencyContact,
        emergencyPhone: userData.emergencyPhone,
        notes: userData.notes
      };

      // Add to local state (simulating API call)
      setUsers(prev => [...prev, mockNewUser]);
      setStats(prev => ({
        ...prev,
        totalUsers: prev.totalUsers + 1,
        activeUsers: userData.status === 'active' ? prev.activeUsers + 1 : prev.activeUsers
      }));
      
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

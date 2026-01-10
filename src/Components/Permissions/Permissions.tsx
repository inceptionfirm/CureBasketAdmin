import React, { useState, useEffect, useCallback } from 'react';
import { permissionService, Permission, PermissionGroup } from '../../services/permissionService';
import AddPermissionModal from './AddPermissionModal';
import './Permissions.css';

const Permissions: React.FC = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddPermissionModalOpen, setIsAddPermissionModalOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [groupFilter, setGroupFilter] = useState<string>('');
  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    total: 0,
    totalPages: 1,
  });

  const loadPermissionGroups = useCallback(async () => {
    try {
      const groups = await permissionService.getAllPermissionGroups();
      setPermissionGroups(groups);
    } catch (err) {
      console.error('Failed to load permission groups:', err);
    }
  }, []);

  const loadPermissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await permissionService.getAllPermissionsInPages({
        page: pagination.page - 1,
        size: pagination.size,
        sortBy: 'name',
        asc: true,
      });
      
      setPermissions(response.permissions);
      setPagination(prev => ({
        ...prev,
        total: response.pagination.total,
        totalPages: response.pagination.totalPages,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load permissions');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.size]);

  useEffect(() => {
    loadPermissionGroups();
  }, [loadPermissionGroups]);

  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  const handleAddPermission = async (permissionData: {
    name: string;
    permissionGroupId: number;
  }) => {
    try {
      if (editingPermission) {
        await permissionService.updatePermission(
          editingPermission.id,
          permissionData.name,
          permissionData.permissionGroupId
        );
      } else {
        await permissionService.createPermission(
          permissionData.name,
          permissionData.permissionGroupId
        );
      }
      await loadPermissions();
      setIsAddPermissionModalOpen(false);
      setEditingPermission(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save permission');
    }
  };

  const handleEditPermission = (permission: Permission) => {
    setEditingPermission(permission);
    setIsAddPermissionModalOpen(true);
  };

  const handleDeletePermission = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this permission?')) {
      try {
        await permissionService.deletePermission([id]);
        await loadPermissions();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete permission');
      }
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleGroupFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGroupFilter(e.target.value);
  };

  const getGroupName = (groupId: number): string => {
    const group = permissionGroups.find(g => g.id === groupId);
    return group?.name || 'Unknown Group';
  };

  const filteredPermissions = permissions.filter(permission => {
    const matchesSearch = permission.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = !groupFilter || permission.permissionGroupId.toString() === groupFilter;
    return matchesSearch && matchesGroup;
  });

  return (
    <div className="permissions-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Permissions</h1>
          <p className="page-description">Manage system permissions and access controls</p>
        </div>
        <button 
          className="add-button"
          onClick={() => setIsAddPermissionModalOpen(true)}
        >
          <span className="button-icon">+</span>
          Add Permission
        </button>
      </div>

      <div className="permissions-container">
        <div className="table-header">
          <h2 className="table-title">All Permissions</h2>
        </div>

        <div className="search-filters">
          <input
            type="text"
            placeholder="Search permissions..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
          <select
            value={groupFilter}
            onChange={handleGroupFilter}
            className="filter-select"
          >
            <option value="">All Groups</option>
            {permissionGroups.map(group => (
              <option key={group.id} value={group.id.toString()}>
                {group.name}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <div>Loading permissions...</div>
          </div>
        ) : error ? (
          <div className="empty-state">
            <div className="empty-state-icon">⚠️</div>
            <div className="empty-state-title">Error</div>
            <div className="empty-state-description">{error}</div>
          </div>
        ) : filteredPermissions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔐</div>
            <div className="empty-state-title">No permissions found</div>
            <div className="empty-state-description">
              {searchTerm || groupFilter 
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by adding your first permission'
              }
            </div>
          </div>
        ) : (
          <>
            <table className="permissions-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Permission Group</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPermissions.map((permission) => (
                  <tr key={permission.id}>
                    <td>{permission.id}</td>
                    <td>
                      <div className="permission-name">{permission.name}</div>
                    </td>
                    <td>
                      <div className="permission-group">{getGroupName(permission.permissionGroupId)}</div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-edit"
                          onClick={() => handleEditPermission(permission)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDeletePermission(permission.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  disabled={pagination.page === 1}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                >
                  Previous
                </button>
                <span>
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <AddPermissionModal
        isOpen={isAddPermissionModalOpen}
        onClose={() => {
          setIsAddPermissionModalOpen(false);
          setEditingPermission(null);
        }}
        onSubmit={handleAddPermission}
        editingPermission={editingPermission}
        permissionGroups={permissionGroups}
      />
    </div>
  );
};

export default Permissions;


import React, { useState, useEffect, useCallback } from 'react';
import { roleService, Role, CreateRolePayload } from '../../services/roleService';
import { permissionService, Permission } from '../../services/permissionService';
import AddRoleModal from './AddRoleModal';
import './Roles.css';

const Roles: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    total: 0,
    totalPages: 1,
  });

  const loadPermissions = useCallback(async () => {
    try {
      const allPermissions = await permissionService.getAllPermissionsAtOnce();
      setPermissions(allPermissions);
    } catch (err) {
      console.error('Failed to load permissions:', err);
    }
  }, []);

  const loadRoles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await roleService.getAllRoles({
        page: pagination.page - 1,
        size: pagination.size,
        sortBy: 'name',
        asc: true,
      });
      
      setRoles(response.roles);
      setPagination(prev => ({
        ...prev,
        total: response.pagination.total,
        totalPages: response.pagination.totalPages,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load roles');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.size]);

  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  const handleAddRole = async (roleData: CreateRolePayload) => {
    try {
      if (editingRole) {
        await roleService.updateRole(editingRole.id, roleData);
      } else {
        await roleService.createRole(roleData);
      }
      await loadRoles();
      setIsAddRoleModalOpen(false);
      setEditingRole(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save role');
    }
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setIsAddRoleModalOpen(true);
  };

  const handleDeleteRole = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this role? This will affect all users with this role.')) {
      try {
        await roleService.deleteRole(id);
        await loadRoles();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete role');
      }
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const getPermissionName = (permissionId: number): string => {
    const permission = permissions.find(p => p.id === permissionId);
    return permission?.name || `Permission #${permissionId}`;
  };

  const filteredRoles = roles.filter(role => {
    return role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           role.description?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="roles-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Roles</h1>
          <p className="page-description">Manage user roles and assign permissions</p>
        </div>
        <button 
          className="add-button"
          onClick={() => setIsAddRoleModalOpen(true)}
        >
          <span className="button-icon">+</span>
          Add Role
        </button>
      </div>

      <div className="roles-container">
        <div className="table-header">
          <h2 className="table-title">All Roles</h2>
        </div>

        <div className="search-filters">
          <input
            type="text"
            placeholder="Search roles..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <div>Loading roles...</div>
          </div>
        ) : error ? (
          <div className="empty-state">
            <div className="empty-state-icon">⚠️</div>
            <div className="empty-state-title">Error</div>
            <div className="empty-state-description">{error}</div>
          </div>
        ) : filteredRoles.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👤</div>
            <div className="empty-state-title">No roles found</div>
            <div className="empty-state-description">
              {searchTerm 
                ? 'Try adjusting your search criteria'
                : 'Get started by adding your first role'
              }
            </div>
          </div>
        ) : (
          <>
            <table className="roles-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Permissions</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRoles.map((role) => (
                  <tr key={role.id}>
                    <td>{role.id}</td>
                    <td>
                      <div className="role-name">{role.name}</div>
                    </td>
                    <td>
                      <span className={`role-type role-type-${role.roleType.toLowerCase()}`}>
                        {role.roleType}
                      </span>
                    </td>
                    <td>
                      <div className="role-description">
                        {role.description || 'No description'}
                      </div>
                    </td>
                    <td>
                      <div className="role-permissions">
                        {role.permissionIds && role.permissionIds.length > 0 ? (
                          <>
                            <span className="permissions-count">
                              {role.permissionIds.length} permission{role.permissionIds.length !== 1 ? 's' : ''}
                            </span>
                            <div className="permissions-preview">
                              {role.permissionIds.slice(0, 3).map((permId) => (
                                <span key={permId} className="permission-tag">
                                  {getPermissionName(permId)}
                                </span>
                              ))}
                              {role.permissionIds.length > 3 && (
                                <span className="permission-tag more">
                                  +{role.permissionIds.length - 3} more
                                </span>
                              )}
                            </div>
                          </>
                        ) : (
                          <span className="no-permissions">No permissions</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-edit"
                          onClick={() => handleEditRole(role)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDeleteRole(role.id)}
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

      <AddRoleModal
        isOpen={isAddRoleModalOpen}
        onClose={() => {
          setIsAddRoleModalOpen(false);
          setEditingRole(null);
        }}
        onSubmit={handleAddRole}
        editingRole={editingRole}
        permissions={permissions}
      />
    </div>
  );
};

export default Roles;


import React, { useState, useEffect, useCallback } from 'react';
import { permissionService, PermissionGroup } from '../../services/permissionService';
import AddPermissionGroupModal from './AddPermissionGroupModal';
import './PermissionGroups.css';

const PermissionGroups: React.FC = () => {
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddGroupModalOpen, setIsAddGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<PermissionGroup | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadPermissionGroups = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const groups = await permissionService.getAllPermissionGroupsWithPermissions();
      setPermissionGroups(groups);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load permission groups');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPermissionGroups();
  }, [loadPermissionGroups]);

  const handleAddGroup = async (name: string) => {
    try {
      if (editingGroup) {
        await permissionService.updatePermissionGroup(editingGroup.id, name);
      } else {
        await permissionService.createPermissionGroup(name);
      }
      await loadPermissionGroups();
      setIsAddGroupModalOpen(false);
      setEditingGroup(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save permission group');
    }
  };

  const handleEditGroup = (group: PermissionGroup) => {
    setEditingGroup(group);
    setIsAddGroupModalOpen(true);
  };

  const handleDeleteGroup = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this permission group? This will also delete all permissions in this group.')) {
      try {
        await permissionService.deletePermissionGroup(id);
        await loadPermissionGroups();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete permission group');
      }
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredGroups = permissionGroups.filter(group => {
    return group.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="permission-groups-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Permission Groups</h1>
          <p className="page-description">Organize permissions into groups for better management</p>
        </div>
        <button 
          className="add-button"
          onClick={() => setIsAddGroupModalOpen(true)}
        >
          <span className="button-icon">+</span>
          Add Group
        </button>
      </div>

      <div className="permission-groups-container">
        <div className="table-header">
          <h2 className="table-title">All Permission Groups</h2>
        </div>

        <div className="search-filters">
          <input
            type="text"
            placeholder="Search groups..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <div>Loading permission groups...</div>
          </div>
        ) : error ? (
          <div className="empty-state">
            <div className="empty-state-icon">⚠️</div>
            <div className="empty-state-title">Error</div>
            <div className="empty-state-description">{error}</div>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <div className="empty-state-title">No permission groups found</div>
            <div className="empty-state-description">
              {searchTerm 
                ? 'Try adjusting your search criteria'
                : 'Get started by adding your first permission group'
              }
            </div>
          </div>
        ) : (
          <div className="groups-grid">
            {filteredGroups.map((group) => (
              <div key={group.id} className="group-card">
                <div className="group-card-header">
                  <h3 className="group-name">{group.name}</h3>
                  <div className="group-actions">
                    <button
                      className="btn-edit"
                      onClick={() => handleEditGroup(group)}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteGroup(group.id)}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div className="group-permissions">
                  <div className="permissions-count">
                    {group.permissions?.length || 0} Permission{group.permissions?.length !== 1 ? 's' : ''}
                  </div>
                  {group.permissions && group.permissions.length > 0 && (
                    <div className="permissions-list">
                      {group.permissions.slice(0, 5).map((permission) => (
                        <span key={permission.id} className="permission-badge">
                          {permission.name}
                        </span>
                      ))}
                      {group.permissions.length > 5 && (
                        <span className="permission-badge more">
                          +{group.permissions.length - 5} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddPermissionGroupModal
        isOpen={isAddGroupModalOpen}
        onClose={() => {
          setIsAddGroupModalOpen(false);
          setEditingGroup(null);
        }}
        onSubmit={handleAddGroup}
        editingGroup={editingGroup}
      />
    </div>
  );
};

export default PermissionGroups;


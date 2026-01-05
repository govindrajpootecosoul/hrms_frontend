'use client';

import { useState, useMemo } from 'react';
import { useAdminPortal } from '@/lib/context/AdminPortalContext';
import { AdminTable } from '@/components/admin-portal/ui/AdminTable';
import { AdminButton } from '@/components/admin-portal/ui/AdminButton';
import { AdminModal } from '@/components/admin-portal/ui/AdminModal';
import { AdminToggle } from '@/components/admin-portal/ui/AdminToggle';
import { AdminMultiSelect } from '@/components/admin-portal/ui/AdminMultiSelect';
import portalList from '@/data/admin-portal/portalList.json';

export default function UsersPage() {
  const { users, addUser, updateUser, deleteUser, toggleUserActive, loading, error } = useAdminPortal();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    active: true,
    role: 'user',
    portals: [],
  });

  const handleCreate = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      active: true,
      role: 'user',
      portals: [],
    });
    setIsCreateModalOpen(true);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: user.password,
      active: user.active,
      role: user.role || 'user',
      portals: user.portals,
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleSubmitCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await addUser(formData);
      setIsCreateModalOpen(false);
      setFormData({
        name: '',
        email: '',
        password: '',
        active: true,
        role: 'user',
        portals: [],
      });
    } catch (err) {
      setSubmitError(err.message || 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    if (selectedUser) {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        await updateUser(selectedUser.id, formData);
        setIsEditModalOpen(false);
        setSelectedUser(null);
      } catch (err) {
        setSubmitError(err.message || 'Failed to update user');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedUser) {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        await deleteUser(selectedUser.id);
        setIsDeleteModalOpen(false);
        setSelectedUser(null);
      } catch (err) {
        setSubmitError(err.message || 'Failed to delete user');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleTogglePortal = async (userId, portal) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      const newPortals = user.portals.includes(portal)
        ? user.portals.filter(p => p !== portal)
        : [...user.portals, portal];
      try {
        await updateUser(userId, { portals: newPortals });
      } catch (err) {
        console.error('Failed to update user portals:', err);
        setSubmitError(err.message || 'Failed to update portal access');
      }
    }
  };

  // Ensure portalList is an array
  const portals = Array.isArray(portalList) ? portalList : [];
  const tableHeaders = ['Name', 'Email', 'Role', 'Active', ...portals, 'Actions'];

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    // Ensure users is an array
    if (!Array.isArray(users)) {
      return [];
    }
    
    // If no search query, return all users
    if (!searchQuery || searchQuery.trim() === '') {
      return users;
    }
    
    // Normalize search query
    const query = searchQuery.toLowerCase().trim();
    
    // Filter users
    return users.filter((user) => {
      if (!user) return false;
      const name = String(user.name || '').toLowerCase();
      const email = String(user.email || '').toLowerCase();
      return name.includes(query) || email.includes(query);
    });
  }, [users, searchQuery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-800">Error: {error}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Users Management</h1>
        <AdminButton onClick={handleCreate}>Create User</AdminButton>
      </div>

      {submitError && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">Error: {submitError}</div>
        </div>
      )}

      {/* Search Filter */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        {searchQuery && (
          <div className="mt-2 text-sm text-gray-600">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <AdminTable headers={tableHeaders}>
          {filteredUsers.length === 0 ? (
            <tr>
              <td colSpan={tableHeaders.length} className="px-6 py-8 text-center text-gray-500">
                {searchQuery ? 'No users found matching your search.' : 'No users found.'}
              </td>
            </tr>
          ) : (
            filteredUsers.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span>{user.name}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {user.email}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user.role === 'admin' || user.role === 'superadmin'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {user.role === 'superadmin' ? 'Super Admin' : user.role === 'admin' ? 'Admin' : 'User'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <AdminToggle
                  checked={user.active}
                  onChange={() => toggleUserActive(user.id)}
                />
              </td>
              {portals.map((portal) => (
                <td key={portal} className="px-4 py-4 whitespace-nowrap text-center">
                  <label className="flex items-center justify-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={user.portals.includes(portal)}
                      onChange={() => handleTogglePortal(user.id, portal)}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                      title={`Toggle ${portal} access`}
                    />
                  </label>
                </td>
              ))}
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <AdminButton
                    variant="secondary"
                    size="sm"
                    onClick={() => handleEdit(user)}
                  >
                    Edit
                  </AdminButton>
                  <AdminButton
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(user)}
                  >
                    Delete
                  </AdminButton>
                </div>
              </td>
            </tr>
            ))
          )}
        </AdminTable>
      </div>

      {/* Create Modal */}
      <AdminModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create User"
      >
        <form onSubmit={handleSubmitCreate} className="space-y-4">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-semibold shadow-lg">
              {formData.name.charAt(0).toUpperCase() || '👤'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <AdminToggle
              checked={formData.active}
              onChange={(checked) => setFormData({ ...formData, active: checked })}
              label="Active"
            />
          </div>
          <div>
            <AdminMultiSelect
              options={portals}
              selected={formData.portals}
              onChange={(selected) => setFormData({ ...formData, portals: selected })}
              label="Portals"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <AdminButton
              type="button"
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </AdminButton>
            <AdminButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create'}
            </AdminButton>
          </div>
        </form>
      </AdminModal>

      {/* Edit Modal */}
      <AdminModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit User"
      >
        <form onSubmit={handleSubmitEdit} className="space-y-4">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-semibold shadow-lg">
              {formData.name.charAt(0).toUpperCase() || '👤'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <AdminToggle
              checked={formData.active}
              onChange={(checked) => setFormData({ ...formData, active: checked })}
              label="Active"
            />
          </div>
          <div>
            <AdminMultiSelect
              options={portals}
              selected={formData.portals}
              onChange={(selected) => setFormData({ ...formData, portals: selected })}
              label="Portals"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <AdminButton
              type="button"
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </AdminButton>
            <AdminButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update'}
            </AdminButton>
          </div>
        </form>
      </AdminModal>

      {/* Delete Confirmation Modal */}
      <AdminModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete User"
        size="sm"
      >
        <p className="text-gray-700 mb-4">
          Are you sure you want to delete user <strong>{selectedUser?.name}</strong>? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <AdminButton
            variant="outline"
            onClick={() => setIsDeleteModalOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </AdminButton>
          <AdminButton variant="danger" onClick={handleConfirmDelete} disabled={isSubmitting}>
            {isSubmitting ? 'Deleting...' : 'Delete'}
          </AdminButton>
        </div>
      </AdminModal>
    </div>
  );
}













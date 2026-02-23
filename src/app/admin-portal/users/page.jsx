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
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    active: true,
    role: 'user',
    portals: [],
    employeeId: '',
    department: '',
    company: '',
    hasCredentialAccess: true,
    hasSubscriptionAccess: true,
  });

  const handleCreate = () => {
    setSubmitError(null);
    setSubmitSuccess(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      active: true,
      role: 'user',
      portals: [],
      employeeId: '',
      department: '',
      company: '',
      hasCredentialAccess: true,
      hasSubscriptionAccess: true,
    });
    setIsCreateModalOpen(true);
  };

  const handleEdit = (user) => {
    setSubmitError(null);
    setSubmitSuccess(null);
    setSelectedUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '', // Don't pre-fill password
      active: user.active !== false,
      role: user.role || 'user',
      portals: user.portals || [],
      employeeId: user.employeeId || '',
      department: user.department || '',
      company: user.company || '',
      hasCredentialAccess: user.hasCredentialAccess !== false,
      hasSubscriptionAccess: user.hasSubscriptionAccess !== false,
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (user) => {
    setSubmitError(null);
    setSubmitSuccess(null);
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleSubmitCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);
    try {
      await addUser(formData);
      setIsCreateModalOpen(false);
      setSubmitSuccess('User created successfully.');
      setFormData({
        name: '',
        email: '',
        password: '',
        active: true,
        role: 'user',
        portals: [],
        employeeId: '',
        department: '',
        company: '',
        hasCredentialAccess: true,
        hasSubscriptionAccess: true,
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
      setSubmitSuccess(null);
      try {
        const userId = selectedUser.id || selectedUser._id;
        const payload = {
          ...formData,
          // Empty password means "do not change password" on edit.
          password: formData.password?.trim() || '',
        };
        await updateUser(userId, payload);
        const successMessage = payload.password
          ? 'User and password updated successfully.'
          : 'User updated successfully.';
        if (typeof window !== 'undefined') {
          window.alert(successMessage);
        }
        setIsEditModalOpen(false);
        setSelectedUser(null);
        setSubmitSuccess(successMessage);
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
      setSubmitSuccess(null);
      try {
        const userId = selectedUser.id || selectedUser._id;
        await deleteUser(userId);
        setIsDeleteModalOpen(false);
        setSelectedUser(null);
        setSubmitSuccess('User deleted successfully.');
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
        setSubmitSuccess('Portal access updated successfully.');
      } catch (err) {
        console.error('Failed to update user portals:', err);
        setSubmitError(err.message || 'Failed to update portal access');
      }
    }
  };

  // Ensure portalList is an array
  const portals = Array.isArray(portalList) ? portalList : [];
  // Map portal names to display names (matching old design)
  const portalDisplayMap = {
    'HRMS': 'HRMS',
    'DataHive': 'DRIVE',
    'Asset Tracker': 'ASSET TRACKER',
    'Finance Tools': 'FINANCE TOOLS',
    'Project Tracker': 'PROJECT TRACKER',
    'Employee Portal': 'EMPLOYEE PORTAL',
    'Query Tracker': 'QUERY TRACKER',
    'Demand / Panel': 'DEMAND / PANEL'
  };
  const tableHeaders = ['Name', 'Email', 'Role', 'Active', ...portals.map(p => portalDisplayMap[p] || p.toUpperCase()), 'Actions'];

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
      const employeeId = String(user.employeeId || '').toLowerCase();
      const department = String(user.department || '').toLowerCase();
      return name.includes(query) || email.includes(query) || employeeId.includes(query) || department.includes(query);
    });
  }, [users, searchQuery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading employees...</div>
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
      {submitSuccess && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-green-800">{submitSuccess}</div>
        </div>
      )}

      {/* Search Filter */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Q Search users by name or email"
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
            Showing {filteredUsers.length} of {users.length} employees
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <div className="min-w-full inline-block align-middle">
          <AdminTable headers={tableHeaders}>
          {filteredUsers.length === 0 ? (
            <tr>
              <td colSpan={tableHeaders.length} className="px-6 py-8 text-center text-gray-500">
                {searchQuery ? 'No employees found matching your search.' : 'No employees found.'}
              </td>
            </tr>
          ) : (
            filteredUsers.map((user) => (
            <tr key={user.id || user._id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                    {(user.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span>{user.name || 'N/A'}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {user.email || 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user.role === 'admin' || user.role === 'superadmin'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {user.role === 'superadmin' ? 'SuperAdmin' : user.role === 'admin' ? 'Admin' : 'User'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <AdminToggle
                  checked={user.active !== false}
                  onChange={() => toggleUserActive(user.id || user._id)}
                />
              </td>
              {portals.map((portal) => {
                const userPortals = user.portals || [];
                const hasAccess = userPortals.includes(portal);
                return (
                  <td key={portal} className="px-6 py-4 whitespace-nowrap text-center">
                    <input
                      type="checkbox"
                      checked={hasAccess}
                      onChange={() => handleTogglePortal(user.id || user._id, portal)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                    />
                  </td>
                );
              })}
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
      </div>

      {/* Create Modal */}
      <AdminModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add Employee"
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
              placeholder="Leave blank to keep current password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Leave blank if you do not want to change password.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee ID
            </label>
            <input
              type="text"
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., ECOSIND0006"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Thrive Ecom"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company
            </label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Ecosoul Home"
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
            <AdminToggle
              checked={formData.hasCredentialAccess}
              onChange={(checked) => setFormData({ ...formData, hasCredentialAccess: checked })}
              label="Has Credential Access"
            />
          </div>
          <div>
            <AdminToggle
              checked={formData.hasSubscriptionAccess}
              onChange={(checked) => setFormData({ ...formData, hasSubscriptionAccess: checked })}
              label="Has Subscription Access"
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
        title="Edit Employee"
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
        title="Delete Employee"
        size="sm"
      >
        <p className="text-gray-700 mb-4">
          Are you sure you want to delete employee <strong>{selectedUser?.name}</strong>? This action cannot be undone.
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













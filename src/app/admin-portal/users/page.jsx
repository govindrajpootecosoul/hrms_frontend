'use client';

import { useState } from 'react';
import { useAdminPortal } from '@/lib/context/AdminPortalContext';
import { AdminTable } from '@/components/admin-portal/ui/AdminTable';
import { AdminButton } from '@/components/admin-portal/ui/AdminButton';
import { AdminModal } from '@/components/admin-portal/ui/AdminModal';
import { AdminToggle } from '@/components/admin-portal/ui/AdminToggle';
import { AdminMultiSelect } from '@/components/admin-portal/ui/AdminMultiSelect';
import portalList from '@/data/admin-portal/portalList.json';

export default function UsersPage() {
  const { users, addUser, updateUser, deleteUser, toggleUserActive } = useAdminPortal();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    active: true,
    portals: [],
  });

  const handleCreate = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      active: true,
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
      portals: user.portals,
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleSubmitCreate = (e) => {
    e.preventDefault();
    addUser(formData);
    setIsCreateModalOpen(false);
    setFormData({
      name: '',
      email: '',
      password: '',
      active: true,
      portals: [],
    });
  };

  const handleSubmitEdit = (e) => {
    e.preventDefault();
    if (selectedUser) {
      updateUser(selectedUser.id, formData);
      setIsEditModalOpen(false);
      setSelectedUser(null);
    }
  };

  const handleConfirmDelete = () => {
    if (selectedUser) {
      deleteUser(selectedUser.id);
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
    }
  };

  const handleTogglePortal = (userId, portal) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      const newPortals = user.portals.includes(portal)
        ? user.portals.filter(p => p !== portal)
        : [...user.portals, portal];
      updateUser(userId, { portals: newPortals });
    }
  };

  const tableHeaders = ['Name', 'Email', 'Active', ...portalList, 'Actions'];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Users Management</h1>
        <AdminButton onClick={handleCreate}>Create User</AdminButton>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <AdminTable headers={tableHeaders}>
          {users.map((user) => (
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
                <AdminToggle
                  checked={user.active}
                  onChange={() => toggleUserActive(user.id)}
                />
              </td>
              {portalList.map((portal) => (
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
          ))}
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
            <AdminToggle
              checked={formData.active}
              onChange={(checked) => setFormData({ ...formData, active: checked })}
              label="Active"
            />
          </div>
          <div>
            <AdminMultiSelect
              options={portalList}
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
            >
              Cancel
            </AdminButton>
            <AdminButton type="submit">Create</AdminButton>
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
            <AdminToggle
              checked={formData.active}
              onChange={(checked) => setFormData({ ...formData, active: checked })}
              label="Active"
            />
          </div>
          <div>
            <AdminMultiSelect
              options={portalList}
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
            >
              Cancel
            </AdminButton>
            <AdminButton type="submit">Update</AdminButton>
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
          >
            Cancel
          </AdminButton>
          <AdminButton variant="danger" onClick={handleConfirmDelete}>
            Delete
          </AdminButton>
        </div>
      </AdminModal>
    </div>
  );
}



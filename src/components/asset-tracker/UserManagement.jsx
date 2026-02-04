'use client';

import { useState, useEffect } from 'react';
import { UserPlus, User, Edit, Lock, Pause, Play, Trash2, CheckCircle, X } from 'lucide-react';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import { API_BASE_URL } from '@/lib/utils/constants';

const UserManagement = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'User',
    department: '',
  });

  const [users, setUsers] = useState([]);

  // Fetch users from API
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('[UserManagement] Fetching users from:', `${API_BASE_URL}/admin-users`);
      
      const response = await fetch(`${API_BASE_URL}/admin-users`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('[UserManagement] API Response:', {
        success: data.success,
        userCount: data.users?.length || 0,
        total: data.total,
        database: data.database
      });
      
      if (data.success && data.users) {
        // Transform API users to component format
        const transformedUsers = data.users.map(user => ({
          id: user.id || user._id,
          name: user.name || '',
          email: user.email || '',
          role: user.role === 'admin' ? 'Admin' : user.role === 'user' ? 'User' : user.role || 'User',
          department: user.department || '',
          status: user.active !== false ? 'Active' : 'Inactive',
          lastLogin: user.updatedAt ? new Date(user.updatedAt).toLocaleString() : 'Never',
        }));
        
        console.log(`[UserManagement] Setting ${transformedUsers.length} users`);
        setUsers(transformedUsers);
      } else {
        throw new Error(data.error || 'Failed to fetch users');
      }
    } catch (err) {
      console.error('[UserManagement] Error fetching users:', err);
      setError(err.message || 'Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role) => {
    const roleStyles = {
      Admin: 'bg-red-100 text-red-700 border-red-200',
      Manager: 'bg-blue-100 text-blue-700 border-blue-200',
      User: 'bg-green-100 text-green-700 border-green-200',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${roleStyles[role] || 'bg-neutral-100 text-neutral-700 border-neutral-200'}`}>
        {role}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    if (status === 'Active') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
          <CheckCircle className="w-3 h-3" />
          Active
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
          <X className="w-3 h-3" />
          Inactive
        </span>
      );
    }
  };

  const handleEdit = (userId) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      });
      setShowEditModal(true);
    }
  };

  const handleAdd = () => {
    setFormData({
      name: '',
      email: '',
      role: 'User',
      department: '',
    });
    setShowAddModal(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.email) {
      alert('Name and Email are required');
      return;
    }

    if (editingUser) {
      // Update existing user
      setUsers(prev => prev.map(user =>
        user.id === editingUser.id
          ? { ...user, ...formData, lastLogin: user.lastLogin }
          : user
      ));
      setShowEditModal(false);
    } else {
      // Add new user
      const newUser = {
        id: Date.now().toString(),
        ...formData,
        status: 'Active',
        lastLogin: 'Never',
      };
      setUsers(prev => [...prev, newUser]);
      setShowAddModal(false);
    }

    setFormData({
      name: '',
      email: '',
      role: 'User',
      department: '',
    });
    setEditingUser(null);
  };

  const handleLock = (userId) => {
    console.log('Lock user:', userId);
  };

  const handlePause = (userId) => {
    setUsers(prev => prev.map(user =>
      user.id === userId
        ? { ...user, status: user.status === 'Active' ? 'Inactive' : 'Active' }
        : user
    ));
  };

  const handleDelete = (userId) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(prev => prev.filter(user => user.id !== userId));
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-neutral-500">Loading users...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">Error: {error}</div>
          <Button
            onClick={fetchUsers}
            className="mt-2 bg-red-600 text-white hover:bg-red-700 text-xs"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 mb-1">User Management</h2>
          <p className="text-xs text-neutral-600">Add, edit, and manage user access to the asset portal</p>
          {users.length > 0 && (
            <p className="text-xs text-neutral-500 mt-1">Showing {users.length} user{users.length !== 1 ? 's' : ''}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            onClick={fetchUsers}
            className="bg-gray-600 text-white hover:bg-gray-700 text-xs"
          >
            Refresh
          </Button>
          <Button
            onClick={handleAdd}
            icon={<UserPlus className="w-3.5 h-3.5" />}
            className="bg-blue-600 text-white hover:bg-blue-700 text-xs"
          >
            Add User
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  USER
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  ROLE
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  DEPARTMENT
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  STATUS
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  LAST LOGIN
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-neutral-500">
                    No users found. Users will be loaded from the Ecosoul_All_Employee database.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                <tr key={user.id} className="hover:bg-neutral-50 transition-colors duration-150">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-sm text-neutral-900">{user.name}</div>
                        <div className="text-xs text-neutral-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-4 py-4 text-sm text-neutral-700">
                    {user.department}
                  </td>
                  <td className="px-4 py-4">
                    {getStatusBadge(user.status)}
                  </td>
                  <td className="px-4 py-4 text-sm text-neutral-700">
                    {user.lastLogin}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(user.id)}
                        className="w-8 h-8 text-neutral-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg flex items-center justify-center transition-colors"
                        title="Edit User"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleLock(user.id)}
                        className="w-8 h-8 text-neutral-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg flex items-center justify-center transition-colors"
                        title="Lock User"
                      >
                        <Lock className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handlePause(user.id)}
                        className="w-8 h-8 text-neutral-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg flex items-center justify-center transition-colors"
                        title={user.status === 'Active' ? 'Pause User' : 'Activate User'}
                      >
                        {user.status === 'Active' ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="w-8 h-8 text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-lg flex items-center justify-center transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit User Modal */}
      <Modal
        isOpen={showAddModal || showEditModal}
        onClose={() => {
          setShowAddModal(false);
          setShowEditModal(false);
          setEditingUser(null);
          setFormData({
            name: '',
            email: '',
            role: 'User',
            department: '',
          });
        }}
        title={editingUser ? 'Edit User' : 'Add New User'}
        size="md"
      >
        <div className="space-y-3">
          <Input
            label="Full Name *"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g. John Smith"
            required
          />
          <Input
            label="Email Address *"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="e.g. john.smith@company.com"
            required
          />
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Role *
            </label>
            <Select
              options={[
                { value: 'Admin', label: 'Admin' },
                { value: 'Manager', label: 'Manager' },
                { value: 'User', label: 'User' },
              ]}
              value={formData.role}
              onChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
              placeholder="Select role"
            />
          </div>
          <Input
            label="Department"
            value={formData.department}
            onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
            placeholder="e.g. IT Department"
          />
          <div className="flex justify-end gap-2 pt-3">
            <Button
              onClick={() => {
                setShowAddModal(false);
                setShowEditModal(false);
                setEditingUser(null);
                setFormData({
                  name: '',
                  email: '',
                  role: 'User',
                  department: '',
                });
              }}
              className="bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 text-xs"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-blue-600 text-white hover:bg-blue-700 text-xs"
            >
              {editingUser ? 'Update' : 'Add'} User
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserManagement;


'use client';

import { useState } from 'react';
import { UserPlus, User, Edit, Lock, Pause, Play, Trash2, CheckCircle, X } from 'lucide-react';
import Button from '@/components/common/Button';

const UserManagement = () => {
  const [users, setUsers] = useState([
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@company.com',
      role: 'Admin',
      department: 'IT Department',
      status: 'Active',
      lastLogin: '2024-01-15 09:30 AM',
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@company.com',
      role: 'Manager',
      department: 'Finance',
      status: 'Active',
      lastLogin: '2024-01-14 02:15 PM',
    },
    {
      id: '3',
      name: 'Mike Wilson',
      email: 'mike.wilson@company.com',
      role: 'User',
      department: 'Marketing',
      status: 'Active',
      lastLogin: '2024-01-12 11:45 AM',
    },
    {
      id: '4',
      name: 'Emma Davis',
      email: 'emma.davis@company.com',
      role: 'Manager',
      department: 'HR',
      status: 'Inactive',
      lastLogin: '2023-12-20 04:30 PM',
    },
  ]);

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
    console.log('Edit user:', userId);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-1">User Management</h2>
          <p className="text-sm text-neutral-600">Add, edit, and manage user access to the asset portal</p>
        </div>
        <Button
          onClick={() => console.log('Add user')}
          icon={<UserPlus className="w-4 h-4" />}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          Add User
        </Button>
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
              {users.map((user) => (
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;


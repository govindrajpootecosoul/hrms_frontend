import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import UserModal from '../components/UserModal';
import Icon from '../components/Icon';

const Settings = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this user?')) return;
    
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (error) {
      alert('Error deactivating user');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingUser(null);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingUser(null);
    fetchUsers();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-blue via-accent-purple to-primary-blue-light bg-clip-text text-transparent">User Management</h1>
        <button
          onClick={handleAdd}
          className="px-6 py-2 rounded-lg bg-gradient-to-r from-primary-blue to-primary-blue-light text-white font-semibold hover:shadow-lg transition-all transform hover:scale-[1.02] flex items-center space-x-2"
        >
          <Icon name="person_add" size={20} />
          <span>Add User</span>
        </button>
      </div>

      <div className="glass-glow rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-blue"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-white/30">
                  <th className="text-left p-4 text-gray-600 text-xs font-semibold uppercase tracking-wide">Name</th>
                  <th className="text-left p-4 text-gray-600 text-xs font-semibold uppercase tracking-wide">Email</th>
                  <th className="text-left p-4 text-gray-600 text-xs font-semibold uppercase tracking-wide">Role</th>
                  <th className="text-left p-4 text-gray-600 text-xs font-semibold uppercase tracking-wide">Status</th>
                  <th className="text-left p-4 text-gray-600 text-xs font-semibold uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-b border-gray-100 hover:bg-white/50 transition-all">
                    <td className="p-4 text-gray-800 font-medium">{user.name}</td>
                    <td className="p-4 text-gray-600">{user.email}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin' 
                          ? 'bg-gradient-to-r from-primary-blue/20 to-primary-blue-light/20 text-primary-blue border border-primary-blue/30' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.isActive 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-blue-600 hover:text-blue-700 p-1 rounded hover:bg-blue-50 transition-all"
                          title="Edit"
                        >
                          <Icon name="edit" size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-all"
                          disabled={!user.isActive}
                          title="Delete"
                        >
                          <Icon name="delete" size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <UserModal
          user={editingUser}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default Settings;

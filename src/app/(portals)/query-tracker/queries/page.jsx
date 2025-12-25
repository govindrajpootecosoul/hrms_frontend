'use client';

import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { useAuth } from '@/lib/context/AuthContext';
import QueryModal from '../components/QueryModal';
import Icon from '../components/Icon';

export default function QueriesList() {
  const { user } = useAuth();
  const isAdmin = () => user?.role === 'admin' || user?.role === 'superadmin';
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    createdBy: ''
  });
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingQuery, setEditingQuery] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchQueries();
    if (isAdmin()) {
      fetchUsers();
    }
  }, [activeTab, filters, currentPage, user]);

  const fetchQueries = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        ...(activeTab === 'my' && user?.id ? { createdBy: user.id } : {}),
        ...(filters.status && { status: filters.status }),
        ...(filters.createdBy && { createdBy: filters.createdBy }),
        ...(filters.search && { search: filters.search })
      };

      const response = await api.get('/queries', { params });
      setQueries(response.data.queries);
      setTotalPages(response.data.pagination.pages);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching queries:', error);
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      // Only log error if it's not a 403 (expected for non-admin users)
      if (error.response?.status !== 403) {
        console.error('Error fetching users:', error);
      }
      // Silently fail for 403 - user just doesn't have admin access
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this query?')) return;
    
    try {
      await api.delete(`/queries/${id}`);
      fetchQueries();
    } catch (error) {
      alert('Error deleting query');
    }
  };

  const handleEdit = (query) => {
    setEditingQuery(query);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingQuery(null);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingQuery(null);
    fetchQueries();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-blue via-accent-purple to-primary-blue-light bg-clip-text text-transparent">Queries List</h1>
        <button
          onClick={handleAdd}
          className="px-6 py-2 rounded-lg bg-gradient-to-r from-primary-blue to-primary-blue-light text-white font-semibold hover:shadow-lg transition-all transform hover:scale-[1.02] flex items-center space-x-2"
        >
          <Icon name="add" size={20} />
          <span>Add Query</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-gray-200">
        <button
          onClick={() => {
            setActiveTab('all');
            setCurrentPage(1);
          }}
          className={`px-4 py-2 font-semibold transition-all ${
            activeTab === 'all'
              ? 'text-primary-blue border-b-2 border-primary-blue'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          All Queries
        </button>
        <button
          onClick={() => {
            setActiveTab('my');
            setCurrentPage(1);
          }}
          className={`px-4 py-2 font-semibold transition-all ${
            activeTab === 'my'
              ? 'text-primary-blue border-b-2 border-primary-blue'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          My Queries
        </button>
      </div>

      {/* Filters */}
      <div className="glass p-4 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Search by customer name, mobile, or query type..."
          value={filters.search}
          onChange={(e) => {
            setFilters({ ...filters, search: e.target.value });
            setCurrentPage(1);
          }}
          className="border border-gray-200 bg-white/50 p-2 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
        />
        <select
          value={filters.status}
          onChange={(e) => {
            setFilters({ ...filters, status: e.target.value });
            setCurrentPage(1);
          }}
          className="border border-gray-200 bg-white/50 p-2 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
        >
          <option value="">All Status</option>
          <option value="Open">Open</option>
          <option value="In-Progress">In-Progress</option>
          <option value="Closed">Closed</option>
        </select>
        {isAdmin() && (
          <select
            value={filters.createdBy}
            onChange={(e) => {
              setFilters({ ...filters, createdBy: e.target.value });
              setCurrentPage(1);
            }}
            className="border border-gray-200 bg-white/50 p-2 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
          >
            <option value="">All Users</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Table */}
      <div className="glass-glow rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-blue"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-white/30">
                    <th className="text-left p-4 text-gray-600 text-xs font-semibold uppercase tracking-wide">Platform</th>
                    <th className="text-left p-4 text-gray-600 text-xs font-semibold uppercase tracking-wide">Customer Name</th>
                    <th className="text-left p-4 text-gray-600 text-xs font-semibold uppercase tracking-wide">Mobile</th>
                    <th className="text-left p-4 text-gray-600 text-xs font-semibold uppercase tracking-wide">Email</th>
                    <th className="text-left p-4 text-gray-600 text-xs font-semibold uppercase tracking-wide">Company</th>
                    <th className="text-left p-4 text-gray-600 text-xs font-semibold uppercase tracking-wide">Location</th>
                    <th className="text-left p-4 text-gray-600 text-xs font-semibold uppercase tracking-wide">Query</th>
                    <th className="text-left p-4 text-gray-600 text-xs font-semibold uppercase tracking-wide">Status</th>
                    <th className="text-left p-4 text-gray-600 text-xs font-semibold uppercase tracking-wide">Received Date</th>
                    <th className="text-left p-4 text-gray-600 text-xs font-semibold uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {queries.map((query) => (
                    <tr key={query._id} className="border-b border-gray-100 hover:bg-white/50 transition-all">
                      <td className="p-4 text-gray-800 font-medium">{query.platform}</td>
                      <td className="p-4 text-gray-800 font-medium">{query.customerName}</td>
                      <td className="p-4 text-gray-600">{query.customerMobile}</td>
                      <td className="p-4 text-gray-600">{query.customerEmail || 'N/A'}</td>
                      <td className="p-4 text-gray-600">{query.companyName || 'N/A'}</td>
                      <td className="p-4 text-gray-600">{query.location || 'N/A'}</td>
                      <td className="p-4 text-gray-600 max-w-xs truncate">{query.customerQuery}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      query.status === 'Open' ? 'bg-blue-100 text-blue-700' :
                      query.status === 'Closed' ? 'bg-green-100 text-green-700' :
                      'bg-purple-100 text-purple-700'
                        }`}>
                          {query.status}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500 text-sm">
                        {new Date(query.queryReceivedDate).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(query)}
                            className="text-blue-600 hover:text-blue-700 p-1 rounded hover:bg-blue-50 transition-all"
                            disabled={!isAdmin() && query.createdBy?._id !== user?.id}
                            title="Edit"
                          >
                            <Icon name="edit" size={18} />
                          </button>
                          {isAdmin() && (
                            <button
                              onClick={() => handleDelete(query._id)}
                              className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-all"
                              title="Delete"
                            >
                              <Icon name="delete" size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {queries.length === 0 && (
              <div className="text-center py-8 text-gray-500">No queries found</div>
            )}
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 p-4 border-t border-gray-200">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Previous
                </button>
                <span className="text-gray-600 px-4">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {showModal && (
        <QueryModal
          query={editingQuery}
          users={users}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}


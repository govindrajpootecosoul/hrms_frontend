'use client';

import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../utils/api';
import { useQueryTrackerAuth } from '../hooks/useQueryTrackerAuth';

const Dashboard = () => {
  const { isAdmin } = useQueryTrackerAuth();
  const [stats, setStats] = useState({
    totalQueries: 0,
    openQueries: 0,
    closedQueries: 0,
    inProgressQueries: 0,
    sourceStats: [],
    userStats: [],
    monthlyStats: { open: 0, closed: 0 }
  });
  const [recentQueries, setRecentQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      const [queriesRes, recentRes] = await Promise.all([
        api.get('/queries?limit=1000'),
        api.get('/queries?limit=10')
      ]);

      const allQueries = queriesRes.data.queries || [];
      
      // Calculate stats
      const total = allQueries.length;
      const open = allQueries.filter(q => q.status === 'Open').length;
      const closed = allQueries.filter(q => q.status === 'Closed').length;
      const inProgress = allQueries.filter(q => q.status === 'In-Progress').length;

      // Source statistics
      const sources = ['Website', 'Email', 'Phone', 'WhatsApp'];
      const sourceStats = sources.map(source => ({
        name: source,
        value: allQueries.filter(q => q.platform === source).length,
        percentage: total > 0 ? ((allQueries.filter(q => q.platform === source).length / total) * 100).toFixed(1) : 0
      }));

      // User statistics (admin only)
      let userStats = [];
      if (isAdmin()) {
        const userMap = {};
        allQueries.forEach(query => {
          const userId = query.createdBy?._id || 'unknown';
          const userName = query.createdBy?.name || 'Unknown';
          if (!userMap[userId]) {
            userMap[userId] = { name: userName, count: 0 };
          }
          userMap[userId].count++;
        });
        userStats = Object.values(userMap).slice(0, 10);
      }

      // Monthly stats (this month)
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyQueries = allQueries.filter(q => {
        const queryDate = new Date(q.queryReceivedDate);
        return queryDate.getMonth() === currentMonth && queryDate.getFullYear() === currentYear;
      });
      const monthlyStats = {
        open: monthlyQueries.filter(q => q.status === 'Open').length,
        closed: monthlyQueries.filter(q => q.status === 'Closed').length
      };

      setStats({
        totalQueries: total,
        openQueries: open,
        closedQueries: closed,
        inProgressQueries: inProgress,
        sourceStats,
        userStats,
        monthlyStats
      });

      setRecentQueries(recentRes.data.queries || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to load dashboard data';
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: errorMessage
      });
      setError(errorMessage);
      setLoading(false);
      // Set empty stats on error
      setStats({
        totalQueries: 0,
        openQueries: 0,
        closedQueries: 0,
        inProgressQueries: 0,
        sourceStats: [],
        userStats: [],
        monthlyStats: { open: 0, closed: 0 }
      });
      setRecentQueries([]);
    }
  };

  const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#f97316', '#60a5fa'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-gray-500 text-sm">Welcome to your query management center</p>
      </div>

      {error && (
        <div className={`border rounded-lg p-4 mb-4 ${
          error.includes('Token') || error.includes('Unauthorized') || error.includes('401')
            ? 'bg-red-50 border-red-200'
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className={`w-5 h-5 mr-2 ${
                error.includes('Token') || error.includes('Unauthorized') || error.includes('401')
                  ? 'text-red-600'
                  : 'text-yellow-600'
              }`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className={`text-sm font-medium ${
                  error.includes('Token') || error.includes('Unauthorized') || error.includes('401')
                    ? 'text-red-800'
                    : 'text-yellow-800'
                }`}>
                  {error}
                </p>
                {(error.includes('Token') || error.includes('Unauthorized') || error.includes('401')) && (
                  <p className="text-xs text-red-600 mt-1">
                    Please try refreshing the page or logging in again.
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/75 backdrop-blur-lg p-6 rounded-2xl transform hover:scale-[1.02] transition-all relative overflow-hidden group shadow-lg border border-white/50">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-all" />
          <div className="relative z-10">
            <div className="text-gray-500 text-xs font-medium mb-2 uppercase tracking-wide">Total Queries</div>
            <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {stats.totalQueries}
            </div>
          </div>
        </div>
        <div className="bg-white/75 backdrop-blur-lg p-6 rounded-2xl transform hover:scale-[1.02] transition-all relative overflow-hidden group shadow-lg border border-white/50">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-all" />
          <div className="relative z-10">
            <div className="text-gray-500 text-xs font-medium mb-2 uppercase tracking-wide">Open Queries</div>
            <div className="text-4xl font-bold text-blue-600">{stats.openQueries}</div>
          </div>
        </div>
        <div className="bg-white/75 backdrop-blur-lg p-6 rounded-2xl transform hover:scale-[1.02] transition-all relative overflow-hidden group shadow-lg border border-white/50">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-purple-500/10 transition-all" />
          <div className="relative z-10">
            <div className="text-gray-500 text-xs font-medium mb-2 uppercase tracking-wide">In Progress</div>
            <div className="text-4xl font-bold text-purple-600">{stats.inProgressQueries}</div>
          </div>
        </div>
        <div className="bg-white/75 backdrop-blur-lg p-6 rounded-2xl transform hover:scale-[1.02] transition-all relative overflow-hidden group shadow-lg border border-white/50">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-green-500/10 transition-all" />
          <div className="relative z-10">
            <div className="text-gray-500 text-xs font-medium mb-2 uppercase tracking-wide">Closed Queries</div>
            <div className="text-4xl font-bold text-green-600">{stats.closedQueries}</div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Query Source Chart */}
        <div className="bg-white/75 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-white/50">
          <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
            <span className="w-1 h-6 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full mr-3"></span>
            Query Sources
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.sourceStats}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {stats.sourceStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  borderRadius: '12px',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Stats Chart (Admin only) */}
        {isAdmin() && (
          <div className="bg-white/75 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-white/50">
            <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
              <span className="w-1 h-6 bg-gradient-to-b from-purple-600 to-pink-600 rounded-full mr-3"></span>
              This Month's Queries
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[{ name: 'Open', value: stats.monthlyStats.open }, { name: 'Closed', value: stats.monthlyStats.closed }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    borderRadius: '12px',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
                  }} 
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* User Stats Chart (Admin only) */}
        {isAdmin() && stats.userStats.length > 0 && (
          <div className="bg-white/75 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-white/50 lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
              <span className="w-1 h-6 bg-gradient-to-b from-orange-500 to-red-500 rounded-full mr-3"></span>
              Queries by User
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.userStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" angle={-45} textAnchor="end" height={100} />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    borderRadius: '12px',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
                  }} 
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Recent Queries Table */}
      <div className="bg-white/75 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-white/50">
        <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
          <span className="w-1 h-6 bg-gradient-to-b from-pink-500 to-rose-500 rounded-full mr-3"></span>
          Recent Queries
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left p-4 text-gray-600 text-xs font-semibold uppercase tracking-wide">Customer</th>
                <th className="text-left p-4 text-gray-600 text-xs font-semibold uppercase tracking-wide">Platform</th>
                <th className="text-left p-4 text-gray-600 text-xs font-semibold uppercase tracking-wide">Status</th>
                <th className="text-left p-4 text-gray-600 text-xs font-semibold uppercase tracking-wide">Created By</th>
                <th className="text-left p-4 text-gray-600 text-xs font-semibold uppercase tracking-wide">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentQueries.map((query) => (
                <tr key={query._id} className="border-b border-gray-100 hover:bg-white/50 transition-all">
                  <td className="p-4 text-gray-800 font-medium">{query.customerName}</td>
                  <td className="p-4 text-gray-600">{query.platform}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      query.status === 'Open' ? 'bg-blue-100 text-blue-700' :
                      query.status === 'Closed' ? 'bg-green-100 text-green-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {query.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">{query.createdBy?.name || 'N/A'}</td>
                  <td className="p-4 text-gray-500 text-sm">
                    {new Date(query.queryReceivedDate).toLocaleDateString()}
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

export default Dashboard;


'use client';

import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../lib/api';
import { useAuth } from '@/lib/context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = () => user?.role === 'admin' || user?.role === 'superadmin';
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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [queriesRes, recentRes] = await Promise.all([
        api.get('/queries?limit=1000'),
        api.get('/queries?limit=10')
      ]);

      const allQueries = queriesRes.data.queries;
      
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

      setRecentQueries(recentRes.data.queries);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#f97316', '#60a5fa'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-blue"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary-blue via-accent-purple to-primary-blue-light bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-gray-500 text-sm">Welcome to your query management center</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-glow p-6 rounded-2xl transform hover:scale-[1.02] transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-blue/5 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-primary-blue/10 transition-all" />
          <div className="relative z-10">
            <div className="text-gray-500 text-xs font-medium mb-2 uppercase tracking-wide">Total Queries</div>
            <div className="text-4xl font-bold bg-gradient-to-r from-primary-blue to-primary-blue-light bg-clip-text text-transparent">
              {stats.totalQueries}
            </div>
          </div>
        </div>
        <div className="glass-glow p-6 rounded-2xl transform hover:scale-[1.02] transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-blue/5 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-primary-blue/10 transition-all" />
          <div className="relative z-10">
            <div className="text-gray-500 text-xs font-medium mb-2 uppercase tracking-wide">Open Queries</div>
            <div className="text-4xl font-bold text-primary-blue">{stats.openQueries}</div>
          </div>
        </div>
        <div className="glass-glow p-6 rounded-2xl transform hover:scale-[1.02] transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent-purple/5 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-accent-purple/10 transition-all" />
          <div className="relative z-10">
            <div className="text-gray-500 text-xs font-medium mb-2 uppercase tracking-wide">In Progress</div>
            <div className="text-4xl font-bold text-accent-purple">{stats.inProgressQueries}</div>
          </div>
        </div>
        <div className="glass-glow p-6 rounded-2xl transform hover:scale-[1.02] transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent-green/5 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-accent-green/10 transition-all" />
          <div className="relative z-10">
            <div className="text-gray-500 text-xs font-medium mb-2 uppercase tracking-wide">Closed Queries</div>
            <div className="text-4xl font-bold text-accent-green">{stats.closedQueries}</div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Query Source Chart */}
        <div className="glass-glow p-6 rounded-2xl">
          <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
            <span className="w-1 h-6 bg-gradient-to-b from-primary-blue to-primary-blue-light rounded-full mr-3"></span>
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
          <div className="glass-glow p-6 rounded-2xl">
            <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
              <span className="w-1 h-6 bg-gradient-to-b from-accent-purple to-accent-purple-light rounded-full mr-3"></span>
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
          <div className="glass-glow p-6 rounded-2xl lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
              <span className="w-1 h-6 bg-gradient-to-b from-accent-orange to-accent-orange-light rounded-full mr-3"></span>
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
      <div className="glass-glow p-6 rounded-2xl">
          <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
            <span className="w-1 h-6 bg-gradient-to-b from-accent-pink to-accent-pink-light rounded-full mr-3"></span>
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
}


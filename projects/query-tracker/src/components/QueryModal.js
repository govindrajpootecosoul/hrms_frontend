import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const QueryModal = ({ query, users, onClose }) => {
  const { isAdmin } = useAuth();
  const [formData, setFormData] = useState({
    platform: 'Website',
    customerName: '',
    customerMobile: '',
    customerEmail: '',
    companyName: '',
    location: '',
    customerQuery: '',
    agentRemark: '',
    queryReceivedDate: new Date().toISOString().split('T')[0],
    agentCallingDate: '',
    status: 'Open',
    assignedTo: '',
    queryType: '',
    howDidYouHearAboutUs: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (query) {
      setFormData({
        platform: query.platform || 'Website',
        customerName: query.customerName || '',
        customerMobile: query.customerMobile || '',
        customerEmail: query.customerEmail || '',
        companyName: query.companyName || '',
        location: query.location || '',
        customerQuery: query.customerQuery || '',
        agentRemark: query.agentRemark || '',
        queryReceivedDate: query.queryReceivedDate ? new Date(query.queryReceivedDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        agentCallingDate: query.agentCallingDate ? new Date(query.agentCallingDate).toISOString().split('T')[0] : '',
        status: query.status || 'Open',
        assignedTo: query.assignedTo?._id || '',
        queryType: query.queryType || '',
        howDidYouHearAboutUs: query.howDidYouHearAboutUs || ''
      });
    }
  }, [query]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (query) {
        await api.put(`/queries/${query._id}`, formData);
      } else {
        await api.post('/queries', formData);
      }
      onClose();
    } catch (error) {
      setError(error.response?.data?.message || 'Error saving query');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-glow rounded-2xl w-full max-w-5xl shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-blue via-accent-purple to-primary-blue-light bg-clip-text text-transparent">
            {query ? 'Edit Query' : 'Add New Query'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-3xl leading-none transition-colors p-1 rounded-lg hover:bg-gray-100"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 bg-red-50 p-3 rounded-lg text-red-600 text-sm border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-4 gap-3">
            {/* Row 1 */}
            <div className="col-span-1">
              <label className="block text-gray-900 text-xs mb-1 font-medium">Platform *</label>
              <select
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                required
                className="w-full border border-gray-200 bg-white/50 p-2 rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
              >
                <option value="Website">Website</option>
                <option value="Email">Email</option>
                <option value="Phone">Phone</option>
                <option value="WhatsApp">WhatsApp</option>
              </select>
            </div>

            <div className="col-span-1">
              <label className="block text-gray-900 text-xs mb-1 font-medium">Status *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                required
                className="w-full border border-gray-200 bg-white/50 p-2 rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
              >
                <option value="Open">Open</option>
                <option value="In-Progress">In-Progress</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div className="col-span-1">
              <label className="block text-gray-900 text-xs mb-1 font-medium">Query Type</label>
              <input
                type="text"
                value={formData.queryType}
                onChange={(e) => setFormData({ ...formData, queryType: e.target.value })}
                className="w-full border border-gray-200 bg-white/50 p-2 rounded-lg text-gray-800 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
                placeholder="Type"
              />
            </div>

            {isAdmin() && (
              <div className="col-span-1">
                <label className="block text-gray-900 text-xs mb-1 font-medium">Assign To</label>
                <select
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  className="w-full border border-gray-200 bg-white/50 p-2 rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
                >
                  <option value="">Unassigned</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-4 gap-3 mt-3">
            <div className="col-span-2">
              <label className="block text-gray-900 text-xs mb-1 font-medium">Customer Name *</label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                required
                className="w-full border border-gray-200 bg-white/50 p-2 rounded-lg text-gray-800 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
                placeholder="Full Name"
              />
            </div>

            <div className="col-span-1">
              <label className="block text-gray-900 text-xs mb-1 font-medium">Customer Mobile *</label>
              <input
                type="text"
                value={formData.customerMobile}
                onChange={(e) => setFormData({ ...formData, customerMobile: e.target.value })}
                required
                className="w-full border border-gray-200 bg-white/50 p-2 rounded-lg text-gray-800 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
                placeholder="Mobile"
              />
            </div>

            <div className="col-span-1">
              <label className="block text-gray-900 text-xs mb-1 font-medium">Customer Email</label>
              <input
                type="email"
                value={formData.customerEmail}
                onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                className="w-full border border-gray-200 bg-white/50 p-2 rounded-lg text-gray-800 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
                placeholder="Email"
              />
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-4 gap-3 mt-3">
            <div className="col-span-2">
              <label className="block text-gray-900 text-xs mb-1 font-medium">Company Name</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full border border-gray-200 bg-white/50 p-2 rounded-lg text-gray-800 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
                placeholder="Company"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-gray-900 text-xs mb-1 font-medium">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full border border-gray-200 bg-white/50 p-2 rounded-lg text-gray-800 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
                placeholder="City, Country"
              />
            </div>
          </div>

          {/* Row 4 */}
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <label className="block text-gray-900 text-xs mb-1 font-medium">Query Received Date *</label>
              <input
                type="date"
                value={formData.queryReceivedDate}
                onChange={(e) => setFormData({ ...formData, queryReceivedDate: e.target.value })}
                required
                className="w-full border border-gray-200 bg-white/50 p-2 rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-gray-900 text-xs mb-1 font-medium">Agent Calling Date</label>
              <input
                type="date"
                value={formData.agentCallingDate}
                onChange={(e) => setFormData({ ...formData, agentCallingDate: e.target.value })}
                className="w-full border border-gray-200 bg-white/50 p-2 rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Row 5 */}
          <div className="mt-3">
            <label className="block text-gray-700 text-xs mb-1 font-medium">Customer Query *</label>
            <textarea
              value={formData.customerQuery}
              onChange={(e) => setFormData({ ...formData, customerQuery: e.target.value })}
              required
              rows="2"
              className="w-full border border-gray-200 bg-white/50 p-2 rounded-lg text-gray-800 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all resize-none"
              placeholder="Enter customer query details..."
            />
          </div>

          {/* Row 6 */}
          <div className="mt-3">
            <label className="block text-gray-700 text-xs mb-1 font-medium">Agent Remark</label>
            <textarea
              value={formData.agentRemark}
              onChange={(e) => setFormData({ ...formData, agentRemark: e.target.value })}
              rows="2"
              className="w-full border border-gray-200 bg-white/50 p-2 rounded-lg text-gray-800 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all resize-none"
              placeholder="Add agent remarks or notes..."
            />
          </div>

          {/* Row 7 - How did you hear about us */}
          <div className="mt-3">
            <label className="block text-gray-700 text-xs mb-1 font-medium">How did you hear about us?</label>
            <input
              type="text"
              value={formData.howDidYouHearAboutUs}
              onChange={(e) => setFormData({ ...formData, howDidYouHearAboutUs: e.target.value })}
              className="w-full border border-gray-200 bg-white/50 p-2 rounded-lg text-gray-800 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
              placeholder="e.g., Google Search, Social Media, Referral, etc."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-100 transition-all border border-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-primary-blue to-primary-blue-light text-white font-semibold text-sm hover:shadow-lg transition-all disabled:opacity-50 transform hover:scale-[1.02]"
            >
              {loading ? 'Saving...' : query ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QueryModal;

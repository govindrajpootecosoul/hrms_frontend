'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { useCompany } from '@/lib/context/CompanyContext';
import { useParams } from 'next/navigation';

export default function RecruiterManagementDialog({ open, onOpenChange, onRecruitersUpdated }) {
  const params = useParams();
  const companyId = params.companyId;
  const { currentCompany } = useCompany();
  
  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingRecruiter, setEditingRecruiter] = useState(null);
  const [deletingRecruiter, setDeletingRecruiter] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'recruiter'
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Get company name helper
  const getCompanyName = () => {
    let company = currentCompany?.name;
    if (!company && typeof window !== 'undefined') {
      company = sessionStorage.getItem('selectedCompany') || 
               sessionStorage.getItem('adminSelectedCompany');
    }
    if (!company && companyId && companyId !== 'undefined') {
      if (typeof window !== 'undefined') {
        company = sessionStorage.getItem(`company_${companyId}`);
      }
    }
    return company;
  };

  // Fetch recruiters
  useEffect(() => {
    if (open) {
      fetchRecruiters();
    }
  }, [open]);

  const fetchRecruiters = async () => {
    try {
      setLoading(true);
      const company = getCompanyName();
      const token = localStorage.getItem('auth_token');
      const headers = {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };
      if (company) {
        // For HRMS Admin Portal - don't send company header to allow all data access
        // headers['x-company'] = company;
      }

      const res = await fetch('/api/hrms-portal/recruitment/recruiters', { headers });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setRecruiters(json.data || []);
        }
      }
    } catch (error) {
      console.error('Fetch recruiters error:', error);
      alert('Failed to fetch recruiters: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setFormData({ name: '', email: '', phone: '', role: 'recruiter' });
    setErrors({});
    setEditingRecruiter(null);
    setIsAddDialogOpen(true);
  };

  const handleEdit = (recruiter) => {
    setFormData({
      name: recruiter.name || '',
      email: recruiter.email || '',
      phone: recruiter.phone || '',
      role: recruiter.role || 'recruiter'
    });
    setErrors({});
    setEditingRecruiter(recruiter);
    setIsAddDialogOpen(true);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = 'Name is required';
    }
    if (!formData.email || formData.email.trim() === '') {
      newErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Invalid email format';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      const company = getCompanyName();
      const token = localStorage.getItem('auth_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };
      if (company) {
        // For HRMS Admin Portal - don't send company header to allow all data access
        // headers['x-company'] = company;
      }

      const url = editingRecruiter
        ? `/api/hrms-portal/recruitment/recruiters/${editingRecruiter.id}`
        : '/api/hrms-portal/recruitment/recruiters';
      
      const method = editingRecruiter ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setIsAddDialogOpen(false);
        setEditingRecruiter(null);
        setFormData({ name: '', email: '', phone: '', role: 'recruiter' });
        await fetchRecruiters();
        if (onRecruitersUpdated) {
          onRecruitersUpdated();
        }
        alert(editingRecruiter ? 'Recruiter updated successfully!' : 'Recruiter added successfully!');
      } else {
        alert('Failed to save recruiter: ' + (json.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Save recruiter error:', error);
      alert('Failed to save recruiter: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingRecruiter) return;

    try {
      const company = getCompanyName();
      const token = localStorage.getItem('auth_token');
      const headers = {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };
      if (company) {
        // For HRMS Admin Portal - don't send company header to allow all data access
        // headers['x-company'] = company;
      }

      const res = await fetch(`/api/hrms-portal/recruitment/recruiters/${deletingRecruiter.id}`, {
        method: 'DELETE',
        headers,
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setDeletingRecruiter(null);
        await fetchRecruiters();
        if (onRecruitersUpdated) {
          onRecruitersUpdated();
        }
        alert('Recruiter deleted successfully!');
      } else {
        alert('Failed to delete recruiter: ' + (json.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Delete recruiter error:', error);
      alert('Failed to delete recruiter: ' + error.message);
    }
  };

  return (
    <>
      <Modal
        isOpen={open}
        onClose={() => onOpenChange(false)}
        title="Manage Recruiters"
        size="lg"
      >
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-slate-600">Add, edit, or remove recruiters from the list</p>
            <Button
              onClick={handleAdd}
              className="bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Recruiter
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : (
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Phone</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {recruiters.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-sm text-slate-500">
                        No recruiters found. Click "Add Recruiter" to add one.
                      </td>
                    </tr>
                  ) : (
                    recruiters.map((recruiter) => (
                      <tr key={recruiter.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm text-slate-900">{recruiter.name}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{recruiter.email}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{recruiter.phone || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-slate-600 capitalize">{recruiter.role || 'recruiter'}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(recruiter)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeletingRecruiter(recruiter)}
                              className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Modal>

      {/* Add/Edit Recruiter Dialog */}
      <Modal
        isOpen={isAddDialogOpen}
        onClose={() => {
          setIsAddDialogOpen(false);
          setEditingRecruiter(null);
          setFormData({ name: '', email: '', phone: '', role: 'recruiter' });
          setErrors({});
        }}
        title={editingRecruiter ? 'Edit Recruiter' : 'Add Recruiter'}
        size="sm"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button
              onClick={() => {
                setIsAddDialogOpen(false);
                setEditingRecruiter(null);
                setFormData({ name: '', email: '', phone: '', role: 'recruiter' });
                setErrors({});
              }}
              disabled={saving}
              className="bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {saving ? 'Saving...' : (editingRecruiter ? 'Update' : 'Add')}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={errors.name ? 'border-red-500' : ''}
              placeholder="John Doe"
            />
            {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={errors.email ? 'border-red-500' : ''}
              placeholder="john.doe@example.com"
            />
            {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91 9876543210"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="recruiter">Recruiter</option>
              <option value="hr">HR</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Dialog */}
      {deletingRecruiter && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setDeletingRecruiter(null)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Delete Recruiter</h3>
            <p className="text-sm text-slate-600 mb-4">
              Are you sure you want to delete <strong>{deletingRecruiter.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeletingRecruiter(null)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


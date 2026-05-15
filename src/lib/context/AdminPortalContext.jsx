'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/utils/constants';

const initialPortalFeatures = [
  {
    portal: 'Asset Tracker',
    categories: ['Laptop', 'Mobile'],
    subcategories: ['Macbook', 'iPhone'],
    locations: ['Delhi', 'Mumbai']
  },
  {
    portal: 'HRMS',
    categories: ['Employee', 'Department'],
    subcategories: ['Full-time', 'Part-time'],
    locations: ['Delhi', 'Bangalore', 'Mumbai']
  },
  {
    portal: 'Finance Tools',
    categories: ['Expenses', 'Invoices'],
    subcategories: ['Travel', 'Equipment'],
    locations: ['Delhi', 'Mumbai', 'Bangalore']
  },
  {
    portal: 'Project Tracker',
    categories: ['Projects', 'Tasks'],
    subcategories: ['Active', 'Completed'],
    locations: ['Delhi', 'Mumbai']
  }
];

const AdminPortalContext = createContext();

export const useAdminPortal = () => {
  const context = useContext(AdminPortalContext);
  if (!context) {
    throw new Error('useAdminPortal must be used within an AdminPortalProvider');
  }
  return context;
};

export const AdminPortalProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [portalFeatures, setPortalFeatures] = useState(initialPortalFeatures);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(undefined);
  const [departments, setDepartments] = useState([]);
  const [departmentManagers, setDepartmentManagers] = useState({});
  const [deptLoading, setDeptLoading] = useState(false);
  const [deptError, setDeptError] = useState(null);

  // Get selected company from sessionStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const company = sessionStorage.getItem('adminSelectedCompany');
      setSelectedCompany(company || '');
    }
  }, []);

  // Fetch users from API on mount and when company changes
  useEffect(() => {
    // Avoid firing API request before company is loaded from sessionStorage.
    if (selectedCompany === undefined) return;
    if (!selectedCompany) {
      setUsers([]);
      setError('Please select a company to view users.');
      setLoading(false);
      return;
    }
    fetchUsers();
    fetchDepartmentsAndManagers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCompany]);

  const fetchUsers = async (opts = {}) => {
    const { silent = false } = opts;
    try {
      if (!silent) {
        setLoading(true);
      }
      setError(null);
      
      // Build API URL with company filter if available
      let apiUrl = `${API_BASE_URL}/admin-users`;
      if (selectedCompany) {
        apiUrl += `?company=${encodeURIComponent(selectedCompany)}`;
      }
      
      console.log('[AdminPortal] Fetching users from:', apiUrl);
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('[AdminPortal] API Response:', {
        success: data.success,
        userCount: data.users?.length || 0,
        total: data.total,
        database: data.database,
        message: data.message
      });
      
      if (data.success) {
        const usersList = data.users || [];
        console.log(`[AdminPortal] Setting ${usersList.length} users in state`);
        setUsers(usersList);
        
        if (usersList.length === 0) {
          console.warn('[AdminPortal] No users returned from API. Check database connection and data.');
        }
      } else {
        setError(data.error || 'Failed to fetch users');
        console.error('[AdminPortal] API returned error:', data.error);
      }
    } catch (err) {
      console.error('[AdminPortal] Error fetching users:', err);
      setError(err.message || 'Failed to fetch users');
      // Set empty array on error to prevent showing stale data
      setUsers([]);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const fetchDepartmentsAndManagers = async () => {
    if (!selectedCompany) return;
    try {
      setDeptLoading(true);
      setDeptError(null);

      const deptUrl = `${API_BASE_URL}/admin-users/departments/list?company=${encodeURIComponent(selectedCompany)}`;
      const mgrUrl = `${API_BASE_URL}/admin-users/departments/managers?company=${encodeURIComponent(selectedCompany)}`;

      const [deptRes, mgrRes] = await Promise.all([fetch(deptUrl), fetch(mgrUrl)]);
      const deptData = await deptRes.json();
      const mgrData = await mgrRes.json();

      if (!deptRes.ok) {
        throw new Error(deptData?.error || `Failed to fetch departments (HTTP ${deptRes.status})`);
      }
      if (!mgrRes.ok) {
        throw new Error(mgrData?.error || `Failed to fetch department managers (HTTP ${mgrRes.status})`);
      }

      if (deptData?.success) {
        setDepartments(Array.isArray(deptData.departments) ? deptData.departments : []);
      } else {
        throw new Error(deptData?.error || 'Failed to fetch departments');
      }

      if (mgrData?.success) {
        setDepartmentManagers(mgrData.managersByDepartment || {});
      } else {
        throw new Error(mgrData?.error || 'Failed to fetch department managers');
      }
    } catch (e) {
      console.error('[AdminPortal] fetchDepartmentsAndManagers error:', e);
      setDeptError(e.message || 'Failed to load departments');
      setDepartments([]);
      setDepartmentManagers({});
    } finally {
      setDeptLoading(false);
    }
  };

  const setDepartmentManager = async (department, managerUserIds) => {
    if (!selectedCompany) {
      throw new Error('Please select a company first.');
    }
    const dept = String(department || '').trim();
    if (!dept) throw new Error('Department is required.');

    const apiUrl = `${API_BASE_URL}/admin-users/departments/${encodeURIComponent(dept)}/manager?company=${encodeURIComponent(selectedCompany)}`;
    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ managerUserIds: Array.isArray(managerUserIds) ? managerUserIds : [] }),
    });
    const data = await response.json();
    if (!response.ok || !data?.success) {
      throw new Error(data?.error || 'Failed to update department manager');
    }

    // Refresh mapping (cheap) to stay consistent with backend
    await fetchDepartmentsAndManagers();
    return data;
  };

  const addUser = async (userData) => {
    try {
      // Build API URL with company filter if available
      let apiUrl = `${API_BASE_URL}/admin-users`;
      if (selectedCompany) {
        apiUrl += `?company=${encodeURIComponent(selectedCompany)}`;
      }
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        if (data.user) {
          setUsers((prev) => [...prev, data.user]);
        } else {
          await fetchUsers({ silent: true });
        }
        return data.user;
      } else {
        throw new Error(data.error || 'Failed to create user');
      }
    } catch (err) {
      console.error('Error creating user:', err);
      throw err;
    }
  };

  const updateUser = async (id, userData) => {
    try {
      // Build API URL with company filter if available
      let apiUrl = `${API_BASE_URL}/admin-users/${id}`;
      if (selectedCompany) {
        apiUrl += `?company=${encodeURIComponent(selectedCompany)}`;
      }
      
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        if (data.user) {
          const uid = String(data.user.id || data.user._id || '');
          setUsers((prev) =>
            prev.map((u) => (String(u.id || u._id) === uid ? { ...u, ...data.user } : u))
          );
        } else {
          await fetchUsers({ silent: true });
        }
        return data.user;
      } else {
        throw new Error(data.error || 'Failed to update user');
      }
    } catch (err) {
      console.error('Error updating user:', err);
      throw err;
    }
  };

  const deleteUser = async (id) => {
    try {
      // Build API URL with company filter if available
      let apiUrl = `${API_BASE_URL}/admin-users/${id}`;
      if (selectedCompany) {
        apiUrl += `?company=${encodeURIComponent(selectedCompany)}`;
      }
      
      const response = await fetch(apiUrl, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        const sid = String(id);
        setUsers((prev) => prev.filter((u) => String(u.id || u._id) !== sid));
      } else {
        throw new Error(data.error || 'Failed to delete user');
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      throw err;
    }
  };

  const toggleUserActive = async (id) => {
    try {
      // Build API URL with company filter if available
      let apiUrl = `${API_BASE_URL}/admin-users/${id}/toggle-active`;
      if (selectedCompany) {
        apiUrl += `?company=${encodeURIComponent(selectedCompany)}`;
      }
      
      const response = await fetch(apiUrl, {
        method: 'PATCH',
      });
      
      const data = await response.json();
      
      if (data.success) {
        const sid = String(id);
        setUsers((prev) =>
          prev.map((u) =>
            String(u.id || u._id) === sid ? { ...u, active: data.active !== false } : u
          )
        );
      } else {
        throw new Error(data.error || 'Failed to toggle user status');
      }
    } catch (err) {
      console.error('Error toggling user status:', err);
      throw err;
    }
  };

  const updatePortalFeature = (portal, feature) => {
    setPortalFeatures(portalFeatures.map(pf => 
      pf.portal === portal ? { ...pf, ...feature } : pf
    ));
  };

  const addCategory = (portal, category) => {
    setPortalFeatures(portalFeatures.map(pf => 
      pf.portal === portal 
        ? { ...pf, categories: [...pf.categories, category] }
        : pf
    ));
  };

  const deleteCategory = (portal, category) => {
    setPortalFeatures(portalFeatures.map(pf => 
      pf.portal === portal 
        ? { ...pf, categories: pf.categories.filter(c => c !== category) }
        : pf
    ));
  };

  const addSubcategory = (portal, subcategory) => {
    setPortalFeatures(portalFeatures.map(pf => 
      pf.portal === portal 
        ? { ...pf, subcategories: [...pf.subcategories, subcategory] }
        : pf
    ));
  };

  const deleteSubcategory = (portal, subcategory) => {
    setPortalFeatures(portalFeatures.map(pf => 
      pf.portal === portal 
        ? { ...pf, subcategories: pf.subcategories.filter(s => s !== subcategory) }
        : pf
    ));
  };

  const addLocation = (portal, location) => {
    setPortalFeatures(portalFeatures.map(pf => 
      pf.portal === portal 
        ? { ...pf, locations: [...pf.locations, location] }
        : pf
    ));
  };

  const deleteLocation = (portal, location) => {
    setPortalFeatures(portalFeatures.map(pf => 
      pf.portal === portal 
        ? { ...pf, locations: pf.locations.filter(l => l !== location) }
        : pf
    ));
  };

  const setCompany = (company) => {
    if (typeof window !== 'undefined') {
      const normalizedCompany = company || '';
      sessionStorage.setItem('adminSelectedCompany', normalizedCompany);
      setSelectedCompany(normalizedCompany);
    }
  };

  const value = {
    users,
    portalFeatures,
    loading,
    error,
    selectedCompany,
    setCompany,
    departments,
    departmentManagers,
    deptLoading,
    deptError,
    addUser,
    updateUser,
    deleteUser,
    toggleUserActive,
    fetchUsers, // Expose fetchUsers for manual refresh
    fetchDepartmentsAndManagers,
    setDepartmentManager,
    updatePortalFeature,
    addCategory,
    deleteCategory,
    addSubcategory,
    deleteSubcategory,
    addLocation,
    deleteLocation,
  };

  return (
    <AdminPortalContext.Provider value={value}>
      {children}
    </AdminPortalContext.Provider>
  );
};













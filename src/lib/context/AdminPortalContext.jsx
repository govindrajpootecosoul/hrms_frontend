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
    portal: 'DataHive',
    categories: ['Data Sources', 'Reports'],
    subcategories: ['Database', 'API'],
    locations: ['Delhi', 'Mumbai']
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
  const [selectedCompany, setSelectedCompany] = useState(null);

  // Get selected company from sessionStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const company = sessionStorage.getItem('adminSelectedCompany');
      setSelectedCompany(company);
    }
  }, []);

  // Fetch users from API on mount and when company changes
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCompany]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
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
      setLoading(false);
    }
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
        // Refresh users list
        await fetchUsers();
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
        // Refresh users list
        await fetchUsers();
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
        // Refresh users list
        await fetchUsers();
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
        // Refresh users list
        await fetchUsers();
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
      sessionStorage.setItem('adminSelectedCompany', company);
      setSelectedCompany(company);
      // Refresh users for the new company
      fetchUsers();
    }
  };

  const value = {
    users,
    portalFeatures,
    loading,
    error,
    selectedCompany,
    setCompany,
    addUser,
    updateUser,
    deleteUser,
    toggleUserActive,
    fetchUsers, // Expose fetchUsers for manual refresh
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













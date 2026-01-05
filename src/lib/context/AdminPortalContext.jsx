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

  // Fetch users from API on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/admin-users`);
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users || []);
      } else {
        setError(data.error || 'Failed to fetch users');
        console.error('Failed to fetch users:', data.error);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const addUser = async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin-users`, {
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
      const response = await fetch(`${API_BASE_URL}/admin-users/${id}`, {
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
      const response = await fetch(`${API_BASE_URL}/admin-users/${id}`, {
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
      const response = await fetch(`${API_BASE_URL}/admin-users/${id}/toggle-active`, {
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

  const value = {
    users,
    portalFeatures,
    loading,
    error,
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













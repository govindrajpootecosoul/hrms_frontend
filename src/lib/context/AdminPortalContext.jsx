'use client';

import { createContext, useContext, useState } from 'react';

// Mock data - in production, this would come from an API
const initialUsers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@company.com',
    password: 'test123',
    active: true,
    portals: ['HRMS', 'Asset Tracker']
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@company.com',
    password: 'password456',
    active: true,
    portals: ['Admin-HRMS', 'Finance Tools']
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob@company.com',
    password: 'secure789',
    active: false,
    portals: ['DataHive', 'Project Tracker']
  }
];

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
    portal: 'Admin-HRMS',
    categories: ['Admin', 'Settings'],
    subcategories: ['User Management', 'Permissions'],
    locations: ['Delhi']
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
  const [users, setUsers] = useState(initialUsers);
  const [portalFeatures, setPortalFeatures] = useState(initialPortalFeatures);

  const addUser = (userData) => {
    const newId = Math.max(...users.map(u => u.id), 0) + 1;
    const newUser = { ...userData, id: newId };
    setUsers([...users, newUser]);
  };

  const updateUser = (id, userData) => {
    setUsers(users.map(user => user.id === id ? { ...user, ...userData } : user));
  };

  const deleteUser = (id) => {
    setUsers(users.filter(user => user.id !== id));
  };

  const toggleUserActive = (id) => {
    setUsers(users.map(user => 
      user.id === id ? { ...user, active: !user.active } : user
    ));
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
    addUser,
    updateUser,
    deleteUser,
    toggleUserActive,
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



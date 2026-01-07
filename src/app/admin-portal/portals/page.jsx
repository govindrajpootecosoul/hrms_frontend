'use client';

import { useState } from 'react';
import { useAdminPortal } from '@/lib/context/AdminPortalContext';
import { AdminButton } from '@/components/admin-portal/ui/AdminButton';
import portalList from '@/data/admin-portal/portalList.json';
import portalConfig from '@/data/admin-portal/portalConfig.json';

function FeatureSection({
  title,
  items,
  onAdd,
  onDelete,
}) {
  const [newItem, setNewItem] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = (e) => {
    e.preventDefault();
    if (newItem.trim()) {
      onAdd(newItem.trim());
      setNewItem('');
      setIsAdding(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        {!isAdding && (
          <AdminButton size="sm" onClick={() => setIsAdding(true)}>
            Add {title.slice(0, -1)}
          </AdminButton>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="mb-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder={`Enter ${title.slice(0, -1).toLowerCase()}`}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              autoFocus
            />
            <AdminButton type="submit" size="sm">
              Add
            </AdminButton>
            <AdminButton
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setIsAdding(false);
                setNewItem('');
              }}
            >
              Cancel
            </AdminButton>
          </div>
        </form>
      )}

      {items.length === 0 ? (
        <p className="text-gray-500 text-sm">No {title.toLowerCase()} yet.</p>
      ) : (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
            >
              <span className="text-gray-800">{item}</span>
              <AdminButton
                variant="danger"
                size="sm"
                onClick={() => onDelete(item)}
              >
                Delete
              </AdminButton>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PortalManagementPage() {
  const { portalFeatures, addCategory, deleteCategory, addSubcategory, deleteSubcategory, addLocation, deleteLocation } = useAdminPortal();
  const [selectedPortal, setSelectedPortal] = useState(portalList[0] || '');

  const getPortalConfig = (portalName) => {
    return portalConfig.find((p) => p.name === portalName) || {
      name: portalName,
      color: '#6B7280',
      icon: '🔧',
      gradient: 'from-gray-500 to-gray-700'
    };
  };

  const handleAddCategory = (portal, category) => {
    addCategory(portal, category);
  };

  const handleDeleteCategory = (portal, category) => {
    deleteCategory(portal, category);
  };

  const handleAddSubcategory = (portal, subcategory) => {
    addSubcategory(portal, subcategory);
  };

  const handleDeleteSubcategory = (portal, subcategory) => {
    deleteSubcategory(portal, subcategory);
  };

  const handleAddLocation = (portal, location) => {
    addLocation(portal, location);
  };

  const handleDeleteLocation = (portal, location) => {
    deleteLocation(portal, location);
  };

  const currentPortal = portalFeatures.find((pf) => pf.portal === selectedPortal);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Portal Management</h1>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-lg shadow-md mb-6 overflow-x-auto">
        <div className="flex items-center border-b border-gray-200">
          {portalList.map((portalName) => {
            const isActive = selectedPortal === portalName;
            const config = getPortalConfig(portalName);
            
            return (
              <button
                key={portalName}
                onClick={() => setSelectedPortal(portalName)}
                className={`relative px-6 py-4 font-medium text-sm transition-colors duration-200 whitespace-nowrap ${
                  isActive
                    ? 'text-blue-600'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{config.icon}</span>
                  <span>{portalName}</span>
                </div>
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Portal Content */}
      {currentPortal ? (
        <div className="space-y-6">
          <FeatureSection
            title="Categories"
            items={currentPortal.categories}
            onAdd={(category) => handleAddCategory(selectedPortal, category)}
            onDelete={(category) => handleDeleteCategory(selectedPortal, category)}
          />
          <FeatureSection
            title="Subcategories"
            items={currentPortal.subcategories}
            onAdd={(subcategory) => handleAddSubcategory(selectedPortal, subcategory)}
            onDelete={(subcategory) => handleDeleteSubcategory(selectedPortal, subcategory)}
          />
          <FeatureSection
            title="Locations"
            items={currentPortal.locations}
            onAdd={(location) => handleAddLocation(selectedPortal, location)}
            onDelete={(location) => handleDeleteLocation(selectedPortal, location)}
          />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">Please select a portal to manage its features.</p>
        </div>
      )}
    </div>
  );
}














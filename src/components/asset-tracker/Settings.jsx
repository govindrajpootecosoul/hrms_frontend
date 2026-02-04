'use client';

import { useState } from 'react';
import { Tags, MapPin, Users, Settings as SettingsIcon } from 'lucide-react';
import CategoryManagement from './CategoryManagement';
import SystemSettings from './SystemSettings';
import UserManagement from './UserManagement';
import LocationManagement from './LocationManagement';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('categories');

  const tabs = [
    { id: 'categories', label: 'Categories & Tags', icon: <Tags className="w-4 h-4" /> },
    { id: 'locations', label: 'Locations & Sites', icon: <MapPin className="w-4 h-4" /> },
    { id: 'users', label: 'User Management', icon: <Users className="w-4 h-4" /> },
    { id: 'system', label: 'System Settings', icon: <SettingsIcon className="w-4 h-4" /> },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'categories':
        return <CategoryManagement />;
      case 'system':
        return <SystemSettings />;
      case 'users':
        return <UserManagement />;
      case 'locations':
        return <LocationManagement />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-neutral-900 mb-1">Settings</h1>
        <p className="text-xs text-neutral-600">Manage categories, users, and system configuration</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-neutral-200">
        <nav className="flex space-x-1" aria-label="Settings Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-1.5 px-4 py-2 text-xs font-medium border-b-2 transition-colors
                ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300'
                }
              `}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Settings;


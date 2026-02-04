'use client';

import { useState } from 'react';
import { Building2, Shield, Globe, Wrench, Edit, Upload, Cloud } from 'lucide-react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';

const SystemSettings = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [settings, setSettings] = useState({
    companyName: 'TechCorp Solutions',
    autoLogoutTime: '30',
    enableNotifications: true,
    enableAuditLogs: true,
    timezone: 'Eastern Time (ET)',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD - US Dollar',
    backupFrequency: 'Daily',
    maintenanceMode: false,
  });

  const handleToggle = (field) => {
    setSettings(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const timezoneOptions = [
    { value: 'Eastern Time (ET)', label: 'Eastern Time (ET)' },
    { value: 'Central Time (CT)', label: 'Central Time (CT)' },
    { value: 'Mountain Time (MT)', label: 'Mountain Time (MT)' },
    { value: 'Pacific Time (PT)', label: 'Pacific Time (PT)' },
    { value: 'UTC', label: 'UTC' },
  ];

  const dateFormatOptions = [
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
  ];

  const currencyOptions = [
    { value: 'USD - US Dollar', label: 'USD - US Dollar' },
    { value: 'EUR - Euro', label: 'EUR - Euro' },
    { value: 'GBP - British Pound', label: 'GBP - British Pound' },
    { value: 'INR - Indian Rupee', label: 'INR - Indian Rupee' },
  ];

  const backupFrequencyOptions = [
    { value: 'Daily', label: 'Daily' },
    { value: 'Weekly', label: 'Weekly' },
    { value: 'Monthly', label: 'Monthly' },
  ];

  const ToggleSwitch = ({ checked, onChange, label, description }) => (
    <div className="flex items-center justify-between py-2">
      <div className="flex-1">
        <label className="text-sm font-medium text-neutral-700">{label}</label>
        {description && (
          <p className="text-xs text-neutral-500 mt-0.5">{description}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-blue-600' : 'bg-neutral-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 mb-1">System Settings</h2>
          <p className="text-xs text-neutral-600">Configure general system preferences and security settings</p>
        </div>
        <Button
          onClick={() => setIsEditing(!isEditing)}
          icon={<Edit className="w-4 h-4" />}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          Edit Settings
        </Button>
      </div>

      {/* Settings Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Company Information */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-neutral-900">Company Information</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Company Name
                </label>
                {isEditing ? (
                  <Input
                    value={settings.companyName}
                    onChange={(e) => handleChange('companyName', e.target.value)}
                    placeholder="Enter company name"
                  />
                ) : (
                  <div className="px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-900">
                    {settings.companyName}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Company Logo
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-neutral-100 border-2 border-dashed border-neutral-300 rounded-lg flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-neutral-400" />
                  </div>
                  {isEditing && (
                    <Button
                      icon={<Upload className="w-4 h-4" />}
                      className="bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50"
                    >
                      Upload New Logo
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Security Settings */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-neutral-900">Security Settings</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Auto Logout Time (minutes)
                </label>
                {isEditing ? (
                  <Input
                    type="number"
                    value={settings.autoLogoutTime}
                    onChange={(e) => handleChange('autoLogoutTime', e.target.value)}
                    placeholder="30"
                  />
                ) : (
                  <div className="px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-900">
                    {settings.autoLogoutTime}
                  </div>
                )}
              </div>
              <div className="border-t border-neutral-200 pt-4">
                <ToggleSwitch
                  checked={settings.enableNotifications}
                  onChange={() => handleToggle('enableNotifications')}
                  label="Enable Notifications"
                  description="Send email notifications for important events"
                />
              </div>
              <div className="border-t border-neutral-200 pt-4">
                <ToggleSwitch
                  checked={settings.enableAuditLogs}
                  onChange={() => handleToggle('enableAuditLogs')}
                  label="Enable Audit Logs"
                  description="Track all system activities and changes"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Regional Settings */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-neutral-900">Regional Settings</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Timezone
                </label>
                {isEditing ? (
                  <Select
                    options={timezoneOptions}
                    value={settings.timezone}
                    onChange={(value) => handleChange('timezone', value)}
                    placeholder="Select timezone"
                  />
                ) : (
                  <div className="px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-900">
                    {settings.timezone}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Date Format
                </label>
                {isEditing ? (
                  <Select
                    options={dateFormatOptions}
                    value={settings.dateFormat}
                    onChange={(value) => handleChange('dateFormat', value)}
                    placeholder="Select date format"
                  />
                ) : (
                  <div className="px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-900">
                    {settings.dateFormat}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Currency
                </label>
                {isEditing ? (
                  <Select
                    options={currencyOptions}
                    value={settings.currency}
                    onChange={(value) => handleChange('currency', value)}
                    placeholder="Select currency"
                  />
                ) : (
                  <div className="px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-900">
                    {settings.currency}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* System Maintenance */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Wrench className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-neutral-900">System Maintenance</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Backup Frequency
                </label>
                {isEditing ? (
                  <Select
                    options={backupFrequencyOptions}
                    value={settings.backupFrequency}
                    onChange={(value) => handleChange('backupFrequency', value)}
                    placeholder="Select backup frequency"
                  />
                ) : (
                  <div className="px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-900">
                    {settings.backupFrequency}
                  </div>
                )}
              </div>
              <div className="border-t border-neutral-200 pt-4">
                <ToggleSwitch
                  checked={settings.maintenanceMode}
                  onChange={() => handleToggle('maintenanceMode')}
                  label="Maintenance Mode"
                  description="Disable system access for maintenance"
                />
              </div>
              {isEditing && (
                <div className="border-t border-neutral-200 pt-4">
                  <Button
                    icon={<Cloud className="w-4 h-4" />}
                    className="bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50"
                  >
                    Configure Backup Settings
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
        <button
          onClick={() => {
            if (confirm('Are you sure you want to reset all settings to defaults?')) {
              // Reset to defaults logic
              setSettings({
                companyName: 'TechCorp Solutions',
                autoLogoutTime: '30',
                enableNotifications: true,
                enableAuditLogs: true,
                timezone: 'Eastern Time (ET)',
                dateFormat: 'MM/DD/YYYY',
                currency: 'USD - US Dollar',
                backupFrequency: 'Daily',
                maintenanceMode: false,
              });
            }
          }}
          className="text-sm text-red-600 hover:text-red-700 font-medium"
        >
          Reset to Defaults
        </button>
        <p className="text-sm text-neutral-500">
          Last updated: January 15, 2024 at 2:30 PM
        </p>
      </div>
    </div>
  );
};

export default SystemSettings;


'use client';

import { useState, useRef } from 'react';
import { User, Mail, Phone, Calendar } from 'lucide-react';
import { CometCard } from '@/components/hrms/ProfilePicCard';
import Tabs from '@/components/common/Tabs';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';

const EmployeeDetailView = ({
  employee,
  onEdit,
  onDelete,
  onExport,
  loading = false
}) => {
  const [activeTab, setActiveTab] = useState('general');
  const [profilePreview, setProfilePreview] = useState(employee?.profilePicture || null);
  const fileInputRef = useRef(null);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-neutral-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-12">
        <User className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-neutral-900 mb-2">No Employee Selected</h3>
        <p className="text-neutral-600">Select an employee to view their details</p>
      </div>
    );
  }

  const tabs = [
    { id: 'general', label: 'General', icon: <User className="w-4 h-4" /> },
    { id: 'bank', label: 'Bank Details', icon: <User className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <User className="w-4 h-4" /> }
  ];

  // Deterministic date formatting to avoid hydration mismatches
  const formatDate = (isoDate) => {
    if (!isoDate) return 'Not provided';
    const parts = String(isoDate).split('-');
    if (parts.length !== 3) return String(isoDate);
    const [y, m, d] = parts;
    return `${d}/${m}/${y}`; // dd/mm/yyyy
  };

  const formatDateTime = (isoDateTime) => {
    if (!isoDateTime) return 'Unknown';
    try {
      const d = new Date(isoDateTime);
      const date = d.toISOString().slice(0, 10); // YYYY-MM-DD
      const time = d.toISOString().slice(11, 19); // HH:MM:SS
      const [y, m, day] = date.split('-');
      return `${day}/${m}/${y} ${time}`;
    } catch {
      return String(isoDateTime);
    }
  };

  const SummaryCard = ({ icon, title, children, trailing }) => (
    <Card className="h-full">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center">
            <span className="text-neutral-800">{icon}</span>
          </div>
          <h4 className="text-neutral-900 font-medium">{title}</h4>
        </div>
        {trailing}
      </div>
      <div className="mt-4 text-neutral-800 space-y-1">
        {children}
      </div>
    </Card>
  );

  const renderGeneralTab = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[260px_minmax(0,1fr)_minmax(0,1fr)] gap-6">
        <div className="flex flex-col items-center justify-center space-y-5">
          <CometCard
            className="w-56"
            imageUrl={profilePreview || undefined}
            name={employee.name}
            designation={employee.designation}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-3 inline-flex items-center px-3 py-1.5 rounded-lg text-xs bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 text-neutral-900 transition-colors"
          >
            Upload Photo
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => setProfilePreview(String(reader.result));
              reader.readAsDataURL(file);
            }}
          />
        </div>
        <SummaryCard icon={<Mail className="w-5 h-5" />} title="Personal Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-neutral-600">Email</p>
                <p className="font-mono text-neutral-900 break-all">{employee.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-600">Phone</p>
                <p className="text-neutral-900">{employee.phone}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-600">Father&apos;s Name</p>
                <p className="text-neutral-900">
                  {employee.fatherName || 'Not provided'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-600">Personal Email</p>
                <p className="text-neutral-900 break-all">
                  {employee.personalEmail || 'Not provided'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-600">Emergency Contact</p>
                <p className="text-neutral-900">
                  {employee.emergencyContact || 'Not provided'}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-neutral-600">Date of Birth</p>
                <p className="text-neutral-900">{formatDate(employee.dateOfBirth)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-600">Gender</p>
                <p className="text-neutral-900 capitalize">
                  {employee.gender || 'Not specified'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-600">Marital Status</p>
                <p className="text-neutral-900">
                  {employee.maritalStatus || 'Not specified'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-600">Blood Group</p>
                <p className="text-neutral-900">
                  {employee.bloodGroup || 'Not specified'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-600">Address</p>
                <p className="text-neutral-900">
                  {employee.address || 'Not provided'}
                </p>
              </div>
            </div>
          </div>
        </SummaryCard>
        <SummaryCard
          icon={<User className="w-5 h-5" />}
          title="Department & Biometric"
          trailing={
            <div className="w-10 h-6 rounded-full bg-emerald-500/30 border border-emerald-400/40 flex items-center px-1">
              <div className="w-4 h-4 bg-emerald-400 rounded-full ml-auto" />
            </div>
          }
        >
          <div className="space-y-3">
            <div>
              <p className="text-sm text-neutral-600">Department</p>
              <p className="text-neutral-900">{employee.department}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-600">Office</p>
              <p className="text-neutral-900">ThriveBrands</p>
            </div>
            <div>
              <p className="text-sm text-neutral-600">Biometric ID</p>
              <p className="font-mono text-neutral-900">{employee.biometricId}</p>
              <div className="flex items-center gap-2 mt-2 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-sm">Active</span>
              </div>
            </div>
          </div>
        </SummaryCard>
      </div>

      {/* Removed lower profile header to keep the summary cards as the main header */}

    </div>
  );

  const renderPersonalTab = () => (
    <Card title="Personal Information">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-neutral-600">Father's Name</p>
            <p className="text-neutral-900">{employee.fatherName || 'Not provided'}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-neutral-600">Personal Email</p>
            <p className="text-neutral-900">{employee.personalEmail || 'Not provided'}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-neutral-600">Marital Status</p>
            <p className="text-neutral-900">{employee.maritalStatus || 'Not specified'}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-neutral-600">Blood Group</p>
            <p className="text-neutral-900">{employee.bloodGroup || 'Not specified'}</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-neutral-600">Address</p>
            <p className="text-neutral-900">{employee.address || 'Not provided'}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-neutral-600">Emergency Contact</p>
            <p className="text-neutral-900">{employee.emergencyContact || 'Not provided'}</p>
          </div>
        </div>
      </div>
    </Card>
  );

  const renderBankTab = () => (
    <Card title="Bank Details">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-neutral-600">Account Number</p>
            <p className="text-neutral-900 font-mono">{employee.accountNumber || 'Not provided'}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-neutral-600">IFSC Code</p>
            <p className="text-neutral-900 font-mono">{employee.ifscCode || 'Not provided'}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-neutral-600">Bank Name</p>
            <p className="text-neutral-900">{employee.bankName || 'Not provided'}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-neutral-600">Branch</p>
            <p className="text-neutral-900">{employee.branch || 'Not provided'}</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-neutral-600">PAN Number</p>
            <p className="text-neutral-900 font-mono">{employee.panNumber || 'Not provided'}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-neutral-600">Aadhar Number</p>
            <p className="text-neutral-900 font-mono">{employee.aadharNumber || 'Not provided'}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-neutral-600">UAN Number</p>
            <p className="text-neutral-900 font-mono">{employee.uanNumber || 'Not provided'}</p>
          </div>
        </div>
      </div>
    </Card>
  );

  const renderSettingsTab = () => (
    <Card title="Account Settings">
      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-neutral-50 border border-neutral-200 rounded-lg">
          <div>
            <h4 className="font-medium text-neutral-900">Account Status</h4>
            <p className="text-sm text-neutral-600">Current account status</p>
          </div>
          <Badge>
            {employee.status || 'Active'}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between p-4 bg-neutral-50 border border-neutral-200 rounded-lg">
          <div>
            <h4 className="font-medium text-neutral-900">Last Updated</h4>
            <p className="text-sm text-neutral-600">{formatDateTime(employee.updatedAt)}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between p-4 bg-neutral-50 border border-neutral-200 rounded-lg">
          <div>
            <h4 className="font-medium text-neutral-900">Created Date</h4>
            <p className="text-sm text-neutral-600">{formatDateTime(employee.createdAt)}</p>
          </div>
        </div>
        
        {/* Admin action removed per design */}
      </div>
    </Card>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general': return renderGeneralTab();
      case 'bank': return renderBankTab();
      case 'settings': return renderSettingsTab();
      default: return renderGeneralTab();
    }
  };

  return (
    <div className="space-y-6">
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      {renderTabContent()}
    </div>
  );
};

export default EmployeeDetailView;


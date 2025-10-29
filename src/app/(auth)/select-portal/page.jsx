'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Package, ArrowRight, Building2 } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { useCompany } from '@/lib/context/CompanyContext';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import Select from '@/components/common/Select';
import Background from '@/components/common/Background';

const PortalSelectionPage = () => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { currentCompany, companies, selectCompany, loadCompanies } = useCompany();
  const [selectedCompanyId, setSelectedCompanyId] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.companies) {
      loadCompanies(user.companies);
    }
  }, [isAuthenticated, user, router, loadCompanies]);

  useEffect(() => {
    if (currentCompany) {
      setSelectedCompanyId(currentCompany.id);
    }
  }, [currentCompany]);

  const handleCompanyChange = (companyId) => {
    setSelectedCompanyId(companyId);
    selectCompany(companyId);
  };

  const handlePortalSelect = (portal) => {
    if (!selectedCompanyId) {
      alert('Please select a company first');
      return;
    }
    
    const companyId = selectedCompanyId;
    
    if (portal === 'hrms') {
      router.push(`/hrms/${companyId}/dashboard`);
    } else if (portal === 'asset-tracker') {
      router.push(`/asset-tracker/${companyId}/dashboard`);
    }
  };

  const companyOptions = companies.map(company => ({
    value: company.id,
    label: company.name
  }));

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Full-page animated background */}
      <div className="fixed inset-0 -z-10">
        <Background
          className="w-full h-full"
          transparent={false}
          rotation={0}
          autoRotate={0}
          speed={0.25}
          scale={1}
          frequency={1}
          warpStrength={1}
          mouseInfluence={1}
          parallax={0.5}
          noise={0.1}
        />
      </div>
      <div className="fixed inset-0 -z-10 bg-neutral-950/50" />
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Building2 className="w-8 h-8 text-white mr-3" />
            <h1 className="text-3xl font-bold text-white">Select Portal</h1>
          </div>
          <p className="text-lg text-white/80">
            Choose the portal you want to access for {user?.name || 'your account'}
          </p>
        </div>

        {/* Company Selection */}
        {companies.length > 1 && (
          <div className="mb-12 relative z-20">
            <Card variant="glass" className="max-w-md mx-auto backdrop-blur-md overflow-visible">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Select Company
                </h3>
                <Select
                  options={companyOptions}
                  value={selectedCompanyId}
                  onChange={handleCompanyChange}
                  placeholder="Choose a company"
                  variant="glass"
                />
              </div>
            </Card>
          </div>
        )}

        {/* Portal Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* HRMS Portal */}
          <Card variant="glass" className="group hover:scale-105 transition-transform duration-300 cursor-pointer backdrop-blur-md relative z-10">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 border border-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-4">
                HRMS Portal
              </h2>
              
              <p className="text-white/80 mb-6 leading-relaxed">
                Manage your human resources, employee data, attendance tracking, 
                and workforce analytics in one comprehensive platform.
              </p>
              
              <div className="space-y-3 mb-6 text-sm text-white/70">
                <div className="flex items-center justify-center">
                  <span className="w-2 h-2 bg-white/70 rounded-full mr-2" />
                  Employee Management
                </div>
                <div className="flex items-center justify-center">
                  <span className="w-2 h-2 bg-white/70 rounded-full mr-2" />
                  Attendance Tracking
                </div>
                <div className="flex items-center justify-center">
                  <span className="w-2 h-2 bg-white/70 rounded-full mr-2" />
                  HR Analytics
                </div>
              </div>
              
              <Button
                onClick={() => handlePortalSelect('hrms')}
                className="w-full bg-primary-600 hover:bg-primary-500 text-white"
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
              >
                Enter HRMS Portal
              </Button>
            </div>
          </Card>

          {/* Asset Tracker Portal */}
          <Card variant="glass" className="group hover:scale-105 transition-transform duration-300 cursor-pointer backdrop-blur-md relative z-10">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 border border-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="w-8 h-8 text-white" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-4">
                Asset Tracker Portal
              </h2>
              
              <p className="text-white/80 mb-6 leading-relaxed">
                Track and manage company assets, monitor assignments, 
                maintenance schedules, and optimize asset utilization.
              </p>
              
              <div className="space-y-3 mb-6 text-sm text-white/70">
                <div className="flex items-center justify-center">
                  <span className="w-2 h-2 bg-white/70 rounded-full mr-2" />
                  Asset Management
                </div>
                <div className="flex items-center justify-center">
                  <span className="w-2 h-2 bg-white/70 rounded-full mr-2" />
                  Assignment Tracking
                </div>
                <div className="flex items-center justify-center">
                  <span className="w-2 h-2 bg-white/70 rounded-full mr-2" />
                  Maintenance Logs
                </div>
              </div>
              
              <Button
                onClick={() => handlePortalSelect('asset-tracker')}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white"
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
              >
                Enter Asset Tracker
              </Button>
            </div>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-sm text-neutral-500">
            Need help? Contact your system administrator
          </p>
        </div>
      </div>
    </div>
  );
};

export default PortalSelectionPage;

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Package, ArrowRight, Building2 } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { useCompany } from '@/lib/context/CompanyContext';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import Select from '@/components/common/Select';
// Background removed for static light theme

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
      {/* Static light overlay */}
      <div className="fixed inset-0 -z-10 bg-white/60" />
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4 gap-5">
            <img src={'/VectorAIStudioBlack.svg'} className="w-[5rem] h-[5rem] mr-3" />
            <h1 className="text-3xl font-bold mt-5">Select Portal</h1>
          </div>
          <p className="text-lg text-neutral-700">
            Choose the portal you want to access for {user?.name || 'your account'}
          </p>
        </div>

        {/* Company Selection */}
        {companies.length > 1 && (
          <div className="mb-12 relative z-20">
            <Card className="max-w-md mx-auto backdrop-blur-md overflow-visible">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-4">
                  Select Company
                </h3>
                <Select
                  options={companyOptions}
                  value={selectedCompanyId}
                  onChange={handleCompanyChange}
                  placeholder="Choose a company"
                />
              </div>
            </Card>
          </div>
        )}

        {/* Portal Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* HRMS Portal */}
          <div className="flip-card-container cursor-pointer">
            <div className="flip-card-inner">
              {/* Front Face */}
              <Card className="flip-card-front backdrop-blur-md w-full h-full">
                <div className="text-center h-full flex flex-col">
                  <div className="w-[15rem] h-[15rem] flex items-center justify-center mx-auto mb-6">
                    <img src={'/hrms_select_portal.jpg'} className="w-[80%] h-[80%] object-contain" />
                  </div>
                  
                  <h2 className="text-2xl font-bold mb-4">
                    HRMS Portal
                  </h2>
                  
                  <p className="text-neutral-700 mb-6 leading-relaxed">
                    Manage your human resources, employee data, attendance tracking, 
                    and workforce analytics in one comprehensive platform.
                  </p>
                </div>
              </Card>

              {/* Back Face */}
              <Card className="flip-card-back backdrop-blur-md w-full h-full !p-0">
                <div className="flex flex-col items-center justify-center flip-card-back-content">
                  <h2 className="text-2xl font-bold mb-4">
                    HRMS Portal
                  </h2>
                  
                  <p className="text-neutral-700 mb-6 leading-relaxed">
                    Manage your human resources, employee data, attendance tracking, 
                    and workforce analytics in one comprehensive platform.
                  </p>
                  <Button
                    onClick={() => handlePortalSelect('hrms')}
                    className="w-full max-w-xs bg-primary-600 hover:bg-primary-500 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    icon={<ArrowRight className="w-4 h-4" />}
                    iconPosition="right"
                  >
                    Enter HRMS Portal
                  </Button>
                </div>
              </Card>
            </div>
          </div>

          {/* Asset Tracker Portal */}
          <div className="flip-card-container cursor-pointer">
            <div className="flip-card-inner">
              {/* Front Face */}
              <Card className="flip-card-front backdrop-blur-md w-full h-full">
              <div className="text-center h-full flex flex-col">
                  <div className="w-[15rem] h-[15rem] flex items-center justify-center mx-auto mb-6">
                    <img src={'/asset_select_portal.jpg'} className="w-full h-full object-contain" />
                  </div>
                  
                  <h2 className="text-2xl font-bold mb-4">
                    Asset Tracker Portal
                  </h2>
                  
                  <p className="text-neutral-700 mb-6 leading-relaxed">
                    Track and manage company assets, monitor assignments, 
                    maintenance schedules, and optimize asset utilization.
                  </p>
                </div>
              </Card>

              {/* Back Face */}
              <Card className="flip-card-back backdrop-blur-md w-full h-full !p-0">
                <div className="flex flex-col items-center justify-center flip-card-back-content">
                  <h2 className="text-2xl font-bold mb-4">
                    Asset Tracker Portal
                  </h2>
                  
                  <p className="text-neutral-700 mb-6 leading-relaxed">
                    Track and manage company assets, monitor assignments, 
                    maintenance schedules, and optimize asset utilization.
                  </p>
                  <Button
                    onClick={() => handlePortalSelect('asset-tracker')}
                    className="w-full max-w-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    icon={<ArrowRight className="w-4 h-4" />}
                    iconPosition="right"
                    >
                    Enter Asset Tracker
                  </Button>
                </div>
              </Card>
            </div>
          </div>
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

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Package, ArrowRight } from 'lucide-react';
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

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.companies) {
      loadCompanies(user.companies);
    }
  }, [isAuthenticated, user, router, loadCompanies]);

  const handlePortalSelect = (portal) => {
    // Admin portals (HRMS / Asset Tracker) remain company-scoped.
    if (portal === 'hrms' || portal === 'asset-tracker') {
      const companyId = currentCompany?.id ?? companies[0]?.id;

      if (portal === 'hrms') {
        router.push(`/hrms/${companyId}/dashboard`);
      } else if (portal === 'asset-tracker') {
        router.push(`/asset-tracker/${companyId}/dashboard`);
      }
      return;
    }

    // Employee self-service portal does not require company selection in the URL
    if (portal === 'employee-portal') {
      router.push('/employee-portal');
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Static light overlay */}
      <div className="fixed inset-0 -z-10 bg-white/60" />
      <div className="w-full max-w-7xl">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="flex items-center justify-center mb-4 gap-5">
            <img src={'/VectorAIStudioBlack.svg'} className="w-[5rem] h-[5rem] mr-3" />
            <h1 className="text-3xl font-bold mt-5">Select Portal</h1>
          </div>
          <p className="text-lg text-neutral-700">
            Choose the portal you want to access for {user?.name || 'your account'}
          </p>
        </div>

        {/* Portal Cards */}
        <div className="w-full grid md:grid-cols-3 gap-8">
          {/* HRMS Portal (visible only to admin/super admin roles) */}
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
                  {user?.role === 'admin' && (
                    <Button
                      onClick={() => handlePortalSelect('hrms')}
                      className="w-full max-w-xs bg-primary-600 hover:bg-primary-500 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                      icon={<ArrowRight className="w-4 h-4" />}
                      iconPosition="right"
                    >
                      Enter HRMS Portal
                    </Button>
                  )}
                </div>
              </Card>
            </div>
          </div>

          {/* Asset Tracker Portal (visible only to admin/super admin roles) */}
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
                  {user?.role === 'admin' && (
                    <Button
                      onClick={() => handlePortalSelect('asset-tracker')}
                      className="w-full max-w-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                      icon={<ArrowRight className="w-4 h-4" />}
                      iconPosition="right"
                      >
                      Enter Asset Tracker
                    </Button>
                  )}
                </div>
              </Card>
            </div>
          </div>
          {/* Employee Self-Service Portal */}
          <div className="flip-card-container cursor-pointer">
            <div className="flip-card-inner">
              {/* Front Face */}
              <Card className="flip-card-front backdrop-blur-md w-full h-full">
                <div className="text-center h-full flex flex-col">
                  <div className="w-[15rem] h-[15rem] flex items-center justify-center mx-auto mb-6">
                    <img src={'/employee_select_portal.png'} className="w-[80%] h-[80%] object-contain" />
                  </div>

                  <h2 className="text-2xl font-bold mb-4">
                    Employee Portal
                  </h2>

                  <p className="text-neutral-700 mb-6 leading-relaxed">
                    Employees can view their profile, leaves, and payroll information
                    in a dedicated self-service experience.
                  </p>
                </div>
              </Card>

              {/* Back Face */}
              <Card className="flip-card-back backdrop-blur-md w-full h-full !p-0">
                <div className="flex flex-col items-center justify-center flip-card-back-content">
                  <h2 className="text-2xl font-bold mb-4">
                    Employee Portal
                  </h2>

                  <p className="text-neutral-700 mb-6 leading-relaxed">
                    Access HR information that is specific to you as an employee,
                    without needing to switch companies.
                  </p>
                  <Button
                    onClick={() => handlePortalSelect('employee-portal')}
                    className="w-full max-w-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    icon={<ArrowRight className="w-4 h-4" />}
                    iconPosition="right"
                  >
                    Enter Employee Portal
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

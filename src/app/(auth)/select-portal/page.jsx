'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Package, ArrowRight, DollarSign, ClipboardList, Building2, MessageSquare, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { useCompany } from '@/lib/context/CompanyContext';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import Select from '@/components/common/Select';
import Modal from '@/components/common/Modal';
// Background removed for static light theme

const PortalSelectionPage = () => {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { currentCompany, companies, selectCompany, loadCompanies } = useCompany();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Portal mapping - maps select portal identifiers to admin portal names
  const portalIdentifierToName = {
    'hrms': 'HRMS',
    'asset-tracker': 'Asset Tracker',
    'finance': 'Finance Tools',
    'project-tracker': 'Project Tracker',
    'datahive': 'DataHive',
    'employee-portal': 'Employee Portal',
    'query-tracker': 'Query Tracker',
    'demand-panel': 'Demand / Panel'
  };

  // Check if user has access to a portal
  const hasPortalAccess = (portalIdentifier) => {
    if (!user) return false;
    
    // Check if user has portals array from database
    if (user.portals && Array.isArray(user.portals) && user.portals.length > 0) {
      const portalName = portalIdentifierToName[portalIdentifier];
      return user.portals.includes(portalName);
    }
    
    // Check portalAccess array (mapped from portals)
    if (user.portalAccess && Array.isArray(user.portalAccess) && user.portalAccess.length > 0) {
      return user.portalAccess.includes(portalIdentifier);
    }
    
    // If no portals are checked, show no portals
    return false;
  };

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
    // Admin portals (HRMS / Asset Tracker / Finance / Demand Panel / DataHive) remain company-scoped.
    if (portal === 'hrms' || portal === 'asset-tracker' || portal === 'finance' || portal === 'demand-panel' || portal === 'datahive') {
      const companyId = currentCompany?.id ?? companies[0]?.id;

      if (!companyId) {
        console.error('No company ID available for portal navigation');
        return;
      }

      if (portal === 'hrms') {
        router.push(`/hrms/${companyId}/dashboard`);
      } else if (portal === 'asset-tracker') {
        router.push(`/asset-tracker/${companyId}/dashboard`);
      } else if (portal === 'finance') {
        router.push(`/finance/${companyId}/dashboard`);
      } else if (portal === 'demand-panel') {
        // Open external URL for Demand / Panel
        window.open('https://cp.thrivebrands-hrms.com/auth', '_blank');
        return;
      } else if (portal === 'datahive') {
        // DataHive portal - you can customize this route as needed
        router.push(`/datahive/${companyId}/dashboard`);
      }
      return;
    }

    // Employee self-service portal does not require company selection in the URL
    if (portal === 'employee-portal') {
      router.push('/employee-portal');
    }

    // Query Tracker portal - integrated in Next.js
    if (portal === 'query-tracker') {
      router.push('/query-tracker');
      return;
    }

  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Static light overlay */}
      <div className="fixed inset-0 -z-10 bg-white/60" />
      
      {/* Admin Portal Button and Logout Icon - Top Right */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-3">
        {user?.role === 'superadmin' && (
          <Button
            onClick={() => router.push('/admin-portal')}
            className="bg-purple-600 hover:bg-purple-500 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Admin Portal
          </Button>
        )}
        {/* Logout Icon */}
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors shadow-md hover:shadow-lg"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        title="Confirm Logout"
        footer={
          <>
            <Button
              onClick={() => setShowLogoutConfirm(false)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                logout();
                router.push('/login');
              }}
              className="bg-red-600 hover:bg-red-500 text-white"
            >
              Logout
            </Button>
          </>
        }
      >
        <p className="text-gray-700">
          Are you sure you want to logout? You will need to login again to access your portals.
        </p>
      </Modal>
      
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
        {(!user?.portals || user.portals.length === 0) && (!user?.portalAccess || user.portalAccess.length === 0) ? (
          <div className="w-full bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
            <div className="text-yellow-800">
              <h3 className="text-xl font-semibold mb-2">No Portals Available</h3>
              <p className="text-sm">
                You don't have access to any portals yet. Please contact your administrator to grant you portal access.
              </p>
            </div>
          </div>
        ) : (
        <div className="w-full grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* HRMS Portal */}
          {hasPortalAccess('hrms') && (
          <div className="flip-card-container cursor-pointer">
            <div className="flip-card-inner">
              {/* Front Face */}
              <Card className="flip-card-front backdrop-blur-md w-full h-full">
                <div className="text-center h-full flex flex-col">
                  <div className="w-[15rem] h-[15rem] flex items-center justify-center mx-auto mb-6">
                    <img
                      src={'/log/HRMS%20Portal.png'}
                      alt="HRMS Portal Logo"
                      className="w-[80%] h-[80%] object-contain"
                    />
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
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('HRMS portal button clicked');
                      handlePortalSelect('hrms');
                    }}
                    className="w-full max-w-xs bg-primary-600 hover:bg-primary-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 relative z-10"
                    icon={<ArrowRight className="w-4 h-4" />}
                    iconPosition="right"
                  >
                    Enter HRMS Portal
                  </Button>
                </div>
              </Card>
            </div>
          </div>
          )}

          {/* Asset Tracker Portal */}
          {hasPortalAccess('asset-tracker') && (
          <div className="flip-card-container cursor-pointer">
            <div className="flip-card-inner">
              {/* Front Face */}
              <Card className="flip-card-front backdrop-blur-md w-full h-full">
              <div className="text-center h-full flex flex-col">
                  <div className="w-[15rem] h-[15rem] flex items-center justify-center mx-auto mb-6">
                    <img
                      src={'/log/Asset%20Tracker%20Portal.png'}
                      alt="Asset Tracker Portal Logo"
                      className="w-full h-full object-contain"
                    />
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
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handlePortalSelect('asset-tracker');
                    }}
                    className="w-full max-w-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 relative z-10"
                    icon={<ArrowRight className="w-4 h-4" />}
                    iconPosition="right"
                  >
                    Enter Asset Tracker
                  </Button>
                </div>
              </Card>
            </div>
          </div>
          )}

          {/* Organisation Tools Portal */}
          {hasPortalAccess('finance') && (
          <div className="flip-card-container cursor-pointer">
            <div className="flip-card-inner">
              {/* Front Face */}
              <Card className="flip-card-front backdrop-blur-md w-full h-full">
                <div className="text-center h-full flex flex-col">
                  <div className="w-[15rem] h-[15rem] flex items-center justify-center mx-auto mb-6">
                    <img
                      src={'/log/Organisation%20Tools.png'}
                      alt="Organisation Tools Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  
                  <h2 className="text-2xl font-bold mb-4">
                    Organisation Tools
                  </h2>
                  
                  <p className="text-neutral-700 mb-6 leading-relaxed">
                    Access comprehensive organisational tools, financial operations, 
                    and business management utilities in one integrated platform.
                  </p>
                </div>
              </Card>

              {/* Back Face */}
              <Card className="flip-card-back backdrop-blur-md w-full h-full !p-0">
                <div className="flex flex-col items-center justify-center flip-card-back-content">
                  <h2 className="text-2xl font-bold mb-4">
                    Organisation Tools
                  </h2>
                  
                  <p className="text-neutral-700 mb-6 leading-relaxed">
                    Access comprehensive organisational tools, financial operations, 
                    and business management utilities in one integrated platform.
                  </p>
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Organisation Tools portal button clicked');
                      handlePortalSelect('finance');
                    }}
                    className="w-full max-w-xs bg-blue-600 hover:bg-blue-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 relative z-10"
                    icon={<ArrowRight className="w-4 h-4" />}
                    iconPosition="right"
                  >
                    Enter Organisation Tools
                  </Button>
                </div>
              </Card>
            </div>
          </div>
          )}

          {/* Project Tracker Portal */}
          {hasPortalAccess('project-tracker') && (
          <div className="flip-card-container cursor-pointer">
            <div className="flip-card-inner">
              {/* Front Face */}
              <Card className="flip-card-front backdrop-blur-md w-full h-full">
                <div className="text-center h-full flex flex-col">
                  <div className="w-[15rem] h-[15rem] flex items-center justify-center mx-auto mb-6">
                    <img
                      src={'/log/Project%20Tracker.png'}
                      alt="Project Tracker Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <h2 className="text-2xl font-bold mb-4">
                    Project Tracker
                  </h2>

                  <p className="text-neutral-700 mb-6 leading-relaxed">
                    Track projects, tasks, and deadlines in your project tracker workspace.
                  </p>
                </div>
              </Card>

              {/* Back Face */}
              <Card className="flip-card-back backdrop-blur-md w-full h-full !p-0">
                <div className="flex flex-col items-center justify-center flip-card-back-content">
                  {/* <div className="w-[15rem] h-[15rem] flex items-center justify-center mx-auto mb-6">
                    <img src={'/project_tracker_2.png'} className="w-full h-full object-contain" />
                  </div> */}
                  <h2 className="text-2xl font-bold mb-4">
                    Project Tracker
                  </h2>

                  <p className="text-neutral-700 mb-6 leading-relaxed text-center">
                    Open the dedicated project tracker to monitor progress and collaborate.
                  </p>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open('https://project-tracker.thrivebrands.in/auth/signin', '_blank');
                    }}
                    className="w-full max-w-xs bg-orange-600 hover:bg-orange-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 relative z-10"
                    icon={<ArrowRight className="w-4 h-4" />}
                    iconPosition="right"
                  >
                    Open Project Tracker
                  </Button>
                </div>
              </Card>
            </div>
          </div>
          )}

          {/* Employee Self-Service Portal */}
          {hasPortalAccess('employee-portal') && (
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
                    Access HR information that is specific to you as an employee,
                    without needing to switch companies.
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
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePortalSelect('employee-portal');
                    }}
                    className="w-full max-w-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 relative z-10"
                    icon={<ArrowRight className="w-4 h-4" />}
                    iconPosition="right"
                  >
                    Enter Employee Portal
                  </Button>
                </div>
              </Card>
            </div>
          </div>
          )}

          {/* Query Tracker Portal */}
          {hasPortalAccess('query-tracker') && (
          <div className="flip-card-container cursor-pointer">
            <div className="flip-card-inner">
              {/* Front Face */}
              <Card className="flip-card-front backdrop-blur-md w-full h-full">
                <div className="text-center h-full flex flex-col">
                  <div className="w-[15rem] h-[15rem] flex items-center justify-center mx-auto mb-6">
                    <img src={'/log/Query Tracker.png'} className="w-full h-full object-contain" />
                  </div>
                  
                  <h2 className="text-2xl font-bold mb-4">
                    Query Tracker
                  </h2>
                  
                  <p className="text-neutral-700 mb-6 leading-relaxed">
                    Track and manage customer queries, support tickets, and customer 
                    interactions across multiple platforms in one centralized system.
                  </p>
                </div>
              </Card>

              {/* Back Face */}
              <Card className="flip-card-back backdrop-blur-md w-full h-full !p-0">
                <div className="flex flex-col items-center justify-center flip-card-back-content">
                  <h2 className="text-2xl font-bold mb-4">
                    Query Tracker
                  </h2>
                  
                  <p className="text-neutral-700 mb-6 leading-relaxed">
                    Track and manage customer queries, support tickets, and customer 
                    interactions across multiple platforms in one centralized system.
                  </p>
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handlePortalSelect('query-tracker');
                    }}
                    className="w-full max-w-xs bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 relative z-10"
                    icon={<ArrowRight className="w-4 h-4" />}
                    iconPosition="right"
                  >
                    Enter Query Tracker
                  </Button>
                </div>
              </Card>
            </div>
          </div>
          )}

          {/* DataHive Portal */}
          {hasPortalAccess('datahive') && (
          <div className="flip-card-container cursor-pointer">
            <div className="flip-card-inner">
              {/* Front Face */}
              <Card className="flip-card-front backdrop-blur-md w-full h-full">
                <div className="text-center h-full flex flex-col">
                  <div className="w-[15rem] h-[15rem] flex items-center justify-center mx-auto mb-6">
                    <img
                      src={'/log/Datahive.png'}
                      alt="DataHive Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  
                  <h2 className="text-2xl font-bold mb-4">
                    DataHive
                  </h2>
                  
                  <p className="text-neutral-700 mb-6 leading-relaxed">
                    Access and manage your data sources, analytics, and reports in one centralized platform.
                  </p>
                </div>
              </Card>

              {/* Back Face */}
              <Card className="flip-card-back backdrop-blur-md w-full h-full !p-0">
                <div className="flex flex-col items-center justify-center flip-card-back-content">
                  <h2 className="text-2xl font-bold mb-4">
                    DataHive
                  </h2>
                  
                  <p className="text-neutral-700 mb-6 leading-relaxed">
                    Access and manage your data sources, analytics, and reports in one centralized platform.
                  </p>
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handlePortalSelect('datahive');
                    }}
                    className="w-full max-w-xs bg-blue-600 hover:bg-blue-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 relative z-10"
                    icon={<ArrowRight className="w-4 h-4" />}
                    iconPosition="right"
                  >
                    Enter DataHive
                  </Button>
                </div>
              </Card>
            </div>
          </div>
          )}

          {/* Demand / Panel Portal */}
          {hasPortalAccess('demand-panel') && (
          <div className="flip-card-container cursor-pointer">
            <div className="flip-card-inner">
              {/* Front Face */}
              <Card className="flip-card-front backdrop-blur-md w-full h-full">
                <div className="text-center h-full flex flex-col">
                  <div className="w-[15rem] h-[15rem] flex items-center justify-center mx-auto mb-6">
                    <img
                      src={'/log/Demand%20planner.png'}
                      alt="Demand / Panel Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  
                  <h2 className="text-2xl font-bold mb-4">
                    Demand / Panel
                  </h2>
                  
                  <p className="text-neutral-700 mb-6 leading-relaxed">
                    Manage demand planning, panel management, and resource allocation 
                    in one comprehensive platform.
                  </p>
                </div>
              </Card>

              {/* Back Face */}
              <Card className="flip-card-back backdrop-blur-md w-full h-full !p-0">
                <div className="flex flex-col items-center justify-center flip-card-back-content">
                  <h2 className="text-2xl font-bold mb-4">
                    Demand / Panel
                  </h2>
                  
                  <p className="text-neutral-700 mb-6 leading-relaxed">
                    Manage demand planning, panel management, and resource allocation 
                    in one comprehensive platform.
                  </p>
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // Open external URL for Demand / Panel
                      window.open('https://cp.thrivebrands-hrms.com/auth', '_blank');
                    }}
                    className="w-full max-w-xs bg-purple-600 hover:bg-purple-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 relative z-10"
                    icon={<ArrowRight className="w-4 h-4" />}
                    iconPosition="right"
                  >
                    Enter Demand / Panel
                  </Button>
                </div>
              </Card>
            </div>
          </div>
          )}
        </div>
        )}

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

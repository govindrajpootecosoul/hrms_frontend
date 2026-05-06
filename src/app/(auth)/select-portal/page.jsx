'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Building2, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { useCompany } from '@/lib/context/CompanyContext';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
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
    'employee-portal': 'Employee Portal',
    'query-tracker': 'Query Tracker'
  };

  // Get company name from email domain
  const getCompanyName = (email) => {
    if (!email) return null;
    const emailLower = String(email).trim().toLowerCase();
    // Support exact formats like:
    // - Example@thrivebrands.ai
    // - Example@ecosoulhome.com
    if (emailLower.endsWith('@thrivebrands.ai')) return 'Thrive';
    if (emailLower.endsWith('@ecosoulhome.com')) return 'Ecosoul Home';
    return null;
  };

  const companyName = user?.email ? getCompanyName(user.email) : null;

  // Normalize company names to improve matching across slight naming differences.
  // Backend canonical names are 'Thrive' and 'Ecosoul Home'.
  const normalizeCompanyName = (value) => {
    if (!value) return null;
    const lc = String(value).trim().toLowerCase();
    const compact = lc.replace(/\s+/g, '');
    if (compact === 'thrive' || compact === 'thrivebrands' || compact === 'thrivebrand') return 'Thrive';
    if (compact === 'ecosoulhome' || compact === 'ecosoul' || compact === 'ecosoul-home') return 'Ecosoul Home';
    return String(value).trim();
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

  useEffect(() => {
    if (!isAuthenticated || !companyName || !companies?.length) return;

    const targetCompany = normalizeCompanyName(companyName);
    const matchedCompany = companies.find(
      (company) => normalizeCompanyName(company?.name) === targetCompany
    );

    // Keep company selection aligned with login email domain for portal isolation.
    if (matchedCompany?.id && currentCompany?.id !== matchedCompany.id) {
      selectCompany(matchedCompany.id);
    }
  }, [isAuthenticated, companyName, companies, currentCompany, selectCompany]);

  const handlePortalSelect = (portal) => {
    // Admin portals (HRMS / Asset Tracker / Finance) remain company-scoped.
    if (portal === 'hrms' || portal === 'asset-tracker' || portal === 'finance') {
      const matchedCompanyByEmail = companyName
        ? companies.find((company) => company?.name?.toLowerCase() === companyName.toLowerCase())
        : null;
      const companyId = matchedCompanyByEmail?.id ?? currentCompany?.id ?? companies[0]?.id;

      if (!companyId) {
        console.error('No company ID available for portal navigation');
        return;
      }

      if (portal === 'hrms') {
        router.push(`/hrms/${companyId}/dashboard`);
      } else if (portal === 'asset-tracker') {
        // Navigate to Asset Tracker - company selection will happen on the dashboard page
        router.push(`/asset-tracker/${companyId}/dashboard`);
        return;
      } else if (portal === 'finance') {
        router.push(`/finance/${companyId}/dashboard`);
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
    <div className="relative flex min-h-screen items-center justify-center p-4 sm:p-8">
      {/* Background with gradient */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50" />
      
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
          className="rounded-full p-2 text-gray-700 shadow-md transition-colors hover:bg-gray-100 hover:text-gray-900 hover:shadow-lg"
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
        <div className="mb-12 text-center sm:mb-14">
          <div className="mb-4 flex items-center justify-center gap-4">
            <img
              src="/VectorAIStudioBlack.svg"
              alt="Vectorlytics"
              className="h-16 w-16"
            />
            <div className="text-left">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Select portal
              </h1>
              <p className="mt-1 text-sm text-slate-600 sm:text-base">
                Choose where you want to go next.
              </p>
            </div>
          </div>
          <p className="mx-auto max-w-2xl text-sm text-neutral-700 sm:text-base">
            Signed in as <span className="font-semibold text-slate-900">{user?.name || 'your account'}</span>.
            Pick a portal to continue.
          </p>
          {companyName && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">
                Logged in as: <span className="font-semibold">{companyName}</span>
              </span>
            </div>
          )}
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
          <div className="w-full grid gap-6 sm:gap-7 md:grid-cols-2 lg:grid-cols-3">
            {[
              hasPortalAccess('hrms')
                ? {
                    id: 'hrms',
                    title: 'HRMS',
                    description:
                      'Manage employees, attendance, payroll, and workforce insights in one place.',
                    img: '/log/HRMS%20Portal.png',
                    gradient: 'from-blue-50 to-indigo-50',
                    ring: 'focus-visible:ring-blue-400',
                    actionLabel: 'Open HRMS',
                    onOpen: () => handlePortalSelect('hrms'),
                  }
                : null,
              hasPortalAccess('asset-tracker')
                ? {
                    id: 'asset-tracker',
                    title: 'Asset Watch',
                    description:
                      'Track assets, assignments, maintenance schedules, and utilisation.',
                    img: '/log/Asset%20Tracker%20Portal.png',
                    gradient: 'from-emerald-50 to-teal-50',
                    ring: 'focus-visible:ring-emerald-400',
                    actionLabel: 'Open Asset Tracker',
                    onOpen: () => handlePortalSelect('asset-tracker'),
                  }
                : null,
              hasPortalAccess('finance')
                ? {
                    id: 'finance',
                    title: 'Ops Toolkit',
                    description:
                      'Access organisational and finance utilities in a unified workspace.',
                    img: '/log/Organisation%20Tools.png',
                    gradient: 'from-sky-50 to-cyan-50',
                    ring: 'focus-visible:ring-sky-400',
                    actionLabel: 'Open Ops Toolkit',
                    onOpen: () => handlePortalSelect('finance'),
                  }
                : null,
              hasPortalAccess('project-tracker')
                ? {
                    id: 'project-tracker',
                    title: 'ProjectHub',
                    description: 'Plan work, track tasks, and hit deadlines with your teams.',
                    img: '/log/Project%20Tracker.png',
                    gradient: 'from-orange-50 to-amber-50',
                    ring: 'focus-visible:ring-orange-400',
                    actionLabel: 'Open Project Tracker',
                    onOpen: () => window.open('https://project-tracker.thrivebrands.in/auth/signin', '_blank'),
                  }
                : null,
              hasPortalAccess('employee-portal')
                ? {
                    id: 'employee-portal',
                    title: 'Employee Portal',
                    description:
                      'View your attendance, requests, and employee information without switching companies.',
                    img: '/log/Employee Portal.png',
                    gradient: 'from-violet-50 to-fuchsia-50',
                    ring: 'focus-visible:ring-violet-400',
                    actionLabel: 'Open Employee Portal',
                    onOpen: () => handlePortalSelect('employee-portal'),
                  }
                : null,
              hasPortalAccess('query-tracker')
                ? {
                    id: 'query-tracker',
                    title: 'QueryHub',
                    description:
                      'Manage customer queries, tickets, and multi-platform support conversations.',
                    img: '/log/Query Tracker.png',
                    gradient: 'from-cyan-50 to-blue-50',
                    ring: 'focus-visible:ring-cyan-400',
                    actionLabel: 'Open Query Tracker',
                    onOpen: () => handlePortalSelect('query-tracker'),
                  }
                : null,
            ]
              .filter(Boolean)
              .map((portal) => (
                <button
                  key={portal.id}
                  type="button"
                  onClick={portal.onOpen}
                  className={[
                    'group relative text-left outline-none',
                    'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50',
                    portal.ring,
                  ].join(' ')}
                  aria-label={portal.actionLabel}
                >
                  <Card
                    className={[
                      'h-full overflow-hidden border border-slate-200/70 bg-white/70 p-6 backdrop-blur-md',
                      'transition will-change-transform',
                      'hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/40',
                    ].join(' ')}
                  >
                    <div className="flex h-full flex-col">
                      <div
                        className={[
                          'relative mb-5 flex items-center gap-4 rounded-2xl border border-slate-200/60',
                          'bg-gradient-to-br p-4',
                          portal.gradient,
                        ].join(' ')}
                      >
                        <div className="h-14 w-14 overflow-hidden rounded-2xl bg-white shadow-sm">
                          <img
                            src={portal.img}
                            alt=""
                            className="h-full w-full object-cover"
                            aria-hidden="true"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900">{portal.title}</p>
                          <p className="mt-0.5 text-xs text-slate-600">Portal</p>
                        </div>
                        <span className="ml-auto inline-flex items-center rounded-full border border-slate-200 bg-white/70 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                          Quick access
                        </span>
                      </div>

                      <p className="text-sm leading-relaxed text-slate-600">{portal.description}</p>

                      <div className="mt-6 flex items-center justify-between gap-4">
                        <span className="text-xs font-semibold text-slate-500">
                          Continue
                        </span>
                        <span
                          className={[
                            'inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2',
                            'text-xs font-semibold text-slate-900 shadow-sm transition',
                            'group-hover:bg-slate-50',
                          ].join(' ')}
                        >
                          {portal.actionLabel}
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </Card>
                </button>
              ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-10 text-center sm:mt-12">
          <p className="text-sm text-neutral-500">
            Need help? Contact your system administrator
          </p>
        </div>
      </div>
    </div>
  );
};

export default PortalSelectionPage;

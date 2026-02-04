'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { AdminPortalProvider, useAdminPortal } from '@/lib/context/AdminPortalContext';
import { AdminLayout } from '@/components/admin-portal/layout/AdminLayout';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import { getCompanyFromEmail } from '@/lib/config/database.config';

// Inner component that can use AdminPortal context
function AdminPortalContent({ children }) {
  const { selectedCompany, setCompany } = useAdminPortal();
  const { user } = useAuth();
  const [showCompanySelectModal, setShowCompanySelectModal] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      let company = sessionStorage.getItem('adminSelectedCompany');
      
      // If no company is selected, try to auto-detect from user's email
      if (!company && user?.email) {
        const detectedCompany = getCompanyFromEmail(user.email);
        if (detectedCompany) {
          company = detectedCompany;
          sessionStorage.setItem('adminSelectedCompany', company);
          setCompany(company);
          console.log(`[AdminPortal] Auto-detected company from email: ${company}`);
        }
      }
      
      // Show company selection modal only if we still don't have a company
      if (!company) {
        if (user?.email) {
          // User is loaded but email doesn't match expected domains - show modal
          setShowCompanySelectModal(true);
        } else {
          // User not loaded yet - wait a bit before showing modal
          const timer = setTimeout(() => {
            const finalCompany = sessionStorage.getItem('adminSelectedCompany');
            if (!finalCompany) {
              setShowCompanySelectModal(true);
            }
          }, 500);
          return () => clearTimeout(timer);
        }
      } else {
        setShowCompanySelectModal(false);
      }
    }
  }, [user, setCompany]);

  const handleCompanySelect = (companyName) => {
    setCompany(companyName);
    setShowCompanySelectModal(false);
  };

  return (
    <>
      <AdminLayout>{children}</AdminLayout>
      
      {/* Company Selection Modal */}
      {showCompanySelectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop - prevent closing on click */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-md" />
          
          {/* Modal */}
          <div className="relative rounded-2xl shadow-2xl w-full max-w-md bg-white border border-neutral-200">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-200 bg-white">
              <h2 className="text-xl font-semibold">Select Company</h2>
            </div>
            
            {/* Content */}
            <div className="p-6">
              <p className="text-gray-700 mb-6">
                Please select a company to view and manage data in the Admin Portal
              </p>
              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => handleCompanySelect('Ecosoul Home')}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Ecosoul Home
                </Button>
                <Button
                  onClick={() => handleCompanySelect('Thrive')}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Thrive
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function AdminPortalLayout({ children }) {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      // Check if user is superadmin only
      if (user?.role !== 'superadmin') {
        router.push('/select-portal');
        return;
      }
    }
  }, [isAuthenticated, loading, user, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'superadmin') {
    return null;
  }

  return (
    <AdminPortalProvider>
      <AdminPortalContent>{children}</AdminPortalContent>
    </AdminPortalProvider>
  );
}













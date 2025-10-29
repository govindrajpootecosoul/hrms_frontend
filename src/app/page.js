'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { Users, Package, Building2, ArrowRight } from 'lucide-react';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        router.push('/select-portal');
      } else {
        router.push('/login');
      }
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl text-center">
        {/* Hero Section */}
        <div className="mb-12">
          <div className="flex items-center justify-center mb-6">
            <Building2 className="w-12 h-12 text-primary-600 mr-4" />
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900">
              HRMS & Asset Tracker
            </h1>
          </div>
          <p className="text-xl text-neutral-600 mb-8 max-w-2xl mx-auto">
            Modern, comprehensive solutions for human resource management and asset tracking. 
            Streamline your operations with our integrated platform.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="group hover:shadow-lg transition-shadow duration-300">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-200 transition-colors">
                <Users className="w-8 h-8 text-primary-600" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">HRMS Portal</h2>
              <p className="text-neutral-600 mb-6">
                Complete human resource management system with employee data, 
                attendance tracking, and workforce analytics.
              </p>
              <div className="space-y-2 text-sm text-neutral-500 mb-6">
                <div>• Employee Management</div>
                <div>• Attendance Tracking</div>
                <div>• HR Analytics & Reports</div>
              </div>
            </div>
          </Card>

          <Card className="group hover:shadow-lg transition-shadow duration-300">
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-secondary-200 transition-colors">
                <Package className="w-8 h-8 text-secondary-600" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">Asset Tracker</h2>
              <p className="text-neutral-600 mb-6">
                Comprehensive asset management solution for tracking, 
                assignment, and maintenance of company resources.
              </p>
              <div className="space-y-2 text-sm text-neutral-500 mb-6">
                <div>• Asset Management</div>
                <div>• Assignment Tracking</div>
                <div>• Maintenance Scheduling</div>
              </div>
            </div>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="space-y-4">
          <Button
            onClick={() => router.push('/login')}
            size="lg"
            icon={<ArrowRight className="w-5 h-5" />}
            iconPosition="right"
          >
            Get Started
          </Button>
          <p className="text-sm text-neutral-500">
            Sign in to access your portals
          </p>
        </div>
      </div>
    </div>
  );
}

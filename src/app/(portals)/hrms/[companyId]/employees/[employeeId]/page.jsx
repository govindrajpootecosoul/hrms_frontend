'use client';

import { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/common/Button';
import { ArrowLeft } from 'lucide-react';
import EmployeeDetailView from '@/components/hrms/EmployeeDetailView';
import { getEmployeeById } from '@/lib/utils/hrmsMockData';

const EmployeeDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const { companyId, employeeId } = params;

  const employee = useMemo(() => getEmployeeById(employeeId), [employeeId]);

  const handleBack = () => router.push(`/hrms/${companyId}/employees`);

  // Removed edit/export/delete per design update

  return (
    <div className="min-h-screen bg-black text-white space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: 'Employees', href: `/hrms/${companyId}/employees` }
        ]}
        leadingAction={
          <button
            aria-label="Back"
            onClick={handleBack}
            className="text-white hover:text-white/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        }
      />

      <div className="mt-2">
        <EmployeeDetailView employee={employee} />
      </div>
    </div>
  );
};

export default EmployeeDetailsPage;



'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SalaryPayslip from '@/app/hrms/[companyId]/employees/components/SalaryPayslip';
import { CreditCard, Loader2 } from 'lucide-react';

function currentMonthYear() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function normalizeCompanyName(company) {
  if (!company) return '';
  const lc = String(company).trim().toLowerCase();
  if (lc.includes('thrive')) return 'Thrive';
  if (lc.includes('ecosoul')) return 'Ecosoul Home';
  return String(company).trim();
}

function payslipCompanyBlock(company) {
  const c = normalizeCompanyName(company);
  if (c === 'Ecosoul Home') {
    return {
      name: 'EcoSoul Home Private Limited',
      address:
        'Advant Navis Business Park Unit No. B-202A, 2nd Floor, Tower-B, Plot No. 7, Sector-142, Noida Gautam Budha Nagar Uttar Pradesh 201305 India',
    };
  }
  return { name: c || 'Company', address: '' };
}

export default function EmployeePayslipPage() {
  const { user } = useAuth();
  const [monthYear, setMonthYear] = useState(currentMonthYear);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const company = useMemo(() => {
    const fromUser = user?.company && String(user.company).trim();
    const fromSession = typeof window !== 'undefined' ? sessionStorage.getItem('selectedCompany') : null;
    return normalizeCompanyName(fromUser || fromSession || '');
  }, [user?.company]);

  const companyId = useMemo(() => {
    if (!company) return '1';
    return company.toLowerCase().includes('thrive') ? '2' : '1';
  }, [company]);

  const payDateStr = useMemo(() => {
    const m = String(monthYear).match(/^(\d{4})-(\d{2})$/);
    if (!m) return '';
    const Y = Number(m[1]);
    const mo = Number(m[2]);
    if (!Number.isFinite(Y) || !Number.isFinite(mo)) return '';
    return new Date(Y, mo, 2).toLocaleDateString('en-GB');
  }, [monthYear]);

  const companyBlock = useMemo(() => payslipCompanyBlock(company), [company]);

  const loadPayslip = useCallback(async () => {
    const employeeId = String(user?.employeeId || '').trim();
    if (!employeeId || !company) {
      setError('Employee ID or company is missing. Please sign in again.');
      setPreview(null);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const q = new URLSearchParams();
      q.append('employeeId', employeeId);
      q.append('monthYear', monthYear);
      q.append('company', company);
      q.append('companyId', companyId);

      const res = await fetch(`/api/hrms-portal/payroll/preview?${q.toString()}`, {
        cache: 'no-store',
        headers: { 'x-company': company },
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        throw new Error(json?.error || `Could not load payslip (${res.status})`);
      }
      setPreview(json.data);
    } catch (e) {
      setPreview(null);
      setError(e?.message || 'Could not load payslip.');
    } finally {
      setLoading(false);
    }
  }, [user?.employeeId, company, companyId, monthYear]);

  useEffect(() => {
    if (user?.employeeId && company) {
      loadPayslip();
    }
  }, [user?.employeeId, company, loadPayslip]);

  const employeeMeta = {
    name: user?.name || '',
    employeeId: user?.employeeId || '',
    jobTitle: user?.department || '',
    joiningDate: '',
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-slate-500">Self service</p>
        <h1 className="text-2xl font-semibold text-slate-900">My payslip</h1>
      </div>

      <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <CreditCard className="h-5 w-5" />
              Salary payslip
            </CardTitle>
            <CardDescription>View and print your payslip for the selected month.</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="month"
              value={monthYear}
              onChange={(e) => setMonthYear(e.target.value)}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900"
            />
            <Button type="button" onClick={loadPayslip} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading…
                </>
              ) : (
                'Refresh'
              )}
            </Button>
            {preview ? (
              <Button type="button" variant="outline" onClick={() => window.print()}>
                Print
              </Button>
            ) : null}
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>
          ) : loading && !preview ? (
            <p className="text-sm text-slate-500">Loading payslip…</p>
          ) : preview ? (
            <SalaryPayslip
              companyName={companyBlock.name}
              companyAddress={companyBlock.address}
              monthYear={monthYear}
              payDateStr={payDateStr}
              employee={employeeMeta}
              preview={preview}
            />
          ) : (
            <p className="text-sm text-slate-500">No payslip data for this month.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


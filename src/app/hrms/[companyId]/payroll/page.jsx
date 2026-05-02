'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import Table from '@/components/common/Table';
import SalaryPayslip from '../employees/components/SalaryPayslip';
import { useCompany } from '@/lib/context/CompanyContext';
import { useToast } from '@/components/common/Toast';
import { API_BASE_URL } from '@/lib/utils/constants';
import { z } from 'zod';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import {
  Coins,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  LayoutDashboard,
  PlayCircle,
  UserRound,
  ShieldCheck,
  Landmark,
  PiggyBank,
  FileBarChart2,
  Settings,
  Building2,
  Users,
  CalendarCog,
  CalendarClock,
  Calendar,
  ReceiptIndianRupee,
  HelpCircle,
  Headset,
  Upload,
  Download,
  Minus,
  Plus,
} from 'lucide-react';

const toMonthYear = (d) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${yyyy}-${mm}`;
};

const money = (n) => {
  const x = Number(n || 0);
  return x.toLocaleString('en-IN', { maximumFractionDigits: 0 });
};

const panSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN (format: ABCDE1234F)');

const ifscSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC (format: HDFC0XXXXXXX)');

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const makeId = () => Math.random().toString(36).slice(2, 10);

function resolvePfSlabIdFromSettings(ctcAnnual, rule, settings, preferredId) {
  const r = String(rule || 'NEW').toUpperCase() === 'OLD' ? 'OLD' : 'NEW';
  const slabs = r === 'OLD' ? settings?.pfSlabsOld : settings?.pfSlabsNew;
  if (!Array.isArray(slabs) || slabs.length === 0) return preferredId ? String(preferredId) : '';
  if (preferredId && slabs.some((s) => String(s.id) === String(preferredId))) {
    return String(preferredId);
  }
  const n = Number(ctcAnnual);
  if (!Number.isFinite(n) || n <= 0) return '';
  const sorted = [...slabs].sort((a, b) => Number(a.minCtc) - Number(b.minCtc));
  for (const s of sorted) {
    const max = Number.isFinite(Number(s.maxCtc)) ? Number(s.maxCtc) : Infinity;
    if (n >= Number(s.minCtc) && n <= max) return String(s.id);
  }
  return sorted.length ? String(sorted[sorted.length - 1].id) : '';
}

export default function PayrollPage() {
  const params = useParams();
  const companyId = params.companyId;
  const { currentCompany } = useCompany();
  const toast = useToast();
  const [isMounted, setIsMounted] = useState(false);

  const [monthYear, setMonthYear] = useState(() => toMonthYear(new Date()));
  const [employees, setEmployees] = useState([]);
  const [employeeId, setEmployeeId] = useState('');
  const [annualCtc, setAnnualCtc] = useState('');
  const [basicPercentOfCtc, setBasicPercentOfCtc] = useState(50);
  const [hraPercentOfBasic, setHraPercentOfBasic] = useState(40);

  const [step, setStep] = useState(1);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [preview, setPreview] = useState(null);
  const [activeTab, setActiveTab] = useState('payroll-dashboard');

  // DigiSME-like global header bits (logo affects payslip preview)
  const logoInputRef = useRef(null);
  const [companyLogoDataUrl, setCompanyLogoDataUrl] = useState(null);

  // DigiSME color spec (applied within payroll page section only)
  const navBarStyle = {
    backgroundColor: '#1a237e',
  };

  const [pfSettings, setPfSettings] = useState({
    pfWageCeilingMonthly: 15000,
    /** Default on: fixed ₹ PF × (paid days ÷ working days) when LOP. Off = full slab PF every month. */
    pfFixedProrateWithLop: true,
    pfSlabsOld: [],
    pfSlabsNew: [],
  });
  const [pfSettingsReady, setPfSettingsReady] = useState(false);
  const [pfSetupTab, setPfSetupTab] = useState('NEW');
  const pfSaveTimerRef = useRef(null);

  // Employee Setup (local, until backend module persists)
  const [payrollEmployees, setPayrollEmployees] = useState([]);
  const [payrollEmployeesLoading, setPayrollEmployeesLoading] = useState(false);
  const [payrollEmployeesError, setPayrollEmployeesError] = useState(null);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [payrollEmployeeSaving, setPayrollEmployeeSaving] = useState({});
  const [payrollOverview, setPayrollOverview] = useState(null);
  const [payrollOverviewLoading, setPayrollOverviewLoading] = useState(false);
  const [payslipOpen, setPayslipOpen] = useState(false);
  const [payslipPreview, setPayslipPreview] = useState(null);
  const [payslipEmployee, setPayslipEmployee] = useState(null);
  const [payslipLoading, setPayslipLoading] = useState(false);
  const [payrollOverviewTick, setPayrollOverviewTick] = useState(0);
  const [adjustmentSavingKey, setAdjustmentSavingKey] = useState(null);
  /** When true, next overview refetch (after +/-) runs without global loading = no "…" flash on whole table */
  const silentPayrollOverviewRefreshRef = useRef(false);

  // Monthly Activity (initialization workflow)
  const [initStatus, setInitStatus] = useState('Not Initialized'); // Not Initialized | Initialized | Published
  const [linkAttendance, setLinkAttendance] = useState(true);
  const [linkLeave, setLinkLeave] = useState(true);
  const [adjustments, setAdjustments] = useState([
    { id: makeId(), employeeId: '', lopDays: 0, overtimeHours: 0, arrears: 0, bonus: 0 },
  ]);
  const [payslipOptions, setPayslipOptions] = useState({
    showYtd: true,
    showAttendanceDetails: true,
    watermarkText: 'CONFIDENTIAL',
    digitalSignaturePlaceholder: true,
  });

  const effectiveCompany = useMemo(() => {
    return (
      currentCompany?.name ||
      (typeof window !== 'undefined'
        ? sessionStorage.getItem('selectedCompany') || sessionStorage.getItem('adminSelectedCompany')
        : null) ||
      companyId
    );
  }, [currentCompany, companyId]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const effectiveCompanyLabel = useMemo(() => {
    // Avoid Next hydration mismatch: render route companyId first, then switch to resolved name after mount.
    if (!isMounted) return companyId || 'Company';
    return effectiveCompany || 'Company';
  }, [isMounted, effectiveCompany, companyId]);

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setLoadingEmployees(true);
        const token = localStorage.getItem('auth_token');

        const q = new URLSearchParams();
        if (effectiveCompany) q.append('company', effectiveCompany);
        q.append('status', 'active');

        const res = await fetch(`/api/hrms-portal/employees?${q.toString()}`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(effectiveCompany ? { 'x-company': effectiveCompany } : {}),
          },
          cache: 'no-store',
        });
        if (!res.ok) throw new Error(`Employees fetch failed: ${res.status}`);
        const json = await res.json();
        if (!json?.success) throw new Error(json?.error || 'Failed to load employees');
        const list = json?.data?.employees || [];
        setEmployees(list);
        if (!employeeId && list.length > 0) {
          setEmployeeId(list[0].employeeId || list[0].biometricId || '');
        }
      } catch (e) {
        console.error('[payroll] loadEmployees error:', e);
        toast.error(e?.message || 'Failed to load employees');
      } finally {
        setLoadingEmployees(false);
      }
    };
    loadEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveCompany]);

  const runPreview = async () => {
    try {
      setLoadingPreview(true);
      setPreview(null);

      if (!employeeId) {
        toast.error('Select an employee');
        return;
      }
      if (!monthYear) {
        toast.error('Select month');
        return;
      }

      const q = new URLSearchParams();
      q.append('employeeId', employeeId);
      q.append('monthYear', monthYear);
      if (effectiveCompany) q.append('company', effectiveCompany);
      if (companyId) q.append('companyId', companyId);
      if (annualCtc) q.append('annualCtc', String(annualCtc));
      q.append('basicPercentOfCtc', String(basicPercentOfCtc));
      q.append('hraPercentOfBasic', String(hraPercentOfBasic));

      const res = await fetch(`/api/hrms-portal/payroll/preview?${q.toString()}`, {
        cache: 'no-store',
        headers: {
          ...(effectiveCompany ? { 'x-company': effectiveCompany } : {}),
        },
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        throw new Error(json?.error || `Preview failed (${res.status})`);
      }
      setPreview(json.data);
      setStep(2);
      toast.success('Payroll preview ready');
    } catch (e) {
      console.error('[payroll] preview error:', e);
      toast.error(e?.message || 'Failed to preview payroll');
    } finally {
      setLoadingPreview(false);
    }
  };

  const payMonthIndex = useMemo(() => {
    const m = Number(String(monthYear).split('-')[1]);
    return Number.isFinite(m) ? m : 1;
  }, [monthYear]);

  const earningsRows = useMemo(() => {
    const list = preview?.earnings || [];
    return list.map((e) => ({
      component: e.name,
      amount: e.amount,
      taxable: e.taxable ? 'Yes' : 'No',
    }));
  }, [preview]);

  const deductionsRows = useMemo(() => {
    const list = preview?.deductions || [];
    return list.map((d) => ({
      component: d.name,
      amount: d.amount,
    }));
  }, [preview]);

  const disbursementTrend = useMemo(() => {
    // Placeholder trend until payroll run history is wired
    const base = preview?.totals?.netPay || 0;
    const points = [];
    for (let i = 5; i >= 0; i--) {
      const dt = new Date();
      dt.setMonth(dt.getMonth() - i);
      points.push({
        month: toMonthYear(dt),
        net: Math.max(0, Math.round(base * (0.92 + i * 0.01))),
        gross: Math.max(0, Math.round((preview?.totals?.gross || base) * (0.94 + i * 0.008))),
      });
    }
    return points;
  }, [preview]);

  const deptBudget = useMemo(() => {
    // Placeholder until dept-wise payroll run aggregation exists
    return [
      { department: 'IT', budget: 420000 },
      { department: 'Finance', budget: 210000 },
      { department: 'Operations', budget: 320000 },
      { department: 'HR', budget: 140000 },
    ];
  }, []);

  const selectedEmployee = useMemo(() => {
    if (!employeeId) return null;
    const emp = employees.find((e) => String(e.employeeId || e.biometricId || e.id) === String(employeeId));
    return emp || null;
  }, [employees, employeeId]);

  // Tabs per DigiSME prompt (9)
  const tabs = useMemo(
    () => [
      { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { key: 'general-setup', label: 'General Setup', icon: Building2 },
      { key: 'employee-setup', label: 'Employee Setup', icon: Users },
      { key: 'monthly-activity', label: 'Monthly Activity', icon: CalendarClock },
      { key: 'income-tax', label: 'Income Tax', icon: ReceiptIndianRupee },
      { key: 'reports', label: 'Reports', icon: FileBarChart2 },
      { key: 'help', label: 'Help', icon: HelpCircle },
      { key: 'support', label: 'InfoTech Support', icon: Headset },
      { key: 'payroll-dashboard', label: 'Payroll Dashboard', icon: CalendarCog },
    ],
    []
  );

  // Seed adjustments table with selected employee
  useEffect(() => {
    setAdjustments((rows) => {
      const first = rows[0];
      if (!first) return rows;
      if (first.employeeId) return rows;
      if (!employeeId) return rows;
      return [{ ...first, employeeId: String(employeeId) }, ...rows.slice(1)];
    });
  }, [employeeId]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('payroll_general_setup_v1');
      const parsed = raw ? JSON.parse(raw) : null;
      if (parsed?.companyLogoDataUrl) setCompanyLogoDataUrl(parsed.companyLogoDataUrl);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        'payroll_general_setup_v1',
        JSON.stringify({
          companyLogoDataUrl,
        })
      );
    } catch {
      // ignore
    }
  }, [companyLogoDataUrl]);

  useEffect(() => {
    if (!effectiveCompany) return;
    let cancelled = false;
    setPfSettingsReady(false);
    (async () => {
      try {
        const res = await fetch(
          `/api/hrms-portal/payroll/settings?company=${encodeURIComponent(effectiveCompany)}`,
          { headers: { 'x-company': effectiveCompany }, cache: 'no-store' }
        );
        const j = await res.json().catch(() => null);
        if (cancelled || !j?.success || !j.data) return;
        setPfSettings({
          pfWageCeilingMonthly: j.data.pfWageCeilingMonthly ?? 15000,
          pfFixedProrateWithLop: j.data.pfFixedProrateWithLop !== false,
          pfSlabsOld: Array.isArray(j.data.pfSlabsOld) ? j.data.pfSlabsOld : [],
          pfSlabsNew: Array.isArray(j.data.pfSlabsNew) ? j.data.pfSlabsNew : [],
        });
      } catch {
        // keep defaults
      } finally {
        if (!cancelled) setPfSettingsReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [effectiveCompany]);

  useEffect(() => {
    if (!effectiveCompany || !pfSettingsReady) return;
    if (pfSaveTimerRef.current) clearTimeout(pfSaveTimerRef.current);
    pfSaveTimerRef.current = setTimeout(async () => {
      try {
        await fetch(`/api/hrms-portal/payroll/settings?company=${encodeURIComponent(effectiveCompany)}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-company': effectiveCompany,
          },
          body: JSON.stringify(pfSettings),
        });
      } catch {
        // ignore
      }
    }, 700);
    return () => {
      if (pfSaveTimerRef.current) clearTimeout(pfSaveTimerRef.current);
    };
  }, [effectiveCompany, pfSettings, pfSettingsReady]);

  const handleLogoPick = async (file) => {
    try {
      if (!file) return;
      const max = 2 * 1024 * 1024;
      if (file.size > max) {
        toast.error('Logo too large (max 2MB)');
        return;
      }
      const reader = new FileReader();
      const dataUrl = await new Promise((resolve, reject) => {
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
      setCompanyLogoDataUrl(String(dataUrl));
      toast.success('Logo uploaded');
    } catch (e) {
      toast.error(e?.message || 'Failed to upload logo');
    }
  };

  const normalizeCompanyName = (value) => {
    if (!value) return null;
    const raw = String(value).trim();
    if (!raw || raw === 'undefined' || raw === 'null') return null;
    const lc = raw.toLowerCase();
    if (lc === '1' || lc === 'ecosoul' || lc === 'eco soul' || lc === 'ecosoul home') return 'Ecosoul Home';
    if (lc === '2' || lc === 'thrive' || lc === 'thrive brands' || lc === 'thrivebrands') return 'Thrive';
    return raw;
  };

  const payrollEmployeesLoadedKeyRef = useRef(null);

  useEffect(() => {
    const company = normalizeCompanyName(effectiveCompany);
    const loadedKey = `${API_BASE_URL}|${company || ''}`;
    if (payrollEmployeesLoadedKeyRef.current === loadedKey) return;
    payrollEmployeesLoadedKeyRef.current = loadedKey;

    const loadPayrollEmployees = async () => {
      try {
        setPayrollEmployeesLoading(true);
        setPayrollEmployeesError(null);
        const url = `${API_BASE_URL}/admin-users${company ? `?company=${encodeURIComponent(company)}` : ''}`;
        const res = await fetch(url, { cache: 'no-store' });
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.success || !Array.isArray(json?.users)) {
          throw new Error(json?.error || `Failed to load employees (HTTP ${res.status})`);
        }
        setPayrollEmployees(json.users);
      } catch (e) {
        console.error('[payroll] loadPayrollEmployees error:', e);
        setPayrollEmployeesError(e?.message || 'Failed to load employees');
        setPayrollEmployees([]);
      } finally {
        setPayrollEmployeesLoading(false);
      }
    };
    loadPayrollEmployees();
  }, [API_BASE_URL, effectiveCompany]);

  const filteredPayrollEmployees = useMemo(() => {
    const q = String(employeeSearch || '').trim().toLowerCase();
    const list = payrollEmployees || [];
    if (!q) return list;
    return list.filter((u) => {
      const hay = [
        u?.name,
        u?.email,
        u?.employeeId,
        u?.department,
        u?.jobTitle,
        u?.company,
        u?.emp_code,
      ]
        .map((x) => String(x || '').toLowerCase())
        .join(' ');
      return hay.includes(q);
    });
  }, [payrollEmployees, employeeSearch]);

  const overviewByKey = useMemo(() => {
    const m = new Map();
    for (const r of payrollOverview?.employees || []) {
      if (r?.employeeId) m.set(String(r.employeeId).trim().toUpperCase(), r);
      if (r?.mongoId) m.set(String(r.mongoId), r);
    }
    return m;
  }, [payrollOverview]);

  const getEmployeeOverview = (u) => {
    const id = String(u?.employeeId || '').trim().toUpperCase();
    if (id && overviewByKey.has(id)) return overviewByKey.get(id);
    const mid = String(u?._id || u?.id || '');
    if (mid && overviewByKey.has(mid)) return overviewByKey.get(mid);
    return null;
  };

  const payDateForPayslip = useMemo(() => {
    const m = String(monthYear).match(/^(\d{4})-(\d{2})$/);
    if (!m) return '';
    const Y = Number(m[1]);
    const mo = Number(m[2]);
    if (!Number.isFinite(Y) || !Number.isFinite(mo)) return '';
    const d = new Date(Y, mo, 2);
    return d.toLocaleDateString('en-GB');
  }, [monthYear]);

  const payslipCompanyBlock = useMemo(() => {
    const c = normalizeCompanyName(effectiveCompany);
    if (c === 'Ecosoul Home') {
      return {
        name: 'EcoSoul Home Private Limited',
        address:
          'Advant Navis Business Park Unit No. B-202A, 2nd Floor, Tower-B, Plot No. 7, Sector-142, Noida Gautam Budha Nagar Uttar Pradesh 201305 India',
      };
    }
    return { name: c || effectiveCompanyLabel || 'Company', address: '' };
  }, [effectiveCompany, effectiveCompanyLabel]);

  useEffect(() => {
    if (activeTab !== 'employee-setup') return;
    const company = normalizeCompanyName(effectiveCompany);
    if (!company) return;
    const silent = silentPayrollOverviewRefreshRef.current;
    silentPayrollOverviewRefreshRef.current = false;
    let cancelled = false;
    (async () => {
      if (!silent) setPayrollOverviewLoading(true);
      try {
        const res = await fetch(
          `/api/hrms-portal/payroll/employees-month-overview?monthYear=${encodeURIComponent(monthYear)}&company=${encodeURIComponent(company)}`,
          { headers: { 'x-company': company }, cache: 'no-store' }
        );
        const j = await res.json().catch(() => null);
        if (!cancelled && j?.success && j.data) setPayrollOverview(j.data);
        else if (!cancelled) setPayrollOverview(null);
      } catch {
        if (!cancelled) setPayrollOverview(null);
      } finally {
        if (!cancelled && !silent) setPayrollOverviewLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [monthYear, activeTab, effectiveCompany, payrollOverviewTick]);

  const applyPaidDayDelta = async (u, direction) => {
    const company = normalizeCompanyName(effectiveCompany);
    const empId = String(u?.employeeId || '').trim();
    if (!company || !empId) {
      toast.error('Company or employee ID is missing.');
      return;
    }
    const ov = getEmployeeOverview(u);
    const cur = Number(ov?.paidDaysAdjustment ?? 0);
    const next = cur + direction;
    const rowKey = String(u._id || u.id || empId);
    setAdjustmentSavingKey(rowKey);
    try {
      const res = await fetch('/api/hrms-portal/payroll/attendance-adjustment', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(company ? { 'x-company': company } : {}),
        },
        body: JSON.stringify({ employeeId: empId, monthYear, deltaPaidDays: next }),
      });
      const j = await res.json().catch(() => null);
      if (!res.ok || !j?.success) throw new Error(j?.error || 'Save failed');
      silentPayrollOverviewRefreshRef.current = true;
      setPayrollOverviewTick((t) => t + 1);
    } catch (e) {
      toast.error(e?.message || 'Failed to save adjustment');
    } finally {
      setAdjustmentSavingKey(null);
    }
  };

  const exportSalaryRegisterExcel = () => {
    const company = normalizeCompanyName(effectiveCompany);
    const rows = (filteredPayrollEmployees || []).map((e) => {
      const ov = getEmployeeOverview(e);
      const slab = ov?.pfSlab;
      let slabText = '';
      if (slab) {
        const ee =
          String(slab.eeMode || 'percent').toLowerCase() === 'fixed' &&
          slab.eeFixedRs != null &&
          Number.isFinite(Number(slab.eeFixedRs))
            ? `EE ₹${slab.eeFixedRs}`
            : `EE ${slab.employeePct}%`;
        const er =
          String(slab.erMode || 'percent').toLowerCase() === 'fixed' &&
          slab.erFixedRs != null &&
          Number.isFinite(Number(slab.erFixedRs))
            ? `ER ₹${slab.erFixedRs}`
            : `ER ${slab.employerPct}%`;
        slabText = `${(slab.label || '').trim() || 'Slab'} (${ee}, ${er})`;
      }
      return {
        Name: e.name,
        Email: e.email,
        'Employee ID': e.employeeId,
        Department: e.department,
        'Job title': e.jobTitle,
        'Annual CTC': e.annualCtc ?? '',
        'PF slab': slabText,
        'Present days': ov?.ok ? ov.paidDays : '',
        'HR paid-day adj': ov?.ok ? ov.paidDaysAdjustment ?? 0 : '',
        'LOP days': ov?.ok ? ov.lopDays : '',
        'Gross salary': ov?.ok ? ov.grossMonthly : ov?.error || '',
        'PF employee': ov?.ok ? ov.pfEmployee : '',
        'PF employer': ov?.ok ? ov.pfEmployer : '',
        'Net salary': ov?.ok ? ov.netMonthly : '',
      };
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Salary register');
    const safeCo = String(company || 'company').replace(/[^\w-]+/g, '_');
    XLSX.writeFile(wb, `salary_register_${monthYear}_${safeCo}.xlsx`);
  };

  const openPayslipDownload = async (u) => {
    const company = normalizeCompanyName(effectiveCompany);
    const empId = String(u?.employeeId || '').trim();
    const ctc = u?.annualCtc;
    if (!company || !empId) {
      toast.error('Company or employee ID is required for the payslip.');
      return;
    }
    if (!Number.isFinite(Number(ctc)) || Number(ctc) <= 0) {
      toast.error('Set annual CTC for this employee first.');
      return;
    }
    setPayslipEmployee(u);
    setPayslipLoading(true);
    setPayslipOpen(true);
    setPayslipPreview(null);
    try {
      const q = new URLSearchParams();
      q.append('employeeId', empId);
      q.append('monthYear', monthYear);
      q.append('company', company);
      if (companyId) q.append('companyId', String(companyId));
      q.append('annualCtc', String(ctc));
      const res = await fetch(`/api/hrms-portal/payroll/preview?${q.toString()}`, {
        cache: 'no-store',
        headers: { 'x-company': company },
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        throw new Error(json?.error || `Preview failed (${res.status})`);
      }
      setPayslipPreview(json.data);
    } catch (e) {
      setPayslipPreview(null);
      setPayslipOpen(false);
      setPayslipEmployee(null);
      toast.error(e?.message || 'Could not load payslip.');
    } finally {
      setPayslipLoading(false);
    }
  };

  const patchPayrollEmployeeLocal = (empId, partial) => {
    setPayrollEmployees((prev) =>
      (prev || []).map((u) => (String(u?._id || u?.id) === String(empId) ? { ...u, ...partial } : u))
    );
  };

  const savePayrollEmployeeFields = async (employeeRow, partial) => {
    const empId = employeeRow?._id || employeeRow?.id;
    if (!empId) return;
    const key = String(empId);
    setPayrollEmployeeSaving((s) => ({ ...s, [key]: true }));
    try {
      const company = normalizeCompanyName(effectiveCompany);
      let url = `${API_BASE_URL}/admin-users/${empId}`;
      if (company) url += `?company=${encodeURIComponent(company)}`;
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partial),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || `Update failed (${res.status})`);
      }
      patchPayrollEmployeeLocal(empId, partial);
    } catch (e) {
      toast.error(e?.message || 'Failed to save');
    } finally {
      setPayrollEmployeeSaving((s) => ({ ...s, [key]: false }));
    }
  };

  const downloadCsv = ({ filename, rows }) => {
    const esc = (v) => {
      const s = String(v ?? '');
      return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = rows.map((r) => r.map(esc).join(',')).join('\r\n') + '\r\n';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen space-y-8">
      {/* Header row tabs (per request) */}
      <Card className="border-2 p-0 rounded-2xl overflow-hidden">
        <div className="px-4 py-4 text-white" style={navBarStyle}>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">Payroll</div>
                <div className="text-xs text-white/80 truncate">{effectiveCompanyLabel}</div>
              </div>
              {companyLogoDataUrl ? (
                <div className="ml-2 h-9 w-9 rounded-xl bg-white/10 border border-white/15 overflow-hidden flex items-center justify-center flex-none">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={companyLogoDataUrl} alt="Company logo" className="h-full w-full object-cover" />
                </div>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => logoInputRef.current?.click?.()}
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 px-3 py-2 text-xs font-semibold"
                title="Upload company logo"
              >
                <Upload className="w-4 h-4" />
                Logo
              </button>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleLogoPick(e.target.files?.[0])}
              />
            </div>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {tabs.map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setActiveTab(t.key)}
                  className={`flex-none inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold border transition-colors ${
                    isActive
                      ? 'bg-sky-200/20 text-white border-sky-200/30'
                      : 'bg-transparent text-white/90 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-sky-200' : 'text-white/80'}`} />
                  <span className="whitespace-nowrap">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      <div className="space-y-6">
          {/* Dashboard tab (kept) */}
          {activeTab === 'dashboard' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <Card className="lg:col-span-8 border-2 p-6 rounded-2xl">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                      <Coins className="w-4 h-4 text-indigo-600" />
                      Salary Disbursement Trend
                    </h2>
                    <p className="text-xs text-slate-600">Gross vs Net (last 6 months)</p>
                  </div>
                </div>
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={disbursementTrend} margin={{ top: 10, right: 12, bottom: 0, left: 0 }}>
                      <CartesianGrid strokeDasharray="5 5" stroke="#E5E7EB" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
                      <ReTooltip
                        formatter={(value, name) => [`₹${money(value)}`, name === 'gross' ? 'Gross' : 'Net']}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="gross"
                        name="Gross"
                        stroke="#6366F1"
                        strokeWidth={2.2}
                        dot={false}
                      />
                      <Line type="monotone" dataKey="net" name="Net" stroke="#10B981" strokeWidth={2.2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="lg:col-span-4 border-2 p-6 rounded-2xl">
                <h2 className="text-base font-semibold text-slate-900 mb-1">Dept-wise Budgeting</h2>
                <p className="text-xs text-slate-600 mb-4">Placeholder until run history is finalized</p>
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={deptBudget} margin={{ top: 10, right: 12, bottom: 0, left: 0 }}>
                      <CartesianGrid vertical={false} strokeDasharray="5 5" stroke="#E5E7EB" />
                      <XAxis dataKey="department" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
                      <ReTooltip formatter={(v) => `₹${money(v)}`} />
                      <Bar dataKey="budget" name="Budget" fill="#4F46E5" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          ) : null}

          {/* Payroll Dashboard tab (DigiSME naming) */}
          {activeTab === 'payroll-dashboard' ? (
            <Card className="border-2 p-6 rounded-2xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-lg font-bold text-slate-900">Payroll Dashboard</div>
                  <div className="text-sm text-slate-600 mt-1">
                    Quick actions + processing status for {monthYear}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                      initStatus === 'Published'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : initStatus === 'Initialized'
                          ? 'bg-sky-50 text-sky-700 border-sky-200'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {initStatus}
                  </span>
                  <Button className="bg-indigo-600 text-white hover:bg-indigo-700" onClick={() => setActiveTab('monthly-activity')}>
                    Go to Monthly Activity
                  </Button>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border p-4 rounded-2xl">
                  <div className="text-xs text-slate-600">Employees</div>
                  <div className="text-2xl font-bold text-slate-900">{employees.length}</div>
                </Card>
                <Card className="border p-4 rounded-2xl">
                  <div className="text-xs text-slate-600">Preview Ready</div>
                  <div className="text-2xl font-bold text-slate-900">{preview ? 'Yes' : 'No'}</div>
                </Card>
                <Card className="border p-4 rounded-2xl">
                  <div className="text-xs text-slate-600">Net (Selected)</div>
                  <div className="text-2xl font-bold text-slate-900">₹{money(preview?.totals?.netPay || 0)}</div>
                </Card>
              </div>
            </Card>
          ) : null}

          {/* General Setup tab — PF slabs only (Old vs New); autosaved */}
          {activeTab === 'general-setup' ? (
            <div className="space-y-6">
              <Card className="border-2 p-6 rounded-2xl">
                <div className="text-lg font-bold text-slate-900">General Setup</div>
                <div className="text-sm text-slate-600 mt-1">
                  Define PF contribution slabs by annual CTC range for Old vs New rules. Changes save automatically.
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setPfSetupTab('NEW')}
                    className={`px-4 py-2 rounded-xl border text-sm font-semibold ${
                      pfSetupTab === 'NEW'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    New rule slabs
                  </button>
                  <button
                    type="button"
                    onClick={() => setPfSetupTab('OLD')}
                    className={`px-4 py-2 rounded-xl border text-sm font-semibold ${
                      pfSetupTab === 'OLD'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Old rule slabs
                  </button>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm font-medium text-slate-700 mb-1">PF wage ceiling (monthly ₹)</div>
                    <input
                      type="number"
                      value={pfSettings.pfWageCeilingMonthly}
                      onChange={(e) =>
                        setPfSettings((p) => ({
                          ...p,
                          pfWageCeilingMonthly: clamp(Number(e.target.value || 0), 0, 999999),
                        }))
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                    <div className="text-xs text-slate-500 mt-1">Applied when PF wage ceiling is enabled on the employee.</div>
                  </div>
                  <div className="md:col-span-2 flex flex-col justify-end">
                    <label className="flex items-start gap-3 cursor-pointer rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={pfSettings.pfFixedProrateWithLop === true}
                        onChange={(e) =>
                          setPfSettings((p) => ({
                            ...p,
                            pfFixedProrateWithLop: e.target.checked,
                          }))
                        }
                        className="mt-1 rounded border-slate-300"
                      />
                      <span>
                        <span className="text-sm font-semibold text-slate-900">
                          Prorate fixed ₹ PF with LOP (paid days ÷ working days)
                        </span>
                        <span className="block text-xs text-slate-600 mt-1">
                          <strong>Off (recommended default):</strong> slab fixed amounts (e.g. ₹2000 / ₹4000) deduct in full each month.
                          <strong className="font-medium"> On:</strong> fixed PF scales down when there are LOP days (like the older engine).
                          Percent-based PF always follows prorated basic either way.
                        </span>
                      </span>
                    </label>
                  </div>
                </div>

                <div className="mt-2 text-xs text-slate-600">
                  Employee / Employer: choose <strong>%</strong> (of PF wage; uses LOP-prorated basic) or <strong>fixed ₹</strong> per month.
                  By default, fixed ₹ is also scaled when there are LOP days (same factor as paid/working days); turn off the checkbox above for full fixed PF.
                </div>

                <div className="mt-4 overflow-auto">
                  <table className="min-w-[1100px] w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-slate-600 border-b">
                        <th className="py-2 pr-2">Label</th>
                        <th className="py-2 pr-2">Min CTC (₹/yr)</th>
                        <th className="py-2 pr-2">Max CTC (₹/yr)</th>
                        <th className="py-2 pr-2">Employee</th>
                        <th className="py-2 pr-2">Employer</th>
                        <th className="py-2 pr-2">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(pfSetupTab === 'OLD' ? pfSettings.pfSlabsOld : pfSettings.pfSlabsNew).map((r) => (
                        <tr key={r.id} className="border-t">
                          <td className="py-2 pr-2">
                            <input
                              value={r.label || ''}
                              onChange={(e) => {
                                const key = pfSetupTab === 'OLD' ? 'pfSlabsOld' : 'pfSlabsNew';
                                setPfSettings((prev) => ({
                                  ...prev,
                                  [key]: prev[key].map((s) =>
                                    s.id === r.id ? { ...s, label: e.target.value } : s
                                  ),
                                }));
                              }}
                              className="w-full min-w-[100px] px-2 py-1.5 rounded-lg border border-slate-200"
                              placeholder="Optional"
                            />
                          </td>
                          <td className="py-2 pr-2">
                            <input
                              type="number"
                              value={r.minCtc ?? ''}
                              onChange={(e) => {
                                const key = pfSetupTab === 'OLD' ? 'pfSlabsOld' : 'pfSlabsNew';
                                const v = Number(e.target.value || 0);
                                setPfSettings((prev) => ({
                                  ...prev,
                                  [key]: prev[key].map((s) =>
                                    s.id === r.id ? { ...s, minCtc: v } : s
                                  ),
                                }));
                              }}
                              className="w-32 px-2 py-1.5 rounded-lg border border-slate-200"
                            />
                          </td>
                          <td className="py-2 pr-2">
                            <input
                              type="number"
                              value={Number.isFinite(r.maxCtc) ? r.maxCtc : ''}
                              onChange={(e) => {
                                const key = pfSetupTab === 'OLD' ? 'pfSlabsOld' : 'pfSlabsNew';
                                const raw = e.target.value;
                                setPfSettings((prev) => ({
                                  ...prev,
                                  [key]: prev[key].map((s) =>
                                    s.id === r.id
                                      ? {
                                          ...s,
                                          maxCtc: raw === '' ? null : Number(raw),
                                        }
                                      : s
                                  ),
                                }));
                              }}
                              className="w-32 px-2 py-1.5 rounded-lg border border-slate-200"
                              placeholder="∞ empty"
                            />
                          </td>
                          <td className="py-2 pr-2 align-top">
                            <div className="flex flex-col gap-1 min-w-[160px]">
                              <select
                                value={r.eeMode === 'fixed' ? 'fixed' : 'percent'}
                                onChange={(e) => {
                                  const key = pfSetupTab === 'OLD' ? 'pfSlabsOld' : 'pfSlabsNew';
                                  const mode = e.target.value === 'fixed' ? 'fixed' : 'percent';
                                  setPfSettings((prev) => ({
                                    ...prev,
                                    [key]: prev[key].map((s) =>
                                      s.id === r.id ? { ...s, eeMode: mode } : s
                                    ),
                                  }));
                                }}
                                className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs"
                              >
                                <option value="percent">% of PF wage</option>
                                <option value="fixed">Fixed ₹ / month</option>
                              </select>
                              {r.eeMode === 'fixed' ? (
                                <input
                                  type="number"
                                  min={0}
                                  step={1}
                                  value={r.eeFixedRs != null && r.eeFixedRs !== '' ? r.eeFixedRs : ''}
                                  onChange={(e) => {
                                    const key = pfSetupTab === 'OLD' ? 'pfSlabsOld' : 'pfSlabsNew';
                                    const raw = e.target.value;
                                    setPfSettings((prev) => ({
                                      ...prev,
                                      [key]: prev[key].map((s) =>
                                        s.id === r.id
                                          ? {
                                              ...s,
                                              eeFixedRs: raw === '' ? null : Number(raw),
                                            }
                                          : s
                                      ),
                                    }));
                                  }}
                                  className="w-full px-2 py-1.5 rounded-lg border border-slate-200"
                                  placeholder="₹ / month"
                                />
                              ) : (
                                <input
                                  type="number"
                                  step="0.01"
                                  value={r.employeePct ?? ''}
                                  onChange={(e) => {
                                    const key = pfSetupTab === 'OLD' ? 'pfSlabsOld' : 'pfSlabsNew';
                                    const v = Number(e.target.value || 0);
                                    setPfSettings((prev) => ({
                                      ...prev,
                                      [key]: prev[key].map((s) =>
                                        s.id === r.id ? { ...s, employeePct: v } : s
                                      ),
                                    }));
                                  }}
                                  className="w-full px-2 py-1.5 rounded-lg border border-slate-200"
                                  placeholder="%"
                                />
                              )}
                            </div>
                          </td>
                          <td className="py-2 pr-2 align-top">
                            <div className="flex flex-col gap-1 min-w-[160px]">
                              <select
                                value={r.erMode === 'fixed' ? 'fixed' : 'percent'}
                                onChange={(e) => {
                                  const key = pfSetupTab === 'OLD' ? 'pfSlabsOld' : 'pfSlabsNew';
                                  const mode = e.target.value === 'fixed' ? 'fixed' : 'percent';
                                  setPfSettings((prev) => ({
                                    ...prev,
                                    [key]: prev[key].map((s) =>
                                      s.id === r.id ? { ...s, erMode: mode } : s
                                    ),
                                  }));
                                }}
                                className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs"
                              >
                                <option value="percent">% of PF wage</option>
                                <option value="fixed">Fixed ₹ / month</option>
                              </select>
                              {r.erMode === 'fixed' ? (
                                <input
                                  type="number"
                                  min={0}
                                  step={1}
                                  value={r.erFixedRs != null && r.erFixedRs !== '' ? r.erFixedRs : ''}
                                  onChange={(e) => {
                                    const key = pfSetupTab === 'OLD' ? 'pfSlabsOld' : 'pfSlabsNew';
                                    const raw = e.target.value;
                                    setPfSettings((prev) => ({
                                      ...prev,
                                      [key]: prev[key].map((s) =>
                                        s.id === r.id
                                          ? {
                                              ...s,
                                              erFixedRs: raw === '' ? null : Number(raw),
                                            }
                                          : s
                                      ),
                                    }));
                                  }}
                                  className="w-full px-2 py-1.5 rounded-lg border border-slate-200"
                                  placeholder="₹ / month"
                                />
                              ) : (
                                <input
                                  type="number"
                                  step="0.01"
                                  value={r.employerPct ?? ''}
                                  onChange={(e) => {
                                    const key = pfSetupTab === 'OLD' ? 'pfSlabsOld' : 'pfSlabsNew';
                                    const v = Number(e.target.value || 0);
                                    setPfSettings((prev) => ({
                                      ...prev,
                                      [key]: prev[key].map((s) =>
                                        s.id === r.id ? { ...s, employerPct: v } : s
                                      ),
                                    }));
                                  }}
                                  className="w-full px-2 py-1.5 rounded-lg border border-slate-200"
                                  placeholder="%"
                                />
                              )}
                            </div>
                          </td>
                          <td className="py-2 pr-2">
                            <button
                              type="button"
                              className="text-xs font-semibold text-rose-700 hover:underline"
                              onClick={() => {
                                const key = pfSetupTab === 'OLD' ? 'pfSlabsOld' : 'pfSlabsNew';
                                setPfSettings((prev) => ({
                                  ...prev,
                                  [key]: prev[key].filter((s) => s.id !== r.id),
                                }));
                              }}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4">
                  <Button
                    className="bg-slate-900 text-white hover:bg-slate-800"
                    onClick={() => {
                      const key = pfSetupTab === 'OLD' ? 'pfSlabsOld' : 'pfSlabsNew';
                      const row = {
                        id: makeId(),
                        label: '',
                        minCtc: 0,
                        maxCtc: null,
                        employeePct: 12,
                        employerPct: 12,
                        eeMode: 'percent',
                        erMode: 'percent',
                        eeFixedRs: null,
                        erFixedRs: null,
                      };
                      setPfSettings((prev) => ({ ...prev, [key]: [...prev[key], row] }));
                    }}
                  >
                    Add slab
                  </Button>
                </div>
              </Card>
            </div>
          ) : null}

          {/* Employee Setup tab — full-width table, one row per employee */}
          {activeTab === 'employee-setup' ? (
            <Card className="border-2 p-6 rounded-2xl overflow-hidden">
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <div className="text-lg font-bold text-slate-900">Employee Setup</div>
                  <div className="text-sm text-slate-600 mt-1">
                    All employees in one list. Edit annual CTC, PF rule, or PF slab — changes save automatically.
                    Use the payroll month below for <span className="font-semibold text-slate-800">present/LOP</span>{' '}
                    and salary amounts (from machine attendance).
                  </div>
                </div>
                <input
                  value={employeeSearch}
                  onChange={(e) => setEmployeeSearch(e.target.value)}
                  placeholder="Search name / email / employeeId / dept / emp_code..."
                  className="w-full md:max-w-md px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-indigo-100 bg-indigo-50/60 px-3 py-3">
                <Calendar className="w-4 h-4 text-indigo-700 shrink-0" />
                <span className="text-sm font-medium text-slate-800">Payroll month</span>
                <input
                  type="month"
                  value={monthYear}
                  onChange={(e) => setMonthYear(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-sm"
                />
                {payrollOverviewLoading && (
                  <span className="text-xs text-slate-600">Updating attendance & salary…</span>
                )}
                <Button
                  type="button"
                  className="bg-emerald-700 text-white hover:bg-emerald-800 text-sm"
                  icon={<Download className="w-4 h-4" />}
                  onClick={exportSalaryRegisterExcel}
                >
                  Salary register (Excel)
                </Button>
                <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-1 w-full md:w-auto md:ml-auto">
                  <span>
                    Weekends (Sat–Sun) are <span className="font-medium">not</span> counted as working or LOP days.
                  </span>
                  <Link
                    href={`/hrms/${companyId}/leaves/manage`}
                    className="text-indigo-700 font-medium hover:underline"
                  >
                    Leave requests
                  </Link>
                  <span className="text-slate-400">|</span>
                  <Link
                    href={`/hrms/${companyId}/attendance/approvals`}
                    className="text-indigo-700 font-medium hover:underline"
                  >
                    Attendance approvals
                  </Link>
                </div>
              </div>

              <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200">
                {payrollEmployeesLoading ? (
                  <div className="p-8 text-sm text-slate-600 text-center">Loading employees…</div>
                ) : payrollEmployeesError ? (
                  <div className="p-8 text-sm text-rose-700 text-center">{payrollEmployeesError}</div>
                ) : filteredPayrollEmployees.length === 0 ? (
                  <div className="p-8 text-sm text-slate-600 text-center">
                    {(payrollEmployees || []).length === 0
                      ? 'No employees for this company.'
                      : 'No employees match your search.'}
                  </div>
                ) : (
                  <table className="min-w-[2100px] w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">
                        <th className="px-3 py-3 whitespace-nowrap">Name</th>
                        <th className="px-3 py-3 whitespace-nowrap">Email</th>
                        <th className="px-3 py-3 whitespace-nowrap">Employee ID</th>
                        <th className="px-3 py-3 whitespace-nowrap">Department</th>
                        <th className="px-3 py-3 whitespace-nowrap">Job title</th>
                        <th className="px-3 py-3 whitespace-nowrap">Location</th>
                        <th className="px-3 py-3 whitespace-nowrap">Emp code</th>
                        <th className="px-3 py-3 whitespace-nowrap">Phone</th>
                        <th className="px-3 py-3 whitespace-nowrap">PAN</th>
                        <th className="px-3 py-3 whitespace-nowrap">UAN</th>
                        <th className="px-3 py-3 whitespace-nowrap">Bank A/C</th>
                        <th className="px-3 py-3 whitespace-nowrap">Annual CTC (₹)</th>
                        <th className="px-3 py-3 whitespace-nowrap">PF rule</th>
                        <th className="px-3 py-3 whitespace-nowrap min-w-[220px]">PF slab</th>
                        <th
                          className="px-3 py-3 whitespace-nowrap text-right min-w-[128px]"
                          title="Increase/decrease paid days (machine + HR correction)."
                        >
                          Present (−/+)
                        </th>
                        <th
                          className="px-3 py-3 whitespace-nowrap text-right min-w-[128px]"
                          title="Increase LOP = fewer paid days; decrease LOP = more paid days."
                        >
                          LOP (−/+)
                        </th>
                        <th className="px-3 py-3 whitespace-nowrap text-right">Gross (₹)</th>
                        <th className="px-3 py-3 whitespace-nowrap text-right">PF EE</th>
                        <th className="px-3 py-3 whitespace-nowrap text-right">PF ER</th>
                        <th className="px-3 py-3 whitespace-nowrap text-right">Net (₹)</th>
                        <th className="px-3 py-3 whitespace-nowrap text-right">Payslip</th>
                        <th className="px-3 py-3 whitespace-nowrap">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {filteredPayrollEmployees.map((u) => {
                        const rowId = String(u?._id || u?.id);
                        const saving = !!payrollEmployeeSaving[rowId];
                        const ov = getEmployeeOverview(u);
                        const fmtOv = (n) => {
                          const x = Number(n);
                          if (!Number.isFinite(x)) return '—';
                          return `₹${x.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                        };
                        const active = u?.active !== false && u?.isActive !== false;
                        const rule = u?.pfRule || 'NEW';
                        const slabs = rule === 'OLD' ? pfSettings.pfSlabsOld : pfSettings.pfSlabsNew;
                        const slabList = Array.isArray(slabs) ? slabs : [];
                        const slabVal = u?.pfSlabId || '';
                        const slabSelectValue =
                          slabVal && slabList.some((s) => String(s.id) === String(slabVal)) ? slabVal : '';

                        return (
                          <tr key={rowId} className="hover:bg-slate-50/80">
                            <td className="px-3 py-2.5 font-medium text-slate-900 whitespace-nowrap">{u?.name || '—'}</td>
                            <td className="px-3 py-2.5 text-slate-600 max-w-[200px] truncate" title={u?.email || ''}>
                              {u?.email || '—'}
                            </td>
                            <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">{u?.employeeId || '—'}</td>
                            <td className="px-3 py-2.5 text-slate-600 max-w-[140px] truncate">{u?.department || '—'}</td>
                            <td className="px-3 py-2.5 text-slate-600 max-w-[140px] truncate">{u?.jobTitle || '—'}</td>
                            <td className="px-3 py-2.5 text-slate-600 max-w-[120px] truncate">{u?.location || '—'}</td>
                            <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">{u?.emp_code || '—'}</td>
                            <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">{u?.phone || '—'}</td>
                            <td className="px-3 py-2.5 text-slate-600 max-w-[100px] truncate">{u?.pan || '—'}</td>
                            <td className="px-3 py-2.5 text-slate-600 max-w-[120px] truncate">{u?.uan || '—'}</td>
                            <td className="px-3 py-2.5 text-slate-600 max-w-[120px] truncate">{u?.bankAccount || '—'}</td>
                            <td className="px-3 py-2.5 whitespace-nowrap">
                              <input
                                type="number"
                                min={0}
                                disabled={saving}
                                value={u.annualCtc != null && u.annualCtc !== '' ? String(u.annualCtc) : ''}
                                onChange={(e) => {
                                  const raw = e.target.value;
                                  if (raw === '') {
                                    patchPayrollEmployeeLocal(rowId, { annualCtc: null });
                                    return;
                                  }
                                  const n = Number(raw);
                                  if (Number.isFinite(n)) patchPayrollEmployeeLocal(rowId, { annualCtc: n });
                                }}
                                onBlur={(e) => {
                                  const raw = e.target.value.trim();
                                  const nextCtc = raw === '' ? null : Number(raw);
                                  const nextSlab =
                                    nextCtc != null && Number.isFinite(nextCtc)
                                      ? resolvePfSlabIdFromSettings(nextCtc, rule, pfSettings, null)
                                      : '';
                                  const patch = {
                                    annualCtc:
                                      nextCtc != null && Number.isFinite(nextCtc) ? nextCtc : null,
                                  };
                                  if (nextSlab) patch.pfSlabId = nextSlab;
                                  savePayrollEmployeeFields(u, patch);
                                }}
                                className="w-28 px-2 py-1 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
                              />
                            </td>
                            <td className="px-3 py-2.5 whitespace-nowrap">
                              <select
                                value={rule === 'OLD' ? 'OLD' : 'NEW'}
                                disabled={saving}
                                onChange={(e) => {
                                  const nextRule = e.target.value;
                                  const nextSlab = resolvePfSlabIdFromSettings(
                                    u.annualCtc,
                                    nextRule,
                                    pfSettings,
                                    null
                                  );
                                  savePayrollEmployeeFields(u, {
                                    pfRule: nextRule,
                                    ...(nextSlab ? { pfSlabId: nextSlab } : {}),
                                  });
                                }}
                                className="px-2 py-1 text-sm border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                              >
                                <option value="NEW">New</option>
                                <option value="OLD">Old</option>
                              </select>
                            </td>
                            <td className="px-3 py-2.5 whitespace-nowrap">
                              <select
                                value={slabSelectValue}
                                disabled={saving || slabList.length === 0}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  savePayrollEmployeeFields(u, { pfSlabId: v || null });
                                }}
                                className="min-w-[200px] max-w-[280px] px-2 py-1 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                              >
                                <option value="">Auto (from CTC)</option>
                                {slabList.map((s) => (
                                  <option key={s.id} value={s.id}>
                                    {(s.label || '').trim() ||
                                      `₹${s.minCtc}-${
                                        Number.isFinite(Number(s.maxCtc)) ? s.maxCtc : '∞'
                                      } · EE ${
                                        String(s.eeMode || 'percent').toLowerCase() === 'fixed' &&
                                        s.eeFixedRs != null &&
                                        Number.isFinite(Number(s.eeFixedRs))
                                          ? `₹${s.eeFixedRs}/mo`
                                          : `${s.employeePct}%`
                                      } / ER ${
                                        String(s.erMode || 'percent').toLowerCase() === 'fixed' &&
                                        s.erFixedRs != null &&
                                        Number.isFinite(Number(s.erFixedRs))
                                          ? `₹${s.erFixedRs}/mo`
                                          : `${s.employerPct}%`
                                      }`}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="px-3 py-2.5 text-right whitespace-nowrap">
                              {payrollOverviewLoading ? (
                                '…'
                              ) : !ov?.ok ? (
                                '—'
                              ) : (
                                (() => {
                                  const pd = Number(ov.paidDays);
                                  const wdm = Number(ov.workingDaysInMonth);
                                  const savingRow = adjustmentSavingKey === rowId;
                                  const canInc =
                                    Number.isFinite(pd) &&
                                    Number.isFinite(wdm) &&
                                    pd < wdm &&
                                    !savingRow;
                                  const canDec =
                                    Number.isFinite(pd) && pd > 0 && !savingRow;
                                  return (
                                    <div className="inline-flex items-center justify-end gap-0.5">
                                      <button
                                        type="button"
                                        title="Decrease present / increase LOP"
                                        disabled={!canDec}
                                        onClick={() => applyPaidDayDelta(u, -1)}
                                        className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40"
                                      >
                                        <Minus className="w-3.5 h-3.5" />
                                      </button>
                                      <span className="min-w-[1.75rem] text-slate-800 font-medium tabular-nums text-center">
                                        {ov.paidDays ?? '—'}
                                      </span>
                                      <button
                                        type="button"
                                        title="Increase present (e.g. forgot punch)"
                                        disabled={!canInc}
                                        onClick={() => applyPaidDayDelta(u, 1)}
                                        className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40"
                                      >
                                        <Plus className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  );
                                })()
                              )}
                            </td>
                            <td className="px-3 py-2.5 text-right whitespace-nowrap">
                              {payrollOverviewLoading ? (
                                '…'
                              ) : !ov?.ok ? (
                                '—'
                              ) : (
                                (() => {
                                  const pd = Number(ov.paidDays);
                                  const wdm = Number(ov.workingDaysInMonth);
                                  const savingRow = adjustmentSavingKey === rowId;
                                  const canIncLop =
                                    Number.isFinite(pd) && pd > 0 && !savingRow;
                                  const canDecLop =
                                    Number.isFinite(pd) &&
                                    Number.isFinite(wdm) &&
                                    pd < wdm &&
                                    !savingRow;
                                  return (
                                    <div className="inline-flex items-center justify-end gap-0.5">
                                      <button
                                        type="button"
                                        title="Decrease LOP / increase present"
                                        disabled={!canDecLop}
                                        onClick={() => applyPaidDayDelta(u, 1)}
                                        className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40"
                                      >
                                        <Minus className="w-3.5 h-3.5" />
                                      </button>
                                      <span className="min-w-[1.75rem] text-slate-800 font-medium tabular-nums text-center">
                                        {ov.lopDays ?? '—'}
                                      </span>
                                      <button
                                        type="button"
                                        title="Increase LOP / decrease present"
                                        disabled={!canIncLop}
                                        onClick={() => applyPaidDayDelta(u, -1)}
                                        className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40"
                                      >
                                        <Plus className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  );
                                })()
                              )}
                            </td>
                            <td className="px-3 py-2.5 text-right text-slate-700 tabular-nums whitespace-nowrap">
                              {payrollOverviewLoading ? '…' : ov?.ok ? fmtOv(ov.grossMonthly) : '—'}
                            </td>
                            <td className="px-3 py-2.5 text-right text-slate-700 tabular-nums whitespace-nowrap">
                              {payrollOverviewLoading ? '…' : ov?.ok ? fmtOv(ov.pfEmployee) : '—'}
                            </td>
                            <td className="px-3 py-2.5 text-right text-slate-700 tabular-nums whitespace-nowrap">
                              {payrollOverviewLoading ? '…' : ov?.ok ? fmtOv(ov.pfEmployer) : '—'}
                            </td>
                            <td className="px-3 py-2.5 text-right font-medium text-slate-900 tabular-nums whitespace-nowrap">
                              {payrollOverviewLoading ? '…' : ov?.ok ? fmtOv(ov.netMonthly) : '—'}
                            </td>
                            <td className="px-3 py-2.5 text-right whitespace-nowrap">
                              <Button
                                type="button"
                                className="!py-1 !px-2 text-xs bg-slate-900 text-white hover:bg-slate-800"
                                onClick={() => openPayslipDownload(u)}
                                disabled={
                                  payslipLoading &&
                                  String(payslipEmployee?._id || payslipEmployee?.id) === rowId
                                }
                              >
                                {payslipLoading &&
                                String(payslipEmployee?._id || payslipEmployee?.id) === rowId
                                  ? '…'
                                  : 'Payslip'}
                              </Button>
                            </td>
                            <td className="px-3 py-2.5 whitespace-nowrap">
                              <span
                                className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold border ${
                                  active
                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                                    : 'border-rose-200 bg-rose-50 text-rose-800'
                                }`}
                              >
                                {active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </Card>
          ) : null}

          {/* Monthly Activity tab */}
          {activeTab === 'monthly-activity' ? (
            <div className="space-y-6">
              <Card className="border-2 p-6 rounded-2xl">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-lg font-bold text-slate-900">Monthly Activity & Processing</div>
                    <div className="text-sm text-slate-600 mt-1">Step-by-step payroll for {monthYear}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-600">Initialization Status</span>
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                        initStatus === 'Published'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : initStatus === 'Initialized'
                            ? 'bg-sky-50 text-sky-700 border-sky-200'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {initStatus}
                    </span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <Card className="lg:col-span-5 border p-5 rounded-2xl">
                    <div className="text-sm font-semibold text-slate-900">Step 1: Initialization</div>
                    <div className="text-xs text-slate-600 mt-1">Fetch data and link attendance/leave sources</div>
                    <div className="mt-4 space-y-2">
                      <label className="flex items-center gap-2 text-sm text-slate-700">
                        <input type="checkbox" checked={linkAttendance} onChange={(e) => setLinkAttendance(e.target.checked)} />
                        Link Attendance Data
                      </label>
                      <label className="flex items-center gap-2 text-sm text-slate-700">
                        <input type="checkbox" checked={linkLeave} onChange={(e) => setLinkLeave(e.target.checked)} />
                        Link Leave Data
                      </label>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button
                        className="bg-indigo-600 text-white hover:bg-indigo-700"
                        onClick={() => {
                          setInitStatus('Initialized');
                          toast.success('Initialized');
                        }}
                      >
                        Initialize
                      </Button>
                      <Button
                        className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                        onClick={() => {
                          setInitStatus('Not Initialized');
                          toast.success('Reset');
                        }}
                      >
                        Reset
                      </Button>
                    </div>
                  </Card>

                  <Card className="lg:col-span-7 border p-5 rounded-2xl">
                    <div className="text-sm font-semibold text-slate-900">Step 2: Salary Adjustment Table</div>
                    <div className="text-xs text-slate-600 mt-1">Editable: LOP, Overtime, Arrears, Bonus</div>
                    <div className="mt-4 overflow-auto">
                      <table className="min-w-[860px] w-full text-sm">
                        <thead>
                          <tr className="text-left text-xs text-slate-600">
                            <th className="py-2 pr-2">Employee</th>
                            <th className="py-2 pr-2">LOP Days</th>
                            <th className="py-2 pr-2">Overtime (hrs)</th>
                            <th className="py-2 pr-2">Arrears</th>
                            <th className="py-2 pr-2">Bonus</th>
                            <th className="py-2 pr-2">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {adjustments.map((r) => (
                            <tr key={r.id} className="border-t">
                              <td className="py-2 pr-2">
                                <select
                                  value={r.employeeId}
                                  onChange={(e) => {
                                    const v = e.target.value;
                                    setAdjustments((rows) => rows.map((x) => (x.id === r.id ? { ...x, employeeId: v } : x)));
                                  }}
                                  className="px-2 py-1.5 rounded-lg border border-slate-200 bg-white"
                                >
                                  <option value="">Select</option>
                                  {employees.map((emp) => {
                                    const id = emp.employeeId || emp.biometricId || emp.id;
                                    return (
                                      <option key={String(id)} value={String(id)}>
                                        {emp.name || id}
                                      </option>
                                    );
                                  })}
                                </select>
                              </td>
                              <td className="py-2 pr-2">
                                <input
                                  type="number"
                                  value={r.lopDays}
                                  onChange={(e) => {
                                    const v = Number(e.target.value || 0);
                                    setAdjustments((rows) => rows.map((x) => (x.id === r.id ? { ...x, lopDays: v } : x)));
                                  }}
                                  className="w-24 px-2 py-1.5 rounded-lg border border-slate-200"
                                />
                              </td>
                              <td className="py-2 pr-2">
                                <input
                                  type="number"
                                  value={r.overtimeHours}
                                  onChange={(e) => {
                                    const v = Number(e.target.value || 0);
                                    setAdjustments((rows) => rows.map((x) => (x.id === r.id ? { ...x, overtimeHours: v } : x)));
                                  }}
                                  className="w-28 px-2 py-1.5 rounded-lg border border-slate-200"
                                />
                              </td>
                              <td className="py-2 pr-2">
                                <input
                                  type="number"
                                  value={r.arrears}
                                  onChange={(e) => {
                                    const v = Number(e.target.value || 0);
                                    setAdjustments((rows) => rows.map((x) => (x.id === r.id ? { ...x, arrears: v } : x)));
                                  }}
                                  className="w-28 px-2 py-1.5 rounded-lg border border-slate-200"
                                />
                              </td>
                              <td className="py-2 pr-2">
                                <input
                                  type="number"
                                  value={r.bonus}
                                  onChange={(e) => {
                                    const v = Number(e.target.value || 0);
                                    setAdjustments((rows) => rows.map((x) => (x.id === r.id ? { ...x, bonus: v } : x)));
                                  }}
                                  className="w-24 px-2 py-1.5 rounded-lg border border-slate-200"
                                />
                              </td>
                              <td className="py-2 pr-2">
                                <button
                                  type="button"
                                  className="text-xs font-semibold text-rose-700 hover:underline"
                                  onClick={() => setAdjustments((rows) => rows.filter((x) => x.id !== r.id))}
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button
                        className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                        onClick={() =>
                          setAdjustments((rows) => [
                            ...rows,
                            { id: makeId(), employeeId: '', lopDays: 0, overtimeHours: 0, arrears: 0, bonus: 0 },
                          ])
                        }
                      >
                        Add row
                      </Button>
                      <Button
                        className="bg-slate-900 text-white hover:bg-slate-800"
                        onClick={() => {
                          setInitStatus('Published');
                          toast.success('Published (demo)');
                        }}
                      >
                        Publish
                      </Button>
                    </div>
                  </Card>
                </div>
              </Card>

              <Card className="border-2 p-6 rounded-2xl">
                <div className="text-sm font-semibold text-slate-900">Step 3: Payslip Generation</div>
                <div className="text-xs text-slate-600 mt-1">Toggle YTD, attendance details, watermark, signature placeholder</div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={!!payslipOptions.showYtd}
                      onChange={(e) => setPayslipOptions((p) => ({ ...p, showYtd: e.target.checked }))}
                    />
                    Show YTD
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={!!payslipOptions.showAttendanceDetails}
                      onChange={(e) => setPayslipOptions((p) => ({ ...p, showAttendanceDetails: e.target.checked }))}
                    />
                    Show Attendance Details
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={!!payslipOptions.digitalSignaturePlaceholder}
                      onChange={(e) => setPayslipOptions((p) => ({ ...p, digitalSignaturePlaceholder: e.target.checked }))}
                    />
                    Digital Signature Placeholder
                  </label>
                  <div>
                    <div className="text-sm font-medium text-slate-700 mb-1">Watermark</div>
                    <input
                      value={payslipOptions.watermarkText}
                      onChange={(e) => setPayslipOptions((p) => ({ ...p, watermarkText: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <Card className="lg:col-span-7 border p-5 rounded-2xl">
                    <div className="text-sm font-semibold text-slate-900 mb-2">Payslip Preview (Mock)</div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 relative overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-5xl font-black text-slate-200/60 rotate-[-18deg] select-none">
                          {payslipOptions.watermarkText || 'CONFIDENTIAL'}
                        </div>
                      </div>
                      <div className="relative">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center">
                              {companyLogoDataUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={companyLogoDataUrl} alt="Logo" className="h-full w-full object-cover" />
                              ) : (
                                <span className="text-xs font-bold text-slate-400">LOGO</span>
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-slate-900">{effectiveCompanyLabel}</div>
                              <div className="text-xs text-slate-500">Payslip • {monthYear}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-slate-500">Net Pay</div>
                            <div className="text-lg font-bold text-slate-900">₹{money(preview?.totals?.netPay || 0)}</div>
                          </div>
                        </div>

                        <div className="mt-4 text-sm text-slate-700">
                          <div className="font-semibold text-slate-900">Employee</div>
                          <div>{selectedEmployee?.name || '—'}</div>
                          {payslipOptions.showAttendanceDetails ? (
                            <div className="mt-2 text-xs text-slate-600">
                              Paid Days : {preview?.attendance?.paidDays ?? '—'} | LOP Days :{' '}
                              {preview?.attendance?.lopDays ?? '—'} (from machine attendance)
                            </div>
                          ) : null}
                          {payslipOptions.showYtd ? (
                            <div className="mt-3 text-xs text-slate-600">
                              YTD values below are illustrative until fiscal accumulation is stored.
                            </div>
                          ) : null}
                        </div>

                        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          <div className="rounded-xl border border-slate-200 overflow-hidden">
                            <div className="px-3 py-2 bg-slate-100 font-semibold text-slate-800">Earnings</div>
                            <table className="w-full text-left">
                              <thead>
                                <tr className="text-slate-500 border-b">
                                  <th className="px-3 py-1.5">Component</th>
                                  <th className="px-3 py-1.5 text-right">Amount</th>
                                  {payslipOptions.showYtd ? <th className="px-3 py-1.5 text-right">YTD</th> : null}
                                </tr>
                              </thead>
                              <tbody>
                                {(preview?.earnings || []).map((row) => (
                                  <tr key={row.code || row.name} className="border-t border-slate-100">
                                    <td className="px-3 py-1.5">{row.name}</td>
                                    <td className="px-3 py-1.5 text-right">₹{money(row.amount)}</td>
                                    {payslipOptions.showYtd ? (
                                      <td className="px-3 py-1.5 text-right text-slate-400">
                                        ₹{money((row.amount || 0) * payMonthIndex)}
                                      </td>
                                    ) : null}
                                  </tr>
                                ))}
                                <tr className="border-t font-semibold bg-slate-50">
                                  <td className="px-3 py-2">Gross</td>
                                  <td className="px-3 py-2 text-right">₹{money(preview?.totals?.gross)}</td>
                                  {payslipOptions.showYtd ? (
                                    <td className="px-3 py-2 text-right text-slate-500">—</td>
                                  ) : null}
                                </tr>
                              </tbody>
                            </table>
                          </div>
                          <div className="rounded-xl border border-slate-200 overflow-hidden">
                            <div className="px-3 py-2 bg-slate-100 font-semibold text-slate-800">Deductions</div>
                            <table className="w-full text-left">
                              <thead>
                                <tr className="text-slate-500 border-b">
                                  <th className="px-3 py-1.5">Component</th>
                                  <th className="px-3 py-1.5 text-right">Amount</th>
                                  {payslipOptions.showYtd ? <th className="px-3 py-1.5 text-right">YTD</th> : null}
                                </tr>
                              </thead>
                              <tbody>
                                {(preview?.deductions || []).map((row) => (
                                  <tr key={row.code || row.name} className="border-t border-slate-100">
                                    <td className="px-3 py-1.5">{row.name}</td>
                                    <td className="px-3 py-1.5 text-right">₹{money(row.amount)}</td>
                                    {payslipOptions.showYtd ? (
                                      <td className="px-3 py-1.5 text-right text-slate-400">
                                        ₹{money((row.amount || 0) * payMonthIndex)}
                                      </td>
                                    ) : null}
                                  </tr>
                                ))}
                                <tr className="border-t font-semibold bg-slate-50">
                                  <td className="px-3 py-2">Total</td>
                                  <td className="px-3 py-2 text-right">₹{money(preview?.totals?.deductionsTotal)}</td>
                                  {payslipOptions.showYtd ? (
                                    <td className="px-3 py-2 text-right text-slate-500">—</td>
                                  ) : null}
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>

                        <div className="mt-4 rounded-xl border border-slate-200 px-3 py-2 text-xs bg-slate-50 flex justify-between">
                          <span className="font-semibold text-slate-800">Total Net Payable</span>
                          <span className="font-bold text-slate-900">₹{money(preview?.totals?.netPay)}</span>
                        </div>
                        <div className="mt-2 text-[11px] text-slate-500">
                          Total Net Payable = Gross Earnings − Total Deductions — This is a system-generated preview.
                        </div>

                        {payslipOptions.digitalSignaturePlaceholder ? (
                          <div className="mt-6 flex items-end justify-between">
                            <div className="text-xs text-slate-500">System generated</div>
                            <div className="text-xs text-slate-500 border-t border-slate-300 w-40 text-center pt-1">
                              Authorized Signatory
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </Card>

                  <Card className="lg:col-span-5 border p-5 rounded-2xl">
                    <div className="text-sm font-semibold text-slate-900">Export</div>
                    <div className="text-xs text-slate-600 mt-1">PDF export will be enabled when pdf-lib is wired server-side.</div>
                    <div className="mt-4 flex gap-2">
                      <Button className="bg-slate-900 text-white hover:bg-slate-800" disabled>
                        Export PDF
                      </Button>
                      <Button className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50" disabled>
                        Download ZIP
                      </Button>
                    </div>
                  </Card>
                </div>
              </Card>
            </div>
          ) : null}

          {/* Monthly Activity integrates preview calculation; keep existing Run Payroll flow under Monthly Activity in DigiSME prompt */}
          {activeTab === 'monthly-activity' ? null : null}

          {/* Income Tax tab */}
          {activeTab === 'income-tax' ? (
            <Card className="border-2 p-6 rounded-2xl">
              <div className="text-lg font-bold text-slate-900">Income Tax</div>
              <div className="text-sm text-slate-600 mt-1">TDS projection preview (yearly) – uses backend preview baseline</div>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border p-4 rounded-2xl">
                  <div className="text-xs text-slate-600">Regime</div>
                  <div className="text-2xl font-bold text-slate-900">{preview?.statutory?.regime || 'NEW'}</div>
                </Card>
                <Card className="border p-4 rounded-2xl">
                  <div className="text-xs text-slate-600">Annual Tax (est.)</div>
                  <div className="text-2xl font-bold text-slate-900">₹{money(preview?.statutory?.annualTax || 0)}</div>
                </Card>
                <Card className="border p-4 rounded-2xl">
                  <div className="text-xs text-slate-600">Monthly TDS</div>
                  <div className="text-2xl font-bold text-slate-900">₹{money(preview?.statutory?.tds || 0)}</div>
                </Card>
              </div>
              <div className="mt-6 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                <div className="text-sm font-semibold text-slate-900">Next</div>
                <div className="text-xs text-slate-600 mt-1">
                  IT Projection sheet + slab updates per FY + investment declarations integration.
                </div>
              </div>
            </Card>
          ) : null}

          {/* Reports tab: Bank Export + Payroll register skeleton */}
          {activeTab === 'reports' ? (
            <div className="space-y-6">
              <Card className="border-2 p-6 rounded-2xl">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-lg font-bold text-slate-900">Reports & Bank Submission</div>
                    <div className="text-sm text-slate-600 mt-1">Bank export CSV + payroll register skeleton</div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      className="bg-slate-900 text-white hover:bg-slate-800"
                      icon={<Download className="w-4 h-4" />}
                      onClick={() => {
                        // Minimal HDFC-like export from preview (selected employee) for now
                        const emp = selectedEmployee;
                        const net = preview?.totals?.netPay || 0;
                        if (!emp) {
                          toast.error('Select employee first');
                          return;
                        }
                        downloadCsv({
                          filename: `hdfc_bulk_${monthYear}.csv`,
                          rows: [
                            ['Debit Account', 'Beneficiary Account', 'Beneficiary Name', 'Amount', 'IFSC', 'Remarks'],
                            [
                              'DEBIT_ACC',
                              emp.bankAccount || 'ACC_NO',
                              emp.name || 'Employee',
                              net,
                              emp.ifsc || 'IFSC',
                              `Payroll ${monthYear}`,
                            ],
                          ],
                        });
                        toast.success('CSV downloaded (demo)');
                      }}
                    >
                      Bank Export (CSV)
                    </Button>
                  </div>
                </div>
                <div className="mt-6 text-sm text-slate-700">
                  <div className="font-semibold text-slate-900">Bank export fields</div>
                  <div className="text-xs text-slate-600 mt-1">
                    Debit Account, Beneficiary Account, Beneficiary Name, Amount, IFSC, Remarks
                  </div>
                </div>
              </Card>

              <Card className="border-2 p-6 rounded-2xl">
                <div className="text-base font-bold text-slate-900">Payroll Register (Preview)</div>
                <div className="text-xs text-slate-600 mt-1">Detailed report: Basic/HRA/Gross, PF/ESI/PT, Net</div>
                <div className="mt-4">
                  <Table
                    columns={[
                      { key: 'label', title: 'Field' },
                      { key: 'value', title: 'Value' },
                    ]}
                    data={[
                      { label: 'Gross', value: `₹${money(preview?.totals?.gross || 0)}` },
                      { label: 'PF (Employee)', value: `₹${money(preview?.statutory?.pf?.employee || 0)}` },
                      { label: 'PF (Employer)', value: `₹${money(preview?.statutory?.pf?.employer || 0)}` },
                      { label: 'ESI (Employee)', value: `₹${money(preview?.statutory?.esi?.employee || 0)}` },
                      { label: 'ESI (Employer)', value: `₹${money(preview?.statutory?.esi?.employer || 0)}` },
                      { label: 'TDS', value: `₹${money(preview?.statutory?.tds || 0)}` },
                      { label: 'Net Pay', value: `₹${money(preview?.totals?.netPay || 0)}` },
                    ]}
                    emptyMessage="Run a preview first"
                  />
                </div>
              </Card>
            </div>
          ) : null}

          {/* Help tab */}
          {activeTab === 'help' ? (
            <Card className="border-2 p-6 rounded-2xl">
              <div className="text-lg font-bold text-slate-900">Help</div>
              <div className="text-sm text-slate-600 mt-1">Quick guide to run payroll</div>
              <div className="mt-6 space-y-3 text-sm text-slate-700">
                <div className="font-semibold text-slate-900">Steps</div>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Complete General Setup (EPF/ESI/PT, daily rate mode).</li>
                  <li>Configure Salary Template and Pay Schedule.</li>
                  <li>Ensure Employee Setup has bank + PAN/IFSC + salary mapping.</li>
                  <li>Go to Monthly Activity → Initialize → Adjustments → Payslip options → Publish.</li>
                </ol>
              </div>
            </Card>
          ) : null}

          {/* InfoTech Support tab */}
          {activeTab === 'support' ? (
            <Card className="border-2 p-6 rounded-2xl">
              <div className="text-lg font-bold text-slate-900">InfoTech Support</div>
              <div className="text-sm text-slate-600 mt-1">Raise a support request for payroll issues</div>
              <div className="mt-6 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                <div className="text-sm font-semibold text-slate-900">Coming next</div>
                <div className="text-xs text-slate-600 mt-1">Ticket creation + audit trail.</div>
              </div>
            </Card>
          ) : null}

          {/* Monthly Activity uses the wizard preview too: keep Run Payroll as a shortcut */}
          {activeTab === 'monthly-activity' ? null : null}

          {/* Keep the existing calculation wizard under Monthly Activity + also expose it as quick entry via dashboard */}
          {activeTab === 'monthly-activity' ? null : null}

          {/* Existing Run Payroll wizard stays accessible as part of Monthly Activity; for now show it here too */}
          {activeTab === 'monthly-activity' ? null : null}

          {/* For now, keep the existing preview engine accessible under Monthly Activity by reusing the prior "run" tab key */}
          {activeTab === 'monthly-activity' ? null : null}

          {/* Backward compatibility: old 'run' tab route now maps to Monthly Activity's quick preview */}
          {activeTab === 'monthly-activity' ? null : null}

          {/* Provide a direct Preview runner in Monthly Activity by reusing the old Run Payroll UI */}
          {activeTab === 'monthly-activity' ? null : null}

          {/* We keep the previous Run Payroll UI under Monthly Activity by also rendering it when initStatus isn't published */}
          {activeTab === 'monthly-activity' ? null : null}

          {/* Legacy run UI exposed as a section inside Monthly Activity (below) */}
          {activeTab === 'monthly-activity' ? (
            <Card className="border-2 p-6 rounded-2xl">
              <div className="text-sm font-semibold text-slate-900">Quick Preview Engine</div>
              <div className="text-xs text-slate-600 mt-1">Use this to compute payroll preview using attendance bridge.</div>
              <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-4 space-y-4">
                  <div>
                    <div className="text-sm font-medium text-slate-700 mb-1">Month</div>
                    <input
                      type="month"
                      value={monthYear}
                      onChange={(e) => setMonthYear(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-700 mb-1">Employee</div>
                    <select
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      disabled={loadingEmployees}
                    >
                      {employees.map((e) => {
                        const id = e.employeeId || e.biometricId || e.id;
                        const label = `${e.name || 'Employee'}${id ? ` (${id})` : ''}`;
                        return (
                          <option key={String(id)} value={String(id)}>
                            {label}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-700 mb-1">Yearly CTC</div>
                    <input
                      value={annualCtc}
                      onChange={(e) => setAnnualCtc(e.target.value)}
                      placeholder="eg. 500000"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>
                  <Button
                    onClick={runPreview}
                    className="w-full bg-indigo-600 text-white hover:bg-indigo-700"
                    icon={loadingPreview ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                    disabled={loadingPreview}
                  >
                    Compute Preview
                  </Button>
                </div>

                <div className="lg:col-span-8 space-y-4">
                  {!preview ? (
                    <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                      <div className="text-sm font-semibold text-slate-900">No preview yet</div>
                      <div className="text-xs text-slate-600 mt-1">Compute preview to see earnings/deductions.</div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="border p-4 rounded-2xl">
                        <div className="text-xs text-slate-600">Gross</div>
                        <div className="text-2xl font-bold text-slate-900">₹{money(preview?.totals?.gross)}</div>
                      </Card>
                      <Card className="border p-4 rounded-2xl">
                        <div className="text-xs text-slate-600">Deductions</div>
                        <div className="text-2xl font-bold text-slate-900">₹{money(preview?.totals?.deductionsTotal)}</div>
                      </Card>
                      <Card className="border p-4 rounded-2xl">
                        <div className="text-xs text-slate-600">Net Pay</div>
                        <div className="text-2xl font-bold text-slate-900">₹{money(preview?.totals?.netPay)}</div>
                      </Card>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ) : null}
      </div>

      {payslipOpen && (
        <style
          dangerouslySetInnerHTML={{
            __html: `@media print {
              body * { visibility: hidden !important; }
              #payroll-payslip-print-root, #payroll-payslip-print-root * { visibility: visible !important; }
              #payroll-payslip-print-root { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; }
            }`,
          }}
        />
      )}

      <Modal
        isOpen={payslipOpen}
        onClose={() => {
          setPayslipOpen(false);
          setPayslipPreview(null);
          setPayslipEmployee(null);
        }}
        title="Payslip"
        size="xl"
        footer={
          <div className="flex gap-3 w-full justify-end flex-wrap">
            <Button
              type="button"
              onClick={() => {
                setPayslipOpen(false);
                setPayslipPreview(null);
                setPayslipEmployee(null);
              }}
              className="bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
            >
              Close
            </Button>
            <Button
              type="button"
              onClick={() => window.print()}
              className="bg-slate-900 text-white hover:bg-slate-800"
              disabled={!payslipPreview || payslipLoading}
            >
              Print / Save as PDF
            </Button>
          </div>
        }
      >
        <div id="payroll-payslip-print-root" className="max-h-[70vh] overflow-y-auto">
          {payslipLoading ? (
            <p className="text-slate-500 text-center py-8">Loading payslip…</p>
          ) : payslipPreview && payslipEmployee ? (
            <SalaryPayslip
              companyName={payslipCompanyBlock.name}
              companyAddress={payslipCompanyBlock.address}
              monthYear={monthYear}
              payDateStr={payDateForPayslip}
              employee={payslipEmployee}
              preview={payslipPreview}
            />
          ) : (
            <p className="text-slate-500 text-center py-8">No preview data.</p>
          )}
        </div>
      </Modal>

    </div>
  );
}



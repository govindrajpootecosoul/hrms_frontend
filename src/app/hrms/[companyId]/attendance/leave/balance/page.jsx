'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useCompany } from '@/lib/context/CompanyContext';
import { useToast } from '@/components/common/Toast';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Table from '@/components/common/Table';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';

const LEAVE_TYPE_OPTIONS = [
  'Casual Leave',
  'Sick Leave',
  'Earned Leave',
  'Work From Home',
  'Compensatory Off',
  'LOP',
];

const defaultBalances = () => ({
  'Casual Leave': 0,
  'Sick Leave': 0,
  'Earned Leave': 0,
  'Work From Home': 0,
  'Compensatory Off': 0,
  'LOP': 0,
});

const resolveEmployeeId = (emp) => {
  const direct = String(emp?.employeeId || '').trim();
  if (direct && direct !== 'N/A') return direct;
  const fromEmail = String(emp?.email || '').trim();
  if (fromEmail && fromEmail.includes('@')) return fromEmail.split('@')[0].trim();
  const fallback = String(emp?.id || '').trim();
  return fallback && fallback !== 'N/A' ? fallback : '';
};

export default function AttendanceLeaveBalancePage() {
  const params = useParams();
  const companyId = params?.companyId;
  const { currentCompany } = useCompany();
  const toast = useToast?.() || { error: () => {}, success: () => {}, info: () => {} };

  const [employees, setEmployees] = useState([]);
  const [balancesByEmployeeId, setBalancesByEmployeeId] = useState(new Map());
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');

  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustLoading, setAdjustLoading] = useState(false);
  const [adjustEmployee, setAdjustEmployee] = useState(null);
  const [adjustForm, setAdjustForm] = useState({
    leaveType: 'Casual Leave',
    delta: 0,
    reason: '',
  });

  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyEmployee, setHistoryEmployee] = useState(null);
  const [historyRows, setHistoryRows] = useState([]);

  const getCompanyName = () => {
    let company = currentCompany?.name;
    if (!company && typeof window !== 'undefined') {
      company = sessionStorage.getItem('selectedCompany') || sessionStorage.getItem('adminSelectedCompany');
    }
    if (!company && companyId && companyId !== 'undefined') {
      if (typeof window !== 'undefined') company = sessionStorage.getItem(`company_${companyId}`);
    }
    return company;
  };

  const fetchEmployees = async (company) => {
    try {
      const token = localStorage.getItem('auth_token');
      const params = new URLSearchParams();
      if (company) params.append('company', company);

      const headers = { ...(token ? { Authorization: `Bearer ${token}` } : {}) };
      if (company) headers['x-company'] = company;

      // Use the existing HRMS employees proxy route (returns normalized employeeId/name/email)
      const res = await fetch(`/api/portals/hrms/employees?${params.toString()}`, { headers });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.success) {
        return json.data?.employees || [];
      }
      return [];
    } catch {
      return [];
    }
  };

  const fetchBalances = async (company) => {
    try {
      const token = localStorage.getItem('auth_token');
      const params = new URLSearchParams();
      if (company) params.append('company', company);

      const headers = { ...(token ? { Authorization: `Bearer ${token}` } : {}) };
      if (company) headers['x-company'] = company;

      const res = await fetch(`/api/portals/hrms/leave-balances?${params.toString()}`, { headers });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.success) {
        const rows = json.data?.balances || [];
        const map = new Map();
        rows.forEach((r) => {
          map.set(String(r.employeeId || ''), { ...defaultBalances(), ...(r.balances || {}) });
        });
        return map;
      }
      return new Map();
    } catch {
      return new Map();
    }
  };

  const refresh = async () => {
    const company = getCompanyName();
    if (!company) return;
    setLoading(true);
    try {
      const [emps, balMap] = await Promise.all([fetchEmployees(company), fetchBalances(company)]);
      setEmployees(Array.isArray(emps) ? emps : []);
      setBalancesByEmployeeId(balMap);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId, currentCompany?.name]);

  const filteredEmployees = useMemo(() => {
    const q = String(search || '').toLowerCase().trim();
    if (!q) return employees;
    return employees.filter((e) => {
      const id = resolveEmployeeId(e).toLowerCase();
      const name = String(e.name || e.firstName || '').toLowerCase();
      return id.includes(q) || name.includes(q);
    });
  }, [employees, search]);

  const openAdjust = (emp) => {
    const employeeId = resolveEmployeeId(emp);
    if (!employeeId) return toast?.error?.('Employee ID not found');
    setAdjustEmployee({ ...emp, employeeId });
    setAdjustForm({ leaveType: 'Casual Leave', delta: 0, reason: '' });
    setAdjustOpen(true);
  };

  const submitAdjust = async () => {
    const employeeId = String(adjustEmployee?.employeeId || '').trim();
    if (!employeeId) return;
    const leaveType = String(adjustForm.leaveType || '').trim();
    const delta = Number(adjustForm.delta || 0);
    if (!leaveType) return toast?.error?.('Leave Type is required');
    if (!Number.isFinite(delta) || delta === 0) return toast?.error?.('Delta must be non-zero');

    const company = getCompanyName();
    try {
      setAdjustLoading(true);
      const token = localStorage.getItem('auth_token');

      const qs = new URLSearchParams();
      if (company) qs.append('company', company);

      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
      if (company) headers['x-company'] = company;

      const res = await fetch(
        `/api/portals/hrms/leave-balances/${encodeURIComponent(employeeId)}/adjust${qs.toString() ? `?${qs.toString()}` : ''}`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            leaveType,
            delta,
            reason: adjustForm.reason,
            performedBy: 'HR Admin',
          }),
        }
      );
      const json = await res.json().catch(() => null);
      if (res.ok && json?.success) {
        toast?.success?.('Leave balance updated');
        setAdjustOpen(false);
        setAdjustEmployee(null);
        await refresh();
      } else {
        toast?.error?.(json?.error || 'Failed to update leave balance');
      }
    } catch {
      toast?.error?.('Failed to update leave balance');
    } finally {
      setAdjustLoading(false);
    }
  };

  const openHistory = async (emp) => {
    const employeeId = resolveEmployeeId(emp);
    if (!employeeId) return toast?.error?.('Employee ID not found');

    setHistoryEmployee({ ...emp, employeeId });
    setHistoryRows([]);
    setHistoryOpen(true);

    const company = getCompanyName();
    try {
      setHistoryLoading(true);
      const token = localStorage.getItem('auth_token');
      const qs = new URLSearchParams();
      if (company) qs.append('company', company);

      const headers = { ...(token ? { Authorization: `Bearer ${token}` } : {}) };
      if (company) headers['x-company'] = company;

      const res = await fetch(
        `/api/portals/hrms/leave-balances/${encodeURIComponent(employeeId)}/history${qs.toString() ? `?${qs.toString()}` : ''}`,
        { headers }
      );
      const json = await res.json().catch(() => null);
      if (res.ok && json?.success) {
        setHistoryRows(json.data?.history || []);
      } else {
        setHistoryRows([]);
      }
    } catch {
      setHistoryRows([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const tableColumns = [
    {
      key: 'employeeName',
      title: 'Employee',
      render: (value, row) => (
        <div className="min-w-0">
          <div className="font-medium text-slate-900 truncate">{row?.name || row?.firstName || value || row?.employeeId}</div>
          <div className="text-xs text-slate-500 truncate">{row?.employeeId || row?.email || ''}</div>
        </div>
      ),
    },
    ...LEAVE_TYPE_OPTIONS.map((t) => ({
      key: `balance_${t.toLowerCase().replace(/\s+/g, '_')}`,
      title: t,
      render: (value, row) => {
        const employeeId = resolveEmployeeId(row);
        const balances = balancesByEmployeeId.get(employeeId) || defaultBalances();
        return <div className="text-slate-900 font-semibold tabular-nums">{Number(balances[t] ?? 0)}</div>;
      },
    })),
    {
      key: 'actions',
      title: 'Actions',
      render: (value, row) => (
        <div className="flex items-center justify-end gap-2">
          <Button size="sm" className="bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl" onClick={() => openAdjust(row)}>
            Add / Remove
          </Button>
          <Button
            size="sm"
            className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl"
            onClick={() => openHistory(row)}
          >
            History
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="border border-slate-200/70 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.03)] p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Leave Balance</h2>
            <p className="text-sm text-slate-600 mt-1">
              Manage employee leave allocations. Changes will reflect on the Employee Portal.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employee..."
              className="w-full sm:w-72"
            />
            <Button className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl" onClick={refresh}>
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      <Card className="border border-slate-200/70 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.03)] p-6">
        {loading ? (
          <div className="text-center py-10 text-slate-600">Loading employees…</div>
        ) : (
          <Table columns={tableColumns} data={filteredEmployees} pagination={true} currentPage={1} totalPages={Math.ceil((filteredEmployees?.length || 0) / 10)} emptyMessage="No employees found" />
        )}
      </Card>

      <Modal
        isOpen={adjustOpen}
        onClose={() => {
          if (adjustLoading) return;
          setAdjustOpen(false);
          setAdjustEmployee(null);
        }}
        title={`Adjust Leave Balance${adjustEmployee?.employeeId ? ` — ${adjustEmployee.employeeId}` : ''}`}
        size="sm"
        footer={
          <div className="flex gap-3 w-full justify-end">
            <Button
              onClick={() => {
                if (adjustLoading) return;
                setAdjustOpen(false);
                setAdjustEmployee(null);
              }}
              disabled={adjustLoading}
              className="bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
            >
              Cancel
            </Button>
            <Button onClick={submitAdjust} disabled={adjustLoading} className="bg-indigo-600 text-white hover:bg-indigo-700">
              {adjustLoading ? 'Saving…' : 'Save'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Leave Type *</label>
            <select
              value={adjustForm.leaveType}
              onChange={(e) => setAdjustForm((p) => ({ ...p, leaveType: e.target.value }))}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
            >
              {LEAVE_TYPE_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Delta (use negative to remove) *</label>
            <Input
              type="number"
              value={adjustForm.delta}
              onChange={(e) => setAdjustForm((p) => ({ ...p, delta: e.target.value }))}
              placeholder="e.g. 2 or -1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Reason (optional)</label>
            <Input value={adjustForm.reason} onChange={(e) => setAdjustForm((p) => ({ ...p, reason: e.target.value }))} placeholder="Reason for adjustment" />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={historyOpen}
        onClose={() => {
          if (historyLoading) return;
          setHistoryOpen(false);
          setHistoryEmployee(null);
          setHistoryRows([]);
        }}
        title={`Leave History${historyEmployee?.employeeId ? ` — ${historyEmployee.employeeId}` : ''}`}
        size="lg"
      >
        <div className="p-6">
          {historyLoading ? (
            <div className="text-center py-10 text-slate-600">Loading history…</div>
          ) : historyRows.length === 0 ? (
            <div className="text-center py-10 text-slate-600">No history found</div>
          ) : (
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-700">
                  <tr className="[&>th]:px-4 [&>th]:py-3 [&>th]:text-xs [&>th]:font-semibold [&>th]:uppercase [&>th]:tracking-wider">
                    <th>Date</th>
                    <th>Leave Type</th>
                    <th className="text-right">Delta</th>
                    <th className="text-right">Previous</th>
                    <th className="text-right">Next</th>
                    <th>By</th>
                    <th>Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {historyRows.slice(0, 200).map((r) => (
                    <tr key={r.id} className="[&>td]:px-4 [&>td]:py-3">
                      <td className="text-slate-700">
                        {r.createdAt ? new Date(r.createdAt).toLocaleString() : '—'}
                      </td>
                      <td className="text-slate-900 font-medium">{r.leaveType}</td>
                      <td className="text-right font-semibold tabular-nums text-slate-900">{r.delta}</td>
                      <td className="text-right tabular-nums text-slate-700">{r.previous}</td>
                      <td className="text-right tabular-nums text-slate-700">{r.next}</td>
                      <td className="text-slate-700">{r.performedBy || '—'}</td>
                      <td className="text-slate-600 max-w-[260px] truncate" title={r.reason || ''}>
                        {r.reason || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}


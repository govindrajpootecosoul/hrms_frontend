import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/utils/constants';

function yyyyMmDd(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function normalizeDept(v) {
  return String(v || '').trim();
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const company = searchParams.get('company');
    const department = searchParams.get('department'); // optional (filters EVERYTHING when set)
    const dateParam = searchParams.get('date'); // optional (anchor date for trends)
    const payrollCompany = searchParams.get('payrollCompany');

    const commonParams = new URLSearchParams();
    if (companyId) commonParams.append('companyId', companyId);
    if (company) commonParams.append('company', company);
    if (payrollCompany && payrollCompany !== 'all') commonParams.append('payrollCompany', payrollCompany);

    const fetchJson = async (url) => {
      const res = await fetch(url, { cache: 'no-store' }).catch(() => null);
      if (!res?.ok) return null;
      return await res.json().catch(() => null);
    };

    // 1) Employees (for department distribution)
    const employeesUrl = `${API_BASE_URL}/admin-users${commonParams.toString() ? `?${commonParams}` : ''}`;
    const employeesJson = await fetchJson(employeesUrl);
    const employees = employeesJson?.success && Array.isArray(employeesJson?.users) ? employeesJson.users : [];

    const deptCountsAll = new Map();
    for (const e of employees) {
      const dept = normalizeDept(e?.department) || 'General';
      deptCountsAll.set(dept, (deptCountsAll.get(dept) || 0) + 1);
    }

    const allDepartments = Array.from(deptCountsAll.entries())
      .map(([dept, count]) => ({ department: dept, count }))
      .sort((a, b) => b.count - a.count || a.department.localeCompare(b.department));

    const totalEmployees = employees.length;
    const requestedDept = normalizeDept(department);
    const effectiveDepartments =
      requestedDept && requestedDept.toLowerCase() !== 'all'
        ? allDepartments.filter((d) => d.department.toLowerCase() === requestedDept.toLowerCase())
        : allDepartments;

    const distributionTotal = effectiveDepartments.reduce((sum, d) => sum + d.count, 0) || 0;
    const departmentDistribution = effectiveDepartments.map((d) => ({
      ...d,
      percentage: distributionTotal ? Math.round((d.count / distributionTotal) * 1000) / 10 : 0, // 1 decimal
    }));

    // 2) Status ratios per department (today) via single backend call (avoid N requests)
    const anchor = dateParam ? new Date(`${dateParam}T00:00:00`) : new Date();
    const todayStr = yyyyMmDd(anchor);

    const ratiosDepartments = (requestedDept && requestedDept.toLowerCase() !== 'all'
      ? effectiveDepartments
      : allDepartments
    ).slice(0, 30); // safety cap

    const byDeptParams = new URLSearchParams(commonParams);
    byDeptParams.append('date', todayStr);
    // backend supports optional department filter; we only use it when user selected one
    if (requestedDept && requestedDept.toLowerCase() !== 'all') {
      byDeptParams.append('department', requestedDept);
    }
    const byDeptJson = await fetchJson(
      `${API_BASE_URL}/hrms/attendance/stats/by-department?${byDeptParams.toString()}`
    );
    const byDepartment =
      byDeptJson && byDeptJson.success && byDeptJson.data && byDeptJson.data.byDepartment
        ? byDeptJson.data.byDepartment
        : null;

    const normalizeDeptKey = (v) => normalizeDept(v);
    const perDeptStats = ratiosDepartments.map(({ department: deptName, count }) => {
      const k = normalizeDeptKey(deptName);
      const s = byDepartment && byDepartment[k] ? byDepartment[k] : null;
      return {
        department: deptName,
        total: s?.totalEmployees ?? count ?? 0,
        onSite: s?.presentToday ?? 0,
        wfh: s?.onWFHToday ?? 0,
        onLeave: s?.onLeaveToday ?? 0,
        absent: s?.absentToday ?? 0,
      };
    });

    // 3) Attendance trend (last 7 days) via single backend call
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(anchor);
      d.setDate(anchor.getDate() - (6 - i));
      return d;
    });

    const endDateStr = yyyyMmDd(anchor);
    const trendParams = new URLSearchParams(commonParams);
    trendParams.append('endDate', endDateStr);
    trendParams.append('days', '7');
    if (requestedDept && requestedDept.toLowerCase() !== 'all') trendParams.append('department', requestedDept);

    const trendsJson = await fetchJson(`${API_BASE_URL}/hrms/attendance/stats/trends?${trendParams.toString()}`);
    const trends = trendsJson && trendsJson.success && trendsJson.data && Array.isArray(trendsJson.data.trends) ? trendsJson.data.trends : [];
    const attendanceTrends = trends.map((t) => ({
      date: t.date,
      present: t.presentToday ?? 0,
      absent: t.absentToday ?? 0,
      wfh: t.onWFHToday ?? 0,
      onLeave: t.onLeaveToday ?? 0,
      totalEmployees: t.totalEmployees ?? 0,
    }));

    return NextResponse.json({
      success: true,
      data: {
        meta: {
          companyId: companyId || null,
          company: company || null,
          department: requestedDept || 'all',
          totalEmployees,
        },
        departmentDistribution,
        statusRatiosByDepartment: perDeptStats.sort((a, b) => (b.total - a.total) || a.department.localeCompare(b.department)),
        attendanceTrends,
      },
    });
  } catch (error) {
    console.error('Command Center Dashboard API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}


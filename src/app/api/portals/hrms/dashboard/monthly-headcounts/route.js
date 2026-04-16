import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/utils/constants';

// Monthly Headcounts API Route
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const company = searchParams.get('company');
    const department = searchParams.get('department'); // optional
    const dateParam = searchParams.get('date'); // optional (anchor month range)

    // Build query params
    const params = new URLSearchParams();
    if (companyId) params.append('companyId', companyId);
    if (company) params.append('company', company);

    const queryString = params.toString();

    // Fetch employees
    const employeesResponse = await fetch(
      `${API_BASE_URL}/admin-users${queryString ? `?${queryString}` : ''}`
    );

    if (!employeesResponse.ok) {
      throw new Error('Failed to fetch employees');
    }

    const employeesData = await employeesResponse.json();
    const employees = employeesData.success ? employeesData.users : employeesData;

    if (!Array.isArray(employees)) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    const parseDate = (v) => {
      if (!v) return null;
      const d = v instanceof Date ? v : new Date(v);
      return Number.isNaN(d.getTime()) ? null : d;
    };

    const endOfMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
    const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);

    const normalizeDept = (v) => String(v || '').trim().toLowerCase();
    const requestedDept = department && department !== 'all' ? normalizeDept(department) : null;
    const scopedEmployees = requestedDept
      ? employees.filter((e) => normalizeDept(e.department || 'General') === requestedDept)
      : employees;

    // Calculate monthly metrics for the last 12 months:
    // - total: active headcount at end of month
    // - joined: joins within month
    // - resigned: exits within month (based on exitDate when available)
    const monthlyHeadcounts = [];
    const today = dateParam ? new Date(`${dateParam}T00:00:00`) : new Date();
    
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      
      const joined = scopedEmployees.filter((emp) => {
        const joinDate = parseDate(emp.joiningDate || emp.createdAt);
        if (!joinDate) return false;
        return joinDate >= monthStart && joinDate <= monthEnd;
      }).length;

      const resigned = scopedEmployees.filter((emp) => {
        const exit = parseDate(emp.exitDate);
        if (!exit) return false;
        return exit >= monthStart && exit <= monthEnd;
      }).length;

      const total = scopedEmployees.filter((emp) => {
        const joinDate = parseDate(emp.joiningDate || emp.createdAt);
        if (!joinDate) return false;
        if (joinDate > monthEnd) return false;
        const exit = parseDate(emp.exitDate);
        if (exit && exit <= monthEnd) return false;
        return true;
      }).length;

      monthlyHeadcounts.push({
        month: monthName,
        total,
        joined,
        resigned,
      });
    }

    return NextResponse.json({
      success: true,
      data: monthlyHeadcounts,
    });
  } catch (error) {
    console.error('Monthly Headcounts API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}


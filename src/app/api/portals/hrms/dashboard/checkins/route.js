import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/utils/constants';

// Employee Check-ins API Route for HRMS Admin Portal
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const company = searchParams.get('company');
    const department = searchParams.get('department'); // optional
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]; // Default to today
    const payrollCompany = searchParams.get('payrollCompany');

    const normalizeCompany = (v) => {
      if (!v) return null;
      const raw = String(v).trim();
      if (!raw || raw === 'undefined' || raw === 'null' || raw === 'all') return null;
      const lc = raw.toLowerCase();
      if (lc === '1' || lc.includes('ecosoul')) return 'Ecosoul Home';
      if (lc === '2' || lc.includes('thrive')) return 'Thrive';
      return raw;
    };

    const resolveCompanies = () => {
      const explicit = normalizeCompany(company);
      if (explicit) return [explicit];
      const fromId = normalizeCompany(companyId);
      if (fromId) return [fromId];
      // all-companies mode
      return ['Ecosoul Home', 'Thrive'];
    };

    // Build query params
    const params = new URLSearchParams();
    if (companyId) params.append('companyId', companyId);
    if (company) params.append('company', company);
    params.append('date', date);
    if (department && department !== 'all') params.append('department', department);
    if (payrollCompany && payrollCompany !== 'all') params.append('payrollCompany', payrollCompany);

    const queryString = params.toString();

    // Preferred: use HRMS attendance endpoint which already merges manual + machine records.
    // If company is not provided, merge across known companies.
    try {
      const companiesToFetch = resolveCompanies();
      const normalizedDept = (v) => String(v || '').trim().toLowerCase();
      const deptKey = department && department !== 'all' ? normalizedDept(department) : null;

      const isHm = (v) => typeof v === 'string' && /^\d{1,2}:\d{2}$/.test(v.trim());
      const hmToIso = (day, hm) => {
        if (!day || !hm || !isHm(hm)) return null;
        const [h, m] = hm.trim().split(':').map(Number);
        const hh = String(h).padStart(2, '0');
        const mm = String(m).padStart(2, '0');
        return `${day}T${hh}:${mm}:00`;
      };

      const perCompany = await Promise.all(
        companiesToFetch.map(async (co) => {
          const qp = new URLSearchParams();
          // Keep companyId for compatibility; company is what scopes the backend.
          if (companyId) qp.append('companyId', companyId);
          qp.append('company', co);
          qp.append('date', date);
          if (department && department !== 'all') qp.append('department', department);

          const attendanceRes = await fetch(`${API_BASE_URL}/hrms/attendance?${qp.toString()}`, {
            headers: { 'Content-Type': 'application/json' },
          });
          if (!attendanceRes?.ok) return { company: co, records: [] };

          const attendanceJson = await attendanceRes.json().catch(() => null);
          const records = attendanceJson?.success?.data?.records
            ? attendanceJson.data.records
            : attendanceJson?.data?.records || attendanceJson?.records || [];

          return { company: co, records: Array.isArray(records) ? records : [] };
        })
      );

      const checkIns = perCompany.flatMap(({ company: co, records }) => {
        return records
          .filter((r) => r && (r.status === 'present' || r.status === 'Present'))
          .filter((r) => {
            if (!deptKey) return true;
            return normalizedDept(r.department || 'General') === deptKey;
          })
          .map((r) => ({
            employeeId: r.biometricId || r.employeeId || r.id,
            employeeName: r.employeeName || r.name || 'Unknown',
            department: r.department || 'General',
            company: r.company || co,
            checkInTime: isHm(r.timeIn) ? hmToIso(r.date || date, r.timeIn) : (r.timeIn || r.checkInTime || null),
            checkOutTime: isHm(r.timeOut) ? hmToIso(r.date || date, r.timeOut) : (r.timeOut || r.checkOutTime || null),
            totalMinutes: r.totalMinutes || 0,
            status: 'checked-in',
            date: r.date || date,
            source: r.source || 'attendance',
            isLate: !!r.isLate,
          }));
      });

        return NextResponse.json({
          success: true,
          data: {
            date,
            companies: companiesToFetch,
            totalCheckedIn: checkIns.length,
            totalCheckedOut: checkIns.filter((c) => !!c.checkOutTime).length,
            checkIns,
          },
        });
    } catch (e) {
      // Fall through to legacy approaches below.
      console.warn('[checkins route] attendance endpoint fetch failed:', e?.message || e);
    }

    // Fetch check-ins for the specified date
    // Note: This assumes the backend has an endpoint to get check-ins by date
    // If not available, we'll fetch from employee-portal checkin history
    try {
      // Try to fetch from a dedicated admin endpoint if it exists
      const checkInsResponse = await fetch(
        `${API_BASE_URL}/hrms/checkins?${queryString}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (checkInsResponse && checkInsResponse.ok) {
        const checkInsData = await checkInsResponse.json();
        if (checkInsData.success && checkInsData.data) {
          return NextResponse.json({
            success: true,
            data: checkInsData.data,
          });
        }
      }
    } catch (err) {
      console.log('Admin check-ins endpoint not available, fetching from employee portal data');
    }

    // Fallback: Fetch employees and then get their check-in status
    const employeesResponse = await fetch(
      `${API_BASE_URL}/admin-users${company ? `?company=${encodeURIComponent(company)}` : ''}`
    );

    if (!employeesResponse.ok) {
      throw new Error('Failed to fetch employees');
    }

    const employeesData = await employeesResponse.json();
    const employees = employeesData.success ? employeesData.users : employeesData;

    if (!Array.isArray(employees)) {
      return NextResponse.json({
        success: true,
        data: {
          date,
          totalCheckedIn: 0,
          totalCheckedOut: 0,
          checkIns: [],
        },
      });
    }

    // Fetch check-in data for each employee (check all employees, not just 30)
    // Use Promise.allSettled to handle failures gracefully
    const checkInsPromises = employees.map(async (emp) => {
      try {
        const employeeId = emp.employeeId || emp._id;
        if (!employeeId) return null;

        // Use backend endpoint directly (backend uses /api/employee, not /api/employee-portal)
        const statusUrl = `${API_BASE_URL}/employee/checkin/status?employeeId=${encodeURIComponent(employeeId)}${company ? `&company=${encodeURIComponent(company)}` : ''}`;
        const statusRes = await fetch(statusUrl);

        if (statusRes.ok) {
          const statusData = await statusRes.json();
          if (statusData?.success && statusData?.data) {
            const checkInData = statusData.data;
            const checkInDate = checkInData.checkInTime 
              ? new Date(checkInData.checkInTime).toISOString().split('T')[0]
              : null;

            // Only include if it's for the requested date
            if (checkInDate === date || (date === new Date().toISOString().split('T')[0] && checkInData.status === 'checked-in')) {
              return {
                employeeId: employeeId,
                employeeName: emp.name || 'Unknown',
                department: emp.department || 'N/A',
                checkInTime: checkInData.checkInTime,
                checkOutTime: checkInData.checkOutTime,
                totalMinutes: checkInData.totalMinutes || 0,
                status: checkInData.status,
                date: checkInDate || date,
              };
            }
          }
        }
      } catch (err) {
        console.error(`Error fetching check-in for employee ${emp.employeeId}:`, err);
        return null;
      }
      return null;
    });

    const checkInsResults = await Promise.all(checkInsPromises);
    const checkIns = checkInsResults.filter(item => item !== null);

    const totalCheckedIn = checkIns.filter(c => c.status === 'checked-in').length;
    const totalCheckedOut = checkIns.filter(c => c.status === 'checked-out' && c.checkOutTime).length;

    return NextResponse.json({
      success: true,
      data: {
        date,
        totalCheckedIn,
        totalCheckedOut,
        totalEmployees: employees.length,
        checkIns,
      },
    });
  } catch (error) {
    console.error('Check-ins API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}


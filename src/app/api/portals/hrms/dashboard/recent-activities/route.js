import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/utils/constants';

// Recent Activities API Route
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const company = searchParams.get('company');
    const department = searchParams.get('department'); // optional
    const payrollCompany = searchParams.get('payrollCompany');

    const dateParam = searchParams.get('date');
    const today = dateParam || new Date().toISOString().split('T')[0];
    const isHm = (v) => typeof v === 'string' && /^\d{1,2}:\d{2}$/.test(v.trim());
    const hmToIso = (day, hm) => {
      if (!day || !hm || !isHm(hm)) return null;
      const [h, m] = hm.trim().split(':').map(Number);
      const hh = String(h).padStart(2, '0');
      const mm = String(m).padStart(2, '0');
      return `${day}T${hh}:${mm}:00`;
    };

    // Build query params
    const params = new URLSearchParams();
    if (companyId) params.append('companyId', companyId);
    if (company) params.append('company', company);
    if (department && department !== 'all') params.append('department', department);
    if (payrollCompany && payrollCompany !== 'all') params.append('payrollCompany', payrollCompany);

    const queryString = params.toString();

    // Fetch recent activities from multiple sources
    const [leavesResponse, employeesResponse, attendanceResponse] = await Promise.all([
      // Recent leave approvals
      fetch(`${API_BASE_URL}/attendance/leaves?limit=10${queryString ? `&${queryString}` : ''}`).catch(() => null),
      // Recent employee additions
      fetch(`${API_BASE_URL}/admin-users?limit=10&sort=createdAt:desc${queryString ? `&${queryString}` : ''}`).catch(() => null),
      // Today's attendance (manual + machine merged by backend)
      fetch(`${API_BASE_URL}/hrms/attendance?date=${encodeURIComponent(today)}${queryString ? `&${queryString}` : ''}`).catch(() => null),
    ]);

    const activities = [];

    // Process today's check-ins (present)
    if (attendanceResponse && attendanceResponse.ok) {
      const attendanceJson = await attendanceResponse.json().catch(() => null);
      const records = attendanceJson?.success?.data?.records
        ? attendanceJson.data.records
        : attendanceJson?.data?.records || attendanceJson?.records || [];

      if (Array.isArray(records)) {
        const normalizedDept = (v) => String(v || '').trim().toLowerCase();
        const deptKey = department && department !== 'all' ? normalizedDept(department) : null;

        const checkInEvents = records
          .filter((r) => r && (r.status === 'present' || r.status === 'Present'))
          .filter((r) => {
            if (!deptKey) return true;
            return normalizedDept(r.department || 'General') === deptKey;
          })
          .map((r) => {
            const when =
              (typeof r.checkInTime === 'string' && r.checkInTime) ||
              (typeof r.timeIn === 'string' && r.timeIn ? (isHm(r.timeIn) ? hmToIso(r.date || today, r.timeIn) : r.timeIn) : null) ||
              null;

            return {
              id: `checkin-${r.id || r.employeeId || r.biometricId || Math.random().toString(36).slice(2)}`,
              type: 'Check-in',
              description: `${r.employeeName || r.name || 'Employee'} checked in`,
              date: when || r.date || today,
              meta: {
                company: r.company || company || null,
                department: r.department || 'General',
                source: r.source || 'attendance',
                isLate: !!r.isLate,
              },
            };
          })
          // most recent first (best-effort)
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 10);

        activities.push(...checkInEvents);
      }
    }

    // Process leaves
    if (leavesResponse && leavesResponse.ok) {
      const leavesData = await leavesResponse.json();
      const leaves = leavesData.success ? leavesData.leaves : (Array.isArray(leavesData) ? leavesData : []);
      const normalizedDept = (v) => String(v || '').trim().toLowerCase();
      const deptKey = department && department !== 'all' ? normalizedDept(department) : null;
      
      leaves
        .filter((leave) => {
          if (!deptKey) return true;
          return normalizedDept(leave.department || 'General') === deptKey;
        })
        .slice(0, 5)
        .forEach(leave => {
        activities.push({
          id: `leave-${leave._id || leave.id}`,
          type: leave.status === 'Approved' ? 'Leave Approved' : leave.status === 'Pending' ? 'Leave Request' : 'Leave',
          description: `${leave.employeeName || 'Employee'}'s leave request ${leave.status === 'Approved' ? 'approved' : 'submitted'} for ${leave.days || 1} day(s)`,
          date: leave.createdAt || leave.date || new Date().toISOString().split('T')[0],
        });
      });
    }

    // Process new hires
    if (employeesResponse && employeesResponse.ok) {
      const employeesData = await employeesResponse.json();
      const employees = employeesData.success ? employeesData.users : (Array.isArray(employeesData) ? employeesData : []);
      const normalizedDept = (v) => String(v || '').trim().toLowerCase();
      const deptKey = department && department !== 'all' ? normalizedDept(department) : null;
      
      employees
        .filter((emp) => {
          if (!deptKey) return true;
          return normalizedDept(emp.department || 'General') === deptKey;
        })
        .slice(0, 5)
        .forEach(emp => {
        const joinDate = new Date(emp.createdAt || emp.joiningDate);
        const daysAgo = Math.floor((new Date() - joinDate) / (1000 * 60 * 60 * 24));
        
        if (daysAgo <= 30) {
          activities.push({
            id: `hire-${emp._id || emp.id}`,
            type: 'New Hire',
            description: `${emp.name || 'Employee'} joined ${emp.department || 'the organization'} as ${emp.jobTitle || emp.designation || 'Team Member'}`,
            date: joinDate.toISOString().split('T')[0],
          });
        }
      });
    }

    // Sort by date (most recent first) and limit to 10
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return NextResponse.json({
      success: true,
      data: activities.slice(0, 10),
    });
  } catch (error) {
    console.error('Recent Activities API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}


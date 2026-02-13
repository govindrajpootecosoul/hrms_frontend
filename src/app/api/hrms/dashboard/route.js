import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/utils/constants';

// HRMS Dashboard API Route
// Aggregates all dashboard data from backend

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const company = searchParams.get('company');

    // Build query params
    const params = new URLSearchParams();
    if (companyId) params.append('companyId', companyId);
    if (company) params.append('company', company);

    const queryString = params.toString();
    const baseUrl = `${API_BASE_URL}/hrms/dashboard`;

    // Fetch critical dashboard data in parallel with timeout
    const fetchWithTimeout = (url, timeout = 5000) => {
      return Promise.race([
        fetch(url).catch(() => null),
        new Promise((resolve) => setTimeout(() => resolve(null), timeout))
      ]);
    };

    const [
      statsResponse,
      employeesResponse,
      attendanceResponse,
      leavesResponse,
    ] = await Promise.all([
      // Stats endpoint (critical - 5 second timeout)
      fetchWithTimeout(`${baseUrl}/stats${queryString ? `?${queryString}` : ''}`, 5000),
      // Employees for headcount calculation (critical - 5 second timeout)
      fetchWithTimeout(`${API_BASE_URL}/admin-users${queryString ? `?${queryString}` : ''}`, 5000),
      // Today's attendance (less critical - 3 second timeout)
      fetchWithTimeout(`${API_BASE_URL}/attendance?date=${new Date().toISOString().split('T')[0]}${queryString ? `&${queryString}` : ''}`, 3000),
      // Pending leaves (less critical - 3 second timeout)
      fetchWithTimeout(`${API_BASE_URL}/attendance/leaves?status=Pending${queryString ? `&${queryString}` : ''}`, 3000),
    ]);

    // Process stats
    let stats = {
      totalEmployees: 0,
      activeEmployees: 0,
      todayAttendance: 0,
      pendingLeaves: 0,
      upcomingBirthdays: 0,
    };

    if (statsResponse && statsResponse.ok) {
      const statsData = await statsResponse.json();
      if (statsData.success && statsData.data) {
        stats = { ...stats, ...statsData.data };
      } else if (statsData.totalEmployees !== undefined) {
        stats = { ...stats, ...statsData };
      }
    }

    // Calculate from employees if stats endpoint doesn't provide all data
    let employees = [];
    if (employeesResponse && employeesResponse.ok) {
      const employeesData = await employeesResponse.json();
      if (employeesData.success && employeesData.users) {
        employees = employeesData.users;
        stats.totalEmployees = employees.length;
        stats.activeEmployees = employees.filter(e => e.active !== false).length;

        // Calculate upcoming birthdays (next 30 days)
        const today = new Date();
        const nextMonth = new Date(today);
        nextMonth.setMonth(today.getMonth() + 1);
        const currentYear = today.getFullYear();

        stats.upcomingBirthdays = employees.filter(emp => {
          if (!emp.dateOfBirth) return false;
          const dob = new Date(emp.dateOfBirth);
          const thisYearBirthday = new Date(currentYear, dob.getMonth(), dob.getDate());
          return thisYearBirthday >= today && thisYearBirthday <= nextMonth;
        }).length;
      }
    }

    // Calculate today's attendance from check-ins
    // Use a more efficient approach: query check-ins directly from database via API
    if (employees.length > 0) {
      try {
        // Try to get check-ins count from the checkins API endpoint
        const checkInsParams = new URLSearchParams();
        if (companyId) checkInsParams.append('companyId', companyId);
        if (company) checkInsParams.append('company', company);
        checkInsParams.append('date', new Date().toISOString().split('T')[0]);
        
        const checkInsUrl = `${API_BASE_URL}/employee/checkins/today${checkInsParams.toString() ? `?${checkInsParams.toString()}` : ''}`;
        
        try {
          const checkInsRes = await fetch(checkInsUrl, { 
            signal: AbortSignal.timeout(3000) // 3 second timeout
          });
          
          if (checkInsRes && checkInsRes.ok) {
            const checkInsData = await checkInsRes.json();
            if (checkInsData?.success && checkInsData?.data?.totalCheckedIn !== undefined) {
              stats.todayAttendance = checkInsData.data.totalCheckedIn;
            }
          }
        } catch (err) {
          // If dedicated endpoint doesn't exist, fall back to checking individual employees
          // But limit to reasonable number to avoid slow loading
          if (employees.length <= 50) {
            const employeesToCheck = employees.slice(0, 30);
            
            const checkInPromises = employeesToCheck.map(async (emp) => {
              try {
                const employeeId = emp.employeeId || emp._id;
                if (!employeeId) return false;
                
                const statusUrl = `${API_BASE_URL}/employee/checkin/status?employeeId=${encodeURIComponent(employeeId)}${company ? `&company=${encodeURIComponent(company)}` : ''}`;
                const statusRes = await fetch(statusUrl, { 
                  signal: AbortSignal.timeout(2000) 
                });
                
                if (statusRes && statusRes.ok) {
                  const statusData = await statusRes.json();
                  if (statusData?.success && statusData?.data && statusData.data.status === 'checked-in') {
                    return true;
                  }
                }
              } catch (err) {
                return false;
              }
              return false;
            });
            
            const checkInResults = await Promise.allSettled(checkInPromises);
            const checkedInCount = checkInResults.filter(r => r.status === 'fulfilled' && r.value === true).length;
            if (checkedInCount > 0) {
              stats.todayAttendance = checkedInCount;
            }
          }
        }
      } catch (err) {
        console.error('Check-ins calculation error:', err.message);
        // Don't fail the whole request if check-ins fail
      }
    }

    // Fallback to attendance endpoint if check-ins not available
    if (stats.todayAttendance === 0 && attendanceResponse && attendanceResponse.ok) {
      const attendanceData = await attendanceResponse.json();
      if (attendanceData.success && attendanceData.attendance) {
        stats.todayAttendance = attendanceData.attendance.filter(
          a => a.status === 'Present' || a.status === 'present'
        ).length;
      } else if (Array.isArray(attendanceData)) {
        stats.todayAttendance = attendanceData.filter(
          a => a.status === 'Present' || a.status === 'present'
        ).length;
      }
    }

    // Calculate pending leaves
    if (leavesResponse && leavesResponse.ok) {
      const leavesData = await leavesResponse.json();
      if (leavesData.success && leavesData.leaves) {
        stats.pendingLeaves = leavesData.leaves.length;
      } else if (Array.isArray(leavesData)) {
        stats.pendingLeaves = leavesData.length;
      }
    }

    return NextResponse.json({
      success: true,
      data: { stats },
    });
  } catch (error) {
    console.error('HRMS Dashboard API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}


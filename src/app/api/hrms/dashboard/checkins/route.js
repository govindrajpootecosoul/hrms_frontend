import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/utils/constants';

// Employee Check-ins API Route for HRMS Admin Portal
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const company = searchParams.get('company');
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]; // Default to today

    // Build query params
    const params = new URLSearchParams();
    if (companyId) params.append('companyId', companyId);
    if (company) params.append('company', company);
    params.append('date', date);

    const queryString = params.toString();

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


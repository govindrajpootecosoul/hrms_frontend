import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/utils/constants';

// Upcoming Leaves & Festivals API Route
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

    const upcomingItems = [];

    // Fetch upcoming leaves
    try {
      const leavesResponse = await fetch(
        `${API_BASE_URL}/attendance/leaves?status=Approved&startDate=${new Date().toISOString().split('T')[0]}${queryString ? `&${queryString}` : ''}`
      );

      if (leavesResponse && leavesResponse.ok) {
        const leavesData = await leavesResponse.json();
        const leaves = leavesData.success ? leavesData.leaves : (Array.isArray(leavesData) ? leavesData : []);

        leaves.forEach(leave => {
          upcomingItems.push({
            id: `leave-${leave._id || leave.id}`,
            type: 'Leave',
            name: leave.employeeName || 'Employee',
            date: leave.startDate || leave.date || new Date().toISOString().split('T')[0],
            reason: leave.reason || leave.type || 'Personal Leave',
            department: leave.department || 'N/A',
          });
        });
      }
    } catch (err) {
      console.log('Leaves API error:', err.message);
    }

    // Fetch holidays/festivals
    try {
      const holidaysResponse = await fetch(
        `${API_BASE_URL}/attendance/holidays?startDate=${new Date().toISOString().split('T')[0]}${queryString ? `&${queryString}` : ''}`
      );

      if (holidaysResponse && holidaysResponse.ok) {
        const holidaysData = await holidaysResponse.json();
        const holidays = holidaysData.success ? holidaysData.holidays : (Array.isArray(holidaysData) ? holidaysData : []);

        holidays.forEach(holiday => {
          upcomingItems.push({
            id: `holiday-${holiday._id || holiday.id}`,
            type: 'Festival',
            name: holiday.name || 'Holiday',
            date: holiday.date || new Date().toISOString().split('T')[0],
            reason: holiday.description || 'National Holiday',
            department: 'All',
          });
        });
      }
    } catch (err) {
      console.log('Holidays API error:', err.message);
    }

    // Sort by date
    upcomingItems.sort((a, b) => new Date(a.date) - new Date(b.date));

    return NextResponse.json({
      success: true,
      data: upcomingItems.slice(0, 10),
    });
  } catch (error) {
    console.error('Upcoming Leaves & Festivals API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}


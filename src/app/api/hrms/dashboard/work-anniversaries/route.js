import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/utils/constants';

// Work Anniversary Calendar API Route
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

    // Get current month work anniversaries
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const anniversaries = employees
      .filter(emp => {
        const joinDate = emp.joiningDate || emp.createdAt;
        if (!joinDate) return false;
        const join = new Date(joinDate);
        return join.getMonth() === currentMonth;
      })
      .map(emp => {
        const joinDate = new Date(emp.joiningDate || emp.createdAt);
        const anniversaryThisYear = new Date(currentYear, joinDate.getMonth(), joinDate.getDate());
        const years = currentYear - joinDate.getFullYear();

        return {
          id: emp._id || emp.id,
          name: emp.name || 'Unknown',
          department: emp.department || 'N/A',
          date: anniversaryThisYear.toISOString().split('T')[0],
          years,
          joiningDate: emp.joiningDate || emp.createdAt,
        };
      })
      .sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA - dateB;
      });

    return NextResponse.json({
      success: true,
      data: anniversaries,
    });
  } catch (error) {
    console.error('Work Anniversaries API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}


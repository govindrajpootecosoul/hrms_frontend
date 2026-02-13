import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/utils/constants';

// Monthly Headcounts API Route
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

    // Calculate monthly headcounts for the last 12 months
    const monthlyHeadcounts = [];
    const today = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      // Count employees who joined before or during this month
      const headcount = employees.filter(emp => {
        if (!emp.createdAt && !emp.joiningDate) return false;
        const joinDate = new Date(emp.createdAt || emp.joiningDate);
        return joinDate <= new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
      }).length;

      monthlyHeadcounts.push({
        month: monthName,
        headcount,
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


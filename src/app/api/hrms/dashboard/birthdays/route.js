import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/utils/constants';

// Birthday Calendar API Route
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

    // Get current month birthdays
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const birthdays = employees
      .filter(emp => {
        if (!emp.dateOfBirth) return false;
        const dob = new Date(emp.dateOfBirth);
        return dob.getMonth() === currentMonth;
      })
      .map(emp => {
        const dob = new Date(emp.dateOfBirth);
        const birthdayThisYear = new Date(currentYear, dob.getMonth(), dob.getDate());
        
        return {
          id: emp._id || emp.id,
          name: emp.name || 'Unknown',
          department: emp.department || 'N/A',
          date: birthdayThisYear.toISOString().split('T')[0],
          dateOfBirth: emp.dateOfBirth,
        };
      })
      .sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA - dateB;
      });

    return NextResponse.json({
      success: true,
      data: birthdays,
    });
  } catch (error) {
    console.error('Birthdays API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}


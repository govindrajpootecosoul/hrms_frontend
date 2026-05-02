import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/utils/constants';

function parseFlexibleDate(value) {
  if (!value) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const str = String(value).trim();
  if (!str) return null;

  // ISO / YYYY-MM-DD (avoid UTC shifting by constructing local date)
  const iso = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T\s].*)?$/);
  if (iso) {
    const y = Number(iso[1]);
    const m = Number(iso[2]);
    const d = Number(iso[3]);
    const dt = new Date(y, m - 1, d);
    return Number.isNaN(dt.getTime()) ? null : dt;
  }

  // DD/MM/YYYY or DD-MM-YYYY
  const dmy = str.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
  if (dmy) {
    const d = Number(dmy[1]);
    const m = Number(dmy[2]);
    const y = Number(dmy[3]);
    const dt = new Date(y, m - 1, d);
    return Number.isNaN(dt.getTime()) ? null : dt;
  }

  // Fallback: let JS try (handles RFC2822 / ISO with timezone, etc.)
  const dt = new Date(str);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function toYmdLocal(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Birthday Calendar API Route
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const company = searchParams.get('company');
    const department = searchParams.get('department'); // optional
    const dateParam = searchParams.get('date'); // optional (anchor month)

    // Build query params
    const params = new URLSearchParams();
    if (companyId) params.append('companyId', companyId);
    if (company) params.append('company', company);

    const queryString = params.toString();

    // Fetch employees
    const employeesResponse = await fetch(
      `${API_BASE_URL}/admin-users${queryString ? `?${queryString}` : ''}`,
      {
        cache: 'no-store',
      }
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

    // Get current month birthdays (anchor month)
    const today = dateParam ? parseFlexibleDate(dateParam) || new Date() : new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const normalizeDept = (v) => String(v || '').trim().toLowerCase();
    const requestedDept = department && department !== 'all' ? normalizeDept(department) : null;

    const birthdays = employees
      .filter(emp => {
        if (!emp.dateOfBirth) return false;
        const dob = parseFlexibleDate(emp.dateOfBirth);
        if (!dob) return false;
        return dob.getMonth() === currentMonth;
      })
      .filter(emp => {
        if (!requestedDept) return true;
        return normalizeDept(emp.department || 'General') === requestedDept;
      })
      .map(emp => {
        const dob = parseFlexibleDate(emp.dateOfBirth);
        if (!dob) return null;
        const birthdayThisYear = new Date(currentYear, dob.getMonth(), dob.getDate());
        
        return {
          id: emp._id || emp.id,
          name: emp.name || 'Unknown',
          department: emp.department || 'N/A',
          date: toYmdLocal(birthdayThisYear),
          dateOfBirth: emp.dateOfBirth,
        };
      })
      .filter(Boolean)
      .sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA - dateB;
      });

    return NextResponse.json(
      {
        success: true,
        data: birthdays,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          Pragma: 'no-cache',
        },
      }
    );
  } catch (error) {
    console.error('Birthdays API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}


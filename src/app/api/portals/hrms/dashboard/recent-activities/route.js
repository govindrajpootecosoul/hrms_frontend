import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/utils/constants';

// Recent Activities API Route
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

    // Fetch recent activities from multiple sources
    const [leavesResponse, employeesResponse] = await Promise.all([
      // Recent leave approvals
      fetch(`${API_BASE_URL}/attendance/leaves?limit=10${queryString ? `&${queryString}` : ''}`).catch(() => null),
      // Recent employee additions
      fetch(`${API_BASE_URL}/admin-users?limit=10&sort=createdAt:desc${queryString ? `&${queryString}` : ''}`).catch(() => null),
    ]);

    const activities = [];

    // Process leaves
    if (leavesResponse && leavesResponse.ok) {
      const leavesData = await leavesResponse.json();
      const leaves = leavesData.success ? leavesData.leaves : (Array.isArray(leavesData) ? leavesData : []);
      
      leaves.slice(0, 5).forEach(leave => {
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
      
      employees.slice(0, 5).forEach(emp => {
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


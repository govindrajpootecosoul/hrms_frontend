import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/utils/constants';

// Employee Attendance API Route
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const company = searchParams.get('company');
    const timeframe = searchParams.get('timeframe') || '7d'; // 7d, month, prev
    const month = searchParams.get('month'); // For previous month view

    if (!employeeId) {
      return NextResponse.json(
        { success: false, error: 'Employee ID is required' },
        { status: 400 }
      );
    }

    // Build query params for check-in history
    const params = new URLSearchParams();
    params.append('employeeId', employeeId);
    params.append('limit', '100'); // Get enough records to calculate attendance
    if (company) {
      params.append('company', company);
    }

    // Fetch check-in history from backend
    const backendUrl = `${API_BASE_URL}/employee/checkin/history?${params.toString()}`;
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error:', response.status, errorText);
      return NextResponse.json(
        { success: false, error: `Backend error: ${response.status}` },
        { status: response.status }
      );
    }

    const historyData = await response.json();
    
    if (!historyData.success || !historyData.data || !historyData.data.history) {
      return NextResponse.json({
        success: true,
        data: {
          attendanceLast7Days: [],
          attendanceThisMonth: [],
          attendancePreviousMonth: [],
          totalHours7Days: 0,
          totalHoursThisMonth: 0,
          totalHoursPreviousMonth: 0,
        },
      });
    }

    const checkInHistory = historyData.data.history || [];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Helper function to get day name
    const getDayName = (date) => {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return days[date.getDay()];
    };

    // Helper function to check if date is weekend
    const isWeekend = (date) => {
      const day = date.getDay();
      return day === 0 || day === 6; // Sunday or Saturday
    };

    // Process check-in history into attendance records
    const processAttendance = (startDate, endDate) => {
      const attendanceMap = new Map();
      
      // Initialize all dates in range
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const dateKey = currentDate.toISOString().split('T')[0];
        const dayName = getDayName(currentDate);
        const isWeekendDay = isWeekend(currentDate);
        
        attendanceMap.set(dateKey, {
          date: dateKey,
          day: dayName,
          status: isWeekendDay ? 'Weekend' : 'Absent',
          hours: 0,
          totalMinutes: 0,
          checkInTime: null,
          checkOutTime: null,
        });
        
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Fill in actual check-in data
      checkInHistory.forEach((record) => {
        const recordDate = record.date;
        if (attendanceMap.has(recordDate)) {
          const attendance = attendanceMap.get(recordDate);
          const totalMinutes = record.totalMinutes || 0;
          const hours = totalMinutes / 60;
          
          attendance.totalMinutes = totalMinutes;
          attendance.hours = parseFloat(hours.toFixed(2));
          attendance.checkInTime = record.checkInTime;
          attendance.checkOutTime = record.checkOutTime;
          
          // Determine status
          if (isWeekend(new Date(recordDate))) {
            attendance.status = 'Weekend';
          } else if (hours >= 4) {
            // If worked 4+ hours, consider it Present
            attendance.status = 'Present';
          } else if (hours > 0) {
            // If worked less than 4 hours, might be partial day
            attendance.status = 'Present';
          } else {
            attendance.status = 'Absent';
          }
        }
      });

      return Array.from(attendanceMap.values())
        .sort((a, b) => new Date(b.date) - new Date(a.date)); // Most recent first
    };

    // Calculate date ranges
    const last7DaysEnd = new Date(today);
    const last7DaysStart = new Date(today);
    last7DaysStart.setDate(last7DaysStart.getDate() - 6); // Last 7 days including today

    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    let previousMonthStart, previousMonthEnd;
    if (month) {
      const [year, monthNum] = month.split('-').map(Number);
      previousMonthStart = new Date(year, monthNum - 1, 1);
      previousMonthEnd = new Date(year, monthNum, 0);
    } else {
      const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      previousMonthStart = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), 1);
      previousMonthEnd = new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 0);
    }

    // Process attendance for different timeframes
    const attendanceLast7Days = processAttendance(last7DaysStart, last7DaysEnd);
    const attendanceThisMonth = processAttendance(thisMonthStart, thisMonthEnd);
    const attendancePreviousMonth = processAttendance(previousMonthStart, previousMonthEnd);

    // Calculate total hours
    const totalHours7Days = attendanceLast7Days.reduce((sum, day) => sum + (day.hours || 0), 0);
    const totalHoursThisMonth = attendanceThisMonth.reduce((sum, day) => sum + (day.hours || 0), 0);
    const totalHoursPreviousMonth = attendancePreviousMonth.reduce((sum, day) => sum + (day.hours || 0), 0);

    return NextResponse.json({
      success: true,
      data: {
        attendanceLast7Days,
        attendanceThisMonth,
        attendancePreviousMonth,
        totalHours7Days: parseFloat(totalHours7Days.toFixed(1)),
        totalHoursThisMonth: parseFloat(totalHoursThisMonth.toFixed(1)),
        totalHoursPreviousMonth: parseFloat(totalHoursPreviousMonth.toFixed(1)),
      },
    });
  } catch (error) {
    console.error('Employee Attendance API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}


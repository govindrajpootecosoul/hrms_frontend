import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/utils/constants';

// Employee Attendance API Route
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const empCode = searchParams.get('empCode');
    const company = searchParams.get('company');
    const timeframe = searchParams.get('timeframe') || '7d'; // 7d, month, prev
    const month = searchParams.get('month'); // For previous month view

    if (!employeeId) {
      return NextResponse.json(
        { success: false, error: 'Employee ID is required' },
        { status: 400 }
      );
    }

    const authHeader = request.headers.get('authorization');

    const asYmd = (d) => {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    };

    const startOfMonthLocal = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
    const endOfMonthLocal = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

    const buildAttendanceFromMachine = async () => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const last7End = new Date(today);
      const last7Start = new Date(today);
      last7Start.setDate(last7Start.getDate() - 6);

      const thisMonthStart = startOfMonthLocal(now);
      // Don't show future dates in "This month" view.
      const thisMonthEnd = (() => {
        const eom = endOfMonthLocal(now);
        return eom > today ? today : eom;
      })();

      let prevMonthStart;
      let prevMonthEnd;
      if (month) {
        const [y, m] = month.split('-').map(Number);
        prevMonthStart = new Date(y, (m ?? 1) - 1, 1);
        prevMonthEnd = new Date(y, (m ?? 1), 0);
      } else {
        const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        prevMonthStart = new Date(prev.getFullYear(), prev.getMonth(), 1);
        prevMonthEnd = new Date(prev.getFullYear(), prev.getMonth() + 1, 0);
      }

      const fetchRange = async (startDate, endDate) => {
        const params = new URLSearchParams();
        params.append('employeeId', employeeId);
        if (empCode) params.append('empCode', empCode);
        params.append('startDate', asYmd(startDate));
        params.append('endDate', asYmd(endDate));
        if (company) params.append('company', company);

        const backendUrl = `${API_BASE_URL}/employee/machine-attendance?${params.toString()}`;
        const res = await fetch(backendUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(authHeader ? { Authorization: authHeader } : {}),
          },
        });
        if (!res.ok) return [];
        const json = await res.json();
        return json?.success && json?.data?.records ? json.data.records : [];
      };

      // Fetch only what we need for the selected view, but also return full arrays for UI components.
      const [r7, rThis, rPrev] = await Promise.all([
        fetchRange(last7Start, last7End),
        fetchRange(thisMonthStart, thisMonthEnd),
        fetchRange(prevMonthStart, prevMonthEnd),
      ]);

      // If machine endpoint returns no records at all, fall back to check-in history attendance.
      // This avoids showing all-Absent when empCode mapping is missing/mismatched.
      if ((!r7 || r7.length === 0) && (!rThis || rThis.length === 0) && (!rPrev || rPrev.length === 0)) {
        return null;
      }

      const normalizeMachineStatus = (raw) => {
        const s = String(raw || '').trim().toLowerCase();
        if (!s) return '';
        if (s === 'present') return 'Present';
        if (s === 'absent') return 'Absent';
        if (s === 'weekend') return 'Weekend';
        if (s === 'wfh' || s === 'work from home') return 'WFH';
        return String(raw).trim();
      };

      const toDayName = (dateStr) => {
        const dt = new Date(`${dateStr}T12:00:00`);
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return Number.isNaN(dt.getTime()) ? '' : days[dt.getDay()];
      };

      const isWeekendYmd = (ymd) => {
        const dt = new Date(`${ymd}T12:00:00`);
        const day = dt.getDay();
        return day === 0 || day === 6;
      };

      /** Align machine row to portal week strip using browser-local calendar day (fixes UTC vs local date skew). */
      const ymdFromRecord = (r) => {
        const iso = r?.dateIso;
        if (iso) {
          const d = new Date(iso);
          if (!Number.isNaN(d.getTime())) {
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            return `${yyyy}-${mm}-${dd}`;
          }
        }
        const y = r?.date;
        if (y && /^\d{4}-\d{2}-\d{2}$/.test(String(y).trim())) {
          const d = new Date(`${String(y).trim().slice(0, 10)}T12:00:00`);
          if (!Number.isNaN(d.getTime())) {
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            return `${yyyy}-${mm}-${dd}`;
          }
        }
        return '';
      };

      const buildSeries = (startDate, endDate, records) => {
        const byDate = new Map();
        for (const r of records) {
          const dayKey = ymdFromRecord(r);
          if (!dayKey) continue;
          // Prefer explicit DB status if present; fallback to punch presence.
          const status = normalizeMachineStatus(r.status);
          const hasIn = r.punchIn != null && String(r.punchIn).trim() !== '';
          const isPresentByStatus = status.toLowerCase() === 'present';
          if (!hasIn && !isPresentByStatus) continue;
          byDate.set(dayKey, r);
        }

        const out = [];
        const cur = new Date(startDate);
        while (cur <= endDate) {
          const ymd = asYmd(cur);
          const rec = byDate.get(ymd);
          const machineStatus = normalizeMachineStatus(rec?.status);
          const weekend = isWeekendYmd(ymd);
          const present = Boolean(rec) || machineStatus.toLowerCase() === 'present';
          const status = machineStatus || (weekend ? 'Weekend' : present ? 'Present' : 'Absent');
          out.push({
            date: ymd,
            day: toDayName(ymd),
            status,
            hours: rec?.hoursWorked != null && rec?.hoursWorked !== '' ? Number(rec.hoursWorked) : 0,
            punchIn: rec?.punchIn || null,
            punchOut: rec?.punchOut || null,
            source: 'machine',
          });
          cur.setDate(cur.getDate() + 1);
        }
        return out.sort((a, b) => (a.date < b.date ? 1 : -1));
      };

      const attendanceLast7Days = buildSeries(last7Start, last7End, r7);
      const attendanceThisMonth = buildSeries(thisMonthStart, thisMonthEnd, rThis);
      const attendancePreviousMonth = buildSeries(prevMonthStart, prevMonthEnd, rPrev);

      const totalHours7Days = attendanceLast7Days.reduce((sum, d) => sum + (Number.isFinite(d.hours) ? d.hours : 0), 0);
      const totalHoursThisMonth = attendanceThisMonth.reduce((sum, d) => sum + (Number.isFinite(d.hours) ? d.hours : 0), 0);
      const totalHoursPreviousMonth = attendancePreviousMonth.reduce((sum, d) => sum + (Number.isFinite(d.hours) ? d.hours : 0), 0);

      return {
        attendanceLast7Days,
        attendanceThisMonth,
        attendancePreviousMonth,
        totalHours7Days: parseFloat(totalHours7Days.toFixed(1)),
        totalHoursThisMonth: parseFloat(totalHoursThisMonth.toFixed(1)),
        totalHoursPreviousMonth: parseFloat(totalHoursPreviousMonth.toFixed(1)),
      };
    };

    // Prefer machine_attendance_reports via backend (resolves emp_code from logged-in employeeId).
    const machineData = await buildAttendanceFromMachine();
    if (machineData) {
      return NextResponse.json({ success: true, data: machineData });
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
        ...(authHeader ? { Authorization: authHeader } : {}),
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
    // Use UTC date to match backend format (backend uses toISOString().split('T')[0])
    // This ensures consistency with check-in records stored in database
    const todayKey = now.toISOString().split('T')[0];
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    console.log(`[Attendance API] Today's date key: ${todayKey}, Current time: ${now.toISOString()}, Local date: ${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`);
    
    // Fetch today's check-in status to handle active check-ins
    let todayCheckInStatus = null;
    try {
      const statusParams = new URLSearchParams();
      statusParams.append('employeeId', employeeId);
      if (company) {
        statusParams.append('company', company);
      }
      
      const statusUrl = `${API_BASE_URL}/employee/checkin/status?${statusParams.toString()}`;
      console.log(`[Attendance API] Fetching check-in status from: ${statusUrl}`);
      
      const statusResponse = await fetch(statusUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
      });
      
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        console.log(`[Attendance API] Check-in status response:`, JSON.stringify(statusData));
        if (statusData.success && statusData.data) {
          todayCheckInStatus = statusData.data;
          console.log(`[Attendance API] Today's check-in status:`, {
            status: todayCheckInStatus.status,
            checkInTime: todayCheckInStatus.checkInTime,
            totalMinutes: todayCheckInStatus.totalMinutes,
            todayKey
          });
        } else {
          console.log(`[Attendance API] Check-in status response missing data:`, statusData);
        }
      } else {
        const errorText = await statusResponse.text();
        console.error(`[Attendance API] Check-in status API error: ${statusResponse.status} - ${errorText}`);
      }
    } catch (err) {
      console.error('[Attendance API] Error fetching check-in status:', err);
      // Continue without today's status - will use history data only
    }
    
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

      // Handle today's check-in status FIRST (before history) if it's in the date range
      // This ensures today's active check-in takes precedence over history data
      if (todayCheckInStatus && attendanceMap.has(todayKey)) {
        const todayAttendance = attendanceMap.get(todayKey);
        const isTodayWeekend = isWeekend(today);
        
        // If checked in today (even without checkout), mark as Present
        if (todayCheckInStatus.status === 'checked-in' && !isTodayWeekend) {
          const totalMinutes = todayCheckInStatus.totalMinutes || 0;
          const hours = totalMinutes / 60;
          
          todayAttendance.status = 'Present';
          todayAttendance.totalMinutes = totalMinutes;
          todayAttendance.hours = parseFloat(hours.toFixed(2));
          todayAttendance.checkInTime = todayCheckInStatus.checkInTime;
          todayAttendance.checkOutTime = todayCheckInStatus.checkOutTime;
          
          console.log(`[Attendance API] Today (${todayKey}) marked as Present - checked in with ${hours.toFixed(2)} hours`);
        } else if (todayCheckInStatus.status === 'checked-out' && !isTodayWeekend) {
          // If checked out today, mark as Present if there's any time worked
          const totalMinutes = todayCheckInStatus.totalMinutes || 0;
          const hours = totalMinutes / 60;
          
          if (hours > 0) {
            todayAttendance.status = 'Present';
            todayAttendance.totalMinutes = totalMinutes;
            todayAttendance.hours = parseFloat(hours.toFixed(2));
            todayAttendance.checkInTime = todayCheckInStatus.checkInTime;
            todayAttendance.checkOutTime = todayCheckInStatus.checkOutTime;
            
            console.log(`[Attendance API] Today (${todayKey}) marked as Present - checked out with ${hours.toFixed(2)} hours`);
          }
        }
      }

      // Fill in actual check-in data from history (but don't override today if already set)
      console.log(`[Attendance API] Processing ${checkInHistory.length} history records. Today key: ${todayKey}`);
      checkInHistory.forEach((record) => {
        const recordDate = record.date;
        console.log(`[Attendance API] Processing history record: date=${recordDate}, checkInTime=${record.checkInTime}, totalMinutes=${record.totalMinutes}, matchesToday=${recordDate === todayKey}`);
        
        if (attendanceMap.has(recordDate)) {
          const attendance = attendanceMap.get(recordDate);
          
          // Skip today if we already processed it from check-in status API
          // This ensures today's status from check-in status API takes precedence
          if (recordDate === todayKey && todayCheckInStatus) {
            // Only skip if today was successfully processed from check-in status
            // Otherwise, process it from history as fallback
            if (todayCheckInStatus.status === 'checked-in' || 
                (todayCheckInStatus.status === 'checked-out' && (todayCheckInStatus.totalMinutes || 0) > 0)) {
              console.log(`[Attendance API] Skipping today (${todayKey}) from history - already processed from check-in status`);
              return; // Don't override today's status if we already set it from check-in status
            }
          }
          
          const totalMinutes = record.totalMinutes || 0;
          const hours = totalMinutes / 60;
          
          attendance.totalMinutes = totalMinutes;
          attendance.hours = parseFloat(hours.toFixed(2));
          attendance.checkInTime = record.checkInTime;
          attendance.checkOutTime = record.checkOutTime;
          
          // Determine status
          if (isWeekend(new Date(recordDate))) {
            attendance.status = 'Weekend';
            console.log(`[Attendance API] Date ${recordDate} marked as Weekend`);
          } else if (recordDate === todayKey) {
            // TODAY: Mark as Present if checked in (even without checkout or 0 hours)
            // This is a fallback if check-in status API didn't work
            if (record.checkInTime) {
              attendance.status = 'Present';
              console.log(`[Attendance API] ✅ TODAY (${todayKey}) marked as Present from history - has check-in`);
            } else {
              attendance.status = 'Absent';
              console.log(`[Attendance API] ❌ TODAY (${todayKey}) marked as Absent - no check-in`);
            }
          } else if (record.checkInTime) {
            // PREVIOUS DATES: Mark as Present if there's a check-in (regardless of hours worked)
            // User wants: if they check in on a day, that day should show green
            attendance.status = 'Present';
            console.log(`[Attendance API] ✅ Date ${recordDate} marked as Present - has check-in (${hours.toFixed(2)} hours worked)`);
          } else {
            // PREVIOUS DATES: No check-in = Absent
            attendance.status = 'Absent';
            console.log(`[Attendance API] ❌ Date ${recordDate} marked as Absent - no check-in`);
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
    // Don't show future dates in "This month" view.
    const thisMonthEnd = (() => {
      const eom = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return eom > today ? today : eom;
    })();

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


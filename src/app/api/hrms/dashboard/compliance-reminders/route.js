import { NextResponse } from 'next/server';

// Compliance & Reminders API Route
// Returns static compliance reminders with calculated due dates
export async function GET(request) {
  try {
    const today = new Date();
    
    // Calculate compliance reminders
    const reminders = [
      {
        id: 'tax-filing',
        title: 'Tax Filing Due',
        dueDate: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        daysRemaining: 5,
        color: 'red',
      },
      {
        id: 'payroll-processing',
        title: 'Payroll Processing',
        dueDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        daysRemaining: 3,
        color: 'amber',
      },
      {
        id: 'quarterly-review',
        title: 'Quarterly Review',
        dueDate: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        daysRemaining: 10,
        color: 'blue',
      },
    ];

    // Format reminders
    const formattedReminders = reminders.map(reminder => ({
      id: reminder.id,
      title: reminder.title,
      daysRemaining: reminder.daysRemaining,
      dueDate: reminder.dueDate.toISOString().split('T')[0],
      color: reminder.color,
    }));

    return NextResponse.json({
      success: true,
      data: formattedReminders,
    });
  } catch (error) {
    console.error('Compliance Reminders API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}


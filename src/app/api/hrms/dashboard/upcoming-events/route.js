import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/utils/constants';

// Upcoming Events API Route
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

    // Fetch upcoming interviews, trainings, etc.
    // For now, we'll return empty array as this might need a separate events/calendar system
    // You can extend this to fetch from a calendar/events API when available
    
    const events = [];

    // If there's a recruitment API, fetch upcoming interviews
    try {
      const recruitmentResponse = await fetch(
        `${API_BASE_URL}/recruitment/interviews?status=upcoming${queryString ? `&${queryString}` : ''}`
      );
      
      if (recruitmentResponse && recruitmentResponse.ok) {
        const recruitmentData = await recruitmentResponse.json();
        const interviews = recruitmentData.success ? recruitmentData.interviews : (Array.isArray(recruitmentData) ? recruitmentData : []);
        
        interviews.forEach(interview => {
          events.push({
            id: `interview-${interview._id || interview.id}`,
            type: 'Interview',
            title: `Interview - ${interview.position || interview.jobTitle || 'Position'}`,
            date: interview.date || interview.scheduledDate || new Date().toISOString().split('T')[0],
            time: interview.time || interview.scheduledTime || '10:00 AM',
          });
        });
      }
    } catch (err) {
      // Recruitment API might not exist, that's okay
      console.log('Recruitment API not available:', err.message);
    }

    // Sort by date
    events.sort((a, b) => new Date(a.date) - new Date(b.date));

    return NextResponse.json({
      success: true,
      data: events.slice(0, 10),
    });
  } catch (error) {
    console.error('Upcoming Events API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}


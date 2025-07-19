import { useEffect, useState } from 'react';

export function useDashboardStats(user: any) {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      fetch(`${import.meta.env.VITE_BACKEND_URL}/api/meetings`).then(r => r.ok ? r.json() : []),
      fetch(`${import.meta.env.VITE_BACKEND_URL}/api/feedback`).then(r => r.ok ? r.json() : [])
    ]).then(([meetingsData, feedbackData]) => {
      setMeetings(Array.isArray(meetingsData) ? meetingsData.filter((m: any) => m.userId === user.id) : []);
      setFeedback(Array.isArray(feedbackData) ? feedbackData : []);
      setLoading(false);
    }).catch(() => {
      setMeetings([]);
      setFeedback([]);
      setLoading(false);
    });
  }, [user]);

  // Stats logic

  const totalMeetings = meetings.length;
  // Removed meetingsThisMonth and meetingsLastMonth as per latest requirements

  const meetingIds = meetings.map(m => String(m.meetingId));
  const userFeedback = feedback.filter(fb => meetingIds.includes(String(fb.meetingId)));
  const avgRating = (feedbacks: any[]) => {
    const ratings = feedbacks.map(fb => fb.responses?.overallSatisfaction).filter((v: any) => typeof v === 'number');
    if (!ratings.length) return '-';
    return (ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length).toFixed(2);
  };
  const avgRatingAll = avgRating(userFeedback);
  return {
    loading,
    totalMeetings,
    avgRatingAll
  };
}

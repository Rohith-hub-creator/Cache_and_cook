export async function saveMeeting(meetingData: any) {
  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/meetings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(meetingData)
  });
  if (!response.ok) {
    throw new Error('Failed to save meeting');
  }
  return await response.json();
}

export async function getFeedbackData() {
  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/feedback`);
  if (!response.ok) {
    throw new Error('Failed to fetch feedback data');
  }
  return await response.json();
}

export async function getMeetingData(meetingId: string | undefined) {
  if (!meetingId) {
    throw new Error('Meeting ID is required');
  }
  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/meetings/${encodeURIComponent(meetingId)}`);
  if (!response.ok) {
    throw new Error('Failed to fetch meeting data');
  }
  return await response.json();
}

export async function saveFeedback(feedbackData: any) {
  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/feedback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(feedbackData)
  });
  if (!response.ok) {
    throw new Error('Failed to save feedback');
  }
  return await response.json();
}

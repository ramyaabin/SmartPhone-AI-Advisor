import axiosClient from './axiosClient';

export async function sendChatMessage({ question, sessionId, backend }) {
  // Longer than the backend's worst case (rewrite 8s + embedding 2x10s +
  // answer 30s), plus time for a sleeping free-tier server to wake, so the
  // backend's error message reaches the user instead of a generic timeout.
  const { data } = await axiosClient.post(
    '/chat',
    { question, sessionId, backend },
    { timeout: 90000 }
  );
  return data;
}

export async function resetChatSession(sessionId) {
  const { data } = await axiosClient.post('/chat/reset', { sessionId });
  return data;
}

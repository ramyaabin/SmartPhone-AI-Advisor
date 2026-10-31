import axiosClient from './axiosClient';

export async function sendChatMessage({ question, sessionId, backend }) {
  // Longer than the backend's worst case (rewrite 8s + embedding 2x10s +
  // answer 30s), so the backend's error message reaches the user instead of a
  // generic timeout.
  const { data } = await axiosClient.post(
    '/chat',
    { question, sessionId, backend },
    { timeout: 65000 }
  );
  return data;
}

export async function resetChatSession(sessionId) {
  const { data } = await axiosClient.post('/chat/reset', { sessionId });
  return data;
}

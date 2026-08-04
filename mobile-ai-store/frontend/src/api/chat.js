import axiosClient from './axiosClient';

export async function sendChatMessage({ question, sessionId, backend }) {
  const { data } = await axiosClient.post('/chat', { question, sessionId, backend });
  return data;
}

export async function resetChatSession(sessionId) {
  const { data } = await axiosClient.post('/chat/reset', { sessionId });
  return data;
}

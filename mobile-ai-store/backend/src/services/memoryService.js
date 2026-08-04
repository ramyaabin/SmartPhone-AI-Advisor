import { BufferMemory } from 'langchain/memory';
import { ChatMessageHistory } from 'langchain/stores/message/in_memory';

/**
 * Keeps one LangChain ConversationBufferMemory instance per chat session
 * (keyed by a sessionId the frontend generates and stores in localStorage).
 * This is process-memory only — fine for a demo/portfolio project. Swap in
 * a Redis-backed ChatMessageHistory for production persistence.
 */
const sessions = new Map();

export function getMemory(sessionId = 'default') {
  if (!sessions.has(sessionId)) {
    sessions.set(
      sessionId,
      new BufferMemory({
        chatHistory: new ChatMessageHistory(),
        returnMessages: true,
        memoryKey: 'chat_history',
        inputKey: 'input',
        outputKey: 'output'
      })
    );
  }
  return sessions.get(sessionId);
}

export function clearMemory(sessionId = 'default') {
  sessions.delete(sessionId);
}

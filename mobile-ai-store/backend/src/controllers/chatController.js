import { answerQuestion } from '../services/ragService.js';
import { clearMemory } from '../services/memoryService.js';

export async function postChat(req, res, next) {
  try {
    const { question, sessionId, backend } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ error: 'question is required' });
    }

    const result = await answerQuestion({
      question: question.trim(),
      sessionId: sessionId || 'default',
      backend: backend === 'faiss' ? 'faiss' : 'chroma'
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
}

export function resetChat(req, res) {
  const { sessionId } = req.body;
  clearMemory(sessionId || 'default');
  res.json({ ok: true });
}

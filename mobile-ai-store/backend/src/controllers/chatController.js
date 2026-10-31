import { answerQuestion } from '../services/ragService.js';
import { clearMemory } from '../services/memoryService.js';

// Retrieval backends this deployment supports, first one is the default.
// Production sets RETRIEVAL_BACKENDS=faiss because it has no Chroma server.
const ENABLED_BACKENDS = (process.env.RETRIEVAL_BACKENDS || 'chroma,faiss')
  .split(',')
  .map((b) => b.trim())
  .filter((b) => b === 'chroma' || b === 'faiss');

export async function postChat(req, res, next) {
  try {
    const { question, sessionId, backend } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ error: 'question is required' });
    }

    const result = await answerQuestion({
      question: question.trim(),
      sessionId: sessionId || 'default',
      backend: ENABLED_BACKENDS.includes(backend) ? backend : ENABLED_BACKENDS[0] || 'faiss'
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

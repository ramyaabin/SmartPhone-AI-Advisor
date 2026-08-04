import { useEffect, useRef, useState } from 'react';
import { MessageCircle, X, Send, Loader2, RotateCcw, Cpu } from 'lucide-react';
import { sendChatMessage, resetChatSession } from '../api/chat';

const SUGGESTIONS = [
  'Which iPhone has the best battery?',
  'Compare iPhone 16 Pro and Samsung S24 Ultra',
  'Which phone has 512GB storage?',
  'Suggest a gaming phone under €900',
  'Which phone has the best camera?'
];

function getSessionId() {
  let id = localStorage.getItem('mas-chat-session');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('mas-chat-session', id);
  }
  return id;
}

export default function ChatWidget({ open, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "Hi! I'm your Mobile AI Store assistant. Ask me anything about the phones in our catalog — I'll only answer from real product data, with citations."
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [backend, setBackend] = useState('chroma'); // 'chroma' (OpenAI) | 'faiss' (HF local)
  const bottomRef = useRef(null);
  const sessionId = useRef(getSessionId());

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  async function handleSend(text) {
    const question = (text ?? input).trim();
    if (!question || loading) return;

    setMessages((prev) => [...prev, { role: 'user', content: question }]);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const res = await sendChatMessage({
        question,
        sessionId: sessionId.current,
        backend
      });
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: res.answer, sources: res.sources }
      ]);
    } catch (err) {
      setError(err.message || 'The assistant is unavailable right now.');
    } finally {
      setLoading(false);
    }
  }

  async function handleReset() {
    await resetChatSession(sessionId.current).catch(() => {});
    setMessages([
      {
        role: 'assistant',
        content: "Conversation cleared. What would you like to know about our phones?"
      }
    ]);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative flex h-[85vh] w-full max-w-lg flex-col rounded-t-3xl bg-white shadow-2xl dark:bg-slate-900 sm:h-[80vh] sm:rounded-3xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-white">
              <MessageCircle size={18} />
            </span>
            <div>
              <p className="font-semibold leading-tight">Store Assistant</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">RAG-grounded · no hallucinations</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleReset}
              title="Clear conversation"
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
            >
              <RotateCcw size={16} />
            </button>
            <button
              onClick={onClose}
              title="Close"
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Retrieval backend switch */}
        <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-2 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <Cpu size={13} />
          Retrieval:
          <button
            onClick={() => setBackend('chroma')}
            className={`rounded-full px-2.5 py-1 font-medium ${
              backend === 'chroma' ? 'bg-brand-500 text-white' : 'bg-slate-100 dark:bg-slate-800'
            }`}
          >
            OpenAI + Chroma
          </button>
          <button
            onClick={() => setBackend('faiss')}
            className={`rounded-full px-2.5 py-1 font-medium ${
              backend === 'faiss' ? 'bg-brand-500 text-white' : 'bg-slate-100 dark:bg-slate-800'
            }`}
          >
            HF Instructor + FAISS
          </button>
        </div>

        {/* Messages */}
        <div className="scrollbar-thin flex-1 space-y-4 overflow-y-auto px-5 py-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-brand-500 text-white'
                    : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100'
                }`}
              >
                <p className="whitespace-pre-wrap">{m.content}</p>
                {m.sources?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5 border-t border-black/5 pt-2 dark:border-white/10">
                    {m.sources.map((s, idx) => (
                      <span
                        key={idx}
                        className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-900/60 dark:text-slate-300"
                      >
                        {s.brand} {s.product}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2.5 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                <Loader2 size={14} className="animate-spin" /> Thinking...
              </div>
            </div>
          )}
          {error && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-950/40 dark:text-red-400">
              {error}
            </p>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && (
          <div className="scrollbar-thin flex gap-2 overflow-x-auto px-5 pb-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => handleSend(s)}
                className="whitespace-nowrap rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 border-t border-slate-100 p-4 dark:border-slate-800"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about a phone's specs, price, or comparisons..."
            className="input"
          />
          <button type="submit" disabled={loading} className="btn-primary px-3.5">
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}

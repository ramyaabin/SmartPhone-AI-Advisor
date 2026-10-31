import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, X, Send, Loader2, RotateCcw, Cpu, Info } from 'lucide-react';
import { sendChatMessage, resetChatSession } from '../api/chat';

// Retrieval backends offered in the UI; the live site sets this to "faiss"
// because it has no Chroma server. The switch is hidden when only one is left.
const ENABLED_BACKENDS = (import.meta.env.VITE_RETRIEVAL_BACKENDS || 'chroma,faiss')
  .split(',')
  .map((b) => b.trim())
  .filter((b) => b === 'chroma' || b === 'faiss');

const TOKEN_PATTERN = /(\[[^\]]+\]\(\/product\/[^)\s]+\)|\*\*[^*]+\*\*)/g;
const LINK_PATTERN = /^\[([^\]]+)\]\((\/product\/[^)\s]+)\)$/;
const BOLD_PATTERN = /^\*\*([^*]+)\*\*$/;

// Renders the small bit of markdown the assistant uses: **bold** and links to
// product pages. Only /product/... links become clickable, so the model can't
// send users to arbitrary URLs.
function renderAssistantText(text, onNavigate) {
  // Show "### Heading" lines as bold text rather than raw hashes.
  const withHeadings = text.replace(/^#{1,6}\s+(.+)$/gm, '**$1**');
  return withHeadings.split(TOKEN_PATTERN).map((part, i) => {
    const link = part.match(LINK_PATTERN);
    if (link) {
      return (
        <Link
          key={i}
          to={link[2]}
          onClick={onNavigate}
          className="font-semibold text-brand-500 underline underline-offset-2 hover:text-brand-600 dark:text-brand-400"
        >
          {link[1]}
        </Link>
      );
    }
    const bold = part.match(BOLD_PATTERN);
    if (bold) return <strong key={i}>{bold[1]}</strong>;
    return part;
  });
}

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
  const [backend, setBackend] = useState(ENABLED_BACKENDS[0] || 'faiss'); // 'chroma' (OpenAI) | 'faiss' (HF local)
  const bottomRef = useRef(null);
  const sessionId = useRef(getSessionId());
  // A ref updates immediately, unlike `loading`, so pressing Enter twice
  // quickly can't send the same question twice.
  const sendingRef = useRef(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  async function handleSend(text) {
    const question = (text ?? input).trim();
    if (!question || sendingRef.current) return;
    sendingRef.current = true;

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
      sendingRef.current = false;
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
        {ENABLED_BACKENDS.length > 1 && (
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
        )}
        {ENABLED_BACKENDS.length === 1 && ENABLED_BACKENDS[0] === 'faiss' && (
          <div className="flex items-start gap-2 border-b border-slate-100 bg-slate-50 px-5 py-2 text-xs leading-relaxed text-slate-500 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400">
            <Info size={13} className="mt-0.5 shrink-0" />
            <span>
              <span className="font-medium text-slate-600 dark:text-slate-300">Retrieval: HF Instructor + FAISS.</span>{' '}
              The OpenAI + ChromaDB mode is turned off on this demo because it needs a paid,
              always-on database server. It works when you run the project locally.
            </span>
          </div>
        )}

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
                <p className="whitespace-pre-wrap">
                  {m.role === 'assistant' ? renderAssistantText(m.content, onClose) : m.content}
                </p>
                {m.sources?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5 border-t border-black/5 pt-2 dark:border-white/10">
                    {m.sources.map((s, idx) =>
                      s.productId ? (
                        <Link
                          key={idx}
                          to={`/product/${s.productId}`}
                          onClick={onClose}
                          className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-medium text-slate-600 hover:bg-brand-500 hover:text-white dark:bg-slate-900/60 dark:text-slate-300"
                        >
                          {s.brand} {s.product}
                        </Link>
                      ) : (
                        <span
                          key={idx}
                          className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-900/60 dark:text-slate-300"
                        >
                          {s.brand} {s.product}
                        </span>
                      )
                    )}
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

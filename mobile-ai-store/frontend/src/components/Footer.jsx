export default function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-100 bg-slate-50 py-10 dark:border-slate-800 dark:bg-slate-900/40">
      <div className="mx-auto max-w-7xl px-4 text-center text-sm text-slate-500 dark:text-slate-400 sm:px-6">
        <p>Mobile AI Store — a portfolio project demonstrating a RAG-powered shopping assistant.</p>
        <p className="mt-1">Built with React, Express, LangChain, and OpenAI. Not a real store.</p>
      </div>
    </footer>
  );
}

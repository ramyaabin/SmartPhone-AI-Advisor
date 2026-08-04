import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function HeroBanner({ onOpenChat }) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-500 to-indigo-500 px-6 py-14 text-white sm:px-12 sm:py-20">
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

      <div className="relative mx-auto max-w-2xl text-center">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide">
          <Sparkles size={14} /> AI Shopping Assistant Included
        </span>
        <h1 className="text-3xl font-extrabold leading-tight sm:text-5xl">
          Find your perfect smartphone, powered by AI.
        </h1>
        <p className="mt-4 text-base text-white/85 sm:text-lg">
          Browse Apple, Samsung, Google, OnePlus, and Xiaomi — or just ask our
          assistant what fits your budget and needs.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a href="#featured" className="btn-primary bg-white text-brand-600 hover:bg-slate-100">
            Shop Featured Phones <ArrowRight size={16} />
          </a>
          <button
            onClick={onOpenChat}
            className="rounded-xl border border-white/40 px-4 py-2.5 font-medium text-white transition hover:bg-white/10"
          >
            Ask the AI Assistant
          </button>
        </div>
      </div>
    </section>
  );
}

import { useEffect, useState } from 'react';

export default function Loader({ label = 'Loading...' }) {
  // The free-tier backend sleeps when idle; explain the wait if it's slow.
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500" />
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      {slow && (
        <p className="max-w-xs text-center text-xs text-slate-400 dark:text-slate-500">
          Waking up the server. This demo runs on a free host that sleeps when
          idle, so the first load can take up to a minute.
        </p>
      )}
    </div>
  );
}

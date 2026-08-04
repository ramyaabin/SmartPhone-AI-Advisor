export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-6 py-10 text-center dark:border-red-900/40 dark:bg-red-950/30">
      <p className="text-red-600 dark:text-red-400">{message || 'Something went wrong.'}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary">
          Try again
        </button>
      )}
    </div>
  );
}

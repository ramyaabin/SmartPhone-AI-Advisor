export function errorHandler(err, req, res, next) {
  console.error(`[error] ${req.method} ${req.path} ->`, err.message);

  const status = err.status || 500;
  res.status(status).json({
    error: err.publicMessage || 'Something went wrong. Please try again.',
    ...(process.env.NODE_ENV === 'development' && { detail: err.message })
  });
}

export function notFound(req, res) {
  res.status(404).json({ error: `Route ${req.originalUrl} not found` });
}

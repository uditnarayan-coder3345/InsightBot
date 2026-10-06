export function notFoundHandler(req, res) { res.status(404).json({ success: false, error: 'The requested API route was not found.' }); }
export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  const status = Number(error.status || error.statusCode) || 500;
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}:`, error);
  if (error.name === 'MulterError') return res.status(400).json({ success: false, error: error.code === 'LIMIT_FILE_SIZE' ? 'The file exceeds the 25 MB upload limit.' : 'The uploaded file could not be accepted.' });
  const safeStatus = status >= 400 && status < 500 ? status : 500;
  return res.status(safeStatus).json({ success: false, error: safeStatus === 500 ? 'An unexpected server error occurred.' : (error.publicMessage || error.message || 'The request could not be completed.') });
}

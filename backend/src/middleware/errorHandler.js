export const errorHandler = (err, req, res, next) => {
  console.error('[Error Handler]', err);

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({ message: messages.join(', ') });
  }

  if (err.code === 11000) {
    return res.status(400).json({ message: 'A record with this field already exists.' });
  }

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File size exceeds maximum limit of 25MB.' });
    }
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  }

  const statusCode = err.statusCode || err.status || (res.statusCode !== 200 ? res.statusCode : 500);
  res.status(statusCode).json({
    message: err.message || 'An unexpected internal server error occurred.',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

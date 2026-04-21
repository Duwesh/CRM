export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
    return;
  }

  // PostgreSQL unique violation
  if (err.code === '23505') {
    res.status(409).json({
      success: false,
      error: 'Record already exists',
      detail: err.detail,
    });
    return;
  }

  // PostgreSQL foreign key violation
  if (err.code === '23503') {
    res.status(400).json({
      success: false,
      error: 'Referenced record does not exist',
    });
    return;
  }

  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
};

export const notFoundHandler = (_req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found`,
  });
};

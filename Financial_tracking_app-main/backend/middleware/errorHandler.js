/**
 * Global Error Handler Middleware
 * Processes and formats all application errors before sending a response
 */

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log detailed error output in development mode
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  }

  // Handle invalid MongoDB ObjectId errors
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { statusCode: 404, message };
  }

  // Handle duplicate field errors (MongoDB unique constraint)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    error = { statusCode: 400, message };
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { statusCode: 400, message };
  }

  // Handle invalid JWT tokens
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { statusCode: 401, message };
  }

  // Handle expired JWT tokens
  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { statusCode: 401, message };
  }

  res.status(error.statusCode || 500).json({
    status: 'error',
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * Custom Application Error Class
 * Used to throw controlled, operational errors with specific status codes
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = { errorHandler, AppError };

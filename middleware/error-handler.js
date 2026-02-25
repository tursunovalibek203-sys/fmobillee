// ==================== PROFESSIONAL ERROR HANDLER ====================

const { HTTP_STATUS, ERRORS } = require('../config/constants');

class ErrorHandler extends Error {
  constructor(message, statusCode = HTTP_STATUS.INTERNAL_ERROR) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorMiddleware = (err, req, res, next) => {
  let { statusCode, message } = err;

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = Object.values(err.errors).map(e => e.message).join(', ');
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    const field = Object.keys(err.keyPattern)[0];
    message = `${field} allaqachon mavjud`;
  }

  // Mongoose cast error
  if (err.name === 'CastError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = 'Noto\'g\'ri ID formati';
  }

  // Log error for debugging
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', {
      message: err.message,
      stack: err.stack,
      statusCode
    });
  }

  res.status(statusCode || HTTP_STATUS.INTERNAL_ERROR).json({
    success: false,
    message: message || ERRORS.DATABASE_ERROR,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = { ErrorHandler, errorMiddleware };

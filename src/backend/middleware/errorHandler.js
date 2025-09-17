const logger = require('../utils/logger');

class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg?.match(/(["'])(\\?.)*?\1/)?.[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401);

const sendErrorDev = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    logger.error('ERROR DETAILS:', {
      error: err,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    return res.status(err.statusCode).json({
      success: false,
      error: {
        status: err.status,
        message: err.message,
        stack: err.stack,
        error: err
      }
    });
  }

  // RENDERED WEBSITE
  logger.error('ERROR DETAILS:', err);
  res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message
  });
};

const sendErrorProd = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
      logger.error('Operational Error:', {
        message: err.message,
        statusCode: err.statusCode,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip
      });

      return res.status(err.statusCode).json({
        success: false,
        error: {
          message: err.message,
          statusCode: err.statusCode
        }
      });
    }

    // Programming or other unknown error: don't leak error details
    logger.error('Unknown Error:', {
      error: err,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip
    });

    return res.status(500).json({
      success: false,
      error: {
        message: 'Something went wrong!',
        statusCode: 500
      }
    });
  }

  // RENDERED WEBSITE
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message
    });
  }

  // Programming or other unknown error: don't leak error details
  logger.error('Unknown Error:', err);
  res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later.'
  });
};

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    // Handle specific MongoDB errors
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};

// Catch async errors
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

// Rate limit error handler
const handleRateLimit = (req, res) => {
  logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
  res.status(429).json({
    success: false,
    error: {
      message: 'Too many requests, please try again later.',
      statusCode: 429,
      retryAfter: req.rateLimit?.resetTime
    }
  });
};

module.exports = {
  AppError,
  globalErrorHandler,
  catchAsync,
  handleRateLimit
};
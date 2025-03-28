/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log the error
  console.error('Error caught by error handling middleware:', err);
  
  // Determine HTTP status code
  const statusCode = err.statusCode || 500;
  
  // Prepare error response
  const errorResponse = {
    success: false,
    error: err.message || 'Sunucu hatası',
  };
  
  // Add stack trace in development mode
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }
  
  // Send error response
  res.status(statusCode).json(errorResponse);
};

/**
 * Error handling for async functions
 * Wraps an async function to automatically catch errors and pass them to next()
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/**
 * Custom error class for API errors
 */
class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
  
  static notFound(message = 'Kaynak bulunamadı') {
    return new ApiError(message, 404);
  }
  
  static badRequest(message = 'Geçersiz istek') {
    return new ApiError(message, 400); 
  }
  
  static unauthorized(message = 'Yetkilendirme hatası') {
    return new ApiError(message, 401);
  }
  
  static forbidden(message = 'Bu işlem için yetkiniz bulunmamaktadır') {
    return new ApiError(message, 403);
  }
  
  static internal(message = 'Sunucu hatası') {
    return new ApiError(message, 500);
  }
}

module.exports = {
  errorHandler,
  asyncHandler,
  ApiError
};

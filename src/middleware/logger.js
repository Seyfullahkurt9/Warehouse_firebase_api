/**
 * Request logging middleware
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log request details
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  
  // Process the request
  res.on('finish', () => {
    // Calculate response time
    const duration = Date.now() - start;
    
    // Get response status code
    const statusCode = res.statusCode;
    
    // Log response details with colorized status code
    const statusColor = statusCode >= 500 ? '\x1b[31m' : // Red for 5xx
                       statusCode >= 400 ? '\x1b[33m' : // Yellow for 4xx
                       statusCode >= 300 ? '\x1b[36m' : // Cyan for 3xx
                       statusCode >= 200 ? '\x1b[32m' : // Green for 2xx
                       '\x1b[0m'; // Default color
    
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${statusColor}${statusCode}\x1b[0m ${duration}ms`);
  });
  
  next();
};

/**
 * Error logging
 */
const errorLogger = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ERROR:`, {
    method: req.method,
    path: req.path,
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
  
  next(err);
};

module.exports = { 
  requestLogger,
  errorLogger
};

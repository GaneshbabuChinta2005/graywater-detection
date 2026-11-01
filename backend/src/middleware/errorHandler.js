const errorHandler = (err, req, res, next) => {
  console.error('[Server Error Handler]', err);

  // Handle Axios ML service connection failures
  if (err.code === 'ECONNREFUSED' || err.message?.includes('ML_SERVICE_UNAVAILABLE')) {
    return res.status(503).json({
      success: false,
      error: 'ML_SERVICE_UNAVAILABLE',
      message: 'AI inference service is currently unavailable. Ensure the Python FastAPI service is running on port 8000.'
    });
  }

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    error: err.name || 'INTERNAL_SERVER_ERROR',
    message: err.message || 'An unexpected server error occurred.'
  });
};

module.exports = errorHandler;

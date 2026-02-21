/**
 * Global error handler middleware
 */

export function errorHandler(err, req, res, next) {
  console.error("[Error]", err.message);

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      error: "File too large. Maximum size is 2MB.",
    });
  }

  if (err.message?.includes("Invalid file type")) {
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }

  if (err.message === "GEMINI_API_KEY is not set in environment.") {
    return res.status(503).json({
      success: false,
      error: "Service configuration error. Please try again later.",
    });
  }

  if (err.message?.includes("rate-limited")) {
    return res.status(503).json({
      success: false,
      error: err.message,
    });
  }

  const status = err.statusCode || err.status || 500;
  res.status(status).json({
    success: false,
    error: err.message || "Internal server error.",
  });
}


// export default AppError;
// Custom Error Class
// We create this so that we can attach extra information
// like status code and status to an error.

class AppError extends Error {
  constructor(message, statusCode) {
    // Call JavaScript's built-in Error constructor
    super(message);

    // Store the HTTP status code (404, 401, 500, etc.)
    this.statusCode = statusCode;

    // Decide whether it is a client error or server error
    if (statusCode >= 400 && statusCode < 500) {
      this.status = "fail";
    } else {
      this.status = "error";
    }

    // Marks this as an expected (operational) error
    this.isOperational = true;

    // Saves the exact location where the error occurred
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
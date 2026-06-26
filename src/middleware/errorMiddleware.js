

// export default errorMiddleware;
const errorMiddleware = (err, req, res, next) => {

  // If no status code is present, assume Internal Server Error
  if (!err.statusCode) {
    err.statusCode = 500;
  }

  // If no status is present, assume "error"
  if (!err.status) {
    err.status = "error";
  }

  // Development Environment
  if (process.env.NODE_ENV === "development") {

    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack,
    });

  }

  // Production Environment
  if (err.isOperational) {

    // Send expected errors to the client
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

  }

  // Unexpected error (Programming Bug)

  console.error("Unexpected Error:", err);

  return res.status(500).json({
    status: "error",
    message: "Something went wrong. Please try again later.",
  });
};

export default errorMiddleware;
/**
 * Standardized API error handling and response formatting
 */

export class ApiError extends Error {
  constructor(message, statusCode = 500, code = "INTERNAL_ERROR") {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

export const errorResponse = (error, statusCode = 500) => {
  let message = "Internal Server Error";
  let code = "INTERNAL_ERROR";
  let details = null;

  console.log("errorerrorerror", error);

  if (error instanceof ApiError) {
    message = error.message;
    statusCode = error.statusCode;
    code = error.code;
  } else if (
    error &&
    typeof error.getErrors === "function" &&
    error.getErrors()
  ) {
    message = error.message || "Validation failed";
    code = "VALIDATION_ERROR";
    statusCode = 400;
    details = error.getErrors();
  } else if (error instanceof SyntaxError) {
    message = "Invalid JSON in request body";
    code = "INVALID_JSON";
    statusCode = 400;
  } else if (error instanceof TypeError) {
    message = error.message;
    code = "TYPE_ERROR";
    statusCode = 400;
  }

  return {
    status: statusCode,
    body: {
      success: false,
      error: {
        code,
        message,
        ...(details && { details }),
      },
    },
  };
};

export const successResponse = (data, statusCode = 200) => {
  return {
    status: statusCode,
    body: {
      success: true,
      data,
    },
  };
};

export const paginatedResponse = (
  data,
  page,
  limit,
  total,
  statusCode = 200,
) => {
  return {
    status: statusCode,
    body: {
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
  };
};

/**
 * Handle API endpoint with error catching
 */
export const withErrorHandling = (handler) => {
  return async (req, ...args) => {
    try {
      return await handler(req, ...args);
    } catch (error) {
      console.error("API Error:", error);
      const { status, body } = errorResponse(error);
      return Response.json(body, { status });
    }
  };
};

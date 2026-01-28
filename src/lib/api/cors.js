/**
 * CORS configuration for mobile app and cross-origin requests
 */

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:8000",
  process.env.NEXT_PUBLIC_APP_URL,
  process.env.MOBILE_APP_URL,
].filter(Boolean);

export const corsHeaders = {
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

/**
 * Handle OPTIONS request for CORS preflight
 */
export const handleCorsPreFlight = (origin) => {
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin)
    ? origin
    : ALLOWED_ORIGINS[0];

  return new Response(null, {
    status: 200,
    headers: {
      ...corsHeaders,
      "Access-Control-Allow-Origin": allowedOrigin,
    },
  });
};

/**
 * Add CORS headers to response
 */
export const addCorsHeaders = (response, origin) => {
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin)
    ? origin
    : ALLOWED_ORIGINS[0];
  const headers = new Headers(response.headers);

  headers.set("Access-Control-Allow-Origin", allowedOrigin);
  Object.entries(corsHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

/**
 * CORS middleware for API routes
 */
export const withCors = (handler) => {
  return async (req, ...args) => {
    const origin = req.headers.get("origin") || "";

    // Handle preflight requests
    if (req.method === "OPTIONS") {
      return handleCorsPreFlight(origin);
    }

    // Execute handler
    const response = await handler(req, ...args);

    // Add CORS headers to response
    return addCorsHeaders(response, origin);
  };
};

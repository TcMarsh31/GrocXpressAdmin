/**
 * Authentication middleware for API routes
 * Protects admin operations
 */

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export class AuthenticationError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "AuthenticationError";
    this.statusCode = 401;
    this.code = "UNAUTHORIZED";
  }
}

/**
 * Get authenticated user from request
 */
export const getAuthUser = async (req) => {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new AuthenticationError("Authentication required");
  }

  return user;
};

/**
 * Verify admin role
 */
export const verifyAdminRole = async (req) => {
  const user = await getAuthUser(req);

  // Check if user has admin role in custom claims or user metadata
  const isAdmin =
    user.user_metadata?.role === "admin" ||
    user.app_metadata?.roles?.includes("admin");

  if (!isAdmin) {
    throw new AuthenticationError("Admin privileges required");
  }

  return user;
};

/**
 * Middleware to require authentication
 */
export const requireAuth = (handler) => {
  return async (req, ...args) => {
    try {
      const user = await getAuthUser(req);
      req.user = user;
      return await handler(req, ...args);
    } catch (error) {
      if (error instanceof AuthenticationError) {
        return Response.json(
          {
            success: false,
            error: {
              code: error.code,
              message: error.message,
            },
          },
          { status: error.statusCode },
        );
      }
      throw error;
    }
  };
};

/**
 * Middleware to require admin role
 */
export const requireAdmin = (handler) => {
  return async (req, ...args) => {
    try {
      const user = await verifyAdminRole(req);
      req.user = user;
      return await handler(req, ...args);
    } catch (error) {
      if (error instanceof AuthenticationError) {
        return Response.json(
          {
            success: false,
            error: {
              code: error.code,
              message: error.message,
            },
          },
          { status: error.statusCode },
        );
      }
      throw error;
    }
  };
};

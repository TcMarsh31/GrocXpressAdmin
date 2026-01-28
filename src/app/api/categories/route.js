/**
 * GET /api/categories - List all categories
 * POST /api/categories - Create a new category (admin only)
 */

import { NextResponse } from "next/server";
import { createValidator } from "@/lib/api/validation";
import {
  successResponse,
  errorResponse,
  withErrorHandling,
} from "@/lib/api/error-handler";
import { withCors } from "@/lib/api/cors";
import { requireAdmin } from "@/lib/api/auth";
import { categoriesDb } from "@/lib/api/db";

const handleGet = async (req) => {
  const { data, error } = await categoriesDb.getAll();

  if (error) {
    const { status, body } = errorResponse(error, 500);
    return NextResponse.json(body, { status });
  }

  const { status, body } = successResponse(data);
  return NextResponse.json(body, { status });
};

const handlePost = async (req) => {
  const body = await req.json();

  // Validate input
  const validator = createValidator(body);
  validator
    .string("name", { required: true, min: 1, max: 255 })
    .string("icon", { required: true, max: 500 })
    .string("background_color", { required: true, max: 50 })
    .string("icon_color", { required: true, max: 50 });

  if (!validator.isValid()) {
    const { status, body: errorBody } = errorResponse(validator, 400);
    return NextResponse.json(errorBody, { status });
  }

  // Create category
  const categoryData = {
    name: body.name,
    icon: body.icon,
    background_color: body.background_color,
    icon_color: body.icon_color,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await categoriesDb.create(categoryData);

  if (error) {
    const { status, body: errorBody } = errorResponse(error, 500);
    return NextResponse.json(errorBody, { status });
  }

  const { status, body: responseBody } = successResponse(data, 201);
  return NextResponse.json(responseBody, { status });
};

const handler = async (req) => {
  if (req.method === "GET") {
    return handleGet(req);
  }
  if (req.method === "POST") {
    return await requireAdmin(handlePost)(req);
  }
  return NextResponse.json(
    {
      success: false,
      error: { code: "METHOD_NOT_ALLOWED", message: "Method not allowed" },
    },
    { status: 405 },
  );
};

export const GET = withErrorHandling((req) => withCors(handler)(req));
export const POST = withErrorHandling((req) => withCors(handler)(req));
export const OPTIONS = (req) => withCors(async () => new Response())(req);

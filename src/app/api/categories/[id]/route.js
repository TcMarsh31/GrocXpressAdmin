/**
 * GET /api/categories/[id] - Get category by ID
 * PUT /api/categories/[id] - Update category (admin only)
 * DELETE /api/categories/[id] - Delete category (admin only)
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
import { ApiError } from "@/lib/api/error-handler";

const handleGet = async (req, { params }) => {
  const { id } = await params;

  const { data, error } = await categoriesDb.getById(id);

  if (error || !data) {
    const { status, body } = errorResponse(
      new ApiError("Category not found", 404, "NOT_FOUND"),
      404,
    );
    return NextResponse.json(body, { status });
  }

  const { status, body } = successResponse(data);
  return NextResponse.json(body, { status });
};

const handlePut = async (req, { params }) => {
  const { id } = await params;
  const body = await req.json();

  // Validate input
  const validator = createValidator(body);
  validator
    .string("name", { max: 255 })
    .string("description", { max: 1000 })
    .string("icon", { max: 500 });

  if (!validator.isValid()) {
    const { status, body: errorBody } = errorResponse(validator, 400);
    return NextResponse.json(errorBody, { status });
  }

  // Update category
  const categoryData = {};
  if (body.name !== undefined) categoryData.name = body.name;
  if (body.description !== undefined)
    categoryData.description = body.description;
  if (body.icon !== undefined) categoryData.icon = body.icon;
  categoryData.updated_at = new Date().toISOString();

  const { data, error } = await categoriesDb.update(id, categoryData);

  if (error || !data) {
    const { status, body: errorBody } = errorResponse(
      new ApiError("Category not found", 404, "NOT_FOUND"),
      404,
    );
    return NextResponse.json(errorBody, { status });
  }

  const { status, body: responseBody } = successResponse(data);
  return NextResponse.json(responseBody, { status });
};

const handleDelete = async (req, { params }) => {
  const { id } = await params;

  const { error } = await categoriesDb.delete(id);

  if (error) {
    const { status, body } = errorResponse(error, 500);
    return NextResponse.json(body, { status });
  }

  const { status, body } = successResponse({ id }, 200);
  return NextResponse.json(body, { status });
};

const handler = async (req, context) => {
  if (req.method === "GET") {
    return handleGet(req, context);
  }
  if (req.method === "PUT") {
    return await requireAdmin(async (r) => handlePut(r, context))(req);
  }
  if (req.method === "DELETE") {
    return await requireAdmin(async (r) => handleDelete(r, context))(req);
  }
  return NextResponse.json(
    {
      success: false,
      error: { code: "METHOD_NOT_ALLOWED", message: "Method not allowed" },
    },
    { status: 405 },
  );
};

export const GET = withErrorHandling(handler);
export const PUT = withErrorHandling(handler);
export const DELETE = withErrorHandling(handler);
export const OPTIONS = (req) => withCors(async () => new Response())(req);

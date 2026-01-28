/**
 * PUT /api/banners/[id] - Update banner (admin only)
 * DELETE /api/banners/[id] - Delete banner (admin only)
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
import { bannersDb } from "@/lib/api/db";
import { ApiError } from "@/lib/api/error-handler";

const handlePut = async (req, { params }) => {
  const { id } = await params;
  const body = await req.json();

  // Validate input
  const validator = createValidator(body);
  validator
    .string("title", { max: 255 })
    .string("description", { max: 1000 })
    .string("image_url", { max: 500 })
    .string("link_url", { max: 500 })
    .string("start_date", {})
    .string("end_date", {})
    .number("position", { min: 0 })
    .boolean("is_active", {});

  if (!validator.isValid()) {
    const { status, body: errorBody } = errorResponse(validator, 400);
    return NextResponse.json(errorBody, { status });
  }

  // Update banner
  const bannerData = {};
  if (body.title !== undefined) bannerData.title = body.title;
  if (body.description !== undefined) bannerData.description = body.description;
  if (body.image_url !== undefined) bannerData.image_url = body.image_url;
  if (body.link_url !== undefined) bannerData.link_url = body.link_url;
  if (body.start_date !== undefined) bannerData.start_date = body.start_date;
  if (body.end_date !== undefined) bannerData.end_date = body.end_date;
  if (body.position !== undefined) bannerData.position = body.position;
  if (body.is_active !== undefined) bannerData.is_active = body.is_active;
  bannerData.updated_at = new Date().toISOString();

  const { data, error } = await bannersDb.update(id, bannerData);

  if (error || !data) {
    const { status, body: errorBody } = errorResponse(
      new ApiError("Banner not found", 404, "NOT_FOUND"),
      404,
    );
    return NextResponse.json(errorBody, { status });
  }

  const { status, body: responseBody } = successResponse(data);
  return NextResponse.json(responseBody, { status });
};

const handleDelete = async (req, { params }) => {
  const { id } = await params;

  const { error } = await bannersDb.delete(id);

  if (error) {
    const { status, body } = errorResponse(error, 500);
    return NextResponse.json(body, { status });
  }

  const { status, body } = successResponse({ id }, 200);
  return NextResponse.json(body, { status });
};

const handler = async (req, context) => {
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

export const PUT = withErrorHandling(handler);
export const DELETE = withErrorHandling(handler);
export const OPTIONS = (req) => withCors(async () => new Response())(req);

/**
 * GET /api/banners - Get active banners or list all (admin)
 * POST /api/banners - Create a new banner (admin only)
 */

import { NextResponse } from "next/server";
import { createValidator } from "@/lib/api/validation";
import {
  successResponse,
  paginatedResponse,
  errorResponse,
  withErrorHandling,
} from "@/lib/api/error-handler";
import { withCors } from "@/lib/api/cors";
import { requireAdmin } from "@/lib/api/auth";
import { bannersDb } from "@/lib/api/db";

const handleGet = async (req, user) => {
  const { searchParams } = new URL(req.url);
  const adminList = searchParams.get("admin") === "true" && user;

  if (adminList) {
    // Admin view - list all banners with pagination
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, parseInt(searchParams.get("limit") || "20"));

    const { data, error, total } = await bannersDb.getAll(page, limit);

    if (error) {
      const { status, body } = errorResponse(error, 500);
      return NextResponse.json(body, { status });
    }

    const { status, body } = paginatedResponse(data, page, limit, total);
    return NextResponse.json(body, { status });
  } else {
    // Public view - get active banners only
    const { data, error } = await bannersDb.getActive();

    if (error) {
      const { status, body } = errorResponse(error, 500);
      return NextResponse.json(body, { status });
    }

    const { status, body } = successResponse(data);
    return NextResponse.json(body, { status });
  }
};

const handlePost = async (req) => {
  const body = await req.json();

  // Validate input
  const validator = createValidator(body);
  validator
    .string("image_url", { required: true, max: 500 })
    .string("title", { required: true, min: 1, max: 255 })
    .string("subtitle", { max: 500 })
    .boolean("is_active", {});

  if (!validator.isValid()) {
    const { status, body: errorBody } = errorResponse(validator, 400);
    return NextResponse.json(errorBody, { status });
  }

  // Create banner
  const bannerData = {
    image_url: body.image_url,
    title: body.title,
    subtitle: body.subtitle || null,
    is_active: body.is_active !== false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await bannersDb.create(bannerData);

  if (error) {
    const { status, body: errorBody } = errorResponse(error, 500);
    return NextResponse.json(errorBody, { status });
  }

  const { status, body: responseBody } = successResponse(data, 201);
  return NextResponse.json(responseBody, { status });
};

const handler = async (req) => {
  if (req.method === "GET") {
    return handleGet(req, req.user);
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

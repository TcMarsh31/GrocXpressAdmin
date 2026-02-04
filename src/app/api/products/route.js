/**
 * GET /api/products - List products with pagination and filters
 * POST /api/products - Create a new product (admin only)
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
import { productsDb } from "@/lib/api/db";

const handleGet = async (req) => {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, parseInt(searchParams.get("limit") || "20"));
  const categoryId = searchParams.get("categoryId");
  const search = searchParams.get("search");
  const featured = searchParams.get("featured") === "true";

  const filters = {};
  if (categoryId) filters.categoryId = categoryId;
  if (search) filters.search = search;
  if (featured) filters.featured = featured;

  const { data, error, total } = await productsDb.getAll(page, limit, filters);

  if (error) {
    const { status, body } = errorResponse(error, 500);
    return NextResponse.json(body, { status });
  }

  const { status, body } = paginatedResponse(data, page, limit, total);
  return NextResponse.json(body, { status });
};

const handlePost = async (req) => {
  const body = await req.json();

  // Validate input
  const validator = createValidator(body);
  validator
    .string("product_name", { required: true, min: 1, max: 255 })
    .string("description", { max: 2000 })
    .number("price", { required: true, min: 0 })
    .number("stock", { required: true, min: 0 })
    .string("category_id", { required: true })
    .string("image_url", { required: true, max: 500 })
    .string("weight", { max: 100 })
    .string("badge", { max: 100 })
    .number("rating", { min: 0, max: 5 })
    .number("review_count", { min: 0 })
    .string("background_color", { max: 50 });

  if (!validator.isValid()) {
    console.log("Validation errors:", validator.getErrors());
    const { status, body: errorBody } = errorResponse(validator, 400);
    return NextResponse.json(errorBody, { status });
  }

  // Create product
  const productData = {
    product_name: body.product_name,
    description: body.description || null,
    price: body.price,
    unit: body.stock,
    category_id: body.category_id,
    image_url: body.image_url,
    weight: body.weight || null,
    badge: body.badge || null,
    rating: body.rating || 0,
    review_count: body.review_count || 0,
    background_color: body.background_color || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await productsDb.create(productData);

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

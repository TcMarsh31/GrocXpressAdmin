/**
 * GET /api/products/[id] - Get product by ID
 * PUT /api/products/[id] - Update product (admin only)
 * DELETE /api/products/[id] - Delete product (admin only)
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
import { productsDb } from "@/lib/api/db";
import { ApiError } from "@/lib/api/error-handler";

const handleGet = async (req, { params }) => {
  const { id } = await params;

  const { data, error } = await productsDb.getById(id);

  if (error || !data) {
    const { status, body } = errorResponse(
      new ApiError("Product not found", 404, "NOT_FOUND"),
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
    .string("description", { max: 2000 })
    .number("price", { min: 0 })
    .number("stock", { min: 0 })
    .string("category_id", {})
    .string("image_url", { max: 500 })
    .boolean("is_featured", {});

  if (!validator.isValid()) {
    const { status, body: errorBody } = errorResponse(validator, 400);
    return NextResponse.json(errorBody, { status });
  }

  // Update product
  const productData = {};
  if (body.product_name !== undefined)
    productData.product_name = body.product_name;
  if (body.description !== undefined)
    productData.description = body.description;
  if (body.price !== undefined) productData.price = body.price;
  if (body.stock !== undefined) productData.unit = body.stock;
  if (body.category_id !== undefined)
    productData.category_id = body.category_id;
  if (body.image_url !== undefined) productData.image_url = body.image_url;
  if (body.is_featured !== undefined)
    productData.is_featured = body.is_featured;
  productData.updated_at = new Date().toISOString();

  const { data, error } = await productsDb.update(id, productData);

  if (error || !data) {
    const { status, body: errorBody } = errorResponse(
      new ApiError("Product not found", 404, "NOT_FOUND"),
      404,
    );
    return NextResponse.json(errorBody, { status });
  }

  const { status, body: responseBody } = successResponse(data);
  return NextResponse.json(responseBody, { status });
};

const handleDelete = async (req, { params }) => {
  const { id } = await params;

  const { error } = await productsDb.delete(id);

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

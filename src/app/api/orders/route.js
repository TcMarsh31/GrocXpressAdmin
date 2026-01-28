/**
 * GET /api/orders - List orders with pagination
 * POST /api/orders - Create a new order
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
import { requireAuth } from "@/lib/api/auth";
import { ordersDb, orderItemsDb } from "@/lib/api/db";

const handleGet = async (req) => {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, parseInt(searchParams.get("limit") || "20"));
  const userId = searchParams.get("userId");

  const filters = {};
  if (userId) filters.userId = userId;

  const { data, error, total } = await ordersDb.getAll(page, limit, filters);

  if (error) {
    const { status: statusCode, body } = errorResponse(error, 500);
    return NextResponse.json(body, { status: statusCode });
  }

  const { status: statusCode, body } = paginatedResponse(
    data,
    page,
    limit,
    total,
  );
  return NextResponse.json(body, { status: statusCode });
};

const handlePost = async (req) => {
  const body = await req.json();

  // Validate input
  const validator = createValidator(body);
  validator
    .string("user_id", {})
    .array("items", { required: true, minItems: 1 })
    .number("total_amount", { required: true, min: 0 })
    .number("item_count", { required: true, min: 1 });

  if (!validator.isValid()) {
    const { status, body: errorBody } = errorResponse(validator, 400);
    return NextResponse.json(errorBody, { status });
  }

  // Create order with unique order number
  const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  const orderData = {
    order_number: orderNumber,
    user_id: body.user_id || null,
    item_count: body.item_count,
    total_amount: body.total_amount,
    placed_date: new Date().toISOString(),
    order_placed_date: new Date().toISOString(),
    order_confirmed_date: null,
    order_shipped_date: null,
    out_for_delivery_date: null,
    order_delivered_date: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await ordersDb.create(orderData);

  if (error) {
    const { status, body: errorBody } = errorResponse(error, 500);
    return NextResponse.json(errorBody, { status });
  }

  // Create order items if provided
  if (body.items && body.items.length > 0) {
    const orderItems = body.items.map((item) => ({
      order_id: data.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
      created_at: new Date().toISOString(),
    }));

    const { error: itemsError } = await orderItemsDb.createBatch(orderItems);

    if (itemsError) {
      // Log the error but don't fail the order creation
      console.error("Failed to create order items:", itemsError);
    }
  }

  const { status, body: responseBody } = successResponse(data, 201);
  return NextResponse.json(responseBody, { status });
};

const handler = async (req) => {
  if (req.method === "GET") {
    return handleGet(req);
  }
  if (req.method === "POST") {
    return await requireAuth(handlePost)(req);
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

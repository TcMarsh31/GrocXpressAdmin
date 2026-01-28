/**
 * GET /api/order-items?orderId=... - Get order items for an order
 * POST /api/order-items - Create a new order item
 */

import { NextResponse } from "next/server";
import { createValidator } from "@/lib/api/validation";
import {
  successResponse,
  errorResponse,
  withErrorHandling,
} from "@/lib/api/error-handler";
import { withCors } from "@/lib/api/cors";
import { orderItemsDb } from "@/lib/api/db";

const handleGet = async (req) => {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId");

  if (!orderId) {
    const { status, body } = errorResponse(
      { message: "orderId query parameter is required" },
      400,
    );
    return NextResponse.json(body, { status });
  }

  const { data, error } = await orderItemsDb.getByOrderId(orderId);

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
    .string("order_id", { required: true })
    .string("product_id", { required: true })
    .number("quantity", { required: true, min: 1 })
    .number("price", { required: true, min: 0 });

  if (!validator.isValid()) {
    const { status, body: errorBody } = errorResponse(validator, 400);
    return NextResponse.json(errorBody, { status });
  }

  // Create order item
  const itemData = {
    order_id: body.order_id,
    product_id: body.product_id,
    quantity: body.quantity,
    price: body.price,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await orderItemsDb.create(itemData);

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
    return handlePost(req);
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

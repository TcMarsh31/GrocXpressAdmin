/**
 * GET /api/order-items/[id] - Get a specific order item
 * PUT /api/order-items/[id] - Update an order item
 * DELETE /api/order-items/[id] - Delete an order item
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

const handleGet = async (req, { params }) => {
  const { id } = await params;

  const { data, error } = await orderItemsDb.getByOrderId(id);

  if (error) {
    const { status, body } = errorResponse(error, 500);
    return NextResponse.json(body, { status });
  }

  if (!data || data.length === 0) {
    const { status, body } = errorResponse(
      { message: "Order item not found" },
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
  validator.number("quantity", { min: 1 }).number("price", { min: 0 });

  if (!validator.isValid()) {
    const { status, body: errorBody } = errorResponse(validator, 400);
    return NextResponse.json(errorBody, { status });
  }

  const updateData = {};
  if (body.quantity !== undefined) updateData.quantity = body.quantity;
  if (body.price !== undefined) updateData.price = body.price;

  const { data, error } = await orderItemsDb.update(id, updateData);

  if (error) {
    const { status, body: errorBody } = errorResponse(error, 500);
    return NextResponse.json(errorBody, { status });
  }

  const { status, body: responseBody } = successResponse(data);
  return NextResponse.json(responseBody, { status });
};

const handleDelete = async (req, { params }) => {
  const { id } = await params;

  const { error } = await orderItemsDb.delete(id);

  if (error) {
    const { status, body } = errorResponse(error, 500);
    return NextResponse.json(body, { status });
  }

  const { status, body } = successResponse({ message: "Order item deleted" });
  return NextResponse.json(body, { status });
};

const handler = async (req, context) => {
  if (req.method === "GET") {
    return handleGet(req, context);
  }
  if (req.method === "PUT") {
    return handlePut(req, context);
  }
  if (req.method === "DELETE") {
    return handleDelete(req, context);
  }
  return NextResponse.json(
    {
      success: false,
      error: { code: "METHOD_NOT_ALLOWED", message: "Method not allowed" },
    },
    { status: 405 },
  );
};

export const GET = withErrorHandling((req, context) =>
  withCors(() => handler(req, context))(req),
);
export const PUT = withErrorHandling((req, context) =>
  withCors(() => handler(req, context))(req),
);
export const DELETE = withErrorHandling((req, context) =>
  withCors(() => handler(req, context))(req),
);
export const OPTIONS = (req) => withCors(async () => new Response())(req);

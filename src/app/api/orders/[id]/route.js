/**
 * GET /api/orders/[id] - Get order by ID
 * PUT /api/orders/[id] - Update order (admin only)
 */

import { NextResponse } from "next/server";
import { createValidator } from "@/lib/api/validation";
import {
  successResponse,
  errorResponse,
  withErrorHandling,
} from "@/lib/api/error-handler";
import { withCors } from "@/lib/api/cors";
import { requireAuth, requireAdmin } from "@/lib/api/auth";
import { ordersDb } from "@/lib/api/db";

const handleGet = async (req, { params }) => {
  const { id } = await params;

  const { data, error } = await ordersDb.getById(id);

  if (error) {
    const { status, body } = errorResponse(error, 500);
    return NextResponse.json(body, { status });
  }

  if (!data) {
    const { status, body } = errorResponse({ message: "Order not found" }, 404);
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
    .number("item_count", { min: 1 })
    .number("total_amount", { min: 0 })
    .string("order_confirmed_date", {})
    .string("order_shipped_date", {})
    .string("out_for_delivery_date", {})
    .string("order_delivered_date", {});

  if (!validator.isValid()) {
    const { status, body: errorBody } = errorResponse(validator, 400);
    return NextResponse.json(errorBody, { status });
  }

  // Build update data
  const updateData = {};
  if (body.item_count !== undefined) updateData.item_count = body.item_count;
  if (body.total_amount !== undefined)
    updateData.total_amount = body.total_amount;
  if (body.order_confirmed_date !== undefined)
    updateData.order_confirmed_date = body.order_confirmed_date;
  if (body.order_shipped_date !== undefined)
    updateData.order_shipped_date = body.order_shipped_date;
  if (body.out_for_delivery_date !== undefined)
    updateData.out_for_delivery_date = body.out_for_delivery_date;
  if (body.order_delivered_date !== undefined)
    updateData.order_delivered_date = body.order_delivered_date;

  const { data, error } = await ordersDb.update(id, updateData);

  if (error) {
    const { status, body: errorBody } = errorResponse(error, 500);
    return NextResponse.json(errorBody, { status });
  }

  if (!data) {
    const { status, body: errorBody } = errorResponse(
      { message: "Order not found" },
      404,
    );
    return NextResponse.json(errorBody, { status });
  }

  const { status, body: responseBody } = successResponse(data);
  return NextResponse.json(responseBody, { status });
};

const handler = async (req, context) => {
  if (req.method === "GET") {
    return await requireAuth(async (r) => handleGet(r, context))(req);
  }
  if (req.method === "PUT") {
    return await requireAdmin(async (r) => handlePut(r, context))(req);
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
export const OPTIONS = (req) => withCors(async () => new Response())(req);

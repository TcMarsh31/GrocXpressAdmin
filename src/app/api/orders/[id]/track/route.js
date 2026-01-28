/**
 * GET /api/orders/[id]/track - Get order tracking information
 * PUT /api/orders/[id]/track - Update order delivery status (admin only)
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
import { ordersDb } from "@/lib/api/db";

const handleGet = async (req, { params }) => {
  const { id } = await params;

  const { data, error } = await ordersDb.getTracking(id);

  if (error) {
    const { status, body } = errorResponse(error, 500);
    return NextResponse.json(body, { status });
  }

  if (!data) {
    const { status, body } = errorResponse({ message: "Order not found" }, 404);
    return NextResponse.json(body, { status });
  }

  // Build timeline from delivery dates
  const timeline = [];
  if (data.order_placed_date) {
    timeline.push({
      status: "placed",
      label: "Order Placed",
      timestamp: data.order_placed_date,
    });
  }
  if (data.order_confirmed_date) {
    timeline.push({
      status: "confirmed",
      label: "Order Confirmed",
      timestamp: data.order_confirmed_date,
    });
  }
  if (data.order_shipped_date) {
    timeline.push({
      status: "shipped",
      label: "Order Shipped",
      timestamp: data.order_shipped_date,
    });
  }
  if (data.out_for_delivery_date) {
    timeline.push({
      status: "out_for_delivery",
      label: "Out for Delivery",
      timestamp: data.out_for_delivery_date,
    });
  }
  if (data.order_delivered_date) {
    timeline.push({
      status: "delivered",
      label: "Delivered",
      timestamp: data.order_delivered_date,
    });
  }

  const { status, body } = successResponse({
    orderId: data.id,
    orderNumber: data.order_number,
    timeline,
  });
  return NextResponse.json(body, { status });
};

const handlePut = async (req, { params }) => {
  const { id } = await params;
  const body = await req.json();

  // Validate input
  const validator = createValidator(body);
  validator
    .string("order_confirmed_date", {})
    .string("order_shipped_date", {})
    .string("out_for_delivery_date", {})
    .string("order_delivered_date", {});

  if (!validator.isValid()) {
    const { status, body: errorBody } = errorResponse(validator, 400);
    return NextResponse.json(errorBody, { status });
  }

  const updateData = {};
  if (body.order_confirmed_date !== undefined) {
    updateData.order_confirmed_date = body.order_confirmed_date;
  }
  if (body.order_shipped_date !== undefined) {
    updateData.order_shipped_date = body.order_shipped_date;
  }
  if (body.out_for_delivery_date !== undefined) {
    updateData.out_for_delivery_date = body.out_for_delivery_date;
  }
  if (body.order_delivered_date !== undefined) {
    updateData.order_delivered_date = body.order_delivered_date;
  }

  const { data, error } = await ordersDb.updateDeliveryStatus(id, updateData);

  if (error) {
    const { status, body: errorBody } = errorResponse(error, 500);
    return NextResponse.json(errorBody, { status });
  }

  const { status, body: responseBody } = successResponse(data);
  return NextResponse.json(responseBody, { status });
};

const handler = async (req, context) => {
  if (req.method === "GET") {
    return handleGet(req, context);
  }
  if (req.method === "PUT") {
    return await requireAdmin(async () => handlePut(req, context))(req);
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

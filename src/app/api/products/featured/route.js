/**
 * GET /api/products/featured - Get featured products
 */

import { NextResponse } from "next/server";
import {
  successResponse,
  errorResponse,
  withErrorHandling,
} from "@/lib/api/error-handler";
import { withCors } from "@/lib/api/cors";
import { productsDb } from "@/lib/api/db";

const handler = async (req) => {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(50, parseInt(searchParams.get("limit") || "10"));

  const { data, error } = await productsDb.getFeatured(limit);

  if (error) {
    const { status, body } = errorResponse(error, 500);
    return NextResponse.json(body, { status });
  }

  const { status, body } = successResponse(data);
  return NextResponse.json(body, { status });
};

export const GET = withErrorHandling(handler);
export const OPTIONS = (req) => withCors(async () => new Response())(req);

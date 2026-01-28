/**
 * GET /api/products/category/[categoryId] - Get products by category
 */

import { NextResponse } from "next/server";
import {
  paginatedResponse,
  errorResponse,
  withErrorHandling,
} from "@/lib/api/error-handler";
import { withCors } from "@/lib/api/cors";
import { productsDb } from "@/lib/api/db";

const handler = async (req, { params }) => {
  const { categoryId } = await params;
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, parseInt(searchParams.get("limit") || "20"));

  const { data, error, total } = await productsDb.getByCategory(
    categoryId,
    page,
    limit,
  );

  if (error) {
    const { status, body } = errorResponse(error, 500);
    return NextResponse.json(body, { status });
  }

  const { status, body } = paginatedResponse(data, page, limit, total);
  return NextResponse.json(body, { status });
};

export const GET = withErrorHandling(handler);
export const OPTIONS = (req) => withCors(async () => new Response())(req);

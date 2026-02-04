import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function middleware(req) {
  const res = NextResponse.next();

  const supabase = await createClient(cookies());

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = req.nextUrl.pathname;

  console.log("SSSSSSSSSSSSSSSSSSSS", session);

  // Match /[locale]/dashboard/*
  const isDashboardRoute = pathname.startsWith("/admin");

  if (isDashboardRoute && !session) {
    const locale = pathname.split("/")[1];
    return NextResponse.redirect(new URL(`/${locale}/login`, req.url));
  }

  return res;
}

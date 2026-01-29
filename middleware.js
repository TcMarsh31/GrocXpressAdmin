import { NextResponse } from "next/server";

// Lightweight middleware: if a request targets /admin and there is no
// Supabase session cookie, redirect to /admin/login early. The server
// layout still enforces role checks.
export function middleware(req) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/admin")) return NextResponse.next();

  // -- DEV: log and detect repeated requests to /admin/login --
  if (pathname === "/admin/login") {
    try {
      if (process.env.NODE_ENV !== "production") {
        const ua = req.headers.get("user-agent") || "-";
        const referer = req.headers.get("referer") || "-";
        const secFetchSite = req.headers.get("sec-fetch-site") || "-";
        const secFetchMode = req.headers.get("sec-fetch-mode") || "-";
        const purpose = req.headers.get("purpose") || "-";
        const xff = req.headers.get("x-forwarded-for") || "-";

        // keep a short-lived in-memory sliding-window of timestamps per signature
        const sig = `${ua}|${referer}`;
        const map =
          globalThis.__devAdminLoginMap ||
          (globalThis.__devAdminLoginMap = new Map());
        const now = Date.now();
        const windowMs = 5000; // 5s
        const limit = 12; // requests per window allowed
        const arr = (map.get(sig) || []).filter((t) => now - t < windowMs);
        arr.push(now);
        map.set(sig, arr);

        console.log(
          "[dev-middleware] /admin/login hit — sig:",
          sig,
          "count:",
          arr.length,
          "ua:",
          ua,
          "ref:",
          referer,
          "sec-fetch-site:",
          secFetchSite,
          "sec-fetch-mode:",
          secFetchMode,
          "purpose:",
          purpose,
          "xff:",
          xff,
        );

        if (arr.length > limit) {
          return new NextResponse(
            JSON.stringify({
              success: false,
              message: "Rate limit (dev) — too many /admin/login requests",
            }),
            {
              status: 429,
              headers: {
                "content-type": "application/json",
                "retry-after": "5",
              },
            },
          );
        }
      }
    } catch (err) {
      // best-effort logging — don't block the request on errors
      console.warn("[dev-middleware] logging failed", err);
    }

    // allow the actual login page to render
    return NextResponse.next();
  }

  // allow public assets & API calls under /admin
  if (pathname.startsWith("/admin/_next") || pathname.includes("/api/")) {
    return NextResponse.next();
  }

  const cookieNames = ["sb:token", "sb-access-token", "supabase-auth-token"];
  const hasCookie = cookieNames.some((n) => !!req.cookies.get(n));
  if (!hasCookie) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

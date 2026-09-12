import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/constants";

const PROTECTED = ["/orders", "/account", "/checkout"];

/**
 * Presence check only. The signature is verified server-side on every protected page
 * via getUser() — middleware runs on the edge without the signing key and must not be
 * the only thing standing between a forged cookie and someone's order history.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!PROTECTED.some((p) => pathname.startsWith(p))) return NextResponse.next();
  if (request.cookies.has(SESSION_COOKIE)) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = "/signin";
  url.search = `?next=${encodeURIComponent(pathname)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/orders/:path*", "/account/:path*", "/checkout/:path*"],
};

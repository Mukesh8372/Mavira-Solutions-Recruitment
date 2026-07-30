import { NextResponse, type NextRequest } from "next/server";

/**
 * Route guards (Next 16 proxy — successor to middleware.ts, Node runtime).
 * This is a fast redirect layer only: real authorization is re-checked
 * server-side in each dashboard layout and every server action.
 */
const protectedPrefixes = ["/dashboard", "/employer", "/admin"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!protectedPrefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }
  const hasSession =
    request.cookies.has("authjs.session-token") || request.cookies.has("__Secure-authjs.session-token");
  if (!hasSession) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/employer/:path*", "/admin/:path*"],
};

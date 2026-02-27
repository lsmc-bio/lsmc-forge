import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  if (!req.auth && req.nextUrl.pathname !== "/login") {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.href);
    return NextResponse.redirect(loginUrl);
  }
});

export const config = {
  matcher: [
    // Protect everything except: API auth routes, static files, images, favicon, login page
    "/((?!api/auth|_next/static|_next/image|favicon\\.ico|brand/|bed-viz-app/|login).*)",
  ],
};

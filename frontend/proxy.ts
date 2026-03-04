import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getCurrentUser } from "./lib/api";

const publicRoutes = ["/login", "/signup"];

export async function proxy(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const { pathname } = request.nextUrl;

  const isPublic = publicRoutes.some((route) => pathname.startsWith(route));

  // ...existing code...
  const user = token ? await getCurrentUser(token).catch(() => null) : null;

  if (isPublic && user)
    return NextResponse.redirect(new URL("/dashboard", request.url));

  if (isPublic) return NextResponse.next();

  if (!user) return NextResponse.redirect(new URL("/login", request.url));

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/login", "/signup", "/about/:path*", "/dashboard/:path*"],
};

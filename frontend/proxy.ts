import { NextResponse, type NextRequest } from "next/server";
import { createClient as createSupabaseServerClient } from "@/lib/supabase";

const publicRoutes = ["/login", "/signup"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = publicRoutes.some((route) => pathname.startsWith(route));
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  console.log({ user });

  // Redirect non-authenticated users away from protected routes
  if (isPublic && user)
    return NextResponse.redirect(new URL("/dashboard", request.url));

  if (isPublic) return NextResponse.next();

  if (!user) return NextResponse.redirect(new URL("/login", request.url));

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/signup", "/about/:path*", "/dashboard/:path*"],
};

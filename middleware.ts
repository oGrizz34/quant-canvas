import { type NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  // 1. Create an empty response (we will modify it if needed)
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 2. Initialize the Supabase Client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  // 3. Check if the user is logged in
  const { data: { user } } = await supabase.auth.getUser();

  // 4. Define Protected Routes
  // If user is NOT logged in, and tries to visit these paths...
  if (!user && (
      request.nextUrl.pathname.startsWith("/dashboard") || 
      request.nextUrl.pathname.startsWith("/settings") || 
      request.nextUrl.pathname.startsWith("/strategy")
  )) {
    // ...Bounce them to Login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 5. Define Auth Routes (Login/Signup)
  // If user IS logged in, and tries to visit Login...
  if (user && request.nextUrl.pathname.startsWith("/login")) {
    // ...Bounce them to Dashboard (No need to login twice)
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

// Configuration: Only run this middleware on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
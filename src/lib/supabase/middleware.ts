import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = { name: string; value: string; options?: CookieOptions };

// Routes that require a session. Page-level requireUser() is the second line of defense.
function isProtected(pathname: string): boolean {
  if (
    pathname === "/wishlist" ||
    pathname.startsWith("/wishlist/") ||
    pathname === "/itineraries" ||
    pathname.startsWith("/itineraries/") ||
    pathname === "/profile" ||
    pathname.startsWith("/profile/") ||
    pathname === "/journal/new"
  ) {
    return true;
  }
  // /journal/[slug]/edit
  return /^\/journal\/[^/]+\/edit\/?$/.test(pathname);
}

// Refreshes the Supabase auth session cookie on navigation and redirects anonymous users
// away from protected routes (see isProtected). When Supabase env is not configured this
// returns early and lets the request through; page-level requireUser() still guards.
export async function updateSession(
  request: NextRequest,
): Promise<NextResponse> {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return supabaseResponse;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // IMPORTANT: getUser() refreshes the token and writes updated cookies.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Gate protected routes: redirect anonymous users to sign-in with returnTo.
  if (!user && isProtected(request.nextUrl.pathname)) {
    const signInUrl = request.nextUrl.clone();
    signInUrl.pathname = "/auth/sign-in";
    signInUrl.search = "";
    signInUrl.searchParams.set(
      "returnTo",
      request.nextUrl.pathname + request.nextUrl.search,
    );
    return NextResponse.redirect(signInUrl);
  }

  return supabaseResponse;
}

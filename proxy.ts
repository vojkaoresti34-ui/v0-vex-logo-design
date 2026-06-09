import { NextRequest, NextResponse } from "next/server";

const isAdminRoute = (path: string) => path.startsWith("/admin");
const isAppRoute = (path: string) => path.startsWith("/app");
const isAuthRoute = (path: string) =>
  path.startsWith("/login") || path.startsWith("/signup");

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const sessionToken = req.cookies.get("sessionToken")?.value;

  // Redirect authenticated users away from login/signup
  if (sessionToken && isAuthRoute(pathname)) {
    return NextResponse.redirect(new URL("/app", req.url));
  }

  // Protect /app and /admin — redirect unauthenticated users to /login,
  // preserving where they were headed so login can send them back.
  if ((isAppRoute(pathname) || isAdminRoute(pathname)) && !sessionToken) {
    const url = new URL("/login", req.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    "/(api|trpc)(.*)",
  ],
};

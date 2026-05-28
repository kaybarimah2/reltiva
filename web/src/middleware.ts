import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  const isAuthPage = pathname.startsWith("/auth/login") || pathname.startsWith("/auth/register");
  const isDashboardPage = pathname.startsWith("/dashboard");

  if (isDashboardPage) {
    if (!token) {
      const loginUrl = new URL("/auth/login", req.url);
      loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    const role = (token.role as string) || "BUYER";
    const isBuyerDashboard = pathname.startsWith("/dashboard/buyer");
    const isAgentDashboard = pathname.startsWith("/dashboard/agent");
    const isAdminDashboard = pathname.startsWith("/dashboard/admin");

    if (isBuyerDashboard && role !== "BUYER") {
      return NextResponse.redirect(new URL(getDashboardRoute(role), req.url));
    }
    if (isAgentDashboard && role !== "AGENT") {
      return NextResponse.redirect(new URL(getDashboardRoute(role), req.url));
    }
    if (isAdminDashboard && role !== "ADMIN") {
      return NextResponse.redirect(new URL(getDashboardRoute(role), req.url));
    }

    // Redirect general "/dashboard" access to the role-specific dashboard
    if (pathname === "/dashboard" || pathname === "/dashboard/") {
      return NextResponse.redirect(new URL(getDashboardRoute(role), req.url));
    }
  }

  if (isAuthPage) {
    if (token) {
      const role = (token.role as string) || "BUYER";
      return NextResponse.redirect(new URL(getDashboardRoute(role), req.url));
    }
  }

  return NextResponse.next();
}

function getDashboardRoute(role: string): string {
  switch (role) {
    case "ADMIN":
      return "/dashboard/admin";
    case "AGENT":
      return "/dashboard/agent";
    case "BUYER":
    default:
      return "/dashboard/buyer";
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/login", "/auth/register"],
};

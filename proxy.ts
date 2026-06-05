import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  const isDashboard = pathname.startsWith("/dashboard");
  const isBackoffice = pathname.startsWith("/backoffice");
  const isSeller = pathname.startsWith("/seller");
  const adminOnlyDashboardRoutes = [
    "/dashboard/sellers",
    "/dashboard/customers",
    "/dashboard/markets",
    "/dashboard/hsn",
  ];
  const sellerDashboardRoutes = [
    "/dashboard/products",
    "/dashboard/orders",
    "/dashboard/sales",
    "/dashboard/profile",
  ];

  // 🔒 Not logged in → redirect to login
  if ((isDashboard || isBackoffice || isSeller) && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isBackoffice && role !== "ADMIN" && role !== "SELLER") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (
    adminOnlyDashboardRoutes.some((route) => pathname.startsWith(route)) &&
    role !== "ADMIN"
  ) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (
    sellerDashboardRoutes.some((route) => pathname.startsWith(route)) &&
    role !== "ADMIN" &&
    role !== "SELLER"
  ) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // 🔐 Seller only routes
  if (isSeller && role !== "SELLER") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/backoffice/:path*", "/seller/:path*"],
};

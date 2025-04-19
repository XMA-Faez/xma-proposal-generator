import { auth } from "@/auth";

export default auth((req) => {
  // If user is trying to access admin routes without admin privileges, redirect to login
  const isAdminRoute =
    req.nextUrl.pathname.startsWith("/proposal-generator") ||
    req.nextUrl.pathname.startsWith("/proposals");

  const isAdminUser = req.auth?.user && req.auth.user.role === "admin";

  // Protect admin routes
  if (isAdminRoute && !isAdminUser) {
    return Response.redirect(new URL("/login", req.nextUrl.origin));
  }

  // Redirect authenticated users from login page to admin dashboard
  if (req.nextUrl.pathname === "/login" && req.auth) {
    return Response.redirect(
      new URL("/proposal-generator", req.nextUrl.origin),
    );
  }
});

// Specify which paths the middleware should run on
export const config = {
  matcher: ["/proposal-generator/:path*", "/proposals/:path*", "/login"],
};

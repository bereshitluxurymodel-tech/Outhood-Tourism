import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// This middleware is a coarse first gate (keeps unauthenticated/wrong-role
// users off entire route trees). It is NOT a substitute for the per-resource
// ownership checks inside each API route/service call — see
// docs/security.md for why both layers are required.
export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    if (path.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    const isSupplierPortalPath = path.startsWith("/supplier") && !path.startsWith("/supplier/apply");
    if (isSupplierPortalPath && !["SUPPLIER", "ADMIN"].includes(token?.role as string)) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      // /supplier/apply is deliberately public: someone applying to BECOME
      // a supplier does not have the SUPPLIER role yet, so it must not
      // require login or role membership. Everything else matched below
      // still requires an authenticated session.
      authorized: ({ token, req }) => {
        if (req.nextUrl.pathname.startsWith("/supplier/apply")) return true;
        return !!token;
      },
    },
  }
);

// Note: /supplier/apply is intentionally NOT protected — see the callback
// above. Only the supplier PORTAL (dashboard, listings, bookings) needs
// auth, so those get their own explicit paths rather than matching all of
// /supplier/:path* once more sub-routes exist.
export const config = {
  matcher: ["/admin/:path*", "/supplier/:path*", "/dashboard/:path*"],
};

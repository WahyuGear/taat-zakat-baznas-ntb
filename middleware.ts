import { NextRequest, NextResponse } from "next/server";
import { verifyTokenEdge } from "@/lib/auth/jwt-edge";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("token")?.value;

  // ================================
  // HALAMAN ADMIN
  // ================================

  if (pathname.startsWith("/admin")) {
    // Login admin tidak membutuhkan token
    if (pathname === "/admin/login") {
      if (token) {
        const user = await verifyTokenEdge(token);

        if (user) {
          return NextResponse.redirect(
            new URL("/admin", request.url)
          );
        }
      }

      return NextResponse.next();
    }

    // Semua halaman admin wajib login
    if (!token) {
      return NextResponse.redirect(
        new URL("/admin/login", request.url)
      );
    }

    const user = await verifyTokenEdge(token);

    // Token tidak valid / expired
    if (!user) {
      const response = NextResponse.redirect(
        new URL("/admin/login", request.url)
      );

      response.cookies.delete("token");

      return response;
    }

    // Donatur tidak boleh masuk dashboard admin
    if (
      user.role !== "ADMIN" &&
      user.role !== "SUPER_ADMIN"
    ) {
      return NextResponse.redirect(
        new URL("/", request.url)
      );
    }

    // ================================
    // KHUSUS SUPER ADMIN
    // ================================

    if (pathname.startsWith("/admin/users")) {
      if (user.role !== "SUPER_ADMIN") {
        return NextResponse.redirect(
          new URL("/admin", request.url)
        );
      }
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
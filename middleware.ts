import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ambil token dari cookie
  const token = request.cookies.get("token")?.value;

  // ================================
  // HALAMAN ADMIN
  // ================================

  if (pathname.startsWith("/admin")) {
    // Halaman login tidak perlu token
    if (pathname === "/admin/login") {
      // Kalau sudah login, jangan kembali ke login
      if (token) {
        const user = verifyToken(token);

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

    const user = verifyToken(token);

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
    // AREA KHUSUS SUPER ADMIN
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
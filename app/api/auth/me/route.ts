import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth/jwt";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    // Tidak ada token
    if (!token) {
      return NextResponse.json(
        {
          authenticated: false,
          user: null,
          message: "Token tidak ditemukan",
        },
        { status: 401 }
      );
    }

    // Verifikasi token
    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        {
          authenticated: false,
          user: null,
          message: "Token tidak valid",
        },
        { status: 401 }
      );
    }

    // Pastikan ID valid
    const userId = Number(payload.id);

    if (!Number.isInteger(userId) || userId <= 0) {
      console.error("INVALID USER ID:", payload.id);

      return NextResponse.json(
        {
          authenticated: false,
          user: null,
          message: "ID user tidak valid",
        },
        { status: 401 }
      );
    }

    // Ambil data TERBARU dari database
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        role: true,
        npwz: true,
      },
    });

    if (!user) {
      console.error("USER NOT FOUND:", userId);

      return NextResponse.json(
        {
          authenticated: false,
          user: null,
          message: "User tidak ditemukan",
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        authenticated: true,
        user,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/auth/me ERROR:", error);

    return NextResponse.json(
      {
        authenticated: false,
        user: null,
        message: "Terjadi kesalahan server",
      },
      { status: 500 }
    );
  }
}
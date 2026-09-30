import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Token verifikasi tidak ditemukan",
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        emailVerificationToken: token,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Token verifikasi tidak valid",
        },
        { status: 400 }
      );
    }

    if (
      !user.emailVerificationExpires ||
      user.emailVerificationExpires < new Date()
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Token verifikasi sudah kedaluwarsa. Silakan minta email verifikasi baru.",
        },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Email berhasil diverifikasi",
    });
  } catch (error) {
    console.error("VERIFY EMAIL ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan server",
      },
      { status: 500 }
    );
  }
}
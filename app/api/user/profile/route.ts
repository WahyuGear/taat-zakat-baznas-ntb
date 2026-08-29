import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth/jwt";

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          message: "Silakan login terlebih dahulu",
        },
        {
          status: 401,
        }
      );
    }

    const user = verifyToken(token);

    if (!user) {
      return NextResponse.json(
        {
          message: "Session tidak valid",
        },
        {
          status: 401,
        }
      );
    }

    const body = await request.json();

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const phone =
      typeof body.phone === "string"
        ? body.phone.trim()
        : "";

    const image =
      typeof body.image === "string" &&
      body.image.trim() !== ""
        ? body.image.trim()
        : null;

    if (!name) {
      return NextResponse.json(
        {
          message: "Nama wajib diisi",
        },
        {
          status: 400,
        }
      );
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        name,
        phone: phone || null,
        image,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        role: true,
      },
    });

    return NextResponse.json({
      message: "Profil berhasil diperbarui",
      user: updatedUser,
    });

  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);

    return NextResponse.json(
      {
        message: "Gagal memperbarui profil",
      },
      {
        status: 500,
      }
    );
  }
}
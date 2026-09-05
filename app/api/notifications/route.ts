import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";
import { prisma } from "@/lib/prisma";

async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId: Number(currentUser.id),
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    const unreadCount = notifications.filter(
      (notification) => !notification.isRead
    ).length;

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("GET /api/notifications ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil notifikasi",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const userId = Number(currentUser.id);

    if (body.markAll === true) {
      await prisma.notification.updateMany({
        where: {
          userId,
          isRead: false,
        },
        data: {
          isRead: true,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Semua notifikasi ditandai sudah dibaca",
      });
    }

    if (body.id) {
      const notification = await prisma.notification.findFirst({
        where: {
          id: Number(body.id),
          userId,
        },
      });

      if (!notification) {
        return NextResponse.json(
          {
            success: false,
            message: "Notifikasi tidak ditemukan",
          },
          { status: 404 }
        );
      }

      await prisma.notification.update({
        where: {
          id: notification.id,
        },
        data: {
          isRead: true,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Notifikasi ditandai sudah dibaca",
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: "Data tidak valid",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("PATCH /api/notifications ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal memperbarui notifikasi",
      },
      { status: 500 }
    );
  }
}
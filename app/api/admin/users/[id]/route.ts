import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { verifyToken } from "@/lib/auth/jwt";
import { cookies } from "next/headers";

async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return null;
  }

  return verifyToken(token);
}

// GET DETAIL USER
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Belum login.",
        },
        { status: 401 }
      );
    }

    if (currentUser.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "Akses hanya untuk Super Admin.",
        },
        { status: 403 }
      );
    }

    const { id } = await params;
    const userId = Number(id);

    if (!Number.isInteger(userId)) {
      return NextResponse.json(
        {
          success: false,
          message: "ID user tidak valid.",
        },
        { status: 400 }
      );
    }

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
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            donations: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    if (
      user.role !== "ADMIN" &&
      user.role !== "SUPER_ADMIN"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Akun ini bukan akun administrator.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("GET ADMIN USER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data user.",
      },
      { status: 500 }
    );
  }
}

// UPDATE USER
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Belum login.",
        },
        { status: 401 }
      );
    }

    if (currentUser.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "Hanya Super Admin yang dapat mengubah akun.",
        },
        { status: 403 }
      );
    }

    const { id } = await params;
    const userId = Number(id);

    if (!Number.isInteger(userId)) {
      return NextResponse.json(
        {
          success: false,
          message: "ID user tidak valid.",
        },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    if (
      existingUser.role !== "ADMIN" &&
      existingUser.role !== "SUPER_ADMIN"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Akun ini bukan administrator.",
        },
        { status: 400 }
      );
    }

    const body = await req.json();

    const name =
      body.name !== undefined
        ? String(body.name).trim()
        : existingUser.name;

    const email =
      body.email !== undefined
        ? String(body.email).trim().toLowerCase()
        : existingUser.email;

    const phone =
      body.phone !== undefined
        ? String(body.phone).trim()
        : existingUser.phone;

    const role =
      body.role !== undefined
        ? String(body.role).trim()
        : existingUser.role;

    const isActive =
      body.isActive !== undefined
        ? Boolean(body.isActive)
        : existingUser.isActive;

    const password =
      body.password !== undefined
        ? String(body.password)
        : "";

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama wajib diisi.",
        },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message: "Email wajib diisi.",
        },
        { status: 400 }
      );
    }

    if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "Role tidak valid.",
        },
        { status: 400 }
      );
    }

    // Cek email jika email diganti
    if (email !== existingUser.email) {
      const emailOwner = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (emailOwner && emailOwner.id !== userId) {
        return NextResponse.json(
          {
            success: false,
            message: "Email sudah digunakan oleh akun lain.",
          },
          { status: 409 }
        );
      }
    }

    const data: {
      name: string;
      email: string;
      phone: string | null;
      role: "ADMIN" | "SUPER_ADMIN";
      isActive: boolean;
      password?: string;
    } = {
      name,
      email,
      phone: phone || null,
      role: role as "ADMIN" | "SUPER_ADMIN",
      isActive,
    };

    if (password) {
      if (password.length < 8) {
        return NextResponse.json(
          {
            success: false,
            message: "Password minimal 8 karakter.",
          },
          { status: 400 }
        );
      }

      data.password = await hashPassword(password);
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Akun berhasil diperbarui.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("UPDATE ADMIN USER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal memperbarui akun.",
      },
      { status: 500 }
    );
  }
}

// DELETE USER
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Belum login.",
        },
        { status: 401 }
      );
    }

    // HANYA SUPER ADMIN
    if (currentUser.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "Hanya Super Admin yang dapat menghapus akun.",
        },
        { status: 403 }
      );
    }

    const { id } = await params;
    const userId = Number(id);

    if (!Number.isInteger(userId)) {
      return NextResponse.json(
        {
          success: false,
          message: "ID user tidak valid.",
        },
        { status: 400 }
      );
    }

    // Tidak boleh menghapus diri sendiri
    if (userId === currentUser.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Anda tidak dapat menghapus akun sendiri.",
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        _count: {
          select: {
            donations: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    if (
      user.role !== "ADMIN" &&
      user.role !== "SUPER_ADMIN"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Akun ini bukan administrator.",
        },
        { status: 400 }
      );
    }

    // Kalau sudah punya donasi, TIDAK BOLEH DIHAPUS
    if (user._count.donations > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Akun tidak dapat dihapus karena sudah memiliki riwayat donasi. Gunakan Nonaktifkan.",
          donations: user._count.donations,
        },
        { status: 409 }
      );
    }

    await prisma.user.delete({
      where: {
        id: userId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Akun berhasil dihapus.",
    });
  } catch (error) {
    console.error("DELETE ADMIN USER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menghapus akun.",
      },
      { status: 500 }
    );
  }
}
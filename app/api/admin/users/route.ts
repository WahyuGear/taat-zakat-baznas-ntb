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

// GET
// Mengambil daftar ADMIN dan SUPER_ADMIN
export async function GET() {
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

    const users = await prisma.user.findMany({
      where: {
        role: {
          in: ["ADMIN", "SUPER_ADMIN"],
        },
      },
      orderBy: {
        createdAt: "desc",
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

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("GET ADMIN USERS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data admin.",
      },
      { status: 500 }
    );
  }
}

// POST
// Membuat ADMIN atau SUPER_ADMIN baru
export async function POST(req: NextRequest) {
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
          message: "Hanya Super Admin yang dapat membuat akun admin.",
        },
        { status: 403 }
      );
    }

    const body = await req.json();

    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "")
      .trim()
      .toLowerCase();
    const phone = String(body.phone ?? "").trim();
    const password = String(body.password ?? "");
    const role = String(body.role ?? "").trim();

    // Validasi nama
    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama wajib diisi.",
        },
        { status: 400 }
      );
    }

    // Validasi email
    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message: "Email wajib diisi.",
        },
        { status: 400 }
      );
    }

    // Validasi password
    if (!password || password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: "Password minimal 8 karakter.",
        },
        { status: 400 }
      );
    }

    // Hanya boleh ADMIN / SUPER_ADMIN
    if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "Role tidak valid.",
        },
        { status: 400 }
      );
    }

    // Cek email
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Email sudah digunakan.",
        },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        password: hashedPassword,
        role,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message:
          role === "SUPER_ADMIN"
            ? "Super Admin berhasil dibuat."
            : "Admin berhasil dibuat.",
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE ADMIN ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal membuat akun admin.",
      },
      { status: 500 }
    );
  }
}
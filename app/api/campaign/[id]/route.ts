import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const campaignId = Number(id);

    if (!Number.isInteger(campaignId)) {
      return NextResponse.json(
        { message: "ID campaign tidak valid" },
        { status: 400 }
      );
    }

    const campaign = await prisma.campaign.findUnique({
      where: {
        id: campaignId,
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { message: "Campaign tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(campaign);
  } catch (error) {
    console.error("GET CAMPAIGN ERROR:", error);

    return NextResponse.json(
      {
        message: "Gagal mengambil campaign",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const campaignId = Number(id);

    if (!Number.isInteger(campaignId)) {
      return NextResponse.json(
        { message: "ID campaign tidak valid" },
        { status: 400 }
      );
    }

    const body = await request.json();

    if (!body.title?.trim()) {
      return NextResponse.json(
        { message: "Judul campaign wajib diisi" },
        { status: 400 }
      );
    }

    if (!body.description?.trim()) {
      return NextResponse.json(
        { message: "Deskripsi campaign wajib diisi" },
        { status: 400 }
      );
    }

    if (!body.image) {
      return NextResponse.json(
        { message: "Gambar campaign wajib diisi" },
        { status: 400 }
      );
    }

    const target = Number(body.target);

    if (!Number.isFinite(target) || target <= 0) {
      return NextResponse.json(
        { message: "Target campaign tidak valid" },
        { status: 400 }
      );
    }

    const campaign = await prisma.campaign.update({
      where: {
        id: campaignId,
      },
      data: {
        title: body.title.trim(),
        description: body.description.trim(),
        image: body.image,
        target,
        category: body.category ?? "Sedekah",
        type: body.type ?? "GENERAL",
        isActive:
          typeof body.isActive === "boolean"
            ? body.isActive
            : true,
        featured:
          typeof body.featured === "boolean"
            ? body.featured
            : false,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Campaign berhasil diupdate",
      campaign,
    });
  } catch (error) {
    console.error("PUT CAMPAIGN ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengupdate campaign",
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // =========================
    // CEK LOGIN
    // =========================

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Anda harus login",
        },
        { status: 401 }
      );
    }

    const jwtUser = verifyToken(token);

    if (!jwtUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Token tidak valid",
        },
        { status: 401 }
      );
    }

    // =========================
    // DELETE HANYA SUPER_ADMIN
    // =========================

    if (jwtUser.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Hanya SUPER_ADMIN yang dapat menghapus campaign",
        },
        { status: 403 }
      );
    }

    // =========================
    // CEK ID CAMPAIGN
    // =========================

    const { id } = await params;
    const campaignId = Number(id);

    if (!Number.isInteger(campaignId)) {
      return NextResponse.json(
        {
          success: false,
          message: "ID campaign tidak valid",
        },
        { status: 400 }
      );
    }

    // =========================
    // CEK CAMPAIGN
    // =========================

    const campaign = await prisma.campaign.findUnique({
      where: {
        id: campaignId,
      },
    });

    if (!campaign) {
      return NextResponse.json(
        {
          success: false,
          message: "Campaign tidak ditemukan",
        },
        { status: 404 }
      );
    }

    // =========================
    // CEK TRANSAKSI / DONASI
    // =========================

    const donationCount = await prisma.donation.count({
      where: {
        campaignId,
      },
    });

    if (donationCount > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Campaign tidak dapat dihapus karena sudah memiliki transaksi donasi. Nonaktifkan campaign sebagai gantinya.",
        },
        { status: 409 }
      );
    }

    // =========================
    // DELETE
    // =========================

    await prisma.campaign.delete({
      where: {
        id: campaignId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Campaign berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE CAMPAIGN ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menghapus campaign",
      },
      { status: 500 }
    );
  }
}
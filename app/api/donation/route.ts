import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      donorName,
      email,
      phone,
      message,
      amount,
      campaignSlug,
    } = body;

    // =========================
    // VALIDASI CAMPAIGN
    // =========================

    const campaign = await prisma.campaign.findUnique({
      where: {
        slug: campaignSlug,
      },
    });

    if (!campaign) {
      return NextResponse.json(
        {
          message: "Campaign tidak ditemukan",
        },
        {
          status: 404,
        }
      );
    }

    // =========================
    // AMBIL USER DARI JWT
    // =========================

    const cookieStore = await cookies();

    const token = cookieStore.get("token")?.value;

    let userId: number | null = null;

    if (token) {
      const user = verifyToken(token);

      if (user) {
        userId = user.id;
      }
    }

    // =========================
    // VALIDASI NOMINAL
    // =========================

    const donationAmount = Number(amount);

    if (!Number.isFinite(donationAmount) || donationAmount <= 0) {
      return NextResponse.json(
        {
          message: "Nominal donasi tidak valid",
        },
        {
          status: 400,
        }
      );
    }

    // =========================
    // SIMPAN DONASI
    // + UPDATE CAMPAIGN
    // =========================

    const result = await prisma.$transaction(async (tx) => {
      const donation = await tx.donation.create({
        data: {
          donorName:
            typeof donorName === "string"
              ? donorName.trim()
              : "",

          email:
            typeof email === "string"
              ? email.trim()
              : null,

          phone:
            typeof phone === "string"
              ? phone.trim()
              : null,

          message:
            typeof message === "string"
              ? message.trim()
              : null,

          amount: donationAmount,

          campaignId: campaign.id,

          // User login sekarang disimpan dari JWT
          userId,
        },
      });

      // Update total campaign
      await tx.campaign.update({
        where: {
          id: campaign.id,
        },

        data: {
          collected: {
            increment: donationAmount,
          },
        },
      });

      return donation;
    });

    // =========================
    // RESPONSE
    // =========================

    return NextResponse.json({
      message: "Donasi berhasil dibuat",
      donation: result,
    });
  } catch (error) {
    console.error("DONATION API ERROR:", error);

    return NextResponse.json(
      {
        message: "Gagal membuat donasi",
      },
      {
        status: 500,
      }
    );
  }
}
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { cookies } from "next/headers";

import { verifyToken } from "@/lib/auth/jwt";

import midtransClient from "midtrans-client";

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
          success: false,
          message: "Campaign tidak ditemukan",
        },
        { status: 404 }
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

    if (
      !Number.isFinite(donationAmount) ||
      donationAmount <= 0 ||
      !Number.isInteger(donationAmount)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Nominal donasi tidak valid",
        },
        { status: 400 }
      );
    }

    // =========================
    // NORMALISASI DATA
    // =========================

    const cleanDonorName =
      typeof donorName === "string"
        ? donorName.trim()
        : "";

    const cleanEmail =
      typeof email === "string"
        ? email.trim()
        : "";

    const cleanPhone =
      typeof phone === "string"
        ? phone.trim()
        : "";

    const cleanMessage =
      typeof message === "string"
        ? message.trim()
        : "";

    if (!cleanDonorName) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama lengkap wajib diisi",
        },
        { status: 400 }
      );
    }

    if (!cleanEmail) {
      return NextResponse.json(
        {
          success: false,
          message: "Email wajib diisi",
        },
        { status: 400 }
      );
    }

    if (!process.env.MIDTRANS_SERVER_KEY) {
      return NextResponse.json(
        {
          success: false,
          message:
            "MIDTRANS_SERVER_KEY belum dikonfigurasi",
        },
        { status: 500 }
      );
    }

    // =========================
    // BUAT ORDER ID
    // =========================

    const orderId = `BAZNAS-${Date.now()}-${Math.floor(
      Math.random() * 1000
    )}`;

    // =========================
    // SIMPAN DONATION
    // STATUS = PENDING
    // =========================

    const donation = await prisma.donation.create({
      data: {
        donorName: cleanDonorName,
        email: cleanEmail,
        phone: cleanPhone,
        message: cleanMessage,
        amount: donationAmount,
        campaignId: campaign.id,
        userId,
        orderId,
        paymentStatus: "PENDING",
      },
    });

    // =========================
    // MIDTRANS SNAP
    // =========================

    const serverKey = process.env.MIDTRANS_SERVER_KEY;
const clientKey = process.env.MIDTRANS_CLIENT_KEY;

if (!serverKey || !clientKey) {
  return NextResponse.json(
    {
      success: false,
      message: "Konfigurasi Midtrans belum lengkap",
    },
    { status: 500 }
  );
}

const snap = new midtransClient.Snap({
  isProduction:
    process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey,
  clientKey,
});

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: donationAmount,
      },

      customer_details: {
        first_name: cleanDonorName,
        email: cleanEmail,
        phone: cleanPhone || undefined,
      },

      credit_card: {
        secure: true,
      },
    };

    const transaction =
      await snap.createTransaction(parameter);

    // =========================
    // SIMPAN SNAP TOKEN
    // =========================

    const updatedDonation =
      await prisma.donation.update({
        where: {
          id: donation.id,
        },

        data: {
          snapToken: transaction.token,
        },
      });

    // =========================
    // RESPONSE
    // =========================

    return NextResponse.json({
      success: true,
      message: "Transaksi berhasil dibuat",
      donation: updatedDonation,
      token: transaction.token,
      redirect_url: transaction.redirect_url,
    });
  } catch (error) {
    console.error(
      "DONATION MIDTRANS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Gagal membuat transaksi pembayaran",
      },
      { status: 500 }
    );
  }
}
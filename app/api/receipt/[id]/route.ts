import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { generateReceipt } from "@/lib/receipt/generate-receipt";

const zakatTypes = [
  "ZAKAT_PENGHASILAN",
  "ZAKAT_MAL",
  "ZAKAT_PERTANIAN",
  "ZAKAT_PETERNAKAN",
  "ZAKAT_PERDAGANGAN",
  "ZAKAT_FITRAH",
];

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const donationId = Number(id);

    if (!Number.isInteger(donationId) || donationId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "ID donasi tidak valid.",
        },
        { status: 400 }
      );
    }

    const donation = await prisma.donation.findUnique({
      where: {
        id: donationId,
      },
      include: {
        user: true,
        campaign: true,
      },
    });

    if (!donation) {
      return NextResponse.json(
        {
          success: false,
          message: "Data donasi tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    if (donation.paymentStatus !== "SUCCESS") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Struk hanya dapat diterbitkan untuk transaksi yang berhasil.",
        },
        { status: 400 }
      );
    }

    // Struk hanya untuk transaksi NON-ZAKAT
    if (zakatTypes.includes(donation.campaign.type)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Transaksi zakat menggunakan BSZ, bukan struk pembayaran.",
        },
        { status: 400 }
      );
    }

    const receiptNumber = `STRUK-${new Date(
      donation.createdAt
    ).getFullYear()}-${String(donation.id).padStart(6, "0")}`;

    const transactionType =
      donation.campaign.type !== "GENERAL"
        ? donation.campaign.type.replaceAll("_", " ")
        : donation.campaign.category;

    const verificationUrl = `${
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    }/verifikasi/struk/${receiptNumber}`;

    const pdf = await generateReceipt({
      receiptNumber,

      donorName: donation.user?.name || donation.donorName,

      phone: donation.phone || donation.user?.phone || null,

      email: donation.email,

      campaignTitle: donation.campaign.title,

      transactionType,

      paymentMethod: donation.paymentMethod || null,

      amount: donation.amount,

      transactionDate:
        donation.settlementTime || donation.createdAt,

      verificationUrl,
    });

    return new NextResponse(Buffer.from(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${receiptNumber}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("RECEIPT GENERATION ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal membuat struk pembayaran.",
      },
      { status: 500 }
    );
  }
}
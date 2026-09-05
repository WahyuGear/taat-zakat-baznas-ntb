import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateBSZ } from "@/lib/bsz/generate-bsz";

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
          message: "BSZ hanya dapat diterbitkan untuk transaksi yang berhasil.",
        },
        { status: 400 }
      );
    }
    // Cek apakah transaksi adalah zakat dengan tipe yang valid
    const zakatTypes = [
      "ZAKAT_PENGHASILAN",
      "ZAKAT_MAL",
      "ZAKAT_PERTANIAN",
      "ZAKAT_PETERNAKAN",
      "ZAKAT_PERDAGANGAN",
      "ZAKAT_FITRAH",
    ];
    
    if (!zakatTypes.includes(donation.campaign.type)) {
      return NextResponse.json(
        {
          success: false,
          message: "BSZ hanya dapat diterbitkan untuk transaksi zakat.",
        },
        { status: 400 }
      );
    }

    const bszNumber = `BSZ-${new Date(donation.createdAt).getFullYear()}-${String(
      donation.id
    ).padStart(6, "0")}`;

    const objectType =
      donation.campaign.type !== "GENERAL"
        ? donation.campaign.type.replaceAll("_", " ")
        : donation.campaign.category;

    const pdf = await generateBSZ({
      bszNumber,

      period: new Intl.DateTimeFormat("id-ID", {
        month: "long",
        year: "numeric",
      }).format(donation.createdAt),

      donorName: donation.user?.name || donation.donorName,
      npwz: donation.user?.npwz || null,

      // Belum tersedia di schema Prisma saat ini
      npwp: null,
      address: null,

      phone: donation.phone || donation.user?.phone || null,
      email: donation.email,

      objectType,
      description: donation.campaign.title,
      paymentMethod: donation.paymentMethod || null,

      amount: donation.amount,
      total: donation.amount,

      transactionDate: donation.settlementTime || donation.createdAt,

      // Belum tersedia di database
      officerName: null,

      verificationUrl: `${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      }/verifikasi/bsz/${bszNumber}`,
    });

    return new NextResponse(Buffer.from(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${bszNumber}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("BSZ GENERATION ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal membuat Bukti Setor Zakat.",
      },
      { status: 500 }
    );
  }
}
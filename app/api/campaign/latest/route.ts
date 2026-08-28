import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const campaigns = await prisma.campaign.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 6,
    });

    return NextResponse.json(campaigns);
  } catch (error) {
    console.error("LATEST CAMPAIGN ERROR:", error);

    return NextResponse.json(
      {
        message: "Gagal mengambil campaign terbaru",
      },
      {
        status: 500,
      }
    );
  }
}
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const campaigns = await prisma.campaign.findMany({
      where: {
        isActive: true,
        featured: true,
      },
      orderBy: {
        collected: "desc",
      },
      take: 6,
    });

    return NextResponse.json(campaigns);
  } catch (error) {
    console.error("FEATURED CAMPAIGN ERROR:", error);

    return NextResponse.json(
      { message: "Gagal mengambil campaign featured" },
      { status: 500 }
    );
  }
}
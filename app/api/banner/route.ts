import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const banners = await prisma.banner.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        order: "asc",
      },
    });

    return NextResponse.json(banners);
  } catch (error) {
    console.error("GET BANNER ERROR:", error);

    return NextResponse.json(
      { message: "Gagal mengambil banner" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const banner = await prisma.banner.create({
      data: {
        title: body.title,
        subtitle: body.subtitle || null,
        image: body.image,
        link: body.link || null,
        buttonText: body.buttonText || null,
        isActive: body.isActive ?? true,
        order: Number(body.order ?? 0),
      },
    });

    return NextResponse.json(banner, { status: 201 });
  } catch (error) {
    console.error("CREATE BANNER ERROR:", error);

    return NextResponse.json(
      { message: "Gagal membuat banner" },
      { status: 500 }
    );
  }
}
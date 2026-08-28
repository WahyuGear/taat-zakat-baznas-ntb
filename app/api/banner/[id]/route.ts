import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();

    const banner = await prisma.banner.update({
      where: {
        id: Number(id),
      },
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

    return NextResponse.json(banner);
  } catch (error) {
    console.error("UPDATE BANNER ERROR:", error);

    return NextResponse.json(
      { message: "Gagal mengubah banner" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: Params
) {
  try {
    const { id } = await params;

    await prisma.banner.delete({
      where: {
        id: Number(id),
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("DELETE BANNER ERROR:", error);

    return NextResponse.json(
      { message: "Gagal menghapus banner" },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET
 * Mengambil semua laporan BAZNAS NTB
 */
export async function GET() {
  try {
    const reports = await prisma.report.findMany({
      orderBy: [
        {
          year: "desc",
        },
        {
          month: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error("GET REPORT ERROR:", error);

    return NextResponse.json(
      {
        message: "Gagal mengambil data laporan",
      },
      {
        status: 500,
      }
    );
  }
}

/**
 * POST
 * Menambahkan laporan baru
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validasi
    if (!body.title || !body.year || !body.category) {
      return NextResponse.json(
        {
          message:
            "Judul, tahun, dan kategori wajib diisi",
        },
        {
          status: 400,
        }
      );
    }

    const report = await prisma.report.create({
      data: {
        title: String(body.title),

        description: body.description
          ? String(body.description)
          : null,

        year: Number(body.year),

        month:
          body.month !== undefined &&
          body.month !== null &&
          body.month !== ""
            ? Number(body.month)
            : null,

        category: String(body.category),

        amount: Number(body.amount ?? 0),

        beneficiaries: Number(
          body.beneficiaries ?? 0
        ),

        fileUrl: body.fileUrl
          ? String(body.fileUrl)
          : null,

        isPublished:
          body.isPublished !== undefined
            ? Boolean(body.isPublished)
            : true,
      },
    });

    return NextResponse.json(report, {
      status: 201,
    });
  } catch (error) {
    console.error("POST REPORT ERROR:", error);

    return NextResponse.json(
      {
        message: "Gagal membuat laporan",
      },
      {
        status: 500,
      }
    );
  }
}
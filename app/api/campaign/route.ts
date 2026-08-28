import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");
}

// ==========================================
// GET CAMPAIGNS
// /api/campaigns
// /api/campaigns?search=sedekah
// ==========================================

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";

    const campaigns = await prisma.campaign.findMany({
      where: {
        isActive: true,

        ...(search
          ? {
              OR: [
                {
                  title: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  description: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  category: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              ],
            }
          : {}),
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(campaigns);
  } catch (error) {
    console.error("GET CAMPAIGNS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil campaign",
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      {
        status: 500,
      }
    );
  }
}

// ==========================================
// POST CAMPAIGN
// ==========================================

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (
      !body.title ||
      !body.description ||
      !body.image ||
      !body.target
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Data belum lengkap",
        },
        {
          status: 400,
        }
      );
    }

    const baseSlug = slugify(body.title);

    let slug = baseSlug;
    let counter = 2;

    while (
      await prisma.campaign.findUnique({
        where: {
          slug,
        },
      })
    ) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const campaign = await prisma.campaign.create({
      data: {
        title: body.title,
        slug,
        description: body.description,
        image: body.image,
        target: Number(body.target),
        collected: 0,
        category: body.category ?? "",
        type: body.type ?? "GENERAL",
        isActive: body.isActive ?? true,
        featured: body.featured ?? false,
      },
    });

    return NextResponse.json(campaign);
  } catch (error) {
    console.error("POST CAMPAIGN ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal membuat campaign",
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      {
        status: 500,
      }
    );
  }
}
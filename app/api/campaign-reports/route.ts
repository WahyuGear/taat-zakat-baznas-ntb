import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const campaignIdParam = searchParams.get("campaignId");
    const campaignId = Number(campaignIdParam);

    if (!campaignIdParam || !Number.isInteger(campaignId)) {
      return NextResponse.json(
        {
          success: false,
          message: "campaignId tidak valid",
        },
        {
          status: 400,
        }
      );
    }

    const campaign = await prisma.campaign.findUnique({
      where: {
        id: campaignId,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        target: true,
        collected: true,
        isActive: true,
      },
    });

    if (!campaign) {
      return NextResponse.json(
        {
          success: false,
          message: "Campaign tidak ditemukan",
        },
        {
          status: 404,
        }
      );
    }

    const reports = await prisma.campaignReport.findMany({
      where: {
        campaignId,
        isPublished: true,
      },
      include: {
        items: {
          orderBy: {
            order: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const successfulDonations =
      await prisma.donation.findMany({
        where: {
          campaignId,
          paymentStatus: "SUCCESS",
        },
        select: {
          id: true,
          donorName: true,
          amount: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    const totalDonors = successfulDonations.length;

    const totalDonation = successfulDonations.reduce(
      (total, donation) => total + donation.amount,
      0
    );

    return NextResponse.json({
      success: true,

      campaign,

      summary: {
        totalDonors,
        totalDonation,
      },

      donors: successfulDonations.map((donation) => ({
        id: donation.id,
        donorName:
          donation.donorName?.trim() || "Hamba Allah",
        amount: donation.amount,
        createdAt: donation.createdAt,
      })),

      reports,
    });
  } catch (error) {
    console.error(
      "GET CAMPAIGN REPORT ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil laporan campaign",
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
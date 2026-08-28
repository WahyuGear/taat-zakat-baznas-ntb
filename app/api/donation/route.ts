import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

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


    const campaign = await prisma.campaign.findUnique({
      where: {
        slug: campaignSlug,
      },
    });


    if (!campaign) {
      return NextResponse.json(
        {
          message: "Campaign tidak ditemukan",
        },
        {
          status: 404,
        }
      );
    }



    const cookieStore = await cookies();

    const userId = cookieStore.get("userId")?.value;



    const donationAmount = Number(amount);



    const result = await prisma.$transaction(async (tx) => {


      // buat data donasi

      const donation = await tx.donation.create({

        data: {

          donorName,
          email,
          phone,
          message,

          amount: donationAmount,

          campaignId: campaign.id,

          userId: userId
  ? Number(userId)
  : null,

        },

      });



      // update total campaign

      await tx.campaign.update({

        where: {
          id: campaign.id,
        },

        data: {

          collected: {
            increment: donationAmount,
          },

        },

      });



      return donation;

    });



    return NextResponse.json({

      message: "Donasi berhasil dibuat",

      donation: result,

    });



  } catch (error) {


    console.error(error);


    return NextResponse.json(

      {
        message: "Gagal membuat donasi",
      },

      {
        status: 500,
      }

    );

  }
}
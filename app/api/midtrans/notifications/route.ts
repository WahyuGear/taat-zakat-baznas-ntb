import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import midtransClient from "midtrans-client";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("MIDTRANS NOTIFICATION:", body);

    if (!process.env.MIDTRANS_SERVER_KEY) {
      return NextResponse.json(
        {
          success: false,
          message: "MIDTRANS_SERVER_KEY belum dikonfigurasi",
        },
        { status: 500 }
      );
    }

    const snap = new midtransClient.Snap({
      isProduction:
        process.env.MIDTRANS_IS_PRODUCTION === "true",
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.MIDTRANS_CLIENT_KEY,
    });

    // Verifikasi notification langsung melalui Midtrans
    const notification =
      await snap.transaction.notification(body);

    const orderId = notification.order_id;
    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;
    const transactionId = notification.transaction_id;
    const paymentType = notification.payment_type;
    const settlementTime = notification.settlement_time;

    console.log("MIDTRANS VERIFIED:", {
      orderId,
      transactionStatus,
      fraudStatus,
      transactionId,
      paymentType,
      settlementTime,
    });

    if (!orderId) {
      return NextResponse.json(
        {
          success: false,
          message: "Order ID tidak ditemukan",
        },
        { status: 400 }
      );
    }

    const donation = await prisma.donation.findUnique({
      where: {
        orderId: String(orderId),
      },
    });

    if (!donation) {
      console.error(
        "DONATION TIDAK DITEMUKAN:",
        orderId
      );

      return NextResponse.json(
        {
          success: false,
          message: "Data donasi tidak ditemukan",
        },
        { status: 404 }
      );
    }

    let newPaymentStatus:
      | "PENDING"
      | "SUCCESS"
      | "FAILED"
      | "EXPIRED" = "PENDING";

    if (transactionStatus === "settlement") {
      newPaymentStatus = "SUCCESS";
    } else if (
      transactionStatus === "capture" &&
      fraudStatus !== "deny"
    ) {
      newPaymentStatus = "SUCCESS";
    } else if (
      transactionStatus === "deny" ||
      transactionStatus === "cancel" ||
      transactionStatus === "failure"
    ) {
      newPaymentStatus = "FAILED";
    } else if (transactionStatus === "expire") {
      newPaymentStatus = "EXPIRED";
    } else {
      newPaymentStatus = "PENDING";
    }

    /*
     * SUCCESS hanya boleh menambah collected SEKALI.
     *
     * Kalau notification SUCCESS dikirim ulang oleh Midtrans,
     * jangan sampai collected bertambah dua kali.
     */
    if (
      newPaymentStatus === "SUCCESS" &&
      donation.paymentStatus !== "SUCCESS"
    ) {
      await prisma.$transaction(async (tx) => {
        await tx.donation.update({
          where: {
            id: donation.id,
          },
          data: {
            paymentStatus: "SUCCESS",
            paymentMethod: paymentType
              ? String(paymentType)
              : null,
            transactionId: transactionId
              ? String(transactionId)
              : null,
            settlementTime: settlementTime
              ? new Date(settlementTime)
              : new Date(),
          },
        });

        await tx.campaign.update({
          where: {
            id: donation.campaignId,
          },
          data: {
            collected: {
              increment: donation.amount,
            },
          },
        });
      });
    } else {
      await prisma.donation.update({
        where: {
          id: donation.id,
        },
        data: {
          paymentStatus: newPaymentStatus,
          paymentMethod: paymentType
            ? String(paymentType)
            : null,
          transactionId: transactionId
            ? String(transactionId)
            : null,
          settlementTime:
            newPaymentStatus === "SUCCESS"
              ? settlementTime
                ? new Date(settlementTime)
                : new Date()
              : donation.settlementTime,
        },
      });
    }

    console.log(
      `DONATION ${orderId} → ${newPaymentStatus}`
    );

    return NextResponse.json({
      success: true,
      message: "Notification berhasil diproses",
    });
  } catch (error) {
    console.error(
      "MIDTRANS NOTIFICATION ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Gagal memproses notification",
      },
      { status: 500 }
    );
  }
}
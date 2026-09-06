import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendPaymentEmail } from "@/lib/email/send-email";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("MIDTRANS NOTIFICATION:", body);

    const serverKey = process.env.MIDTRANS_SERVER_KEY;

    if (!serverKey) {
      return NextResponse.json(
        {
          success: false,
          message: "MIDTRANS_SERVER_KEY belum dikonfigurasi",
        },
        { status: 500 }
      );
    }

    const orderId = body.order_id;
    const transactionStatus = body.transaction_status;
    const fraudStatus = body.fraud_status;
    const transactionId = body.transaction_id;
    const paymentType = body.payment_type;
    const settlementTime = body.settlement_time;
    const grossAmount = body.gross_amount;
    const signatureKey = body.signature_key;

    if (!orderId) {
      return NextResponse.json(
        {
          success: false,
          message: "Order ID tidak ditemukan",
        },
        { status: 400 }
      );
    }

    /*
     * VERIFIKASI SIGNATURE MIDTRANS
     *
     * SHA512:
     * order_id + status_code + gross_amount + server_key
     */
    const expectedSignature = crypto
      .createHash("sha512")
      .update(
        `${orderId}${body.status_code}${grossAmount}${serverKey}`
      )
      .digest("hex");

    if (
      !signatureKey ||
      String(signatureKey).toLowerCase() !==
        expectedSignature.toLowerCase()
    ) {
      console.error(
        "MIDTRANS SIGNATURE TIDAK VALID:",
        orderId
      );

      return NextResponse.json(
        {
          success: false,
          message: "Signature notification tidak valid",
        },
        { status: 401 }
      );
    }

    console.log("MIDTRANS SIGNATURE VALID:", orderId);

    const donation = await prisma.donation.findUnique({
      where: {
        orderId: String(orderId),
      },
      include: {
        campaign: true,
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

    /*
     * Pastikan nominal dari Midtrans sama
     * dengan nominal yang tersimpan di database.
     */
    if (
      grossAmount !== undefined &&
      Number(grossAmount) !== donation.amount
    ) {
      console.error(
        "NOMINAL TIDAK SESUAI:",
        orderId,
        grossAmount,
        donation.amount
      );

      return NextResponse.json(
        {
          success: false,
          message: "Nominal transaksi tidak sesuai",
        },
        { status: 400 }
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
     * SUCCESS hanya menambah collected SEKALI.
     *
     * Kalau Midtrans mengirim notification SUCCESS
     * berkali-kali, donation sudah SUCCESS sehingga
     * campaign tidak akan ditambah lagi.
     */
    console.log("EMAIL CONDITION DEBUG:", {
      donationId: donation.id,
      orderId,
      donationPaymentStatus: donation.paymentStatus,
      newPaymentStatus,
      email: donation.email,
      resendConfigured: !!process.env.RESEND_API_KEY,
    });
    
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
    // ================================
    // BUAT NOTIFIKASI USER
    // ================================
    console.log("NOTIFICATION DEBUG:", {
      donationId: donation.id,
      userId: donation.userId,
      newPaymentStatus,
    });
    
    if (donation.userId) {
      let title = "Status Pembayaran";
      let message =
        "Status pembayaran transaksi Anda telah diperbarui.";
      let type = "INFO";
    
      if (newPaymentStatus === "SUCCESS") {
        title = "Pembayaran Berhasil";
        message = `Pembayaran sebesar Rp ${donation.amount.toLocaleString(
          "id-ID"
        )} telah berhasil diterima oleh BAZNAS NTB.`;
        type = "SUCCESS";
      } else if (newPaymentStatus === "FAILED") {
        title = "Pembayaran Gagal";
        message = `Pembayaran sebesar Rp ${donation.amount.toLocaleString(
          "id-ID"
        )} gagal diproses. Silakan coba kembali.`;
        type = "ERROR";
      } else if (newPaymentStatus === "EXPIRED") {
        title = "Pembayaran Kedaluwarsa";
        message = `Pembayaran sebesar Rp ${donation.amount.toLocaleString(
          "id-ID"
        )} telah kedaluwarsa.`;
        type = "WARNING";
      } else if (newPaymentStatus === "PENDING") {
        title = "Pembayaran Diproses";
        message = `Pembayaran sebesar Rp ${donation.amount.toLocaleString(
          "id-ID"
        )} sedang diproses.`;
        type = "INFO";
      }
    
      const notificationLink =
        `/dashboard/pembayaran/${donation.id}`;
    
      const existingNotification =
        await prisma.notification.findFirst({
          where: {
            userId: donation.userId,
            type,
            link: notificationLink,
          },
        });
    
      if (!existingNotification) {
        await prisma.notification.create({
          data: {
            userId: donation.userId,
            title,
            message,
            type,
            link: notificationLink,
          },
        });
      }
    }
    
    // ================================
// KIRIM EMAIL PEMBAYARAN SUCCESS
// ================================

if (
  newPaymentStatus === "SUCCESS" &&
  donation.paymentStatus !== "SUCCESS" &&
  donation.email
) {
  try {
    const zakatTypes = [
      "ZAKAT_PENGHASILAN",
      "ZAKAT_MAL",
      "ZAKAT_PERTANIAN",
      "ZAKAT_PETERNAKAN",
      "ZAKAT_PERDAGANGAN",
    ];

    const isZakat = zakatTypes.includes(
      donation.campaign.type
    );

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

if (!appUrl) {
  throw new Error("NEXT_PUBLIC_APP_URL belum dikonfigurasi");
}

    await sendPaymentEmail({
      to: donation.email,
      donorName: donation.donorName,
      amount: donation.amount,
      program: donation.campaign.title,
      paymentStatus: "SUCCESS",
      transactionId: transactionId
        ? String(transactionId)
        : donation.transactionId,
      documentUrl: `${appUrl}/dashboard/pembayaran/${donation.id}`,
      isZakat,
    });

    console.log(
      "EMAIL PEMBAYARAN BERHASIL DIKIRIM:",
      donation.email
    );
  } catch (emailError) {
    console.error(
      "GAGAL MENGIRIM EMAIL PEMBAYARAN:",
      emailError
    );
  }
}

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
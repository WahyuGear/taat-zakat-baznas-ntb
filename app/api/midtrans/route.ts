import { NextResponse } from "next/server";
import midtransClient from "midtrans-client";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      orderId,
      donorName,
      email,
      phone,
      amount,
    } = body;

    // =========================
    // VALIDASI
    // =========================

    if (!orderId) {
      return NextResponse.json(
        {
          success: false,
          message: "Order ID wajib diisi",
        },
        { status: 400 }
      );
    }

    if (!donorName) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama donatur wajib diisi",
        },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message: "Email wajib diisi",
        },
        { status: 400 }
      );
    }

    const grossAmount = Number(amount);

    if (
      !Number.isFinite(grossAmount) ||
      grossAmount <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Nominal transaksi tidak valid",
        },
        { status: 400 }
      );
    }

    // =========================
    // CEK MIDTRANS KEY
    // =========================

    if (!process.env.MIDTRANS_SERVER_KEY) {
      return NextResponse.json(
        {
          success: false,
          message:
            "MIDTRANS_SERVER_KEY belum dikonfigurasi",
        },
        { status: 500 }
      );
    }

    // =========================
    // MIDTRANS SNAP
    // =========================

    const snap = new midtransClient.Snap({
      isProduction:
        process.env.MIDTRANS_IS_PRODUCTION === "true",
      serverKey:
        process.env.MIDTRANS_SERVER_KEY,
      clientKey:
        process.env.MIDTRANS_CLIENT_KEY,
    });

    const parameter = {
      transaction_details: {
        order_id: String(orderId),
        gross_amount: grossAmount,
      },

      customer_details: {
        first_name: String(donorName),
        email: String(email),
        phone: phone
          ? String(phone)
          : undefined,
      },

      credit_card: {
        secure: true,
      },
    };

    const transaction =
      await snap.createTransaction(parameter);

    return NextResponse.json({
      success: true,
      token: transaction.token,
      redirect_url: transaction.redirect_url,
    });
  } catch (error) {
    console.error(
      "MIDTRANS CREATE TRANSACTION ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Gagal membuat transaksi Midtrans",
      },
      { status: 500 }
    );
  }
}
import { Resend } from "resend";

type SendPaymentEmailParams = {
  to: string;
  donorName: string;
  amount: number;
  program: string;
  paymentStatus: string;
  transactionId?: string | null;
  documentUrl?: string | null;
  isZakat: boolean;
};

export async function sendPaymentEmail({
  to,
  donorName,
  amount,
  program,
  paymentStatus,
  transactionId,
  documentUrl,
  isZakat,
}: SendPaymentEmailParams) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY belum tersedia");
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  
  const documentLabel = isZakat
    ? "Lihat Bukti Setor Zakat (BSZ)"
    : "Lihat Bukti Pembayaran";

  const documentButton = documentUrl
    ? `
      <p style="margin-top:24px;">
        <a
          href="${documentUrl}"
          style="
            display:inline-block;
            padding:12px 20px;
            background:#16a34a;
            color:#ffffff;
            text-decoration:none;
            border-radius:8px;
            font-weight:600;
          "
        >
          ${documentLabel}
        </a>
      </p>
    `
    : "";

  const { data, error } = await resend.emails.send({
    from: "BAZNAS NTB <onboarding@resend.dev>",
    to: [to],
    subject: `Pembayaran Berhasil - ${program}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#222;">
        <h2 style="color:#15803d;">
          Pembayaran Berhasil
        </h2>

        <p>Assalamu'alaikum ${donorName},</p>

        <p>
          Pembayaran Anda telah berhasil diterima oleh
          <strong>BAZNAS NTB</strong>.
        </p>

        <table style="width:100%;border-collapse:collapse;margin-top:20px;">
          <tr>
            <td style="padding:8px 0;">Program</td>
            <td style="padding:8px 0;"><strong>${program}</strong></td>
          </tr>

          <tr>
            <td style="padding:8px 0;">Nominal</td>
            <td style="padding:8px 0;">
              <strong>Rp ${amount.toLocaleString("id-ID")}</strong>
            </td>
          </tr>

          <tr>
            <td style="padding:8px 0;">Status</td>
            <td style="padding:8px 0;">
              <strong>${paymentStatus}</strong>
            </td>
          </tr>

          ${
            transactionId
              ? `
                <tr>
                  <td style="padding:8px 0;">ID Transaksi</td>
                  <td style="padding:8px 0;">
                    ${transactionId}
                  </td>
                </tr>
              `
              : ""
          }
        </table>

        ${documentButton}

        <p style="margin-top:30px;">
          Terima kasih telah menunaikan zakat dan berbagi melalui
          BAZNAS NTB.
        </p>

        <p>
          Wassalamu'alaikum warahmatullahi wabarakatuh.
        </p>

        <hr style="margin-top:30px;border:none;border-top:1px solid #ddd;" />

        <p style="font-size:12px;color:#777;">
          Email ini dikirim secara otomatis oleh sistem BAZNAS NTB.
        </p>
      </div>
    `,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
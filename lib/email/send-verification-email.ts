import nodemailer from "nodemailer";

type SendVerificationEmailParams = {
  to: string;
  name: string;
  verificationUrl: string;
};

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendVerificationEmail({
  to,
  name,
  verificationUrl,
}: SendVerificationEmailParams) {
  if (!process.env.SMTP_FROM) {
    throw new Error("SMTP_FROM belum tersedia");
  }

  const result = await transporter.sendMail({
    from: `"BAZNAS NTB" <${process.env.SMTP_FROM}>`,
    to,
    subject: "Verifikasi Email - BAZNAS NTB",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#222;line-height:1.6;">
        <div style="text-align:center;margin-bottom:24px;">
          <h2 style="color:#15803d;margin-bottom:4px;">
            BAZNAS NTB
          </h2>
          <p style="margin:0;color:#777;">
            Verifikasi Email Akun
          </p>
        </div>

        <p>
          Assalamu'alaikum <strong>${name}</strong>,
        </p>

        <p>
          Terima kasih telah mendaftar di sistem digital
          <strong>BAZNAS NTB</strong>.
        </p>

        <p>
          Untuk mengaktifkan akun Anda, silakan klik tombol
          verifikasi berikut:
        </p>

        <div style="text-align:center;margin:30px 0;">
          <a
            href="${verificationUrl}"
            style="
              display:inline-block;
              padding:13px 24px;
              background:#15803d;
              color:#ffffff;
              text-decoration:none;
              border-radius:8px;
              font-weight:600;
            "
          >
            Verifikasi Email
          </a>
        </div>

        <p>
          Link verifikasi ini berlaku selama
          <strong>30 menit</strong>.
        </p>

        <p style="font-size:13px;color:#777;">
          Jika Anda tidak merasa melakukan pendaftaran,
          abaikan email ini.
        </p>

        <hr style="margin-top:30px;border:none;border-top:1px solid #ddd;" />

        <p style="font-size:12px;color:#777;text-align:center;">
          Email ini dikirim secara otomatis oleh sistem BAZNAS NTB.
        </p>
      </div>
    `,
  });

  return result;
}
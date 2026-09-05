import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";

type ReceiptData = {
  receiptNumber: string;
  donorName: string;
  phone?: string | null;
  email?: string | null;
  campaignTitle: string;
  transactionType: string;
  paymentMethod?: string | null;
  amount: number;
  transactionDate: Date;
  verificationUrl: string;
};

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export async function generateReceipt(data: ReceiptData) {
  const pdfDoc = await PDFDocument.create();

  // Ukuran struk thermal/bank receipt
  const pageWidth = 320;
  const pageHeight = 620;

  const page = pdfDoc.addPage([pageWidth, pageHeight]);

  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // =========================
  // LOGO BAZNAS NTB
  // =========================
  const logoPath = path.join(
    process.cwd(),
    "public",
    "logo-baznas-ntb.png"
  );

  let logo;

  if (fs.existsSync(logoPath)) {
    const logoBytes = fs.readFileSync(logoPath);
    logo = await pdfDoc.embedPng(logoBytes);
  }

  // =========================
  // WARNA
  // =========================
  const green = rgb(0.0, 0.42, 0.25);
  const dark = rgb(0.12, 0.12, 0.12);
  const gray = rgb(0.45, 0.45, 0.45);
  const lightGray = rgb(0.82, 0.82, 0.82);

  // =========================
  // WATERMARK LOGO
  // =========================
  // Logo dibuat berulang diagonal seperti security pattern.
  if (logo) {
    const logoScale = 0.08;
    const logoWidth = logo.width * logoScale;
    const logoHeight = logo.height * logoScale;

    for (let y = -40; y < pageHeight + 100; y += 90) {
      for (let x = -80; x < pageWidth + 100; x += 120) {
        page.drawImage(logo, {
          x,
          y,
          width: logoWidth,
          height: logoHeight,
          rotate: degrees(35),
          opacity: 0.08,
        });
      }
    }
  }

  // =========================
// HEADER
// =========================
let cursorY = pageHeight - 28;

if (logo) {
  const maxLogoWidth = 105;
  const scale = maxLogoWidth / logo.width;

  page.drawImage(logo, {
    x: (pageWidth - logo.width * scale) / 2,
    y: cursorY - logo.height * scale,
    width: logo.width * scale,
    height: logo.height * scale,
  });

  cursorY -= logo.height * scale + 24;
}

const title = "BUKTI PEMBAYARAN";
const titleSize = 13;
const titleWidth = boldFont.widthOfTextAtSize(title, titleSize);

page.drawText(title, {
  x: (pageWidth - titleWidth) / 2,
  y: cursorY,
  size: titleSize,
  font: boldFont,
  color: green,
});

cursorY -= 22;

page.drawLine({
  start: { x: 20, y: cursorY },
  end: { x: pageWidth - 20, y: cursorY },
  thickness: 1,
  color: lightGray,
});

cursorY -= 18;

  // =========================
  // NOMOR TRANSAKSI
  // =========================
  page.drawText(data.receiptNumber, {
    x: 20,
    y: cursorY,
    size: 8,
    font: regularFont,
    color: gray,
  });

  cursorY -= 20;

  // =========================
  // HELPER FIELD
  // =========================
  const drawField = (
    label: string,
    value: string,
    valueBold = false
  ) => {
    page.drawText(label, {
      x: 20,
      y: cursorY,
      size: 8,
      font: regularFont,
      color: gray,
    });

    cursorY -= 12;

    page.drawText(value || "-", {
      x: 20,
      y: cursorY,
      size: valueBold ? 10 : 9,
      font: valueBold ? boldFont : regularFont,
      color: dark,
      maxWidth: pageWidth - 40,
    });

    cursorY -= 18;
  };

  drawField("Nama Donatur", data.donorName, true);

  drawField("Jenis Transaksi", data.transactionType, true);

  drawField("Program", data.campaignTitle);

  drawField(
    "Metode Pembayaran",
    data.paymentMethod || "-"
  );

  drawField(
    "Tanggal Transaksi",
    formatDate(data.transactionDate)
  );

  if (data.phone) {
    drawField("No. Telepon", data.phone);
  }

  // =========================
  // TOTAL
  // =========================
  cursorY -= 4;

  page.drawLine({
    start: { x: 20, y: cursorY },
    end: { x: pageWidth - 20, y: cursorY },
    thickness: 1,
    color: lightGray,
  });

  cursorY -= 24;

  page.drawText("TOTAL PEMBAYARAN", {
    x: 20,
    y: cursorY,
    size: 8,
    font: boldFont,
    color: gray,
  });

  cursorY -= 28;

  page.drawText(formatRupiah(data.amount), {
    x: 20,
    y: cursorY,
    size: 18,
    font: boldFont,
    color: green,
  });

  cursorY -= 25;

  // =========================
  // STATUS
  // =========================
  page.drawText("STATUS", {
    x: 20,
    y: cursorY,
    size: 8,
    font: regularFont,
    color: gray,
  });

  page.drawText("BERHASIL", {
    x: 75,
    y: cursorY,
    size: 9,
    font: boldFont,
    color: green,
  });

  cursorY -= 28;

  // =========================
  // QR VERIFIKASI
  // =========================
  const qrDataUrl = await QRCode.toDataURL(data.verificationUrl, {
    width: 180,
    margin: 1,
  });

  const qrBase64 = qrDataUrl.split(",")[1];
  const qrBytes = Buffer.from(qrBase64, "base64");

  const qrImage = await pdfDoc.embedPng(qrBytes);

  const qrSize = 70;

  page.drawImage(qrImage, {
    x: (pageWidth - qrSize) / 2,
    y: cursorY - qrSize,
    width: qrSize,
    height: qrSize,
  });

  cursorY -= qrSize + 12;

  const scanText = "Scan untuk verifikasi transaksi";
const scanTextSize = 7;
const scanTextWidth = regularFont.widthOfTextAtSize(
  scanText,
  scanTextSize
);

page.drawText(scanText, {
  x: (pageWidth - scanTextWidth) / 2,
  y: cursorY,
  size: scanTextSize,
  font: regularFont,
  color: gray,
});

  cursorY -= 22;

  // =========================
  // FOOTER
  // =========================
  page.drawLine({
    start: { x: 20, y: cursorY },
    end: { x: pageWidth - 20, y: cursorY },
    thickness: 1,
    color: lightGray,
  });

  cursorY -= 16;

  page.drawText(
    "Terima kasih atas kepercayaan dan kontribusi Anda.",
    {
      x: 20,
      y: cursorY,
      size: 7,
      font: regularFont,
      color: gray,
      maxWidth: pageWidth - 40,
    }
  );

  cursorY -= 12;

  page.drawText(
    "Dokumen ini merupakan bukti pembayaran resmi.",
    {
      x: 20,
      y: cursorY,
      size: 7,
      font: regularFont,
      color: gray,
      maxWidth: pageWidth - 40,
    }
  );

  return await pdfDoc.save();
}
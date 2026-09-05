import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";
import fs from "fs/promises";
import path from "path";

export type BszData = {
  bszNumber: string;
  period?: string;

  donorName: string;
  npwz?: string | null;
  npwp?: string | null;

  address?: string | null;
  phone?: string | null;
  email?: string | null;

  objectType?: string | null;
  description?: string | null;
  paymentMethod?: string | null;

  amount: number;
  total?: number;

  transactionDate: Date | string;

  officerName?: string | null;

  verificationUrl: string;
};

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

function terbilang(nominal: number): string {
  const angka = [
    "",
    "satu",
    "dua",
    "tiga",
    "empat",
    "lima",
    "enam",
    "tujuh",
    "delapan",
    "sembilan",
    "sepuluh",
    "sebelas",
  ];

  const convert = (n: number): string => {
    if (n < 12) return angka[n];
    if (n < 20) return `${convert(n - 10)} belas`;
    if (n < 100) {
      return `${convert(Math.floor(n / 10))} puluh${
        n % 10 ? ` ${convert(n % 10)}` : ""
      }`;
    }
    if (n < 200) {
      return `seratus${n > 100 ? ` ${convert(n - 100)}` : ""}`;
    }
    if (n < 1000) {
      return `${convert(Math.floor(n / 100))} ratus${
        n % 100 ? ` ${convert(n % 100)}` : ""
      }`;
    }
    if (n < 2000) {
      return `seribu${n > 1000 ? ` ${convert(n - 1000)}` : ""}`;
    }
    if (n < 1_000_000) {
      return `${convert(Math.floor(n / 1000))} ribu${
        n % 1000 ? ` ${convert(n % 1000)}` : ""
      }`;
    }
    if (n < 1_000_000_000) {
      return `${convert(Math.floor(n / 1_000_000))} juta${
        n % 1_000_000 ? ` ${convert(n % 1_000_000)}` : ""
      }`;
    }
    if (n < 1_000_000_000_000) {
      return `${convert(Math.floor(n / 1_000_000_000))} miliar${
        n % 1_000_000_000 ? ` ${convert(n % 1_000_000_000)}` : ""
      }`;
    }

    return `${convert(Math.floor(n / 1_000_000_000_000))} triliun${
      n % 1_000_000_000_000
        ? ` ${convert(n % 1_000_000_000_000)}`
        : ""
    }`;
  };

  return `${convert(Math.floor(nominal))} rupiah`
    .replace(/\s+/g, " ")
    .trim();
}

export async function generateBSZ(data: BszData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // A4
  const pageWidth = 595.28;
  const pageHeight = 841.89;

  // Logo BAZNAS NTB
  const logoPath = path.join(
    process.cwd(),
    "public",
    "logo-baznas-ntb.png"
  );

  const logoBytes = await fs.readFile(logoPath);
  const logo = await pdfDoc.embedPng(logoBytes);

  const logoScale = Math.min(
    110 / logo.width,
    65 / logo.height
  );

  const logoWidth = logo.width * logoScale;
  const logoHeight = logo.height * logoScale;

  // QR verification
  const qrDataUrl = await QRCode.toDataURL(data.verificationUrl, {
    margin: 1,
    width: 300,
  });

  const qrBase64 = qrDataUrl.split(",")[1];

  if (!qrBase64) {
    throw new Error("QR Code gagal dibuat.");
  }

  const qrBytes = Buffer.from(qrBase64, "base64");
  const qrImage = await pdfDoc.embedPng(qrBytes);

  const total = data.total ?? data.amount;

  const drawPage = (pageNumber: 1 | 2) => {
    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    const margin = 42;
    const contentWidth = pageWidth - margin * 2;

    let y = pageHeight - 45;

    // Border
    page.drawRectangle({
      x: 25,
      y: 25,
      width: pageWidth - 50,
      height: pageHeight - 50,
      borderWidth: 1,
      borderColor: rgb(0.15, 0.45, 0.25),
    });

    // Logo
    page.drawImage(logo, {
      x: margin,
      y: y - logoHeight + 5,
      width: logoWidth,
      height: logoHeight,
    });

    const headerX = margin + logoWidth + 18;

    page.drawText("BADAN AMIL ZAKAT NASIONAL", {
      x: headerX,
      y: y - 5,
      size: 13,
      font: boldFont,
      color: rgb(0.05, 0.35, 0.18),
    });

    page.drawText("Provinsi Nusa Tenggara Barat", {
      x: headerX,
      y: y - 23,
      size: 11,
      font: boldFont,
    });

    page.drawText("BUKTI SETOR ZAKAT", {
      x: headerX,
      y: y - 43,
      size: 15,
      font: boldFont,
      color: rgb(0.05, 0.35, 0.18),
    });

    page.drawText(`Nomor: ${data.bszNumber}`, {
      x: headerX,
      y: y - 62,
      size: 9,
      font: regularFont,
    });

    // Label lembar
    const label =
      pageNumber === 1
        ? "LEMBAR 1 — UNTUK ARSIP WAJIB ZAKAT"
        : "LEMBAR 2 — UNTUK MUZAKI";

    page.drawRectangle({
      x: pageWidth - margin - 175,
      y: pageHeight - 145,
      width: 175,
      height: 28,
      color: rgb(0.95, 0.78, 0.15),
    });

    page.drawText(label, {
      x: pageWidth - margin - 165,
      y: pageHeight - 136,
      size: 8,
      font: boldFont,
    });

    y = pageHeight - 175;

    // Garis header
    page.drawLine({
      start: { x: margin, y },
      end: { x: pageWidth - margin, y },
      thickness: 1.5,
      color: rgb(0.05, 0.35, 0.18),
    });

    y -= 28;

    // Informasi transaksi
    page.drawText("DATA WAJIB ZAKAT / MUZAKI", {
      x: margin,
      y,
      size: 11,
      font: boldFont,
      color: rgb(0.05, 0.35, 0.18),
    });

    y -= 22;

    const rowHeight = 25;

    const drawRow = (
      label: string,
      value: string,
      rowY: number
    ) => {
      page.drawRectangle({
        x: margin,
        y: rowY - rowHeight,
        width: contentWidth,
        height: rowHeight,
        borderWidth: 0.5,
        borderColor: rgb(0.75, 0.75, 0.75),
      });

      page.drawText(label, {
        x: margin + 8,
        y: rowY - 16,
        size: 8.5,
        font: boldFont,
      });

      page.drawText(value || "-", {
        x: margin + 145,
        y: rowY - 16,
        size: 8.5,
        font: regularFont,
        maxWidth: contentWidth - 155,
      });
    };

    drawRow("Nama Muzaki", data.donorName, y);
    y -= rowHeight;

    drawRow("NPWZ", data.npwz || "-", y);
    y -= rowHeight;

    drawRow("NPWP", data.npwp || "-", y);
    y -= rowHeight;

    drawRow("Alamat", data.address || "-", y);
    y -= rowHeight;

    drawRow("Telepon", data.phone || "-", y);
    y -= rowHeight;

    drawRow("Email", data.email || "-", y);
    y -= rowHeight;

    drawRow("Periode", data.period || "-", y);
    y -= rowHeight;

    // Detail ZIS
    y -= 25;

    page.drawText("DETAIL SETORAN ZAKAT", {
      x: margin,
      y,
      size: 11,
      font: boldFont,
      color: rgb(0.05, 0.35, 0.18),
    });

    y -= 22;

    drawRow("Objek ZIS", data.objectType || "-", y);
    y -= rowHeight;

    drawRow("Uraian", data.description || "-", y);
    y -= rowHeight;

    drawRow(
      "Metode Pembayaran",
      data.paymentMethod || "-",
      y
    );
    y -= rowHeight;

    drawRow("Tanggal", formatDate(data.transactionDate), y);
    y -= rowHeight;

    // Total
    y -= 25;

    page.drawRectangle({
      x: margin,
      y: y - 70,
      width: contentWidth,
      height: 70,
      borderWidth: 1,
      borderColor: rgb(0.05, 0.35, 0.18),
    });

    page.drawText("TOTAL ZAKAT", {
      x: margin + 15,
      y: y - 25,
      size: 10,
      font: boldFont,
    });

    page.drawText(formatRupiah(total), {
      x: margin + 15,
      y: y - 48,
      size: 17,
      font: boldFont,
      color: rgb(0.05, 0.35, 0.18),
    });

    page.drawText(
      `Terbilang: ${terbilang(total)}`,
      {
        x: margin + 210,
        y: y - 38,
        size: 8.5,
        font: regularFont,
        maxWidth: contentWidth - 225,
      }
    );

    y -= 100;

    // QR
    page.drawText("VERIFIKASI BSZ", {
      x: margin,
      y,
      size: 9,
      font: boldFont,
      color: rgb(0.05, 0.35, 0.18),
    });

    page.drawImage(qrImage, {
      x: margin,
      y: y - 92,
      width: 82,
      height: 82,
    });

    page.drawText(
      "Scan QR untuk memverifikasi\nkeaslian Bukti Setor Zakat.",
      {
        x: margin + 95,
        y: y - 28,
        size: 8,
        font: regularFont,
        lineHeight: 12,
      }
    );

    // Petugas / Muzaki
    const signatureX = pageWidth - margin - 180;

    page.drawText(
      `Mataram, ${formatDate(data.transactionDate)}`,
      {
        x: signatureX,
        y: y - 5,
        size: 8.5,
        font: regularFont,
      }
    );

    page.drawText("Petugas BAZNAS NTB", {
      x: signatureX,
      y: y - 25,
      size: 9,
      font: boldFont,
    });

    page.drawText(
      data.officerName || "(____________________)",
      {
        x: signatureX,
        y: y - 73,
        size: 9,
        font: regularFont,
      }
    );

    // Footer
    page.drawLine({
      start: { x: margin, y: 58 },
      end: { x: pageWidth - margin, y: 58 },
      thickness: 0.5,
      color: rgb(0.7, 0.7, 0.7),
    });

    page.drawText(
      pageNumber === 1
        ? "Dokumen arsip resmi BAZNAS NTB."
        : "Simpan Bukti Setor Zakat ini sebagai bukti pembayaran.",
      {
        x: margin,
        y: 42,
        size: 7.5,
        font: regularFont,
      }
    );

    page.drawText(`BSZ ${data.bszNumber}`, {
      x: pageWidth - margin - 100,
      y: 42,
      size: 7.5,
      font: regularFont,
    });
  };

  // Dua lembar
  drawPage(1);
  drawPage(2);

  return await pdfDoc.save();
}
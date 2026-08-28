import { prisma } from "@/lib/prisma";
import ExcelJS from "exceljs";
import { NextResponse } from "next/server";

export async function GET() {
  const donations = await prisma.donation.findMany({
    include: {
      campaign: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const workbook = new ExcelJS.Workbook();

  const sheet = workbook.addWorksheet("Laporan Donasi");

  sheet.columns = [
    { header: "Tanggal", key: "date", width: 18 },
    { header: "Donatur", key: "name", width: 30 },
    { header: "Campaign", key: "campaign", width: 35 },
    { header: "Nominal", key: "amount", width: 20 },
  ];

  donations.forEach((item) => {
    sheet.addRow({
      date: item.createdAt.toLocaleDateString("id-ID"),
      name: item.donorName,
      campaign: item.campaign.title,
      amount: item.amount,
    });
  });

  sheet.getRow(1).font = {
    bold: true,
  };

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition":
        'attachment; filename="laporan-donasi.xlsx"',
    },
  });
}
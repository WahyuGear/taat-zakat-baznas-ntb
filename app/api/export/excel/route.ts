import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import ExcelJS from "exceljs";

export async function GET() {
  const workbook = new ExcelJS.Workbook();

  const sheet = workbook.addWorksheet("Laporan Donasi");

  sheet.columns = [
    {
      header: "No",
      key: "no",
      width: 8,
    },
    {
      header: "Donatur",
      key: "donor",
      width: 30,
    },
    {
      header: "Email",
      key: "email",
      width: 35,
    },
    {
      header: "Campaign",
      key: "campaign",
      width: 35,
    },
    {
      header: "Nominal",
      key: "amount",
      width: 20,
    },
    {
      header: "Status",
      key: "status",
      width: 18,
    },
    {
      header: "Tanggal",
      key: "date",
      width: 20,
    },
  ];

  const donations = await prisma.donation.findMany({
    include: {
      campaign: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  donations.forEach((item, index) => {
    sheet.addRow({
      no: index + 1,
      donor: item.donorName,
      email: item.email,
      campaign: item.campaign.title,
      amount: item.amount,
      status: item.paymentStatus,
      date: item.createdAt.toLocaleDateString("id-ID"),
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
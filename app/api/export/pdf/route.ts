import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";
import React from "react";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
  },

  header: {
    textAlign: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 15,
    fontWeight: "bold",
  },

  subtitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginTop: 4,
  },

  reportTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 8,
  },

  section: {
    marginTop: 15,
  },

  bold: {
    fontWeight: "bold",
  },

  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    paddingBottom: 5,
    marginTop: 10,
  },

  row: {
    flexDirection: "row",
    paddingTop: 6,
    paddingBottom: 6,
    borderBottomWidth: 0.5,
  },

  no: {
    width: "7%",
  },

  donor: {
    width: "25%",
  },

  campaign: {
    width: "28%",
  },

  amount: {
    width: "23%",
  },

  status: {
    width: "17%",
  },

  signature: {
    marginTop: 80,
    flexDirection: "row",
  },

  signatureBox: {
    width: "50%",
    textAlign: "center",
  },

  signatureName: {
    marginTop: 50,
    fontWeight: "bold",
  },
});

function rupiah(value: number): string {
  return "Rp " + value.toLocaleString("id-ID");
}

function tanggal(value: Date): string {
  return value.toLocaleDateString("id-ID");
}

function LaporanPDF({ donations }: { donations: any[] }) {
  const totalDonasi = donations.reduce(
    (total, item) => total + Number(item.amount || 0),
    0
  );

  const totalDonatur = new Set(
    donations.map((item) => item.email)
  ).size;

  const rows = donations.map((item, index) => {
    return React.createElement(
      View,
      {
        key: item.id,
        style: styles.row,
      },

      React.createElement(
        Text,
        { style: styles.no },
        String(index + 1)
      ),

      React.createElement(
        Text,
        { style: styles.donor },
        item.donorName || "-"
      ),

      React.createElement(
        Text,
        { style: styles.campaign },
        item.campaign?.title || "-"
      ),

      React.createElement(
        Text,
        { style: styles.amount },
        rupiah(Number(item.amount || 0))
      ),

      React.createElement(
        Text,
        { style: styles.status },
        item.paymentStatus || "-"
      )
    );
  });

  return React.createElement(
    Document,
    null,

    React.createElement(
      Page,
      {
        size: "A4",
        style: styles.page,
      },

      React.createElement(
        View,
        { style: styles.header },

        React.createElement(
          Text,
          { style: styles.title },
          "BADAN AMIL ZAKAT NASIONAL"
        ),

        React.createElement(
          Text,
          { style: styles.subtitle },
          "PROVINSI NUSA TENGGARA BARAT"
        ),

        React.createElement(
          Text,
          { style: styles.reportTitle },
          "LAPORAN DONASI"
        )
      ),

      React.createElement(
        View,
        { style: styles.section },

        React.createElement(
          Text,
          { style: styles.bold },
          "Ringkasan Laporan"
        ),

        React.createElement(
          Text,
          null,
          "Total Donasi : " + rupiah(totalDonasi)
        ),

        React.createElement(
          Text,
          null,
          "Total Donatur : " + String(totalDonatur) + " Orang"
        ),

        React.createElement(
          Text,
          null,
          "Jumlah Transaksi : " + String(donations.length)
        ),

        React.createElement(
          Text,
          null,
          "Tanggal Cetak : " + tanggal(new Date())
        )
      ),

      React.createElement(
        View,
        { style: styles.section },

        React.createElement(
          Text,
          { style: styles.bold },
          "Rincian Donasi"
        ),

        React.createElement(
          View,
          { style: styles.tableHeader },

          React.createElement(
            Text,
            { style: styles.no },
            "No"
          ),

          React.createElement(
            Text,
            { style: styles.donor },
            "Donatur"
          ),

          React.createElement(
            Text,
            { style: styles.campaign },
            "Campaign"
          ),

          React.createElement(
            Text,
            { style: styles.amount },
            "Nominal"
          ),

          React.createElement(
            Text,
            { style: styles.status },
            "Status"
          )
        ),

        ...rows
      ),

      React.createElement(
        View,
        { style: styles.signature },

        React.createElement(
          View,
          { style: styles.signatureBox },

          React.createElement(
            Text,
            null,
            "Mengetahui,"
          ),

          React.createElement(
            Text,
            null,
            "Ketua"
          ),

          React.createElement(
            Text,
            { style: styles.signatureName },
            "Dr. Muhammad Iqbal, MA."
          )
        ),

        React.createElement(
          View,
          { style: styles.signatureBox },

          React.createElement(
            Text,
            null,
            "Mataram, " + tanggal(new Date())
          ),

          React.createElement(
            Text,
            null,
            "BADAN AMIL ZAKAT NASIONAL"
          ),

          React.createElement(
            Text,
            null,
            "PROVINSI NUSA TENGGARA BARAT"
          ),

          React.createElement(
            Text,
            null,
            "KABAG Pengumpulan"
          ),

          React.createElement(
            Text,
            { style: styles.signatureName },
            "Humaidi, S.Ak."
          )
        )
      )
    )
  );
}

export async function GET() {
  try {
    const donations = await prisma.donation.findMany({
      include: {
        campaign: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const document = React.createElement(
      LaporanPDF,
      {
        donations,
      }
    );

    const result = await pdf(
      document as any
    ).toBuffer();
    
    return new NextResponse(result as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition":
          'attachment; filename="laporan-donasi-baznas-ntb.pdf"',
      },
    });
  } catch (error) {
    console.error("PDF ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal membuat laporan PDF",
      },
      {
        status: 500,
      }
    );
  }
}
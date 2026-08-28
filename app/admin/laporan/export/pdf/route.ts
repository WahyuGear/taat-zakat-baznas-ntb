import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import PDFDocument from "pdfkit";
import path from "path";

export async function GET() {

  try {

    const donations = await prisma.donation.findMany({
      include:{
        campaign:true,
      },
      orderBy:{
        createdAt:"desc",
      },
    });


    const totalDonasi = donations.reduce(
      (total,item)=> total + item.amount,
      0
    );


    const totalDonatur = new Set(
      donations.map(item=>item.email)
    ).size;


    const totalCampaign = new Set(
      donations.map(item=>item.campaign?.title)
    ).size;



    const doc = new PDFDocument({
      size:"A4",
      margin:50
    });


    const regularFont = path.join(
      process.cwd(),
      "public/fonts/Roboto-Regular.ttf"
    );


    const boldFont = path.join(
      process.cwd(),
      "public/fonts/Roboto-Bold.ttf"
    );


    doc.registerFont(
      "Roboto",
      regularFont
    );


    doc.registerFont(
      "Roboto-Bold",
      boldFont
    );


    doc.font("Roboto");



    const buffers:any[]=[];


    doc.on("data",(chunk)=>{
      buffers.push(chunk);
    });


    const pdfBuffer = new Promise<Buffer>((resolve)=>{

      doc.on("end",()=>{

        resolve(Buffer.concat(buffers));

      });

    });



    // HEADER

    doc
    .font("Roboto-Bold")
    .fontSize(16)
    .text(
      "BADAN AMIL ZAKAT NASIONAL",
      {
        align:"center"
      }
    );


    doc
    .fontSize(14)
    .text(
      "PROVINSI NUSA TENGGARA BARAT",
      {
        align:"center"
      }
    );


    doc.moveDown();


    doc
    .font("Roboto-Bold")
    .fontSize(14)
    .text(
      "LAPORAN DONASI",
      {
        align:"center"
      }
    );


    doc.moveDown(2);



    // RINGKASAN

    doc
    .font("Roboto-Bold")
    .fontSize(12)
    .text(
      "Ringkasan Laporan"
    );


    doc.moveDown();


    doc
    .font("Roboto")
    .fontSize(10)
    .text(
`
Total Donasi : Rp ${totalDonasi.toLocaleString("id-ID")}

Total Donatur : ${totalDonatur} Orang

Total Campaign : ${totalCampaign} Program
`
    );



    doc.moveDown(2);



    // DETAIL

    doc
    .font("Roboto-Bold")
    .fontSize(12)
    .text(
      "Rincian Donasi"
    );


    doc.moveDown();



    donations.forEach((item,index)=>{


      doc
      .font("Roboto")
      .fontSize(9)
      .text(
`${index+1}. ${item.donorName}

Program : ${item.campaign?.title ?? "-"}

Nominal : Rp ${item.amount.toLocaleString("id-ID")}

Status : ${item.paymentStatus}

------------------------------------
`
      );


    });



    // TANDA TANGAN


    doc.moveDown(3);



    const tanggal = new Date()
    .toLocaleDateString(
      "id-ID",
      {
        day:"numeric",
        month:"long",
        year:"numeric"
      }
    );



    const leftX = 70;
    const rightX = 330;
    const y = doc.y;



    doc
    .font("Roboto")
    .fontSize(10);



    // KANAN TANGGAL

    doc.text(
      `Mataram, ${tanggal}`,
      rightX,
      y,
      {
        width:220,
        align:"center"
      }
    );



    // KIRI

    doc.text(
      "Mengetahui,",
      leftX,
      y+40,
      {
        width:180,
        align:"center"
      }
    );


    doc.text(
      "Ketua",
      leftX,
      y+60,
      {
        width:180,
        align:"center"
      }
    );



    // KANAN

    doc.text(
      "BADAN AMIL ZAKAT NASIONAL",
      rightX,
      y+40,
      {
        width:220,
        align:"center"
      }
    );


    doc.text(
      "PROVINSI NUSA TENGGARA BARAT",
      rightX,
      y+55,
      {
        width:220,
        align:"center"
      }
    );


    doc.text(
      "KABAG Pengumpulan",
      rightX,
      y+75,
      {
        width:220,
        align:"center"
      }
    );



    // NAMA BOLD


    doc
    .font("Roboto-Bold")
    .text(
      "Dr. Muhammad Iqbal, MA.",
      leftX,
      y+140,
      {
        width:180,
        align:"center"
      }
    );


    doc
    .text(
      "Humaidi, S.Ak.",
      rightX,
      y+140,
      {
        width:220,
        align:"center"
      }
    );



    doc.end();



    const buffer = await pdfBuffer;



    return new NextResponse(
      new Uint8Array(buffer),
      {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition":
            'attachment; filename="laporan-donasi.pdf"',
        },
      }
    );


  } catch(error:any){

    console.error(error);


    return NextResponse.json(
      {
        error:error.message
      },
      {
        status:500
      }
    );

  }

}
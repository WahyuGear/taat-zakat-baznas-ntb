import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function DonationDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

const donationId = Number(id);

if (!Number.isInteger(donationId)) {
  notFound();
}

const donation = await prisma.donation.findUnique({
  where: {
    id: donationId,
  },
  include: {
    campaign: true,
  },
});

if (!donation) {
  notFound();
}

  return (
    <div className="space-y-6">

      <h1 className="text-4xl font-bold">

        Detail Donasi

      </h1>

      <div className="rounded-3xl border bg-white p-8 shadow">

        <div className="space-y-4">

          <p>
            <b>Donatur :</b> {donation.donorName}
          </p>

          <p>
            <b>Email :</b> {donation.email}
          </p>

          <p>
            <b>Campaign :</b> {donation.campaign.title}
          </p>

          <p>
            <b>Nominal :</b>

            Rp {donation.amount.toLocaleString("id-ID")}

          </p>

          <p>

            <b>Status :</b>

            {donation.paymentStatus}

          </p>

          <p>

            <b>Tanggal :</b>

            {new Date(
              donation.createdAt
            ).toLocaleString("id-ID")}

          </p>

        </div>

      </div>

    </div>
  );
}
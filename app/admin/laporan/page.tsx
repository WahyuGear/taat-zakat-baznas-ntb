import { prisma } from "@/lib/prisma";
import {
  FolderKanban,
  HeartHandshake,
  Users,
  Wallet,
} from "lucide-react";
import StatsCard from "@/components/admin/stats-card";
import Link from "next/link";

export default async function LaporanPage() {

  const campaign = await prisma.campaign.count();

  const donor = await prisma.donation.groupBy({
    by: ["email"],
  });

  const donation = await prisma.donation.count();

  const total = await prisma.donation.aggregate({
    _sum: {
      amount: true,
    },
  });

  const campaignData = await prisma.campaign.findMany({
    orderBy: {
      collected: "desc",
    },
  });

  return (

    <div className="space-y-8">

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-4xl font-bold">
            Laporan
          </h1>

          <p className="text-gray-500">
            Statistik keseluruhan donasi
          </p>

        </div>

        <div className="flex gap-3">

          <Link
            href="/api/export/excel"
            className="rounded-xl bg-green-600 px-5 py-3 text-white"
          >
            Export Excel
          </Link>

          <Link
            href="/api/export/pdf"
            className="rounded-xl bg-red-600 px-5 py-3 text-white"
          >
            Export PDF
          </Link>

        </div>

      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

        <StatsCard
          title="Campaign"
          value={campaign}
          icon={<FolderKanban />}
        />

        <StatsCard
          title="Donasi"
          value={donation}
          icon={<HeartHandshake />}
        />

        <StatsCard
          title="Donatur"
          value={donor.length}
          icon={<Users />}
        />

        <StatsCard
          title="Dana"
          value={`Rp ${(total._sum.amount ?? 0).toLocaleString("id-ID")}`}
          icon={<Wallet />}
        />

      </div>

      <div className="rounded-3xl border bg-white shadow">

        <table className="w-full">

          <thead className="bg-gray-100">

            <tr>

              <th className="p-4">
                Campaign
              </th>

              <th className="p-4">
                Target
              </th>

              <th className="p-4">
                Terkumpul
              </th>

              <th className="p-4">
                Progress
              </th>

            </tr>

          </thead>

          <tbody>

            {campaignData.map((item) => {

              const progress =
                item.target > 0
                  ? (item.collected / item.target) * 100
                  : 0;

              return (

                <tr
                  key={item.id}
                  className="border-t"
                >

                  <td className="p-4 font-semibold">
                    {item.title}
                  </td>

                  <td className="p-4">
                    Rp {item.target.toLocaleString("id-ID")}
                  </td>

                  <td className="p-4 font-bold text-green-700">
                    Rp {item.collected.toLocaleString("id-ID")}
                  </td>

                  <td className="p-4">

                    <div className="h-3 overflow-hidden rounded-full bg-gray-200">

                      <div
                        className="h-full rounded-full bg-green-600"
                        style={{
                          width: `${progress}%`,
                        }}
                      />

                    </div>

                    <p className="mt-2 text-xs">

                      {progress.toFixed(1)}%

                    </p>

                  </td>

                </tr>

              );

            })}

          </tbody>

        </table>

      </div>

    </div>

  );

}
import DonationChart from "@/components/admin/dashboard/donation-chart";
import QuickAction from "@/components/admin/dashboard/quick-action";
import TopCampaign from "@/components/admin/dashboard/top-campaign";
import TopDonor from "@/components/admin/dashboard/top-donor";
import SummaryCard from "@/components/admin/dashboard/summary-card";
import StatsCard from "@/components/admin/stats-card";

import { prisma } from "@/lib/prisma";

import {
  FolderKanban,
  HeartHandshake,
  Users,
  Wallet,
} from "lucide-react";

import { format } from "date-fns";
import { id } from "date-fns/locale";

export default async function AdminPage() {

  const campaignCount = await prisma.campaign.count();

  const donationCount = await prisma.donation.count();

  const totalDonation = await prisma.donation.aggregate({
    _sum: {
      amount: true,
    },
  });

  const targetDonation = await prisma.campaign.aggregate({
    _sum: {
      target: true,
    },
  });

  const collectedDonation = await prisma.campaign.aggregate({
    _sum: {
      collected: true,
    },
  });

  const donorCount = await prisma.donation.groupBy({
    by: ["email"],
  });

  const topCampaign = await prisma.campaign.findMany({
    orderBy: {
      collected: "desc",
    },
    take: 5,
  });

  const topDonorData = await prisma.donation.groupBy({
    by: ["donorName"],
    _sum: {
      amount: true,
    },
    orderBy: {
      _sum: {
        amount: "desc",
      },
    },
    take: 5,
  });

  const donors = topDonorData.map((item) => ({
    donorName: item.donorName,
    amount: item._sum.amount ?? 0,
  }));

  const latestCampaign = await prisma.campaign.findMany({
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
  });

  const latestDonation = await prisma.donation.findMany({
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      campaign: true,
    },
  });

  const monthlyDonation = await prisma.donation.groupBy({
    by: ["createdAt"],
    _sum: {
      amount: true,
    },
  });

  const chartData = Array.from({ length: 12 }, (_, i) => {

    const month = i + 1;

    const total = monthlyDonation
      .filter(
        (item) =>
          new Date(item.createdAt).getMonth() + 1 === month
      )
      .reduce(
        (sum, item) =>
          sum + (item._sum.amount ?? 0),
        0
      );

    return {
      month: format(
        new Date(2026, i, 1),
        "MMM",
        {
          locale: id,
        }
      ),
      total,
    };
  });

  const progress =
    ((collectedDonation._sum.collected ?? 0) /
      (targetDonation._sum.target ?? 1)) *
    100;

  return (
    <div className="space-y-8">

      <div>

        <h1 className="text-4xl font-extrabold">
          Dashboard
        </h1>

        <p className="mt-2 text-gray-500">
          Selamat datang di Dashboard Admin BAZNAS NTB
        </p>

      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

        <StatsCard
          title="Campaign"
          value={campaignCount}
          icon={<FolderKanban />}
        />

        <StatsCard
          title="Donasi"
          value={donationCount}
          icon={<HeartHandshake />}
        />

        <StatsCard
          title="Donatur"
          value={donorCount.length}
          icon={<Users />}
        />

        <StatsCard
          title="Dana Masuk"
          value={`Rp ${(totalDonation._sum.amount ?? 0).toLocaleString("id-ID")}`}
          icon={<Wallet />}
        />

      </div>

      <SummaryCard
        target={targetDonation._sum.target ?? 0}
        collected={collectedDonation._sum.collected ?? 0}
        percentage={progress}
      />

      <div className="grid gap-8 xl:grid-cols-3">

        <div className="xl:col-span-2">

          <DonationChart
            data={chartData}
          />

        </div>

        <QuickAction />

      </div>
      <div className="grid gap-8 lg:grid-cols-2">

<TopCampaign campaigns={topCampaign} />

<TopDonor donors={donors} />

</div>

<div className="grid gap-8 lg:grid-cols-2">

<div className="rounded-3xl border bg-white p-6 shadow-sm">

  <h2 className="mb-6 text-2xl font-bold">
    Campaign Terbaru
  </h2>

  <div className="space-y-5">

    {latestCampaign.map((item) => (

      <div
        key={item.id}
        className="flex items-center justify-between border-b pb-4"
      >

        <div>

          <h3 className="font-semibold">
            {item.title}
          </h3>

          <p className="text-sm text-gray-500">
            {item.category}
          </p>

        </div>

        <div className="text-right">

          <p className="font-bold text-green-700">
            Rp {item.collected.toLocaleString("id-ID")}
          </p>

          <p className="text-xs text-gray-500">
            Target Rp {item.target.toLocaleString("id-ID")}
          </p>

        </div>

      </div>

    ))}

  </div>

</div>

<div className="rounded-3xl border bg-white p-6 shadow-sm">

  <h2 className="mb-6 text-2xl font-bold">
    Donasi Terbaru
  </h2>

  <div className="space-y-5">

    {latestDonation.map((item) => (

      <div
        key={item.id}
        className="flex items-center justify-between border-b pb-4"
      >

        <div>

          <h3 className="font-semibold">
            {item.donorName}
          </h3>

          <p className="text-sm text-gray-500">
            {item.campaign.title}
          </p>

        </div>

        <div className="text-right">

          <p className="font-bold text-green-700">
            Rp {item.amount.toLocaleString("id-ID")}
          </p>

          <span
            className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-bold ${
              item.paymentStatus === "SUCCESS"
                ? "bg-green-100 text-green-700"
                : item.paymentStatus === "PENDING"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {item.paymentStatus}
          </span>

        </div>

      </div>

    ))}

  </div>

</div>

</div>

</div>
);
}
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  ChevronLeft,
  Heart,
  Users,
  FileText,
  CalendarDays,
} from "lucide-react";

export default async function CampaignDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ amount?: string }>;
}) {
  const { slug } = await params;
  const { amount } = await searchParams;
  const campaign = await prisma.campaign.findUnique({
    where: {
      slug,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      image: true,
      target: true,
      collected: true,
      category: true,
      isActive: true,
    },
  });

  if (!campaign) {
    return (
      <main className="min-h-screen bg-[#f6f8f7] px-4 py-10">
        <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">
            Campaign tidak ditemukan
          </h1>

          <Link
            href="/campaign"
            className="mt-5 inline-flex rounded-xl bg-green-700 px-5 py-3 text-sm font-bold text-white"
          >
            Kembali ke Donasi
          </Link>
        </div>
      </main>
    );
  }

  const [donations, donationStats, reports] =
    await Promise.all([
      prisma.donation.findMany({
        where: {
          campaignId: campaign.id,
          paymentStatus: "SUCCESS",
        },
        select: {
          id: true,
          donorName: true,
          amount: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.donation.aggregate({
        where: {
          campaignId: campaign.id,
          paymentStatus: "SUCCESS",
        },
        _count: {
          _all: true,
        },
        _sum: {
          amount: true,
        },
      }),

      prisma.campaignReport.findMany({
        where: {
          campaignId: campaign.id,
          isPublished: true,
        },
        select: {
          id: true,
          title: true,
          description: true,
          createdAt: true,
          items: {
            select: {
              id: true,
              title: true,
              content: true,
              image: true,
              order: true,
            },
            orderBy: {
              order: "asc",
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);

  const donorCount = donationStats._count._all;
  const totalDonation = donationStats._sum.amount ?? 0;

  const percentage =
    campaign.target > 0
      ? Math.min(
          Math.round(
            (campaign.collected / campaign.target) * 100
          ),
          100
        )
      : 0;

  return (
    <main className="min-h-screen bg-[#f6f8f7] pb-28">
      {/* HEADER */}
      <div className="sticky top-0 z-40 flex h-14 items-center border-b border-slate-100 bg-white/95 px-4 backdrop-blur">
        <Link
          href="/campaign"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100"
        >
          <ChevronLeft
            size={20}
            className="text-slate-700"
          />
        </Link>

        <h1 className="ml-3 text-base font-bold text-slate-900">
          Detail Program
        </h1>
      </div>

      {/* CONTENT */}
      <div className="mx-auto w-full max-w-[430px]">
        {/* CAMPAIGN IMAGE */}
        <div className="w-full bg-slate-100">
          <Image
            src={campaign.image}
            alt={campaign.title}
            width={1200}
            height={675}
            priority
            sizes="(max-width: 430px) 100vw, 430px"
            className="h-auto w-full object-contain"
          />
        </div>

        {/* CAMPAIGN INFO */}
        <div className="rounded-b-[28px] bg-white px-5 pb-6 pt-5">
          {/* CATEGORY */}
          {campaign.category && (
            <span className="inline-flex rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700">
              {campaign.category}
            </span>
          )}

          {/* TITLE */}
          <h2 className="mt-3 text-[22px] font-extrabold leading-tight tracking-tight text-slate-900">
            {campaign.title}
          </h2>

          {/* PROGRESS */}
          <div className="mt-6">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-slate-500">
                  Terkumpul
                </p>

                <p className="mt-1 text-lg font-extrabold text-green-700">
                  Rp{" "}
                  {campaign.collected.toLocaleString(
                    "id-ID"
                  )}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs text-slate-500">
                  Target
                </p>

                <p className="mt-1 text-sm font-bold text-slate-800">
                  Rp{" "}
                  {campaign.target.toLocaleString(
                    "id-ID"
                  )}
                </p>
              </div>
            </div>

            {/* PROGRESS BAR */}
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-green-600 transition-all"
                style={{
                  width: `${percentage}%`,
                }}
              />
            </div>

            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                {percentage}% tercapai
              </span>

              <span className="text-xs text-slate-400">
                Program BAZNAS NTB
              </span>
            </div>
          </div>

          {/* STATISTIK DONASI */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            {/* TOTAL DONASI */}
            <div className="rounded-2xl bg-green-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white">
                  <Heart
                    size={19}
                    className="text-green-700"
                    fill="currentColor"
                  />
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] text-slate-500">
                    Total Donasi
                  </p>

                  <p className="mt-1 truncate text-sm font-extrabold text-slate-900">
                    Rp{" "}
                    {totalDonation.toLocaleString(
                      "id-ID"
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* JUMLAH DONATUR */}
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white">
                  <Users
                    size={19}
                    className="text-slate-600"
                  />
                </div>

                <div>
                  <p className="text-[10px] text-slate-500">
                    Jumlah Donatur
                  </p>

                  <p className="mt-1 text-sm font-extrabold text-slate-900">
                    {donorCount.toLocaleString(
                      "id-ID"
                    )}{" "}
                    orang
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* DAFTAR DONATUR */}
          <div className="mt-8 border-t border-slate-100 pt-7">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Donatur
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Terima kasih atas kebaikan dan dukungan Anda.
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50">
                <Users
                  size={17}
                  className="text-green-700"
                />
              </div>
            </div>

            {/* BELUM ADA DONATUR */}
            {donations.length === 0 ? (
              <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">
                <Users
                  size={28}
                  className="mx-auto text-slate-300"
                />

                <p className="mt-3 text-sm font-bold text-slate-700">
                  Belum ada donasi
                </p>

                <p className="mt-1 text-[11px] leading-5 text-slate-400">
                  Jadilah orang pertama yang mendukung
                  program ini.
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                {donations.map((donation) => (
                  <div
                    key={donation.id}
                    className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3"
                  >
                    {/* AVATAR */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-50 text-sm font-extrabold text-green-700">
                      {donation.donorName
                        ?.charAt(0)
                        .toUpperCase() || "D"}
                    </div>

                    {/* DONOR */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-slate-800">
                        {donation.donorName ||
                          "Hamba Allah"}
                      </p>

                      <p className="mt-0.5 flex items-center gap-1 text-[9px] text-slate-400">
                        <CalendarDays size={10} />

                        {new Date(
                          donation.createdAt
                        ).toLocaleDateString(
                          "id-ID",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </p>
                    </div>

                    {/* NOMINAL */}
                    <div className="shrink-0 text-right">
                      <p className="text-xs font-extrabold text-green-700">
                        Rp{" "}
                        {donation.amount.toLocaleString(
                          "id-ID"
                        )}
                      </p>

                      <p className="mt-0.5 text-[8px] text-slate-400">
                        Donasi
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* TENTANG PROGRAM */}
          <div className="mt-8 border-t border-slate-100 pt-7">
            <h3 className="text-lg font-extrabold text-slate-900">
              Tentang Program
            </h3>

            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">
              {campaign.description}
            </p>
          </div>

          {/* STATUS PROGRAM */}
          <div className="mt-6">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
                  <Users
                    size={18}
                    className="text-slate-600"
                  />
                </div>

                <div>
                  <p className="text-[10px] text-slate-500">
                    Status Program
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-900">
                    {campaign.isActive
                      ? "Aktif"
                      : "Selesai"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* LAPORAN & DOKUMENTASI */}
          <div className="mt-8 border-t border-slate-100 pt-7">
            {/* REPORT HEADER */}
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-green-50">
                <FileText
                  size={21}
                  className="text-green-700"
                />
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Laporan & Dokumentasi
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Transparansi perkembangan dan dokumentasi
                  pelaksanaan program.
                </p>
              </div>
            </div>

            {/* BELUM ADA LAPORAN */}
            {reports.length === 0 ? (
              <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">
                <FileText
                  size={28}
                  className="mx-auto text-slate-300"
                />

                <p className="mt-3 text-sm font-bold text-slate-700">
                  Belum ada laporan
                </p>

                <p className="mt-1 text-[11px] leading-5 text-slate-400">
                  Laporan dan dokumentasi program akan
                  ditampilkan di sini.
                </p>
              </div>
            ) : (
              <div className="mt-5 space-y-6">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm"
                  >
                    {/* REPORT HEADER */}
                    <div className="px-4 pb-3 pt-4">
                      <div className="flex items-center gap-2">
                        <CalendarDays
                          size={14}
                          className="text-green-600"
                        />

                        <span className="text-[10px] font-semibold text-slate-400">
                          {new Date(
                            report.createdAt
                          ).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }
                          )}
                        </span>
                      </div>

                      <h4 className="mt-2 text-base font-extrabold text-slate-900">
                        {report.title}
                      </h4>

                      {report.description && (
                        <p className="mt-2 whitespace-pre-line text-xs leading-5 text-slate-500">
                          {report.description}
                        </p>
                      )}
                    </div>

                    {/* REPORT ITEMS */}
                    {report.items.length > 0 && (
                      <div className="border-t border-slate-100">
                        {report.items.map((item) => (
                          <div
                            key={item.id}
                            className="border-b border-slate-100 last:border-b-0"
                          >
                            {/* IMAGE */}
                            <div className="relative aspect-[16/10] w-full bg-slate-100">
                              <Image
                                src={item.image}
                                alt={
                                  item.title ||
                                  report.title
                                }
                                fill
                                sizes="(max-width: 430px) 100vw, 430px"
                                className="object-cover"
                              />
                            </div>

                            {/* CONTENT */}
                            <div className="px-4 py-4">
                              {item.title && (
                                <h5 className="text-sm font-extrabold text-slate-900">
                                  {item.title}
                                </h5>
                              )}

                              {item.content && (
                                <p className="mt-2 whitespace-pre-line text-xs leading-6 text-slate-600">
                                  {item.content}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM DONATION BUTTON */}
      <div className="fixed bottom-[140px] left-1/2 z-40 w-full max-w-[430px] -translate-x-1/2 px-4">
        <Link
  href={
    amount
      ? `/campaign/${campaign.slug}/donasi?amount=${encodeURIComponent(amount)}`
      : `/campaign/${campaign.slug}/donasi`
  }
          className="flex h-12 w-full items-center justify-center rounded-2xl bg-green-700 text-sm font-extrabold text-white shadow-xl shadow-green-700/25 transition active:scale-[0.98]"
        >
          <Heart
            size={19}
            fill="currentColor"
            className="mr-2"
          />
          Donasi Sekarang
        </Link>
      </div>
    </main>
  );
}
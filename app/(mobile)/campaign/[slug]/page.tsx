import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ChevronLeft, Heart, Users } from "lucide-react";

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const campaign = await prisma.campaign.findUnique({
    where: {
      slug,
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

        {/* IMAGE LANDSCAPE */}
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

          {/* DESCRIPTION */}
          <div className="mt-7">

            <h3 className="text-lg font-extrabold text-slate-900">
              Tentang Program
            </h3>

            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">
              {campaign.description}
            </p>

          </div>

          {/* INFO CARD */}
          <div className="mt-6 grid grid-cols-2 gap-3">

            <div className="rounded-2xl bg-green-50 p-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white">
                  <Heart
                    size={18}
                    className="text-green-700"
                  />
                </div>

                <div>
                  <p className="text-[11px] text-slate-500">
                    Donasi Terkumpul
                  </p>

                  <p className="text-sm font-bold text-slate-900">
                    Rp{" "}
                    {campaign.collected.toLocaleString(
                      "id-ID"
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white">
                  <Users
                    size={18}
                    className="text-slate-600"
                  />
                </div>

                <div>
                  <p className="text-[11px] text-slate-500">
                    Status Program
                  </p>

                  <p className="text-sm font-bold text-slate-900">
                    Aktif
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* BOTTOM DONATION BUTTON */}
      {/* TOMBOL DONASI */}
{/* TOMBOL DONASI */}
<div className="fixed bottom-[140px] left-1/2 z-40 w-full max-w-[430px] -translate-x-1/2 px-4">
  <Link
    href={`/campaign/${campaign.slug}/donasi`}
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

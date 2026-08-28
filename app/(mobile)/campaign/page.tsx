import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  Search,
  ChevronRight,
  Heart,
} from "lucide-react";

export default async function CampaignPage() {
  const campaigns = await prisma.campaign.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="min-h-screen bg-[#F5F7FB] px-4 pb-28 pt-6">
      {/* HEADER */}
      <div className="mb-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-green-700">
              BAZNAS NTB
            </p>

            <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
              Donasi
            </h1>

            <p className="mt-1 text-[11px] text-slate-400">
              Salurkan kebaikan untuk mereka yang membutuhkan
            </p>
          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50">
            <Heart
              size={18}
              strokeWidth={2}
              className="text-green-700"
            />
          </div>
        </div>
      </div>

      {/* SEARCH */}
      <div className="mb-4 flex h-11 items-center gap-2 rounded-2xl border border-slate-100 bg-white px-3 shadow-sm">
        <Search
          size={17}
          className="shrink-0 text-slate-400"
        />

        <span className="text-xs text-slate-400">
          Cari program donasi...
        </span>
      </div>

      {/* CATEGORY */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button className="shrink-0 rounded-full bg-green-700 px-4 py-2 text-[10px] font-semibold text-white">
          Semua
        </button>

        <button className="shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-[10px] font-medium text-slate-500">
          Zakat
        </button>

        <button className="shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-[10px] font-medium text-slate-500">
          Infak
        </button>

        <button className="shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-[10px] font-medium text-slate-500">
          DSKL
        </button>

        <button className="shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-[10px] font-medium text-slate-500">
          Kurban
        </button>
      </div>

      {/* SECTION HEADER */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Semua Program
          </h2>

          <p className="mt-0.5 text-[10px] text-slate-400">
            Pilih program yang ingin kamu dukung
          </p>
        </div>

        <span className="rounded-full bg-green-50 px-2.5 py-1 text-[9px] font-semibold text-green-700">
          {campaigns.length} Program
        </span>
      </div>

      {/* CAMPAIGN GRID */}
      {campaigns.length === 0 ? (
        <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
            <Heart
              size={22}
              className="text-green-700"
            />
          </div>

          <h3 className="mt-3 text-sm font-semibold text-slate-800">
            Belum ada program
          </h3>

          <p className="mt-1 text-xs text-slate-400">
            Program donasi akan muncul di sini.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {campaigns.map((campaign) => {
            const progress =
              campaign.target > 0
                ? Math.min(
                    100,
                    Math.round(
                      (campaign.collected /
                        campaign.target) *
                        100
                    )
                  )
                : 0;

            return (
              <Link
                key={campaign.id}
                href={`/campaign/${campaign.slug}`}
                className="
                  group
                  overflow-hidden
                  rounded-2xl
                  border
                  border-slate-100
                  bg-white
                  shadow-sm
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:shadow-lg
                  active:scale-[0.97]
                "
              >
                {/* IMAGE */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                  <Image
                    src={campaign.image}
                    alt={campaign.title}
                    fill
                    sizes="(max-width: 640px) 50vw, 300px"
                    className="
                      object-contain
                      bg-slate-100
                      transition-transform
                      duration-500
                      group-hover:scale-[1.03]
                    "
                  />

                  {/* BADGE */}
                  {campaign.featured && (
                    <div className="absolute left-2 top-2 rounded-full bg-green-700 px-2 py-1 text-[7px] font-semibold text-white shadow-sm">
                      PILIHAN
                    </div>
                  )}
                </div>

                {/* CONTENT */}
                <div className="p-2.5">
                  {/* TITLE */}
                  <h3 className="line-clamp-2 min-h-[28px] text-[10px] font-semibold leading-[14px] text-slate-900 transition-colors group-hover:text-green-700">
                    {campaign.title}
                  </h3>

                  {/* PROGRESS */}
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-green-600 transition-all duration-700"
                      style={{
                        width: `${progress}%`,
                      }}
                    />
                  </div>

                  {/* INFO */}
                  <div className="mt-2 flex items-center justify-between gap-1">
                    <div className="min-w-0">
                      <p className="text-[7px] font-medium text-slate-400">
                        Terkumpul
                      </p>

                      <p className="truncate text-[9px] font-semibold text-green-700">
                        Rp{" "}
                        {campaign.collected.toLocaleString(
                          "id-ID"
                        )}
                      </p>
                    </div>

                    <span className="shrink-0 rounded-md bg-green-700 px-2 py-1 text-[8px] font-semibold text-white">
                      Donasi
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* FOOT NOTE */}
      {campaigns.length > 0 && (
        <div className="mt-6 flex items-center justify-center gap-1 text-[9px] text-slate-400">
          <span>Program resmi</span>
          <span className="font-semibold text-green-700">
            BAZNAS NTB
          </span>
          <ChevronRight size={11} />
        </div>
      )}
    </main>
  );
}
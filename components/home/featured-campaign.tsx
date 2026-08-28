"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type Campaign = {
  id: number;
  title: string;
  slug: string;
  image: string;
  collected: number;
  target: number;
};

export default function FeaturedCampaign() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        const response = await fetch("/api/campaign/featured", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Gagal mengambil campaign");
        }

        const data = await response.json();
        setCampaigns(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("FEATURED CAMPAIGN ERROR:", error);
        setCampaigns([]);
      } finally {
        setLoading(false);
      }
    };

    loadCampaigns();
  }, []);

  if (loading) {
    return (
      <section className="mt-6">
        <div className="mb-4">
          <h2 className="text-base font-bold text-slate-900">
            Top Campaign
          </h2>
          <p className="mt-0.5 text-[11px] text-slate-400">
            Program pilihan BAZNAS NTB
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="overflow-hidden rounded-2xl bg-white shadow-sm"
            >
              <div className="aspect-[16/9] animate-pulse bg-slate-200" />

              <div className="p-3">
                <div className="h-3 animate-pulse rounded bg-slate-200" />
                <div className="mt-2 h-3 w-3/4 animate-pulse rounded bg-slate-200" />
                <div className="mt-3 h-1.5 animate-pulse rounded-full bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (campaigns.length === 0) {
    return (
      <section className="mt-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Top Campaign
          </h2>

          <Link
            href="/campaign"
            className="text-[10px] font-bold text-green-700"
          >
            Lihat Semua
          </Link>
        </div>

        <div className="rounded-2xl bg-white p-5 text-center shadow-sm">
          <p className="text-sm font-bold text-slate-700">
            Belum ada Top Campaign
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Campaign pilihan akan muncul di sini.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-6">
      {/* HEADER */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Top Campaign
          </h2>

          <p className="mt-0.5 text-[11px] text-slate-400">
            Program pilihan BAZNAS NTB
          </p>
        </div>

        <Link
          href="/campaign"
          className="rounded-full border border-green-100 px-3 py-1.5 text-[10px] font-bold text-green-700 transition hover:bg-green-700 hover:text-white"
        >
          Lihat Semua
        </Link>
      </div>

      {/* CAMPAIGNS */}
      <div className="grid grid-cols-2 gap-3">
        {campaigns.map((item) => {
          const percent =
            item.target > 0
              ? Math.min(
                  100,
                  Math.round((item.collected / item.target) * 100)
                )
              : 0;

          return (
            <Link
              key={item.id}
              href={`/campaign/${item.slug}`}
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
              {/* LANDSCAPE IMAGE */}
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                <Image
                  src={item.image}
                  alt={item.title}
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

                <div className="absolute left-2 top-2 rounded-full bg-green-700 px-2 py-1 text-[7px] font-bold text-white">
                  PILIHAN
                </div>
              </div>

              {/* CONTENT */}
              <div className="p-2.5">
                <h3 className="line-clamp-2 min-h-[28px] text-[10px] font-bold leading-[14px] text-slate-900 group-hover:text-green-700">
                  {item.title}
                </h3>

                {/* PROGRESS */}
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-green-600 transition-all duration-700"
                    style={{
                      width: `${percent}%`,
                    }}
                  />
                </div>

                {/* BOTTOM */}
                <div className="mt-2 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-[7px] text-slate-400">
                      Terkumpul
                    </p>

                    <p className="truncate text-[9px] font-bold text-green-700">
                      Rp {item.collected.toLocaleString("id-ID")}
                    </p>
                  </div>

                  <span className="rounded-md bg-green-700 px-2 py-1 text-[8px] font-bold text-white">
                    Donasi
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
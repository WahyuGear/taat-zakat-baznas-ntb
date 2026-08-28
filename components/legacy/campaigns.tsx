import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

export default async function Campaigns() {
  const campaigns = await prisma.campaign.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 8,
  });

  return (
    <section className="bg-gray-50 py-10 md:py-16">
      <div className="mx-auto max-w-7xl px-4">

        {/* Header */}

        <div className="mb-8 flex items-center justify-between">

          <div>

            <h2 className="text-2xl font-extrabold md:text-4xl">
              Program Donasi
            </h2>

            <p className="mt-2 text-sm text-gray-500 md:text-base">
              Pilih program terbaik untuk membantu sesama.
            </p>

          </div>

          <Link
            href="/campaign"
            className="hidden rounded-xl border border-green-700 px-5 py-2 font-semibold text-green-700 transition hover:bg-green-700 hover:text-white md:block"
          >
            Lihat Semua
          </Link>

        </div>

        {/* Grid */}

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">

          {campaigns.map((campaign) => {

            const progress =
              campaign.target > 0
                ? Math.min(
                    (campaign.collected / campaign.target) * 100,
                    100
                  )
                : 0;

            return (

              <article
                key={campaign.id}
                className="overflow-hidden rounded-2xl border bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >

                {/* IMAGE */}

                <Link href={`/campaign/${campaign.slug}`}>

                  <div className="relative h-32 overflow-hidden md:h-48">

                    <Image
                      src={campaign.image}
                      alt={campaign.title}
                      fill
                      sizes="(max-width:768px) 50vw,
                             (max-width:1280px) 33vw,
                             25vw"
                      className="object-cover transition duration-500 hover:scale-105"
                    />

                    <div className="absolute left-2 top-2 rounded-full bg-green-700 px-2 py-1 text-[10px] font-bold text-white md:px-3 md:text-xs">

                      {campaign.category}

                    </div>

                  </div>

                </Link>

                {/* CONTENT */}

                <div className="p-3 md:p-5">

                  <Link href={`/campaign/${campaign.slug}`}>

                    <h3 className="line-clamp-2 text-sm font-bold leading-5 text-gray-900 transition hover:text-green-700 md:text-xl">

                      {campaign.title}

                    </h3>

                  </Link>

                  <p className="mt-2 hidden line-clamp-2 text-sm text-gray-500 md:block">

                    {campaign.description}

                  </p>

                  {/* Progress */}

                  <div className="mt-4">

                    <div className="mb-2 flex items-center justify-between">

                      <span className="text-[11px] text-gray-500">

                        Progress

                      </span>

                      <span className="text-[11px] font-bold text-green-700">

                        {progress.toFixed(0)}%

                      </span>

                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-gray-200">

                      <div
                        className="h-full rounded-full bg-green-600 transition-all"
                        style={{
                          width: `${progress}%`,
                        }}
                      />

                    </div>

                  </div>

                  {/* Nominal */}

                  <div className="mt-4">

                    <p className="text-[10px] text-gray-500">

                      Terkumpul

                    </p>

                    <h4 className="mt-1 text-sm font-bold text-green-700 md:text-lg">

                      Rp {campaign.collected.toLocaleString("id-ID")}

                    </h4>

                    <p className="mt-1 text-[10px] text-gray-500">

                      Target Rp {campaign.target.toLocaleString("id-ID")}

                    </p>

                  </div>

                  {/* Button */}

                  <Link
                    href={`/campaign/${campaign.slug}`}
                    className="mt-4 flex h-9 items-center justify-center rounded-xl bg-green-700 text-xs font-semibold text-white transition hover:bg-green-800 md:h-11 md:text-sm"
                  >
                    Lihat Detail
                  </Link>

                </div>

              </article>

            );

          })}

        </div>

        {/* Mobile Button */}

        <div className="mt-8 text-center md:hidden">

          <Link
            href="/campaign"
            className="inline-flex rounded-xl border border-green-700 px-6 py-3 font-semibold text-green-700 transition hover:bg-green-700 hover:text-white"
          >
            Lihat Semua Program
          </Link>

        </div>

      </div>
    </section>
  );
}
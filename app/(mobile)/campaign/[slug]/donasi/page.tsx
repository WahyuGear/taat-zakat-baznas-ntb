import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ChevronLeft } from "lucide-react";
import DonasiForm from "./donasi-form";

export default async function DonasiPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const campaign =
    await prisma.campaign.findUnique({
      where: {
        slug,
      },
    });

  if (!campaign) {
    return (
      <main className="min-h-screen bg-[#f6f8f7] px-4 py-10">
        <div className="mx-auto max-w-[430px] rounded-3xl bg-white p-8 text-center shadow-sm">

          <h1 className="text-xl font-extrabold text-slate-900">
            Campaign tidak ditemukan
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Campaign yang Anda cari mungkin
            sudah tidak tersedia.
          </p>

          <p className="mt-4 break-all rounded-xl bg-slate-100 p-3 text-xs font-bold text-slate-600">
            {slug}
          </p>

          <Link
            href="/campaign"
            className="mt-6 block rounded-2xl bg-green-700 py-3.5 font-bold text-white"
          >
            Kembali ke Campaign
          </Link>

        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f8f7] pb-10">

      {/* HEADER */}

      <div className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[430px] items-center px-4">

          <Link
            href={`/campaign/${campaign.slug}`}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100"
          >
            <ChevronLeft size={20} />
          </Link>

          <h1 className="ml-3 font-extrabold">
            Donasi
          </h1>

        </div>
      </div>

      <div className="mx-auto max-w-[430px]">

        {/* GAMBAR LANDSCAPE */}

        <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-200">

          <Image
            src={campaign.image}
            alt={campaign.title}
            fill
            priority
            sizes="(max-width: 430px) 100vw, 430px"
            className="object-cover"
          />

        </div>

        {/* INFO */}

        <section className="bg-white px-5 py-5">

          {campaign.category && (
            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
              {campaign.category}
            </span>
          )}

          <h2 className="mt-3 text-xl font-extrabold leading-tight">
            {campaign.title}
          </h2>

          <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
            {campaign.description}
          </p>

          <div className="mt-5 flex justify-between">

            <div>
              <p className="text-xs text-slate-500">
                Terkumpul
              </p>

              <p className="font-extrabold text-green-700">
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

              <p className="font-bold">
                Rp{" "}
                {campaign.target.toLocaleString(
                  "id-ID"
                )}
              </p>
            </div>

          </div>

        </section>

        {/* FORM DONASI */}

        <div className="mt-3">
          <DonasiForm slug={campaign.slug} />
        </div>

      </div>
    </main>
  );
}
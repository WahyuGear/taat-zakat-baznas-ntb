import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function CampaignDetail({ params }: Props) {
  const { slug } = await params;

  const campaign = await prisma.campaign.findUnique({
    where: {
      slug,
    },
  });

  if (!campaign) {
    notFound();
  }

  const percent = Math.min(
    100,
    Math.round((campaign.collected / campaign.target) * 100)
  );

  return (
    <main className="min-h-screen bg-[#F5F7FB] pb-28">

      <div className="mx-auto max-w-5xl">

        <div className="relative h-[280px] overflow-hidden bg-slate-200 md:h-[420px]">

          <Image
            src={campaign.image}
            alt={campaign.title}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 1200px"
          />

        </div>

        <div className="px-5 py-6">

          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
            {campaign.category}
          </span>

          <h1 className="mt-4 text-2xl font-bold leading-tight text-slate-900 md:text-4xl">
            {campaign.title}
          </h1>

          <p className="mt-4 leading-7 text-slate-600">
            {campaign.description}
          </p>

          <div className="mt-6 rounded-3xl bg-white p-5 shadow-sm">

            <div className="h-3 overflow-hidden rounded-full bg-slate-200">

              <div
                className="h-full rounded-full bg-green-600"
                style={{
                  width: `${percent}%`,
                }}
              />

            </div>

            <div className="mt-4 flex items-end justify-between">

              <div>
                <p className="text-xs text-slate-500">
                  Terkumpul
                </p>

                <p className="text-xl font-bold text-green-700">
                  Rp {campaign.collected.toLocaleString("id-ID")}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs text-slate-500">
                  Target
                </p>

                <p className="font-semibold">
                  Rp {campaign.target.toLocaleString("id-ID")}
                </p>
              </div>

            </div>

            <p className="mt-3 text-sm font-semibold text-slate-500">
              {percent}% tercapai
            </p>

          </div>

        </div>

        <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-white p-4 md:static md:border-0 md:bg-transparent md:px-5">

          <div className="mx-auto max-w-5xl">

            <Link
              href={`/donasi/${campaign.slug}`}
              className="block w-full rounded-2xl bg-green-700 py-4 text-center font-bold text-white shadow-lg transition hover:bg-green-800"
            >
              Donasi Sekarang
            </Link>

          </div>

        </div>

      </div>

    </main>
  );
}
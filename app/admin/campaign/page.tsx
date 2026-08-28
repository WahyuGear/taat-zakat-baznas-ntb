import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import DeleteButton from "./delete-button";
import SearchCampaign from "./search";

export default async function CampaignAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search } = await searchParams;

  const campaigns = await prisma.campaign.findMany({
    where: {
      title: {
        contains: search ?? "",
        mode: "insensitive",
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-8">

      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

        <div>

          <h1 className="text-4xl font-bold">
            Campaign
          </h1>

          <p className="text-gray-500">
            Kelola seluruh campaign donasi
          </p>

        </div>

        <Link
          href="/admin/campaign/new"
          className="rounded-2xl bg-green-700 px-6 py-3 font-semibold text-white"
        >
          + Tambah Campaign
        </Link>

      </div>

      <SearchCampaign />

      <div className="hidden overflow-hidden rounded-3xl border bg-white shadow md:block">

        <table className="w-full">

          <thead className="bg-gray-100">

            <tr>

              <th className="p-5 text-left">
                Campaign
              </th>

              <th className="p-5">
                Kategori
              </th>

              <th className="p-5">
                Target
              </th>

              <th className="p-5">
                Terkumpul
              </th>

              <th className="p-5">
                Status
              </th>

              <th className="p-5">
                Aksi
              </th>

            </tr>

          </thead>

          <tbody>

            {campaigns.map((item) => {

              const progress =
                item.target > 0
                  ? (item.collected / item.target) * 100
                  : 0;

              return (

                <tr
                  key={item.id}
                  className="border-t transition hover:bg-green-50"
                >

                  <td className="p-5">

                    <div className="flex gap-4">

                      <div className="relative h-16 w-24 overflow-hidden rounded-xl">

                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />

                      </div>

                      <div className="flex-1">

                        <p className="font-bold">
                          {item.title}
                        </p>

                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200">

                          <div
                            className={`h-full rounded-full ${
                              progress < 30
                                ? "bg-red-500"
                                : progress < 70
                                ? "bg-yellow-500"
                                : "bg-green-600"
                            }`}
                            style={{
                              width: `${progress}%`,
                            }}
                          />

                        </div>

                        <div className="mt-2 flex justify-between text-xs">

                          <span>
                            {progress.toFixed(0)}%
                          </span>

                          <span>

                            Rp {item.collected.toLocaleString("id-ID")}

                          </span>

                        </div>

                      </div>

                    </div>

                  </td>

                  <td className="p-5">

                    <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">

                      {item.category}

                    </span>

                  </td>

                  <td className="p-5 font-semibold">

                    Rp {item.target.toLocaleString("id-ID")}

                  </td>

                  <td className="p-5 font-bold text-green-700">

                    Rp {item.collected.toLocaleString("id-ID")}

                  </td>

                  <td className="p-5">

                    <div className="flex flex-col gap-2">

                      {item.isActive ? (

                        <span className="rounded-full bg-green-100 px-3 py-1 text-center text-xs font-bold text-green-700">

                          🟢 Aktif

                        </span>

                      ) : (

                        <span className="rounded-full bg-red-100 px-3 py-1 text-center text-xs font-bold text-red-700">

                          🔴 Nonaktif

                        </span>

                      )}

                      {item.featured && (

                        <span className="rounded-full bg-yellow-100 px-3 py-1 text-center text-xs font-bold text-yellow-700">

                          ⭐ Unggulan

                        </span>

                      )}

                    </div>

                  </td>

                  <td className="p-5">

                    <div className="flex gap-2">

                      <Link
                        href={`/admin/campaign/edit/${item.id}`}
                        className="rounded-xl bg-blue-600 px-4 py-2 text-white"
                      >
                        Edit
                      </Link>

                      <DeleteButton id={item.id} />

                    </div>

                  </td>

                </tr>

              );

            })}

          </tbody>

        </table>

      </div>

      {/* ================= MOBILE ================= */}

      <div className="space-y-5 md:hidden">

        {campaigns.map((item) => {

          const progress =
            item.target > 0
              ? (item.collected / item.target) * 100
              : 0;

          return (

            <div
              key={item.id}
              className="overflow-hidden rounded-3xl border bg-white shadow"
            >

              <div className="relative h-52 w-full">

                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                />

              </div>

              <div className="p-5">

                <div className="flex items-start justify-between">

                  <div>

                    <h2 className="text-lg font-bold">
                      {item.title}
                    </h2>

                    <span className="mt-2 inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">

                      {item.category}

                    </span>

                  </div>

                  {item.featured && (

                    <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700">

                      ⭐ Unggulan

                    </span>

                  )}

                </div>

                <div className="mt-5">

                  <div className="mb-2 flex justify-between text-sm">

                    <span>Terkumpul</span>

                    <span className="font-bold text-green-700">

                      Rp {item.collected.toLocaleString("id-ID")}

                    </span>

                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-gray-200">

                    <div
                      className={`h-full ${
                        progress < 30
                          ? "bg-red-500"
                          : progress < 70
                          ? "bg-yellow-500"
                          : "bg-green-600"
                      }`}
                      style={{
                        width: `${progress}%`,
                      }}
                    />

                  </div>

                  <div className="mt-2 flex justify-between text-xs text-gray-500">

                    <span>

                      {progress.toFixed(0)}%

                    </span>

                    <span>

                      Target Rp {item.target.toLocaleString("id-ID")}

                    </span>

                  </div>

                </div>

                <div className="mt-5 flex items-center justify-between">

                  {item.isActive ? (

                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">

                      🟢 Aktif

                    </span>

                  ) : (

                    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">

                      🔴 Nonaktif

                    </span>

                  )}

                  <div className="flex gap-2">

                    <Link
                      href={`/admin/campaign/edit/${item.id}`}
                      className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
                    >
                      Edit
                    </Link>

                    <DeleteButton id={item.id} />

                  </div>

                </div>

              </div>

            </div>

          );

        })}

      </div>

    </div>

  );

}
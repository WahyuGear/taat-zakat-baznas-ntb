import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function DonorPage() {
  const donors = await prisma.donation.groupBy({
    by: ["email", "donorName"],
    _count: {
      id: true,
    },
    _sum: {
      amount: true,
    },
    orderBy: {
      _sum: {
        amount: "desc",
      },
    },
  });

  return (
    <div className="space-y-8">

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-4xl font-bold">
            Donatur
          </h1>

          <p className="text-gray-500">
            Seluruh data donatur
          </p>

        </div>

        <div className="flex gap-3">

          <button className="rounded-xl bg-green-700 px-5 py-3 text-white">
            Export Excel
          </button>

          <button className="rounded-xl bg-red-600 px-5 py-3 text-white">
            Export PDF
          </button>

        </div>

      </div>

      <div className="overflow-hidden rounded-3xl border bg-white shadow">

        <table className="w-full">

          <thead className="bg-gray-100">

            <tr>

              <th className="p-4 text-left">
                Donatur
              </th>

              <th className="p-4">
                Email
              </th>

              <th className="p-4">
                Total Donasi
              </th>

              <th className="p-4">
                Frekuensi
              </th>

              <th className="p-4">
                Detail
              </th>

            </tr>

          </thead>

          <tbody>

            {donors.map((item) => (

<tr
  key={`${item.email || "donor"}-${item.donorName || "unknown"}`}
  className="border-t hover:bg-gray-50"
>

                <td className="p-4 font-semibold">
                  {item.donorName}
                </td>

                <td className="p-4">
                  {item.email}
                </td>

                <td className="p-4 font-bold text-green-700">
                  Rp {(item._sum.amount ?? 0).toLocaleString("id-ID")}
                </td>

                <td className="p-4">
                  {item._count.id} Kali
                </td>

                <td className="p-4">

                  <Link
                    href={`/admin/donor/${encodeURIComponent(item.email)}`}
                    className="rounded-xl bg-blue-600 px-4 py-2 text-white"
                  >
                    Detail
                  </Link>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}
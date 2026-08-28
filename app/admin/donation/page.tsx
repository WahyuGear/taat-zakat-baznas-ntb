import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function DonationPage() {
  const donations = await prisma.donation.findMany({
    include: {
      campaign: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-8">

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-4xl font-bold">
            Data Donasi
          </h1>

          <p className="text-gray-500">
            Seluruh transaksi donasi
          </p>

        </div>

        <div className="flex gap-3">

          <button className="rounded-xl bg-green-600 px-5 py-3 text-white">
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
                Campaign
              </th>

              <th className="p-4">
                Nominal
              </th>

              <th className="p-4">
                Status
              </th>

              <th className="p-4">
                Tanggal
              </th>

              <th className="p-4">
                Detail
              </th>

            </tr>

          </thead>

          <tbody>

            {donations.map((item) => (

              <tr
                key={item.id}
                className="border-t hover:bg-gray-50"
              >

                <td className="p-4">

                  <p className="font-bold">
                    {item.donorName}
                  </p>

                  <p className="text-sm text-gray-500">
                    {item.email}
                  </p>

                </td>

                <td className="p-4">
                  {item.campaign.title}
                </td>

                <td className="p-4 font-bold text-green-700">
                  Rp {item.amount.toLocaleString("id-ID")}
                </td>

                <td className="p-4">

                  <span className="rounded-full bg-green-100 px-3 py-1 text-green-700">

                    {item.paymentStatus}

                  </span>

                </td>

                <td className="p-4">

                  {new Date(item.createdAt).toLocaleDateString("id-ID")}

                </td>

                <td className="p-4">

                  <Link
                    href={`/admin/donation/${item.id}`}
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
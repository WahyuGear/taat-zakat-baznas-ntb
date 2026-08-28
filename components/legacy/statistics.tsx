import { prisma } from "@/lib/prisma";

export default async function Statistics() {
  const [
    totalCampaign,
    activeCampaign,
    totalCollected,
  ] = await Promise.all([
    prisma.campaign.count(),
    prisma.campaign.count({
      where: {
        isActive: true,
      },
    }),
    prisma.campaign.aggregate({
      _sum: {
        collected: true,
      },
    }),
  ]);

  const totalDana = totalCollected._sum.collected ?? 0;

  const cards = [
    {
      title: "Dana Terkumpul",
      value: `Rp ${totalDana.toLocaleString("id-ID")}`,
      color: "text-green-700",
      bg: "bg-green-50",
      icon: "💚",
    },
    {
      title: "Campaign Aktif",
      value: activeCampaign,
      color: "text-blue-700",
      bg: "bg-blue-50",
      icon: "🚀",
    },
    {
      title: "Total Campaign",
      value: totalCampaign,
      color: "text-orange-700",
      bg: "bg-orange-50",
      icon: "📢",
    },
    {
      title: "Donatur",
      value: "Segera",
      color: "text-purple-700",
      bg: "bg-purple-50",
      icon: "🤝",
    },
  ];

  return (
    <section className="bg-white py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4">

        <div className="mb-10 text-center">

          <h2 className="text-2xl font-extrabold md:text-4xl">
            Dampak Kebaikan Bersama
          </h2>

          <p className="mt-3 text-gray-500">
            Transparansi pengelolaan dana untuk masyarakat NTB.
          </p>

        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

          {cards.map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl text-3xl ${item.bg}`}
              >
                {item.icon}
              </div>

              <h3
                className={`mt-5 text-xl font-extrabold md:text-3xl ${item.color}`}
              >
                {item.value}
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                {item.title}
              </p>
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth/jwt";

export default async function DonasiSayaPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  // Belum login
  if (!token) {
    redirect("/login");
  }

  // Verifikasi token
  const user = verifyToken(token);

  if (!user) {
    redirect("/login");
  }

  // Ambil donasi milik user yang sedang login
  const donations = await prisma.donation.findMany({
    where: {
      userId: user.id,
    },
    include: {
      campaign: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="min-h-screen bg-[#F5F7FB] px-4 pb-28 pt-5">
      <div className="mx-auto w-full max-w-[430px]">

        {/* HEADER */}
        <section className="rounded-[28px] bg-green-700 p-5 text-white shadow-sm">
          <h1 className="text-xl font-bold">
            Donasi Saya
          </h1>

          <p className="mt-1 text-xs text-green-100">
            Riwayat donasi Anda di BAZNAS NTB
          </p>
        </section>

        {/* LIST DONASI */}
        <section className="mt-4 space-y-3">

          {donations.length === 0 ? (
            <div className="rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-sm">
              <p className="text-sm font-semibold text-slate-700">
                Belum ada donasi
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Donasi yang Anda lakukan akan muncul di sini.
              </p>
            </div>
          ) : (
            donations.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">

                  {/* CAMPAIGN */}
                  <div className="min-w-0 flex-1">
                    <h2 className="text-sm font-bold text-slate-800">
                      {item.campaign.title}
                    </h2>

                    <p className="mt-1 text-[10px] text-slate-400">
                      {item.createdAt.toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  {/* NOMINAL */}
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold text-green-700">
                      Rp {item.amount.toLocaleString("id-ID")}
                    </p>

                    <span className="mt-1 inline-block rounded-full bg-yellow-100 px-2.5 py-1 text-[9px] font-bold text-yellow-700">
                      {item.paymentStatus}
                    </span>
                  </div>

                </div>
              </div>
            ))
          )}

        </section>

      </div>
    </main>
  );
}
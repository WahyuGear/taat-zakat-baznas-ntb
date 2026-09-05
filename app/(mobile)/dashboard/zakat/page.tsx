import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth/jwt";
import {
  ChevronLeft,
  FileText,
  CalendarDays,
  Wallet,
  ArrowRight,
} from "lucide-react";

export default async function ZakatSayaPage() {
  // =========================
  // CEK LOGIN
  // =========================

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  const jwtUser = verifyToken(token);

  if (!jwtUser) {
    redirect("/login");
  }

  // =========================
  // AMBIL USER
  // =========================

  const user = await prisma.user.findUnique({
    where: {
      id: jwtUser.id,
    },
    select: {
      id: true,
      name: true,
      npwz: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  // =========================
  // AMBIL RIWAYAT ZAKAT
  // =========================

  const zakatTypes = [
    "ZAKAT_PENGHASILAN",
    "ZAKAT_MAL",
    "ZAKAT_PERTANIAN",
    "ZAKAT_PETERNAKAN",
    "ZAKAT_PERDAGANGAN",
  ];

  const zakatPayments = await prisma.donation.findMany({
    where: {
      userId: user.id,
      paymentStatus: "SUCCESS",
      campaign: {
        type: {
          in: zakatTypes,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      campaign: true,
    },
  });

  const formatRupiah = (amount: number) => {
    return `Rp ${amount.toLocaleString("id-ID")}`;
  };

  return (
    <main className="min-h-screen bg-[#F5F7FB] px-4 pb-28 pt-3">
      <div className="mx-auto w-full max-w-[430px]">

        {/* HEADER */}
        <section className="rounded-3xl bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50"
            >
              <ChevronLeft
                size={18}
                className="text-slate-600"
              />
            </Link>

            <div>
              <h1 className="text-base font-extrabold text-slate-900">
                Zakat Saya
              </h1>

              <p className="mt-0.5 text-[9px] text-slate-400">
                Riwayat zakat Anda
              </p>
            </div>
          </div>
        </section>

        {/* RIWAYAT ZAKAT */}
        {zakatPayments.length === 0 ? (
          <section className="mt-4 rounded-3xl bg-white p-7 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50">
              <Wallet
                size={23}
                className="text-green-700"
              />
            </div>

            <h2 className="mt-4 text-sm font-bold text-slate-800">
              Belum Ada Riwayat Zakat
            </h2>

            <p className="mx-auto mt-2 max-w-[260px] text-[9px] leading-4 text-slate-400">
              Riwayat pembayaran zakat Anda akan
              tampil di halaman ini.
            </p>

            <Link
              href="/zakat"
              className="mt-5 inline-flex rounded-2xl bg-green-700 px-5 py-3 text-[10px] font-bold text-white"
            >
              Hitung Zakat
            </Link>
          </section>
        ) : (
          <section className="mt-4 space-y-3">
            {zakatPayments.map((item) => (
              <div
                key={item.id}
                className="rounded-3xl bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">

                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-green-50">
                      <FileText
                        size={20}
                        className="text-green-700"
                      />
                    </div>

                    <div className="min-w-0">
                      <h2 className="truncate text-xs font-extrabold text-slate-800">
                        {item.campaign.title}
                      </h2>

                      <p className="mt-1 flex items-center gap-1 text-[8px] text-slate-400">
                        <CalendarDays size={11} />
                        {new Date(item.createdAt).toLocaleDateString(
                          "id-ID",
                          {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          }
                        )}
                      </p>
                    </div>
                  </div>

                  <span className="shrink-0 rounded-full bg-green-50 px-2 py-1 text-[7px] font-bold text-green-700">
                    LUNAS
                  </span>
                </div>

                <div className="mt-4 flex items-end justify-between border-t border-slate-100 pt-3">
                  <div>
                    <p className="text-[8px] text-slate-400">
                      Nominal Zakat
                    </p>

                    <p className="mt-0.5 text-sm font-extrabold text-green-700">
                      {formatRupiah(item.amount)}
                    </p>
                  </div>

                  <Link
                    href={`/api/bsz/${item.id}`}
                    target="_blank"
                    className="flex items-center gap-1 rounded-xl bg-green-700 px-3 py-2 text-[8px] font-bold text-white"
                  >
                    BSZ
                    <ArrowRight size={11} />
                  </Link>
                </div>
              </div>
            ))}
          </section>
        )}

      </div>
    </main>
  );
}
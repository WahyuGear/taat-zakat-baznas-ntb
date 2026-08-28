import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth/jwt";
import LogoutButton from "./logout-button";

import {
  Heart,
  User,
  FileText,
  Settings,
  ChevronRight,
  Wallet,
  Calculator,
  ShieldCheck,
} from "lucide-react";

export default async function UserDashboardPage() {
  // =========================
  // CEK LOGIN
  // =========================

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  const user = verifyToken(token);

  if (!user) {
    redirect("/login");
  }

  // =========================
  // AMBIL DATA DONASI USER
  // =========================

  const donations = await prisma.donation.findMany({
    where: {
      userId: user.id,
      paymentStatus: "SUCCESS",
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      campaign: true,
    },
  });

  const totalDonation = donations.reduce(
    (total, donation) =>
      total + donation.amount,
    0
  );

  const donationCount = donations.length;

  const campaignCount = new Set(
    donations.map(
      (donation) => donation.campaignId
    )
  ).size;

  // =========================
  // FORMAT RUPIAH
  // =========================

  const formatRupiah = (amount: number) => {
    return `Rp ${amount.toLocaleString("id-ID")}`;
  };

  return (
    <main className="min-h-screen bg-[#F5F7FB] px-4 pb-28 pt-5">

      <div className="mx-auto w-full max-w-[430px]">

        {/* =========================
            HEADER USER
        ========================= */}

        <section className="rounded-[28px] bg-green-700 p-5 text-white shadow-sm">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                <User
                  size={23}
                  strokeWidth={2}
                />
              </div>

              <div>

                <p className="text-[9px] font-medium text-green-100">
                  Selamat datang 👋
                </p>

                <h1 className="mt-0.5 text-base font-bold">
                  {user.name}
                </h1>

              </div>

            </div>

            <div className="rounded-xl bg-white/10 px-2.5 py-1.5">

              <span className="text-[9px] font-bold">
                Muzaki
              </span>

            </div>

          </div>

          <p className="mt-5 max-w-[280px] text-[10px] leading-4 text-green-50/80">
            Kelola aktivitas donasi, zakat,
            dan akun Anda bersama BAZNAS NTB.
          </p>

        </section>

        {/* =========================
            STATISTIK
        ========================= */}

        <section className="mt-4 grid grid-cols-2 gap-3">

          {/* TOTAL DONASI */}

          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50">

              <Wallet
                size={17}
                className="text-green-700"
              />

            </div>

            <p className="mt-4 text-[9px] font-medium text-slate-400">
              Total Donasi
            </p>

            <p className="mt-1 text-base font-bold text-slate-900">
              {formatRupiah(totalDonation)}
            </p>

          </div>

          {/* JUMLAH DONASI */}

          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50">

              <Heart
                size={17}
                className="text-green-700"
              />

            </div>

            <p className="mt-4 text-[9px] font-medium text-slate-400">
              Jumlah Donasi
            </p>

            <p className="mt-1 text-base font-bold text-slate-900">
              {donationCount}
            </p>

          </div>

        </section>

        {/* =========================
            CAMPAIGN DIDUKUNG
        ========================= */}

        <section className="mt-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-[9px] font-medium text-slate-400">
                Campaign Didukung
              </p>

              <p className="mt-1 text-base font-bold text-slate-900">
                {campaignCount} Campaign
              </p>

            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50">

              <Heart
                size={17}
                className="text-green-700"
              />

            </div>

          </div>

        </section>

        {/* =========================
            QUICK ACTION
        ========================= */}

        <section className="mt-4 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">

          <div className="mb-3">

            <h2 className="text-sm font-bold text-slate-900">
              Aktivitas Saya
            </h2>

            <p className="mt-0.5 text-[9px] text-slate-400">
              Akses aktivitas akun Anda
            </p>

          </div>

          <div className="grid grid-cols-2 gap-2.5">

            <Link
              href="/dashboard/donasi"
              className="group flex items-center gap-2.5 rounded-2xl bg-green-50 p-3 transition active:scale-[0.98]"
            >

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white">

                <Heart
                  size={16}
                  className="text-green-700"
                />

              </div>

              <div className="min-w-0">

                <p className="text-[10px] font-bold text-slate-800">
                  Donasi Saya
                </p>

                <p className="mt-0.5 text-[8px] text-slate-400">
                  Riwayat donasi
                </p>

              </div>

            </Link>

            <Link
              href="/dashboard/zakat"
              className="group flex items-center gap-2.5 rounded-2xl bg-green-50 p-3 transition active:scale-[0.98]"
            >

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white">

                <Calculator
                  size={16}
                  className="text-green-700"
                />

              </div>

              <div className="min-w-0">

                <p className="text-[10px] font-bold text-slate-800">
                  Zakat Saya
                </p>

                <p className="mt-0.5 text-[8px] text-slate-400">
                  Riwayat zakat
                </p>

              </div>

            </Link>

          </div>

        </section>

        {/* =========================
            MENU AKUN
        ========================= */}

        <section className="mt-5">

          <p className="mb-2 px-1 text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">
            Akun
          </p>

          <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">

            {/* PROFIL */}

            <Link
              href="/dashboard/profile"
              className="flex items-center gap-3 px-4 py-3.5 transition active:bg-slate-50"
            >

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50">

                <User
                  size={16}
                  className="text-slate-600"
                />

              </div>

              <div className="min-w-0 flex-1">

                <p className="text-[10px] font-bold text-slate-800">
                  Profil Saya
                </p>

                <p className="mt-0.5 text-[8px] text-slate-400">
                  Kelola informasi pribadi
                </p>

              </div>

              <ChevronRight
                size={15}
                className="text-slate-300"
              />

            </Link>

            <div className="ml-16 border-t border-slate-100" />

            {/* RIWAYAT DONASI */}

            <Link
              href="/dashboard/donasi"
              className="flex items-center gap-3 px-4 py-3.5 transition active:bg-slate-50"
            >

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50">

                <FileText
                  size={16}
                  className="text-slate-600"
                />

              </div>

              <div className="min-w-0 flex-1">

                <p className="text-[10px] font-bold text-slate-800">
                  Riwayat Donasi
                </p>

                <p className="mt-0.5 text-[8px] text-slate-400">
                  Lihat transaksi donasi
                </p>

              </div>

              <ChevronRight
                size={15}
                className="text-slate-300"
              />

            </Link>

            <div className="ml-16 border-t border-slate-100" />

            {/* PENGATURAN */}

            <Link
              href="/dashboard/settings"
              className="flex items-center gap-3 px-4 py-3.5 transition active:bg-slate-50"
            >

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50">

                <Settings
                  size={16}
                  className="text-slate-600"
                />

              </div>

              <div className="min-w-0 flex-1">

                <p className="text-[10px] font-bold text-slate-800">
                  Pengaturan Akun
                </p>

                <p className="mt-0.5 text-[8px] text-slate-400">
                  Pengaturan akun dan keamanan
                </p>

              </div>

              <ChevronRight
                size={15}
                className="text-slate-300"
              />

            </Link>

          </div>

        </section>

        {/* =========================
            KEAMANAN
        ========================= */}

        <section className="mt-4 rounded-2xl border border-green-100 bg-green-50 p-4">

          <div className="flex gap-3">

            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white">

              <ShieldCheck
                size={16}
                className="text-green-700"
              />

            </div>

            <div>

              <p className="text-[10px] font-bold text-green-800">
                Akun Aman
              </p>

              <p className="mt-1 text-[8px] leading-4 text-green-700/70">
                Jaga kerahasiaan password dan
                informasi akun Anda.
              </p>

            </div>

          </div>

        </section>

        {/* =========================
            LOGOUT
        ========================= */}

<LogoutButton />

        {/* =========================
            FOOTER
        ========================= */}

        <p className="mt-6 text-center text-[8px] text-slate-400">
          BAZNAS NTB • Layanan Digital
        </p>

      </div>

    </main>
  );
}

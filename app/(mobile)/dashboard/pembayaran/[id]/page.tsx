import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import {
  CheckCircle2,
  FileText,
  ArrowLeft,
  Wallet,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth/jwt";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

const zakatTypes = [
  "ZAKAT_PENGHASILAN",
  "ZAKAT_MAL",
  "ZAKAT_PERTANIAN",
  "ZAKAT_PETERNAKAN",
  "ZAKAT_PERDAGANGAN",
];

export default async function PembayaranPage({
  params,
}: Props) {
  const { id } = await params;

  const donationId = Number(id);

  if (!Number.isInteger(donationId)) {
    redirect("/dashboard");
  }

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
    },
  });

  if (!user) {
    redirect("/login");
  }

  // =========================
  // AMBIL TRANSAKSI
  // =========================

  const donation = await prisma.donation.findFirst({
    where: {
      id: donationId,
      userId: user.id,
    },
    include: {
      campaign: true,
    },
  });

  if (!donation) {
    redirect("/dashboard");
  }

  // =========================
  // FORMAT
  // =========================

  const formatRupiah = (amount: number) =>
    `Rp ${amount.toLocaleString("id-ID")}`;

  const isZakat = zakatTypes.includes(
    donation.campaign.type
  );

  const isSuccess =
    donation.paymentStatus === "SUCCESS";

  // =========================
  // HALAMAN
  // =========================

  return (
    <main className="min-h-screen bg-[#F5F7FB] px-4 pb-28 pt-5">
      <div className="mx-auto w-full max-w-[430px]">

        <Link
          href="/dashboard"
          className="mb-4 inline-flex items-center gap-2 text-xs font-bold text-slate-500"
        >
          <ArrowLeft size={16} />
          Kembali
        </Link>

        {/* STATUS */}

        <section className="rounded-3xl bg-white p-6 text-center shadow-sm">

          <div
            className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${
              isSuccess
                ? "bg-green-50"
                : "bg-yellow-50"
            }`}
          >
            {isSuccess ? (
              <CheckCircle2
                size={42}
                className="text-green-600"
              />
            ) : (
              <Wallet
                size={38}
                className="text-yellow-600"
              />
            )}
          </div>

          <h1 className="mt-5 text-xl font-extrabold text-slate-900">
            {isSuccess
              ? "Pembayaran Berhasil"
              : "Pembayaran Diproses"}
          </h1>

          <p className="mt-2 text-xs leading-5 text-slate-500">
            {isSuccess
              ? "Terima kasih telah menunaikan pembayaran melalui platform resmi BAZNAS NTB."
              : "Pembayaran Anda masih menunggu penyelesaian."}
          </p>

          {/* NOMINAL */}

          <div className="mt-6 rounded-2xl bg-green-50 p-4">
            <p className="text-[9px] font-medium text-slate-500">
              Nominal Pembayaran
            </p>

            <p className="mt-1 text-2xl font-extrabold text-green-700">
              {formatRupiah(donation.amount)}
            </p>
          </div>

          {/* DETAIL */}

          <div className="mt-5 space-y-3 text-left">

            <div className="flex justify-between gap-4 border-b border-slate-100 pb-3">
              <span className="text-[10px] text-slate-400">
                Transaksi
              </span>

              <span className="text-[10px] font-bold text-slate-700">
                #{donation.id}
              </span>
            </div>

            <div className="flex justify-between gap-4 border-b border-slate-100 pb-3">
              <span className="text-[10px] text-slate-400">
                Program
              </span>

              <span className="max-w-[220px] text-right text-[10px] font-bold text-slate-700">
                {donation.campaign.title}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-[10px] text-slate-400">
                Status
              </span>

              <span
                className={`rounded-full px-2 py-1 text-[8px] font-extrabold ${
                  isSuccess
                    ? "bg-green-50 text-green-700"
                    : "bg-yellow-50 text-yellow-700"
                }`}
              >
                {donation.paymentStatus}
              </span>
            </div>

          </div>

          {/* DOKUMEN */}

          {isSuccess && (
            <div className="mt-6 space-y-3">

              {isZakat ? (
                <a
                  href={`/api/bsz/${donation.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-green-700 text-xs font-extrabold text-white shadow-lg shadow-green-700/20 hover:bg-green-800"
                >
                  <FileText size={17} />
                  Lihat / Cetak BSZ
                </a>
              ) : (
                <a
                  href={`/api/receipt/${donation.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-green-700 text-xs font-extrabold text-white shadow-lg shadow-green-700/20 hover:bg-green-800"
                >
                  <FileText size={17} />
                  Lihat / Cetak Struk
                </a>
              )}

              {isZakat && (
                <Link
                  href="/dashboard/zakat"
                  className="flex h-11 w-full items-center justify-center rounded-2xl border border-green-200 bg-green-50 text-xs font-bold text-green-700"
                >
                  Lihat Zakat Saya
                </Link>
              )}

            </div>
          )}

        </section>

      </div>
    </main>
  );
}
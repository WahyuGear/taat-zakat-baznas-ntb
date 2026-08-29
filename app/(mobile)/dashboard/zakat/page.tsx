import Link from "next/link";
import {
  Calculator,
  ChevronLeft,
  Info,
} from "lucide-react";

export default function ZakatSayaPage() {
  return (
    <main className="min-h-screen bg-[#F5F7FB] px-4 pb-6 pt-3">
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

        {/* EMPTY STATE */}
        <section className="mt-4 rounded-3xl bg-white p-7 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50">
            <Calculator
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

        {/* INFO */}
        <section className="mt-3 rounded-2xl border border-green-100 bg-green-50 p-4">
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white">
              <Info
                size={15}
                className="text-green-700"
              />
            </div>

            <div>
              <p className="text-[10px] font-bold text-green-800">
                Catatan
              </p>

              <p className="mt-1 text-[8px] leading-4 text-green-700/70">
                Setelah pembayaran zakat tersedia,
                riwayat transaksi akan ditampilkan
                di sini.
              </p>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
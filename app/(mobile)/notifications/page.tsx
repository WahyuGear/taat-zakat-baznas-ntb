import Link from "next/link";
import {
  Bell,
  Heart,
  Megaphone,
  ShieldCheck,
  ChevronLeft,
} from "lucide-react";

export default function NotificationsPage() {
  return (
    <main className="min-h-screen bg-[#F5F7FB] px-4 pb-28 pt-5">

      <div className="mx-auto w-full max-w-[430px]">

        {/* HEADER */}

        <div className="flex items-center gap-3">

          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm"
          >
            <ChevronLeft size={19} />
          </Link>

          <div>

            <h1 className="text-xl font-extrabold text-slate-900">
              Notifikasi
            </h1>

            <p className="mt-0.5 text-[10px] text-slate-400">
              Informasi terbaru untuk Anda
            </p>

          </div>

        </div>

        {/* NOTIFICATION LIST */}

        <section className="mt-5 space-y-3">

          {/* DONASI */}

          <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">

            <div className="flex gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-green-50">

                <Heart
                  size={18}
                  className="text-green-700"
                />

              </div>

              <div className="min-w-0">

                <div className="flex items-start justify-between gap-2">

                  <h2 className="text-xs font-bold text-slate-800">
                    Terima kasih atas kebaikan Anda 💚
                  </h2>

                  <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" />

                </div>

                <p className="mt-1 text-[10px] leading-4 text-slate-400">
                  Setiap donasi Anda membantu
                  menghadirkan manfaat bagi masyarakat
                  NTB.
                </p>

                <p className="mt-2 text-[9px] text-slate-300">
                  Baru saja
                </p>

              </div>

            </div>

          </div>

          {/* INFO BAZNAS */}

          <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">

            <div className="flex gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-yellow-50">

                <Megaphone
                  size={18}
                  className="text-yellow-600"
                />

              </div>

              <div>

                <h2 className="text-xs font-bold text-slate-800">
                  Informasi BAZNAS NTB
                </h2>

                <p className="mt-1 text-[10px] leading-4 text-slate-400">
                  Pantau berbagai program dan
                  kegiatan kebaikan BAZNAS NTB.
                </p>

                <p className="mt-2 text-[9px] text-slate-300">
                  Informasi
                </p>

              </div>

            </div>

          </div>

          {/* SECURITY */}

          <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">

            <div className="flex gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50">

                <ShieldCheck
                  size={18}
                  className="text-blue-600"
                />

              </div>

              <div>

                <h2 className="text-xs font-bold text-slate-800">
                  Keamanan Akun
                </h2>

                <p className="mt-1 text-[10px] leading-4 text-slate-400">
                  Jangan berikan password Anda kepada
                  siapapun.
                </p>

                <p className="mt-2 text-[9px] text-slate-300">
                  Keamanan
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* EMPTY INFO */}

        <div className="mt-6 flex items-center justify-center gap-2 text-[9px] text-slate-300">

          <Bell size={12} />

          Notifikasi akan diperbarui secara berkala.

        </div>

      </div>

    </main>
  );
}
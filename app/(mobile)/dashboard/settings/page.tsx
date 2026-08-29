import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  Settings,
  User,
  Mail,
  ShieldCheck,
  ChevronLeft,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { verifyToken } from "@/lib/auth/jwt";

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  // CEK LOGIN
  if (!token) {
    redirect("/login");
  }

  const user = verifyToken(token);

  if (!user) {
    redirect("/login");
  }

  const userData = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
  });

  if (!userData) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-[#F5F7FB] px-4 pb-28 pt-5">
      <div className="mx-auto w-full max-w-[430px]">

        {/* HEADER */}
        <section className="rounded-[28px] bg-green-700 p-5 text-white shadow-sm">
          <div className="flex items-center gap-3">

            <Link
              href="/dashboard"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10"
            >
              <ChevronLeft size={19} />
            </Link>

            <div>
              <h1 className="text-lg font-bold">
                Pengaturan Akun
              </h1>

              <p className="mt-0.5 text-[10px] text-green-100">
                Kelola keamanan akun Anda
              </p>
            </div>

          </div>
        </section>

        {/* AKUN */}
        <section className="mt-4">

          <p className="mb-2 px-1 text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">
            Akun
          </p>

          <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">

            <Link
              href="/dashboard/profile/edit"
              className="flex items-center gap-3 px-4 py-4 transition active:bg-slate-50"
            >

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50">
                <User
                  size={16}
                  className="text-green-700"
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

              <ChevronLeft
                size={15}
                className="rotate-180 text-slate-300"
              />

            </Link>

          </div>
        </section>

        {/* EMAIL */}
        <section className="mt-4">

          <p className="mb-2 px-1 text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">
            Informasi Login
          </p>

          <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">

            <div className="flex items-center gap-3 px-4 py-4">

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50">
                <Mail
                  size={16}
                  className="text-slate-600"
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[9px] text-slate-400">
                  Email Akun
                </p>

                <p className="mt-1 truncate text-xs font-bold text-slate-800">
                  {userData.email}
                </p>
              </div>

            </div>

            <div className="ml-16 border-t border-slate-100" />

<Link
  href="/dashboard/profile/edit"
  className="flex items-center gap-3 px-4 py-4 transition active:bg-slate-50"
>
  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50">
    <User
      size={16}
      className="text-green-700"
    />
  </div>

  <div className="min-w-0 flex-1">
    <p className="text-[10px] font-bold text-slate-800">
      Edit Profil
    </p>

    <p className="mt-0.5 text-[8px] text-slate-400">
      Ubah foto, nama & nomor WhatsApp
    </p>
  </div>

  <ChevronLeft
    size={15}
    className="rotate-180 text-slate-300"
  />
</Link>

          </div>
        </section>

        {/* KEAMANAN */}
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
                Keamanan Akun
              </p>

              <p className="mt-1 text-[8px] leading-4 text-green-700/70">
                Jangan pernah memberikan password Anda
                kepada orang lain.
              </p>
            </div>

          </div>

        </section>

        {/* FOOTER */}
        <p className="mt-6 text-center text-[8px] text-slate-400">
          BAZNAS NTB • Layanan Digital
        </p>

      </div>
    </main>
  );
}
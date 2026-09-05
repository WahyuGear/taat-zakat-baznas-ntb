import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Bell,
  Heart,
  Megaphone,
  ShieldCheck,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Info,
} from "lucide-react";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth/jwt";

export default async function NotificationsPage() {
  // =========================
  // CEK LOGIN
  // =========================

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  const currentUser = verifyToken(token);

  if (!currentUser?.id) {
    redirect("/login");
  }

  // =========================
  // AMBIL NOTIFIKASI USER
  // =========================

  const notifications = await prisma.notification.findMany({
    where: {
      userId: Number(currentUser.id),
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
  });

  // =========================
  // ICON NOTIFIKASI
  // =========================

  function getIcon(type: string) {
    if (type === "SUCCESS") {
      return (
        <CheckCircle2
          size={18}
          className="text-green-700"
        />
      );
    }

    if (type === "ERROR") {
      return (
        <AlertCircle
          size={18}
          className="text-red-600"
        />
      );
    }

    if (type === "WARNING") {
      return (
        <AlertCircle
          size={18}
          className="text-yellow-600"
        />
      );
    }

    return (
      <Info
        size={18}
        className="text-blue-600"
      />
    );
  }

  // =========================
  // BACKGROUND ICON
  // =========================

  function getIconBackground(type: string) {
    if (type === "SUCCESS") {
      return "bg-green-50";
    }

    if (type === "ERROR") {
      return "bg-red-50";
    }

    if (type === "WARNING") {
      return "bg-yellow-50";
    }

    return "bg-blue-50";
  }

  // =========================
  // FORMAT WAKTU
  // =========================

  function formatDate(date: Date) {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

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

        {notifications.length === 0 ? (

          <section className="mt-5 rounded-3xl bg-white p-7 text-center shadow-sm">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50">
              <Bell
                size={24}
                className="text-slate-400"
              />
            </div>

            <h2 className="mt-4 text-sm font-bold text-slate-800">
              Belum Ada Notifikasi
            </h2>

            <p className="mt-2 text-[10px] leading-4 text-slate-400">
              Notifikasi pembayaran dan informasi
              BAZNAS NTB akan tampil di sini.
            </p>

          </section>

        ) : (

          <section className="mt-5 space-y-3">

            {notifications.map((notification) => (

              <Link
                key={notification.id}
                href={notification.link || "/notifications"}
                className="block"
              >

                <div
                  className={`rounded-3xl border p-4 shadow-sm transition ${
                    notification.isRead
                      ? "border-slate-100 bg-white"
                      : "border-green-100 bg-green-50/40"
                  }`}
                >

                  <div className="flex gap-3">

                    {/* ICON */}

                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${getIconBackground(
                        notification.type
                      )}`}
                    >
                      {getIcon(notification.type)}
                    </div>

                    {/* CONTENT */}

                    <div className="min-w-0 flex-1">

                      <div className="flex items-start justify-between gap-2">

                        <h2 className="text-xs font-bold text-slate-800">
                          {notification.title}
                        </h2>

                        {!notification.isRead && (
                          <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" />
                        )}

                      </div>

                      <p className="mt-1 text-[10px] leading-4 text-slate-500">
                        {notification.message}
                      </p>

                      <p className="mt-2 text-[9px] text-slate-300">
                        {formatDate(notification.createdAt)}
                      </p>

                    </div>

                  </div>

                </div>

              </Link>

            ))}

          </section>

        )}

        {/* FOOTER INFO */}

        <div className="mt-6 flex items-center justify-center gap-2 text-[9px] text-slate-300">

          <Bell size={12} />

          Notifikasi akan diperbarui secara berkala.

        </div>

      </div>
    </main>
  );
}
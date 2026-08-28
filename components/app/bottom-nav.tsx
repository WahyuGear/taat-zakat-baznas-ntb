"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Heart,
  BarChart3,
  User,
  Calculator,
} from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-3 left-1/2 z-50 w-[calc(100%-24px)] max-w-[400px] -translate-x-1/2">
      <div className="relative h-[72px] rounded-[26px] border border-slate-200 bg-white/95 px-2 shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-xl">
        <div className="grid h-full grid-cols-5 items-end">
          {/* BERANDA */}
          <Link
            href="/"
            className={`flex h-full flex-col items-center justify-center gap-1 rounded-2xl transition-all duration-200 active:scale-95 ${
              isActive("/")
                ? "text-green-700"
                : "text-slate-400"
            }`}
          >
            <Home
              size={21}
              strokeWidth={isActive("/") ? 2.5 : 2}
            />

            <span className="text-[10px] font-semibold">
              Beranda
            </span>
          </Link>

          {/* DONASI */}
          <Link
            href="/campaign"
            className={`flex h-full flex-col items-center justify-center gap-1 rounded-2xl transition-all duration-200 active:scale-95 ${
              isActive("/campaign")
                ? "text-green-700"
                : "text-slate-400"
            }`}
          >
            <Heart
              size={21}
              strokeWidth={
                isActive("/campaign") ? 2.5 : 2
              }
            />

            <span className="text-[10px] font-semibold">
              Donasi
            </span>
          </Link>

          {/* RUANG TENGAH */}
          <div />

          {/* LAPORAN */}
          <Link
            href="/laporan"
            className={`flex h-full flex-col items-center justify-center gap-1 rounded-2xl transition-all duration-200 active:scale-95 ${
              isActive("/laporan")
                ? "text-green-700"
                : "text-slate-400"
            }`}
          >
            <BarChart3
              size={21}
              strokeWidth={
                isActive("/laporan") ? 2.5 : 2
              }
            />

            <span className="text-[10px] font-semibold">
              Laporan
            </span>
          </Link>

          {/* AKUN */}
          <Link
            href="/dashboard"
            className={`flex h-full flex-col items-center justify-center gap-1 rounded-2xl transition-all duration-200 active:scale-95 ${
              isActive("/dashboard")
                ? "text-green-700"
                : "text-slate-400"
            }`}
          >
            <User
              size={21}
              strokeWidth={
                isActive("/dashboard") ? 2.5 : 2
              }
            />

            <span className="text-[10px] font-semibold">
              Akun
            </span>
          </Link>
        </div>

        {/* HITUNG ZAKAT */}
        <Link
          href="/zakat"
          aria-label="Hitung Zakat"
          className={`absolute left-1/2 top-[-28px] flex h-[64px] w-[64px] -translate-x-1/2 items-center justify-center rounded-full border-[5px] border-white shadow-[0_6px_22px_rgba(0,0,0,0.17)] transition-all duration-200 active:scale-90 ${
            isActive("/zakat")
              ? "bg-green-800"
              : "bg-green-700"
          }`}
        >
          <Calculator
            size={28}
            strokeWidth={2.3}
            className="text-white"
          />
        </Link>

        {/* LABEL HITUNG ZAKAT */}
        <Link
          href="/zakat"
          className={`absolute left-1/2 top-[43px] -translate-x-1/2 whitespace-nowrap text-[10px] font-bold ${
            isActive("/zakat")
              ? "text-green-700"
              : "text-slate-500"
          }`}
        >
          Hitung Zakat
        </Link>
      </div>
    </nav>
  );
}
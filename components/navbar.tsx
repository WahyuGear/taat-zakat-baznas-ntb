"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Menu,
  X,
  Bell,
  User,
  Landmark,
  Heart,
  HandCoins,
  Beef,
  Moon,
  Gift,
  ShieldCheck,
  Plane,
} from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const closeMenu = () => {
    setOpen(false);
  };

  return (
    <>
      {/* HEADER */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between bg-white px-5">
        {/* MENU */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Buka menu"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-800 transition hover:bg-slate-100 active:scale-95"
        >
          <Menu size={23} strokeWidth={2} />
        </button>

        {/* LOGO */}
        <Link
          href="/"
          onClick={closeMenu}
          className="text-base font-bold text-green-700"
        >
          BAZNAS NTB
        </Link>

        {/* NOTIFICATION */}
        <button
          type="button"
          aria-label="Notifikasi"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 transition hover:bg-slate-100"
        >
          <Bell size={21} />

          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
        </button>
      </header>

      {/* OVERLAY */}
      {open && (
        <button
          type="button"
          aria-label="Tutup menu"
          onClick={closeMenu}
          className="fixed inset-0 z-50 bg-black/40"
        />
      )}

      {/* DRAWER */}
      <aside
        className={`fixed left-0 top-0 z-[60] h-full w-[82%] max-w-[340px] bg-white shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* DRAWER HEADER */}
        <div className="flex h-16 items-center justify-between border-b px-5">
          <Link
            href="/"
            onClick={closeMenu}
            className="text-lg font-bold text-green-700"
          >
            BAZNAS NTB
          </Link>

          <button
            type="button"
            onClick={closeMenu}
            aria-label="Tutup menu"
            className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-slate-100"
          >
            <X size={23} />
          </button>
        </div>

        {/* MENU CONTENT */}
        <div className="h-[calc(100%-64px)] overflow-y-auto px-4 py-5">
          <p className="mb-3 px-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            Layanan BAZNAS
          </p>

          <div className="space-y-1">
            <Link
              href="/zakat"
              onClick={closeMenu}
              className="flex items-center gap-4 rounded-2xl px-3 py-3.5 transition hover:bg-green-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
                <Landmark size={19} className="text-green-700" />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Zakat
                </p>
                <p className="text-xs text-slate-500">
                  Tunaikan zakat Anda
                </p>
              </div>
            </Link>

            <Link
              href="/infak-sedekah"
              onClick={closeMenu}
              className="flex items-center gap-4 rounded-2xl px-3 py-3.5 transition hover:bg-green-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100">
                <Heart size={19} className="text-red-500" />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Infak/Sedekah
                </p>
                <p className="text-xs text-slate-500">
                  Berbagi kebaikan
                </p>
              </div>
            </Link>

            <Link
              href="/dskl"
              onClick={closeMenu}
              className="flex items-center gap-4 rounded-2xl px-3 py-3.5 transition hover:bg-green-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-100">
                <HandCoins size={19} className="text-yellow-600" />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-900">
                  DSKL
                </p>
                <p className="text-xs text-slate-500">
                  Dana sosial keagamaan
                </p>
              </div>
            </Link>

            <Link
              href="/kurban"
              onClick={closeMenu}
              className="flex items-center gap-4 rounded-2xl px-3 py-3.5 transition hover:bg-green-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
                <Beef size={19} className="text-green-700" />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Kurban
                </p>
                <p className="text-xs text-slate-500">
                  Tunaikan kurban
                </p>
              </div>
            </Link>

            <Link
              href="/fitrah"
              onClick={closeMenu}
              className="flex items-center gap-4 rounded-2xl px-3 py-3.5 transition hover:bg-green-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                <Moon size={19} className="text-blue-600" />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Fitrah
                </p>
                <p className="text-xs text-slate-500">
                  Zakat fitrah
                </p>
              </div>
            </Link>

            <Link
              href="/fidyah"
              onClick={closeMenu}
              className="flex items-center gap-4 rounded-2xl px-3 py-3.5 transition hover:bg-green-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100">
                <Gift size={19} className="text-orange-600" />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Fidyah
                </p>
                <p className="text-xs text-slate-500">
                  Tunaikan fidyah
                </p>
              </div>
            </Link>

            <Link
              href="/kafarat"
              onClick={closeMenu}
              className="flex items-center gap-4 rounded-2xl px-3 py-3.5 transition hover:bg-green-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
                <ShieldCheck size={19} className="text-purple-600" />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Kafarat
                </p>
                <p className="text-xs text-slate-500">
                  Tunaikan kafarat
                </p>
              </div>
            </Link>

            <Link
              href="/dam-haji"
              onClick={closeMenu}
              className="flex items-center gap-4 rounded-2xl px-3 py-3.5 transition hover:bg-green-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100">
                <Plane size={19} className="text-sky-600" />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-900">
                  DAM Haji
                </p>
                <p className="text-xs text-slate-500">
                  Tunaikan DAM Haji
                </p>
              </div>
            </Link>
          </div>

          {/* LAINNYA */}
          <div className="my-5 border-t" />

          <p className="mb-3 px-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            Lainnya
          </p>

          <div className="space-y-1">
            <Link
              href="/campaign"
              onClick={closeMenu}
              className="flex items-center gap-4 rounded-2xl px-3 py-3.5 font-semibold text-slate-800 hover:bg-green-50"
            >
              Semua Program
            </Link>

            <Link
              href="/akun"
              onClick={closeMenu}
              className="flex items-center gap-4 rounded-2xl px-3 py-3.5 font-semibold text-slate-800 hover:bg-green-50"
            >
              <User size={19} />
              Akun Saya
            </Link>
          </div>

          {/* FOOTER DRAWER */}
          <div className="mt-8 rounded-2xl bg-green-50 p-4">
            <p className="text-sm font-bold text-green-800">
              BAZNAS NTB
            </p>

            <p className="mt-1 text-xs leading-5 text-green-700">
              Transformasi Mustahik Menjadi Muzaki
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
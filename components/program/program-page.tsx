"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Heart,
  HandCoins,
  Beef,
  Moon,
  Gift,
  ShieldCheck,
  Plane,
  ChevronRight,
} from "lucide-react";

type ProgramPageProps = {
  title: string;
  description: string;
  icon:
    | "heart"
    | "handcoins"
    | "beef"
    | "moon"
    | "gift"
    | "shield"
    | "plane";
  buttonText?: string;
  buttonHref?: string;
};

const icons = {
  heart: Heart,
  handcoins: HandCoins,
  beef: Beef,
  moon: Moon,
  gift: Gift,
  shield: ShieldCheck,
  plane: Plane,
};

export default function ProgramPage({
  title,
  description,
  icon,
  buttonText = "Mulai Sekarang",
  buttonHref = "/campaign",
}: ProgramPageProps) {
  const Icon = icons[icon];

  return (
    <main className="min-h-screen bg-slate-50 px-4 pb-10 pt-5">
      {/* BACK */}
      <Link
        href="/"
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-600"
      >
        <ArrowLeft size={18} />
        Kembali
      </Link>

      {/* HERO */}
      <section className="overflow-hidden rounded-[28px] bg-gradient-to-br from-green-700 to-green-500 p-6 text-white shadow-lg">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
          <Icon size={30} strokeWidth={2} />
        </div>

        <h1 className="mt-5 text-3xl font-extrabold tracking-tight">
          {title}
        </h1>

        <p className="mt-3 text-sm leading-6 text-green-50">
          {description}
        </p>
      </section>

      {/* ACTION */}
      <section className="mt-5 rounded-[24px] bg-white p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
          BAZNAS NTB
        </p>

        <h2 className="mt-2 text-xl font-bold text-slate-900">
          Salurkan Kebaikanmu
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Pilih program yang tersedia dan salurkan kebaikan melalui
          BAZNAS NTB.
        </p>

        <Link
          href={buttonHref}
          className="mt-5 flex items-center justify-between rounded-2xl bg-green-700 px-5 py-4 text-white transition hover:bg-green-800 active:scale-[0.98]"
        >
          <span className="font-bold">{buttonText}</span>

          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
            <ChevronRight size={19} />
          </span>
        </Link>
      </section>

      {/* INFO */}
      <section className="mt-5 rounded-[24px] border border-green-100 bg-green-50 p-5">
        <p className="text-sm font-bold text-green-800">
          💚 Bersama BAZNAS NTB
        </p>

        <p className="mt-2 text-xs leading-5 text-green-700">
          Setiap kebaikan yang disalurkan menjadi bagian dari ikhtiar
          untuk membantu masyarakat dan memberdayakan mustahik.
        </p>
      </section>
    </main>
  );
}
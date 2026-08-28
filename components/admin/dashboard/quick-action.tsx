"use client";

import Link from "next/link";
import {
  FolderKanban,
  HeartHandshake,
  FileSpreadsheet,
  Users,
  PlusCircle,
  Settings,
} from "lucide-react";

const actions = [
  {
    title: "Tambah Campaign",
    desc: "Buat program baru",
    href: "/admin/campaign/new",
    icon: PlusCircle,
    color: "bg-green-600",
  },
  {
    title: "Kelola Campaign",
    desc: "Edit & hapus campaign",
    href: "/admin/campaign",
    icon: FolderKanban,
    color: "bg-blue-600",
  },
  {
    title: "Data Donasi",
    desc: "Lihat seluruh transaksi",
    href: "/admin/donation",
    icon: HeartHandshake,
    color: "bg-pink-600",
  },
  {
    title: "Laporan",
    desc: "Export Excel & PDF",
    href: "/admin/laporan",
    icon: FileSpreadsheet,
    color: "bg-orange-500",
  },
  {
    title: "Donatur",
    desc: "Kelola seluruh donatur",
    href: "/admin/donor",
    icon: Users,
    color: "bg-purple-600",
  },
  {
    title: "Pengaturan",
    desc: "Website & Midtrans",
    href: "/admin/settings",
    icon: Settings,
    color: "bg-gray-700",
  },
];

export default function QuickAction() {
  return (
    <div className="rounded-3xl border bg-white p-6 shadow-sm">

      <div className="mb-6">

        <h2 className="text-2xl font-bold">
          Quick Action
        </h2>

        <p className="text-sm text-gray-500">
          Akses cepat menu admin.
        </p>

      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">

        {actions.map((item) => {

          const Icon = item.icon;

          return (
            <Link
              key={item.title}
              href={item.href}
              className="group rounded-2xl border p-5 transition-all hover:-translate-y-1 hover:border-green-600 hover:shadow-lg"
            >

              <div
                className={`${item.color} mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-white transition group-hover:scale-110`}
              >
                <Icon size={28} />
              </div>

              <h3 className="font-bold">
                {item.title}
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                {item.desc}
              </p>

            </Link>
          );
        })}

      </div>

    </div>
  );
}
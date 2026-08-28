"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import {
  LayoutDashboard,
  Megaphone,
  HeartHandshake,
  Users,
  FileText,
  Image as ImageIcon,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

const menuItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Campaign",
    href: "/admin/campaign",
    icon: Megaphone,
  },
  {
    label: "Donasi",
    href: "/admin/donation",
    icon: HeartHandshake,
  },
  {
    label: "Donatur",
    href: "/admin/donor",
    icon: Users,
  },
  {
    label: "Laporan",
    href: "/admin/laporan",
    icon: FileText,
  },
  {
    label: "Banner",
    href: "/admin/banner",
    icon: ImageIcon,
  },
  {
    label: "Midtrans",
    href: "/admin/Midtrans",
    icon: CreditCard,
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Login tidak memakai sidebar/topbar admin
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  async function handleLogout() {
    try {
      setLoggingOut(true);

      await fetch("/api/auth/logout", {
        method: "POST",
      });

      localStorage.removeItem("admin");

      router.push("/admin/login");
      router.refresh();
    } catch (error) {
      console.error(error);
      router.push("/admin/login");
    } finally {
      setLoggingOut(false);
    }
  }

  function isActive(href: string) {
    if (href === "/admin") {
      return pathname === "/admin";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <div className="min-h-screen bg-[#f6f8f7] text-gray-900">
      {/* ================= MOBILE OVERLAY ================= */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Tutup sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* ================= SIDEBAR ================= */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col border-r border-gray-100 bg-white shadow-xl transition-transform duration-300 lg:translate-x-0 lg:shadow-none ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* LOGO */}
        <div className="flex h-[82px] items-center justify-between border-b border-gray-100 px-6">
          <Link
            href="/admin"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-700 text-white shadow-lg shadow-green-700/20">
              <ShieldCheck size={24} />
            </div>

            <div>
              <p className="text-base font-extrabold tracking-tight text-gray-900">
                BAZNAS NTB
              </p>

              <p className="text-xs font-medium text-gray-400">
                Admin Panel
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* MENU */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400">
            Menu Utama
          </p>

          <nav className="space-y-1.5">
            {menuItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-semibold transition ${
                    active
                      ? "bg-green-700 text-white shadow-lg shadow-green-700/20"
                      : "text-gray-600 hover:bg-green-50 hover:text-green-700"
                  }`}
                >
                  <Icon
                    size={19}
                    strokeWidth={active ? 2.5 : 2}
                  />

                  <span className="flex-1">{item.label}</span>

                  {active && <ChevronRight size={16} />}
                </Link>
              );
            })}
          </nav>

          <p className="mb-3 mt-8 px-3 text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400">
            Sistem
          </p>

          <nav className="space-y-1.5">
            {menuItems.slice(5).map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-semibold transition ${
                    active
                      ? "bg-green-700 text-white shadow-lg shadow-green-700/20"
                      : "text-gray-600 hover:bg-green-50 hover:text-green-700"
                  }`}
                >
                  <Icon
                    size={19}
                    strokeWidth={active ? 2.5 : 2}
                  />

                  <span className="flex-1">{item.label}</span>

                  {active && <ChevronRight size={16} />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* BOTTOM SIDEBAR */}
        <div className="border-t border-gray-100 p-4">
          <div className="mb-3 rounded-2xl bg-gradient-to-br from-green-50 to-yellow-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-700 font-bold text-white">
                A
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-gray-800">
                  Admin BAZNAS
                </p>

                <p className="text-xs text-gray-500">
                  Administrator
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LogOut size={19} />

            <span>
              {loggingOut ? "Keluar..." : "Keluar"}
            </span>
          </button>
        </div>
      </aside>

      {/* ================= MAIN AREA ================= */}
      <div className="lg:pl-[270px]">
        {/* ================= TOPBAR ================= */}
        <header className="sticky top-0 z-30 border-b border-gray-100 bg-white/90 backdrop-blur-xl">
          <div className="flex h-[82px] items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              {/* MOBILE MENU */}
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:bg-gray-50 lg:hidden"
              >
                <Menu size={21} />
              </button>

              <div className="hidden sm:block">
                <p className="text-xs font-medium text-gray-400">
                  Admin Panel
                </p>

                <h2 className="text-lg font-bold text-gray-900">
                  {pathname === "/admin"
                    ? "Dashboard"
                    : pathname
                        .split("/")
                        .filter(Boolean)
                        .pop()
                        ?.replace(/-/g, " ")
                        .replace(/^./, (char) => char.toUpperCase())}
                </h2>
              </div>
            </div>

            {/* TOP RIGHT */}
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-bold text-gray-800">
                  Admin BAZNAS NTB
                </p>

                <p className="text-xs text-gray-400">
                  Administrator
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-700 font-bold text-white shadow-lg shadow-green-700/20">
                A
              </div>
            </div>
          </div>
        </header>

        {/* ================= CONTENT ================= */}
        <main className="min-h-[calc(100vh-82px)]">
          <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
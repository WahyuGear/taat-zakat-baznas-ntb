"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const menus = [
  { name: "Beranda", href: "/" },
  { name: "Program", href: "/campaign" },
  { name: "Zakat", href: "/zakat" },
  { name: "Laporan", href: "/laporan" },
  { name: "Tentang", href: "/tentang" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  
  const [dropdown, setDropdown] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "auto";
  }, [open]);
  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });
  
    router.push("/");
  
    router.refresh();
  }
  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 shadow-lg backdrop-blur-xl"
            : "bg-white"
        }`}
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">

          {/* Logo */}

          <Link href="/">
            <Image
              src="/images/logo.png"
              alt="BAZNAS NTB"
              width={300}
              height={200}
              priority
              className="h-14 w-auto object-contain lg:h-16"
            />
          </Link>

          {/* Desktop */}

          <nav className="hidden items-center gap-10 lg:flex">
            {menus.map((menu) => (
              <Link
                key={menu.name}
                href={menu.href}
                className="text-lg font-semibold text-gray-700 transition hover:text-green-700"
              >
                {menu.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Login */}

          <div className="hidden lg:block">
            <Link
              href="/login"
              className="rounded-xl border-2 border-green-700 px-6 py-3 text-base font-bold text-green-700 transition hover:bg-green-700 hover:text-white"
            >
              Masuk
            </Link>
          </div>

          {/* Mobile Button */}

          <button
            onClick={() => setOpen(!open)}
            className="rounded-xl p-2 lg:hidden"
          >
            {open ? (
              <X className="h-8 w-8" />
            ) : (
              <Menu className="h-8 w-8" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Overlay */}

      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 lg:hidden ${
          open
            ? "opacity-100 visible"
            : "opacity-0 invisible"
        }`}
        onClick={() => setOpen(false)}
      />

      {/* Mobile Menu */}

      <aside
        className={`fixed top-0 right-0 z-50 h-screen w-80 bg-white shadow-2xl transition-transform duration-300 lg:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b p-6">

          <Image
            src="/images/logo.png"
            alt="logo"
            width={150}
            height={60}
            className="h-12 w-auto"
          />

          <button onClick={() => setOpen(false)}>
            <X className="h-7 w-7" />
          </button>

        </div>

        <div className="flex flex-col p-8">

          {menus.map((menu) => (
            <Link
              key={menu.name}
              href={menu.href}
              onClick={() => setOpen(false)}
              className="border-b py-5 text-xl font-semibold text-gray-700 transition hover:text-green-700"
            >
              {menu.name}
            </Link>
          ))}

          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="mt-8 rounded-xl bg-green-700 py-4 text-center text-lg font-bold text-white"
          >
            Masuk
          </Link>

        </div>
      </aside>

      {/* Spacer */}

      <div className="h-20"></div>
    </>
  );
}
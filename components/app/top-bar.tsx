"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Bell,
  Search,
  X,
  ArrowLeft,
  CheckCircle2,
  Info,
  Heart,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Campaign = {
  id: number;
  title: string;
  slug: string;
  description: string;
  image: string;
  target: number;
  collected: number;
  category: string;
  isActive: boolean;
};

type NotificationItem = {
  id: number;
  title: string;
  message: string;
  time: string;
  type: "info" | "success" | "donation";
  link?: string;
  isRead: boolean;
};

export default function TopBar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const [query, setQuery] = useState("");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [results, setResults] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] =
    useState<NotificationItem[]>([
      {
        id: 1,
        title: "Selamat datang di BAZNAS NTB",
        message:
          "Terima kasih telah bergabung dan ikut berbagi kebaikan bersama BAZNAS NTB.",
        time: "Baru saja",
        type: "info",
        link: "/campaign",
        isRead: false,
      },
      {
        id: 2,
        title: "Sedekah Jumat",
        message:
          "Mari berbagi kebaikan melalui program Sedekah Jumat BAZNAS NTB.",
        time: "Hari ini",
        type: "donation",
        link: "/campaign/sedekah-jumat",
        isRead: false,
      },
      {
        id: 3,
        title: "Terima kasih atas kebaikan Anda",
        message:
          "Setiap kebaikan yang Anda berikan sangat berarti bagi penerima manfaat.",
        time: "Kemarin",
        type: "success",
        link: "/campaign",
        isRead: true,
      },
    ]);

  // ================================
  // AMBIL CAMPAIGN
  // ================================

  useEffect(() => {
    async function loadCampaigns() {
      try {
        const response = await fetch("/api/campaigns");

        if (!response.ok) {
          console.error(
            "Gagal mengambil campaign:",
            response.status
          );
          return;
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          setCampaigns(data);
        }
      } catch (error) {
        console.error(
          "Gagal mengambil campaign:",
          error
        );
      }
    }

    loadCampaigns();
  }, []);

  // ================================
  // KLIK DI LUAR PANEL
  // ================================

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      const target = event.target as Node;

      if (
        searchOpen &&
        searchRef.current &&
        !searchRef.current.contains(target)
      ) {
        setSearchOpen(false);
        setQuery("");
        setResults([]);
      }

      if (
        notificationOpen &&
        notificationRef.current &&
        !notificationRef.current.contains(target)
      ) {
        setNotificationOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, [searchOpen, notificationOpen]);

  // ================================
  // FOCUS SEARCH
  // ================================

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [searchOpen]);

  // ================================
  // SEARCH
  // ================================

  useEffect(() => {
    if (!searchOpen) {
      setResults([]);
      return;
    }

    const keyword = query.trim().toLowerCase();

    if (!keyword) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const timer = setTimeout(() => {
      const filtered = campaigns.filter((campaign) => {
        const title =
          campaign.title?.toLowerCase() || "";

        const description =
          campaign.description?.toLowerCase() || "";

        const category =
          campaign.category?.toLowerCase() || "";

        return (
          title.includes(keyword) ||
          description.includes(keyword) ||
          category.includes(keyword)
        );
      });

      setResults(filtered);
      setLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [query, campaigns, searchOpen]);

  // ================================
  // BUKA SEARCH
  // ================================

  function openSearch() {
    setNotificationOpen(false);
    setSearchOpen(true);
  }

  // ================================
  // TUTUP SEARCH
  // ================================

  function closeSearch() {
    setSearchOpen(false);
    setQuery("");
    setResults([]);
  }

  // ================================
  // BUKA NOTIFICATION
  // ================================

  function openNotifications() {
    setSearchOpen(false);
    setQuery("");
    setResults([]);

    setNotificationOpen((current) => !current);
  }

  // ================================
  // KLIK NOTIFICATION
  // ================================

  function handleNotificationClick(
    notification: NotificationItem
  ) {
    setNotifications((current) =>
      current.map((item) =>
        item.id === notification.id
          ? {
              ...item,
              isRead: true,
            }
          : item
      )
    );

    setNotificationOpen(false);
  }

  const unreadCount = notifications.filter(
    (item) => !item.isRead
  ).length;

  return (
    <>
      {/* ================================
          TOP BAR
      ================================= */}

      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="flex h-16 items-center justify-between px-4">

          {/* LOGO */}

          <Link
            href="/"
            className="flex items-center"
          >
            <Image
              src="/logo-baznas-ntb.png"
              alt="BAZNAS NTB"
              width={110}
              height={32}
              className="h-8 w-auto object-contain"
              priority
            />
          </Link>

          {/* ACTION */}

          <div className="flex items-center gap-1">

            {/* SEARCH BUTTON */}

            <button
              type="button"
              aria-label="Cari"
              onClick={openSearch}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-700 transition hover:bg-slate-100 active:scale-95"
            >
              <Search
                size={20}
                strokeWidth={2}
              />
            </button>

            {/* NOTIFICATION BUTTON */}

            <button
              type="button"
              aria-label="Notifikasi"
              onClick={openNotifications}
              className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-700 transition hover:bg-slate-100 active:scale-95"
            >
              <Bell
                size={20}
                strokeWidth={2}
              />

              {unreadCount > 0 && (
                <span className="absolute right-[7px] top-[6px] h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ================================
          SEARCH PANEL
      ================================= */}

      {searchOpen && (
        <div
          ref={searchRef}
          className="absolute left-0 right-0 z-40 bg-white shadow-lg"
        >
          <div className="mx-auto w-full max-w-[430px]">

            {/* INPUT */}

            <div className="flex items-center gap-2 px-3 py-3">

              <button
                type="button"
                onClick={closeSearch}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100"
              >
                <ArrowLeft size={19} />
              </button>

              <div className="relative flex-1">

                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) =>
                    setQuery(e.target.value)
                  }
                  placeholder="Cari program donasi..."
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm text-slate-800 outline-none focus:border-green-500 focus:bg-white"
                />

                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
            </div>

            {/* HASIL */}

            {query.trim() && (
              <div className="max-h-[70vh] overflow-y-auto px-4 pb-4">

                {loading ? (
                  <div className="py-8 text-center">
                    <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-green-600" />

                    <p className="mt-3 text-[10px] text-slate-400">
                      Mencari program...
                    </p>
                  </div>
                ) : results.length > 0 ? (
                  <div>

                    <p className="mb-3 px-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Hasil pencarian
                    </p>

                    <div className="space-y-2">

                      {results.map((campaign) => {
                        const progress =
                          campaign.target > 0
                            ? Math.min(
                                Math.round(
                                  (campaign.collected /
                                    campaign.target) *
                                    100
                                ),
                                100
                              )
                            : 0;

                        return (
                          <Link
  key={campaign.id}
  href={"/campaign/" + campaign.slug}
  onClick={closeSearch}
                            className="flex gap-3 rounded-2xl border border-slate-100 bg-white p-2.5 transition hover:bg-slate-50 active:scale-[0.99]"
                          >

                            {/* IMAGE */}

                            <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">

                              <Image
                                src={campaign.image}
                                alt={campaign.title}
                                fill
                                sizes="80px"
                                className="object-cover"
                              />

                            </div>

                            {/* CONTENT */}

                            <div className="min-w-0 flex-1">

                              <h3 className="line-clamp-2 text-[11px] font-bold leading-4 text-slate-800">
                                {campaign.title}
                              </h3>

                              {campaign.category && (
                                <p className="mt-1 line-clamp-1 text-[9px] text-green-700">
                                  {campaign.category}
                                </p>
                              )}

                              <div className="mt-2">

                                <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                                  <div
                                    className="h-full rounded-full bg-green-600"
                                    style={{
  width: progress + "%",
}}
                                  />
                                </div>

                                <div className="mt-1 flex justify-between">

                                  <span className="text-[8px] font-bold text-green-700">
                                    Rp{" "}
                                    {campaign.collected.toLocaleString(
                                      "id-ID"
                                    )}
                                  </span>

                                  <span className="text-[8px] text-slate-400">
                                    {progress}%
                                  </span>

                                </div>
                              </div>

                            </div>
                          </Link>
                        );
                      })}

                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center">

                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50">
                      <Search
                        size={21}
                        className="text-slate-300"
                      />
                    </div>

                    <p className="mt-3 text-xs font-bold text-slate-700">
                      Campaign tidak ditemukan
                    </p>

                    <p className="mt-1 text-[9px] text-slate-400">
                      Coba gunakan kata kunci lain.
                    </p>

                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      )}

      {/* ================================
          NOTIFICATION PANEL
      ================================= */}

      {notificationOpen && (
        <div
          ref={notificationRef}
          className="absolute left-0 right-0 z-40 bg-white shadow-lg"
        >
          <div className="mx-auto w-full max-w-[430px]">

            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">

              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Notifikasi
                </h2>

                <p className="mt-0.5 text-[9px] text-slate-400">
                  Informasi terbaru BAZNAS NTB
                </p>
              </div>

              {unreadCount > 0 && (
                <span className="rounded-full bg-green-50 px-2.5 py-1 text-[9px] font-bold text-green-700">
                  {unreadCount} baru
                </span>
              )}

            </div>

            {/* LIST */}

            <div className="max-h-[70vh] overflow-y-auto px-3 py-3">

              {notifications.length === 0 ? (
                <div className="py-10 text-center">

                  <Bell
                    size={25}
                    className="mx-auto text-slate-300"
                  />

                  <p className="mt-3 text-xs font-bold text-slate-700">
                    Belum ada notifikasi
                  </p>

                </div>
              ) : (
                <div className="space-y-2">

                  {notifications.map(
                    (notification) => {

                      const icon =
                        notification.type ===
                        "success" ? (
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-100">
                            <CheckCircle2
                              size={17}
                              className="text-green-700"
                            />
                          </div>
                        ) : notification.type ===
                          "donation" ? (
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-yellow-50">
                            <Heart
                              size={17}
                              className="text-yellow-600"
                            />
                          </div>
                        ) : (
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                            <Info
                              size={17}
                              className="text-blue-600"
                            />
                          </div>
                        );

                      if (notification.link) {
                        return (
                          <Link
  key={notification.id}
  href={notification.link}
  onClick={() =>
    handleNotificationClick(notification)
  }
  className={
    "flex gap-3 rounded-2xl p-3 transition hover:bg-slate-50 " +
    (notification.isRead
      ? "bg-white"
      : "bg-green-50")
  }
>
                            {icon}

                            <div className="min-w-0 flex-1">

                              <div className="flex items-start justify-between gap-2">

                                <h3 className="text-[11px] font-bold text-slate-800">
                                  {notification.title}
                                </h3>

                                {!notification.isRead && (
                                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-green-600" />
                                )}

                              </div>

                              <p className="mt-1 text-[9px] leading-4 text-slate-500">
                                {notification.message}
                              </p>

                              <p className="mt-2 text-[8px] text-slate-400">
                                {notification.time}
                              </p>

                            </div>
                          </Link>
                        );
                      }

                      return (
                        <button
                          key={notification.id}
                          type="button"
                          onClick={() =>
                            handleNotificationClick(
                              notification
                            )
                          }
                          className={
                            "flex gap-3 rounded-2xl p-3 transition hover:bg-slate-50 " +
                            (notification.isRead
                              ? "bg-white"
                              : "bg-green-50")
                          }
                        >
                          {icon}

                          <div className="min-w-0 flex-1">

                            <h3 className="text-[11px] font-bold text-slate-800">
                              {notification.title}
                            </h3>

                            <p className="mt-1 text-[9px] leading-4 text-slate-500">
                              {notification.message}
                            </p>

                            <p className="mt-2 text-[8px] text-slate-400">
                              {notification.time}
                            </p>

                          </div>
                        </button>
                      );
                    }
                  )}

                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  );
}
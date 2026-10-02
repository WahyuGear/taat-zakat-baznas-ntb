"use client";

import Image from "next/image";
import Link from "next/link";

import {
  Bell,
  Search,
  X,
  CheckCircle2,
  Info,
  Heart,
  AlertTriangle,
  XCircle,
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
  createdAt: string;
  type: string;
  link?: string | null;
  isRead: boolean;
};

export default function TopBar() {
  const [query, setQuery] = useState("");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [results, setResults] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);

  const [notificationOpen, setNotificationOpen] =
    useState(false);

  const [notifications, setNotifications] = useState<
    NotificationItem[]
  >([]);

  const [notificationsLoading, setNotificationsLoading] =
    useState(false);

  const [campaignsLoaded, setCampaignsLoaded] =
    useState(false);

  const [notificationsLoaded, setNotificationsLoaded] =
    useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // ================================
  // AMBIL CAMPAIGN
  // Hanya saat user mulai mencari
  // ================================

  async function loadCampaigns() {
    if (campaignsLoaded) {
      return;
    }

    try {
      setCampaignsLoaded(true);

      const response = await fetch("/api/campaigns", {
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) {
        console.error(
          "Gagal mengambil campaign:",
          response.status
        );

        setCampaignsLoaded(false);
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

      setCampaignsLoaded(false);
    }
  }

  // ================================
  // AMBIL NOTIFIKASI
  // Hanya saat lonceng dibuka
  // ================================

  async function loadNotifications() {
    if (notificationsLoaded) {
      return;
    }

    try {
      setNotificationsLoading(true);
      setNotificationsLoaded(true);

      const response = await fetch(
        "/api/notifications",
        {
          credentials: "include",
          cache: "no-store",
        }
      );

      if (!response.ok) {
        console.error(
          "Gagal mengambil notifikasi:",
          response.status
        );

        setNotificationsLoaded(false);
        return;
      }

      const data = await response.json();

      if (
        data.success &&
        Array.isArray(data.notifications)
      ) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error(
        "Gagal mengambil notifikasi:",
        error
      );

      setNotificationsLoaded(false);
    } finally {
      setNotificationsLoading(false);
    }
  }

  // ================================
  // SEARCH
  // ================================

  useEffect(() => {
    const keyword = query.trim().toLowerCase();

    if (!keyword) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    loadCampaigns();

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
  }, [query, campaigns]);
  
  // ================================
  // REFRESH NOTIFIKASI OTOMATIS
  // Setiap 10 detik
  // ================================

  useEffect(() => {
    const interval = setInterval(() => {
      setNotificationsLoaded(false);
      loadNotifications();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // ================================
  // KLIK DI LUAR
  // ================================

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      const target = event.target as Node;

      if (
        searchRef.current &&
        !searchRef.current.contains(target)
      ) {
        setQuery("");
        setResults([]);
      }

      if (
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
  }, []);

  // ================================
  // KLIK NOTIFIKASI
  // ================================

  async function handleNotificationClick(
    notification: NotificationItem
  ) {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          id: notification.id,
        }),
      });

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
    } catch (error) {
      console.error(
        "Gagal menandai notifikasi:",
        error
      );
    }

    setNotificationOpen(false);
  }

  const unreadCount = notifications.filter(
    (item) => !item.isRead
  ).length;

  return (
    <>
      {/* =================================
          TOP BAR
      ================================= */}

      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white shadow-sm">
        <div className="mx-auto flex h-16 w-full max-w-[430px] items-center gap-2 px-3">

          {/* =================================
              LOGO
          ================================= */}

          <Link
            href="/"
            className="flex shrink-0 items-center"
          >
            <Image
              src="/logo-baznas-ntb.png"
              alt="BAZNAS NTB"
              width={100}
              height={30}
              className="h-8 w-auto object-contain"
              priority
            />
          </Link>

          {/* =================================
              SEARCH TENGAH
          ================================= */}

          <div
            ref={searchRef}
            className="relative min-w-0 flex-1"
          >
            <Search
              size={17}
              strokeWidth={2}
              className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={query}
              onChange={(e) =>
                setQuery(e.target.value)
              }
              placeholder="Cari program..."
              className="
                h-10
                w-full
                rounded-2xl
                border
                border-slate-200
                bg-slate-50
                pl-9
                pr-9
                text-[11px]
                text-slate-800
                outline-none
                transition
                placeholder:text-slate-400
                focus:border-green-500
                focus:bg-white
                focus:ring-2
                focus:ring-green-100
              "
            />

            {query && (
              <button
                type="button"
                aria-label="Hapus pencarian"
                onClick={() => {
                  setQuery("");
                  setResults([]);
                }}
                className="
                  absolute
                  right-2
                  top-1/2
                  flex
                  h-7
                  w-7
                  -translate-y-1/2
                  items-center
                  justify-center
                  rounded-lg
                  text-slate-400
                  transition
                  hover:bg-slate-100
                "
              >
                <X size={14} />
              </button>
            )}

            {/* =================================
                HASIL SEARCH
            ================================= */}

            {query.trim() && (
              <div
                className="
                  absolute
                  left-0
                  right-0
                  top-[46px]
                  z-50
                  overflow-hidden
                  rounded-2xl
                  border
                  border-slate-100
                  bg-white
                  shadow-xl
                "
              >
                {loading ? (
                  <div className="px-4 py-6 text-center">
                    <div
                      className="
                        mx-auto
                        h-5
                        w-5
                        animate-spin
                        rounded-full
                        border-2
                        border-slate-200
                        border-t-green-600
                      "
                    />

                    <p className="mt-2 text-[9px] text-slate-400">
                      Mencari program...
                    </p>
                  </div>
                ) : results.length > 0 ? (
                  <div className="max-h-[55vh] overflow-y-auto p-2">
                    <p className="px-2 pb-2 pt-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      Hasil pencarian
                    </p>

                    <div className="space-y-1.5">
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
                            href={`/campaign/${campaign.slug}`}
                            onClick={() => {
                              setQuery("");
                              setResults([]);
                            }}
                            className="
                              flex
                              gap-2.5
                              rounded-xl
                              p-2
                              transition
                              hover:bg-slate-50
                            "
                          >
                            {/* IMAGE */}

                            <div className="relative h-14 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                              <Image
                                src={campaign.image}
                                alt={campaign.title}
                                fill
                                sizes="64px"
                                className="object-cover"
                              />
                            </div>

                            {/* CONTENT */}

                            <div className="min-w-0 flex-1">
                              <h3 className="line-clamp-2 text-[10px] font-bold leading-4 text-slate-800">
                                {campaign.title}
                              </h3>

                              {campaign.category && (
                                <p className="mt-0.5 line-clamp-1 text-[8px] text-green-700">
                                  {campaign.category}
                                </p>
                              )}

                              <div className="mt-1.5">
                                <div className="h-1 overflow-hidden rounded-full bg-slate-100">
                                  <div
                                    className="h-full rounded-full bg-green-600"
                                    style={{
                                      width:
                                        progress + "%",
                                    }}
                                  />
                                </div>

                                <div className="mt-1 flex justify-between">
                                  <span className="text-[7px] font-bold text-green-700">
                                    Rp{" "}
                                    {campaign.collected.toLocaleString(
                                      "id-ID"
                                    )}
                                  </span>

                                  <span className="text-[7px] text-slate-400">
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
                  <div className="px-4 py-7 text-center">
                    <Search
                      size={20}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-2 text-[10px] font-bold text-slate-700">
                      Campaign tidak ditemukan
                    </p>

                    <p className="mt-1 text-[8px] text-slate-400">
                      Coba gunakan kata kunci lain.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* =================================
              NOTIFICATION
          ================================= */}

          <div
            ref={notificationRef}
            className="relative shrink-0"
          >
            <button
              type="button"
              aria-label="Notifikasi"
              onClick={() => {
                const nextState =
                  !notificationOpen;

                setNotificationOpen(nextState);

                if (nextState) {
                  loadNotifications();
                }
              }}
              className="
                relative
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                text-slate-700
                transition
                hover:bg-slate-100
                active:scale-95
              "
            >
              <Bell
                size={20}
                strokeWidth={2}
              />

              {unreadCount > 0 && (
                <span
                  className="
                    absolute
                    right-[8px]
                    top-[7px]
                    h-2
                    w-2
                    rounded-full
                    bg-red-500
                    ring-2
                    ring-white
                  "
                />
              )}
            </button>

            {/* =================================
                NOTIFICATION PANEL
            ================================= */}

            {notificationOpen && (
              <div
                className="
                  absolute
                  right-0
                  top-12
                  z-50
                  w-[calc(100vw-24px)]
                  max-w-[380px]
                  overflow-hidden
                  rounded-2xl
                  border
                  border-slate-100
                  bg-white
                  shadow-xl
                "
              >
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

                <div className="max-h-[60vh] overflow-y-auto p-2">
                  {notificationsLoading ? (
                    <div className="py-10 text-center">
                      <div
                        className="
                          mx-auto
                          h-6
                          w-6
                          animate-spin
                          rounded-full
                          border-2
                          border-slate-200
                          border-t-green-600
                        "
                      />

                      <p className="mt-3 text-[10px] text-slate-400">
                        Memuat notifikasi...
                      </p>
                    </div>
                  ) : notifications.length === 0 ? (
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
                    <div className="space-y-1">
                      {notifications.map(
                        (notification) => {
                          const type =
                            notification.type?.toUpperCase();

                          const icon =
                            type === "SUCCESS" ? (
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-100">
                                <CheckCircle2
                                  size={17}
                                  className="text-green-700"
                                />
                              </div>
                            ) : type === "ERROR" ? (
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100">
                                <XCircle
                                  size={17}
                                  className="text-red-600"
                                />
                              </div>
                            ) : type === "WARNING" ? (
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-yellow-50">
                                <AlertTriangle
                                  size={17}
                                  className="text-yellow-600"
                                />
                              </div>
                            ) : type === "DONATION" ? (
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

                          const content = (
                            <>
                              {icon}

                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <h3 className="text-[10px] font-bold text-slate-800">
                                    {notification.title}
                                  </h3>

                                  {!notification.isRead && (
                                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-green-600" />
                                  )}
                                </div>

                                <p className="mt-1 text-[9px] leading-4 text-slate-500">
                                  {notification.message}
                                </p>

                                <p className="mt-1.5 text-[8px] text-slate-400">
                                  {new Date(
                                    notification.createdAt
                                  ).toLocaleString(
                                    "id-ID",
                                    {
                                      day: "2-digit",
                                      month: "short",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )}
                                </p>
                              </div>
                            </>
                          );

                          if (notification.link) {
                            return (
                              <Link
                                key={notification.id}
                                href={notification.link}
                                onClick={() =>
                                  handleNotificationClick(
                                    notification
                                  )
                                }
                                className={
                                  "flex gap-3 rounded-xl p-3 transition hover:bg-slate-50 " +
                                  (notification.isRead
                                    ? "bg-white"
                                    : "bg-green-50")
                                }
                              >
                                {content}
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
                                "flex w-full gap-3 rounded-xl p-3 text-left transition hover:bg-slate-50 " +
                                (notification.isRead
                                  ? "bg-white"
                                  : "bg-green-50")
                              }
                            >
                              {content}
                            </button>
                          );
                        }
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
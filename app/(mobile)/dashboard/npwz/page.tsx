"use client";

import Image from "next/image";
import { ArrowLeft, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";

type UserData = {
  name: string | null;
  npwz: string | null;
};

export default function NPWZPage() {
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me");

        if (!res.ok) {
          throw new Error("Gagal mengambil data user");
        }

        const data = await res.json();
        setUser(data.user);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  const formattedNpwz = user?.npwz
    ? `${user.npwz.slice(0, 7)} ${user.npwz.slice(7, 8)} ${user.npwz.slice(8)}`
    : "Belum tersedia";

  const handleDownload = async () => {
    if (!cardRef.current || downloading) return;

    try {
      setDownloading(true);

      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });

      const link = document.createElement("a");

      link.download = `Kartu-NPWZ-${user?.name || "Muzaki"}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Gagal download kartu:", error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto min-h-screen w-full max-w-[430px] px-4 py-5">
        {/* HEADER */}
        <div className="mb-5 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </button>

          <div>
            <h1 className="text-base font-bold text-gray-900">
              Kartu NPWZ
            </h1>

            <p className="text-[11px] text-gray-500">
              Kartu NPWZ Muzaki
            </p>
          </div>
        </div>

        {/* KARTU */}
        <div
          ref={cardRef}
          className="relative overflow-hidden rounded-3xl"
        >
          <Image
            src="/images/npwz-card.png"
            alt="Kartu NPWZ BAZNAS NTB"
            width={860}
            height={540}
            className="h-auto w-full"
            priority
          />

          {!loading && (
            <div className="absolute left-[8%] top-[50%] text-black font-monomaniac">
              <p
                className="text-[12px] leading-none"
                style={{
                  textShadow:
                    "1px 1px 1px rgba(255,255,255,0.8)",
                }}
              >
                NPWZ :
              </p>

              <p
                className="mt-1 text-[20px] leading-none tracking-wide"
                style={{
                  textShadow:
                    "1px 1px 1px rgba(255,255,255,0.8)",
                }}
              >
                {formattedNpwz}
              </p>

              <p
                className="mt-2 text-[16px] leading-none"
                style={{
                  textShadow:
                    "1px 1px 1px rgba(255,255,255,0.8)",
                }}
              >
                {user?.name || "Nama Muzaki"}
              </p>
            </div>
          )}
        </div>

        {/* DOWNLOAD */}
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-green-700 px-5 py-4 text-sm font-bold text-white shadow-sm disabled:opacity-60"
        >
          <Download className="h-5 w-5" />

          {downloading
            ? "Menyiapkan Kartu..."
            : "Download Kartu NPWZ"}
        </button>
      </div>
    </main>
  );
}
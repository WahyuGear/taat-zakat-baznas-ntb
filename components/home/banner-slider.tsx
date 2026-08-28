"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type Banner = {
  id: number;
  title: string;
  subtitle: string | null;
  image: string;
  link: string | null;
  buttonText: string | null;
  isActive: boolean;
  order: number;
};

export default function BannerSlider() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBanners() {
      try {
        const response = await fetch("/api/banner", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Gagal mengambil banner");
        }

        const data = await response.json();

        setBanners(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("BANNER ERROR:", error);
      } finally {
        setLoading(false);
      }
    }

    loadBanners();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;

    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [banners.length]);

  if (loading) {
    return (
      <div className="h-[190px] w-full animate-pulse rounded-3xl bg-slate-200 md:h-[360px]" />
    );
  }

  if (!banners.length) {
    return null;
  }

  const banner = banners[current];

  return (
    <section className="w-full">
      <Link
        href={banner.link || "#"}
        className="group relative block aspect-[16/7] w-full overflow-hidden rounded-3xl"
      >
        <Image
          src={banner.image}
          alt={banner.title || "Banner BAZNAS NTB"}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 1200px"
          className="object-cover transition duration-500 group-hover:scale-[1.02]"
        />
      </Link>

      {banners.length > 1 && (
        <div className="mt-3 flex justify-center gap-2">
          {banners.map((item, index) => (
            <button
              key={item.id}
              type="button"
              aria-label={`Banner ${index + 1}`}
              onClick={() => setCurrent(index)}
              className={`h-2 rounded-full transition-all ${
                index === current
                  ? "w-6 bg-green-700"
                  : "w-2 bg-slate-300"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
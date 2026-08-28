"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";

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

const emptyForm = {
  title: "",
  subtitle: "",
  image: "",
  link: "",
  buttonText: "",
  isActive: true,
  order: 0,
};

export default function BannerAdminPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadBanners() {
    try {
      setLoading(true);

      const response = await fetch("/api/banner", {
        cache: "no-store",
      });

      const data = await response.json();

      setBanners(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBanners();
  }, []);

  function handleChange(
    field: keyof typeof emptyForm,
    value: string | boolean | number
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.title.trim()) {
      alert("Judul banner wajib diisi.");
      return;
    }

    if (!form.image.trim()) {
      alert("URL gambar wajib diisi.");
      return;
    }

    try {
      setSaving(true);

      const url = editingId
        ? `/api/banner/${editingId}`
        : "/api/banner";

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error("Gagal menyimpan banner");
      }

      setForm(emptyForm);
      setEditingId(null);

      await loadBanners();
    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan banner.");
    } finally {
      setSaving(false);
    }
  }

  function editBanner(banner: Banner) {
    setEditingId(banner.id);

    setForm({
      title: banner.title,
      subtitle: banner.subtitle || "",
      image: banner.image,
      link: banner.link || "",
      buttonText: banner.buttonText || "",
      isActive: banner.isActive,
      order: banner.order,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function deleteBanner(id: number) {
    const confirmed = window.confirm(
      "Yakin ingin menghapus banner ini?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/banner/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Gagal menghapus banner");
      }

      await loadBanners();
    } catch (error) {
      console.error(error);
      alert("Gagal menghapus banner.");
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl">

        <div className="mb-8">
          <p className="text-sm font-semibold text-green-700">
            BAZNAS NTB
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Kelola Banner
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Kelola banner yang tampil di halaman utama.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">

          {/* FORM */}

          <section className="rounded-3xl bg-white p-6 shadow-sm">

            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold">
                {editingId ? "Edit Banner" : "Tambah Banner"}
              </h2>

              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="text-sm font-semibold text-slate-500"
                >
                  Batal
                </button>
              )}
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >

              <div>
                <label className="mb-1 block text-sm font-semibold">
                  Judul
                </label>

                <input
                  value={form.title}
                  onChange={(e) =>
                    handleChange("title", e.target.value)
                  }
                  placeholder="Contoh: Sedekah Subuh"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-green-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold">
                  Subjudul
                </label>

                <input
                  value={form.subtitle}
                  onChange={(e) =>
                    handleChange("subtitle", e.target.value)
                  }
                  placeholder="Mengundang kebaikan sepanjang hari"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-green-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold">
                  URL Gambar
                </label>

                <input
                  value={form.image}
                  onChange={(e) =>
                    handleChange("image", e.target.value)
                  }
                  placeholder="https://..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-green-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold">
                  Link
                </label>

                <input
                  value={form.link}
                  onChange={(e) =>
                    handleChange("link", e.target.value)
                  }
                  placeholder="/campaign/sedekah-subuh"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-green-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold">
                  Teks Tombol
                </label>

                <input
                  value={form.buttonText}
                  onChange={(e) =>
                    handleChange("buttonText", e.target.value)
                  }
                  placeholder="Donasi Sekarang"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-green-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold">
                  Urutan
                </label>

                <input
                  type="number"
                  value={form.order}
                  onChange={(e) =>
                    handleChange(
                      "order",
                      Number(e.target.value)
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-green-500"
                />
              </div>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-slate-50 p-4">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    handleChange(
                      "isActive",
                      e.target.checked
                    )
                  }
                  className="h-4 w-4"
                />

                <span className="text-sm font-semibold">
                  Tampilkan banner
                </span>
              </label>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl bg-green-700 px-5 py-3 font-bold text-white transition hover:bg-green-800 disabled:opacity-50"
              >
                {saving
                  ? "Menyimpan..."
                  : editingId
                    ? "Simpan Perubahan"
                    : "Tambah Banner"}
              </button>

            </form>
          </section>

          {/* LIST */}

          <section className="space-y-4">

            {loading ? (
              <div className="rounded-3xl bg-white p-8 text-center text-slate-500">
                Memuat banner...
              </div>
            ) : banners.length === 0 ? (
              <div className="rounded-3xl bg-white p-10 text-center">
                <p className="text-lg font-bold">
                  Belum ada banner
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Tambahkan banner pertama menggunakan form di sebelah kiri.
                </p>
              </div>
            ) : (
              banners.map((banner) => (
                <article
                  key={banner.id}
                  className="overflow-hidden rounded-3xl bg-white shadow-sm"
                >

                  <div className="grid md:grid-cols-[260px_1fr]">

                    <div className="relative h-48 bg-slate-200 md:h-full">
                      <Image
                        src={banner.image}
                        alt={banner.title}
                        fill
                        sizes="260px"
                        className="object-cover"
                      />
                    </div>

                    <div className="p-5">

                      <div className="flex items-start justify-between gap-4">

                        <div>
                          <h3 className="text-lg font-bold">
                            {banner.title}
                          </h3>

                          {banner.subtitle && (
                            <p className="mt-1 text-sm text-slate-500">
                              {banner.subtitle}
                            </p>
                          )}
                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            banner.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {banner.isActive
                            ? "Aktif"
                            : "Nonaktif"}
                        </span>

                      </div>

                      <div className="mt-5 flex items-center gap-3">

                        <button
                          type="button"
                          onClick={() => editBanner(banner)}
                          className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteBanner(banner.id)}
                          className="rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-600"
                        >
                          Hapus
                        </button>

                      </div>

                    </div>

                  </div>

                </article>
              ))
            )}

          </section>

        </div>
      </div>
    </main>
  );
}
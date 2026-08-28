"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const campaignTypes = [
  {
    value: "GENERAL",
    label: "Campaign Umum",
    description: "Donasi umum / program lainnya",
  },
  {
    value: "ZAKAT_PENGHASILAN",
    label: "Zakat Penghasilan",
    description: "Zakat gaji, honor, dan profesi",
  },
  {
    value: "ZAKAT_MAL",
    label: "Zakat Mal",
    description: "Zakat harta, emas, tabungan, dan investasi",
  },
  {
    value: "ZAKAT_PERTANIAN",
    label: "Zakat Pertanian",
    description: "Zakat hasil pertanian dan panen",
  },
  {
    value: "ZAKAT_PETERNAKAN",
    label: "Zakat Peternakan",
    description: "Zakat kambing, domba, sapi, dan kerbau",
  },
  {
    value: "ZAKAT_PERDAGANGAN",
    label: "Zakat Perdagangan",
    description: "Zakat harta dan aset perdagangan",
  },
];

export default function NewCampaignPage() {
  const router = useRouter();

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    image: "",
    target: "",
    category: "Sedekah",
    type: "GENERAL",
    isActive: true,
    featured: false,
  });

  async function uploadImage(file: File) {
    setUploading(true);

    try {
      const formData = new FormData();

      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setForm((prev) => ({
          ...prev,
          image: data.url,
        }));
      } else {
        alert(data.message || "Upload gambar gagal");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat upload gambar");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!form.title.trim()) {
      alert("Judul campaign wajib diisi");
      return;
    }

    if (!form.description.trim()) {
      alert("Deskripsi campaign wajib diisi");
      return;
    }

    if (!form.image) {
      alert("Banner campaign wajib diupload");
      return;
    }

    if (!form.target || Number(form.target) <= 0) {
      alert("Target donasi harus lebih dari 0");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/campaign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Campaign berhasil dibuat");

        router.push("/admin/campaign");
        router.refresh();
      } else {
        alert(data.message || "Gagal membuat campaign");
      }
    } catch (error) {
      console.error(error);

      alert("Terjadi kesalahan saat membuat campaign");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl rounded-3xl bg-white shadow-xl">
      {/* HEADER */}
      <div className="rounded-t-3xl bg-gradient-to-r from-green-700 to-emerald-600 p-8 text-white">
        <h1 className="text-3xl font-extrabold">
          Tambah Campaign
        </h1>

        <p className="mt-2 text-green-100">
          Buat campaign donasi baru untuk BAZNAS NTB
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-7 p-8"
      >
        {/* JUDUL */}
        <div>
          <label className="mb-2 block font-semibold">
            Judul Campaign
          </label>

          <input
            type="text"
            required
            className="w-full rounded-2xl border p-4 focus:border-green-600 focus:outline-none"
            placeholder="Masukkan judul campaign"
            value={form.title}
            onChange={(e) =>
              setForm({
                ...form,
                title: e.target.value,
              })
            }
          />
        </div>

        {/* CATEGORY + TYPE */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* CATEGORY */}
          <div>
            <label className="mb-2 block font-semibold">
              Kategori
            </label>

            <select
              className="w-full rounded-2xl border p-4 focus:border-green-600 focus:outline-none"
              value={form.category}
              onChange={(e) =>
                setForm({
                  ...form,
                  category: e.target.value,
                })
              }
            >
              <option value="Zakat">
                🕌 Zakat
              </option>

              <option value="Sedekah">
                ❤️ Sedekah
              </option>

              <option value="Infak">
                🤲 Infak
              </option>

              <option value="Kemanusiaan">
                🚑 Kemanusiaan
              </option>

              <option value="Pendidikan">
                🎓 Pendidikan
              </option>

              <option value="Pemberdayaan">
                🌱 Pemberdayaan
              </option>

              <option value="Lansia">
                👴 Lansia
              </option>

              <option value="Kurban">
                🐄 Kurban
              </option>
            </select>
          </div>

          {/* TYPE */}
          <div>
            <label className="mb-2 block font-semibold">
              Jenis Campaign
            </label>

            <select
              className="w-full rounded-2xl border p-4 focus:border-green-600 focus:outline-none"
              value={form.type}
              onChange={(e) =>
                setForm({
                  ...form,
                  type: e.target.value,
                })
              }
            >
              {campaignTypes.map((item) => (
                <option
                  key={item.value}
                  value={item.value}
                >
                  {item.label}
                </option>
              ))}
            </select>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              Jenis ini digunakan sistem untuk
              menghubungkan campaign dengan
              kalkulator zakat.
            </p>
          </div>
        </div>

        {/* TARGET */}
        <div>
          <label className="mb-2 block font-semibold">
            Target Donasi
          </label>

          <div className="flex items-center rounded-2xl border px-4 focus-within:border-green-600">
            <span className="font-semibold text-slate-400">
              Rp
            </span>

            <input
              type="number"
              min="1"
              required
              className="w-full p-4 outline-none"
              placeholder="50000000"
              value={form.target}
              onChange={(e) =>
                setForm({
                  ...form,
                  target: e.target.value,
                })
              }
            />
          </div>
        </div>

        {/* IMAGE */}
        <div>
          <label className="mb-2 block font-semibold">
            Upload Banner Campaign
          </label>

          <div className="rounded-2xl border-2 border-dashed p-6">
            <input
              type="file"
              accept="image/*"
              className="w-full"
              onChange={(e) => {
                const file = e.target.files?.[0];

                if (file) {
                  uploadImage(file);
                }
              }}
            />

            {uploading && (
              <p className="mt-4 text-sm font-medium text-blue-600">
                ⏳ Mengupload gambar...
              </p>
            )}

            {form.image && (
              <div className="relative mt-6 h-72 overflow-hidden rounded-2xl">
                <Image
                  src={form.image}
                  alt="Preview"
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
              </div>
            )}
          </div>
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="mb-2 block font-semibold">
            Deskripsi Campaign
          </label>

          <textarea
            rows={8}
            required
            className="w-full rounded-2xl border p-4 focus:border-green-600 focus:outline-none"
            placeholder="Tulis cerita campaign..."
            value={form.description}
            onChange={(e) =>
              setForm({
                ...form,
                description: e.target.value,
              })
            }
          />
        </div>

        {/* SETTINGS */}
        <div className="rounded-2xl border bg-slate-50 p-6">
          <h3 className="mb-5 text-lg font-bold">
            Pengaturan Campaign
          </h3>

          <label className="mb-4 flex items-center justify-between">
            <span className="font-medium">
              Campaign Aktif
            </span>

            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) =>
                setForm({
                  ...form,
                  isActive: e.target.checked,
                })
              }
              className="h-5 w-5"
            />
          </label>

          <label className="flex items-center justify-between">
            <span className="font-medium">
              ⭐ Program Unggulan
            </span>

            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) =>
                setForm({
                  ...form,
                  featured: e.target.checked,
                })
              }
              className="h-5 w-5"
            />
          </label>
        </div>

        {/* INFO */}
        {form.type !== "GENERAL" && (
          <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
            <p className="font-bold text-green-800">
              🕌 Campaign Zakat
            </p>

            <p className="mt-1 text-sm leading-6 text-green-700">
              Campaign ini akan dikenali oleh sistem
              sebagai{" "}
              <strong>
                {
                  campaignTypes.find(
                    (item) =>
                      item.value === form.type
                  )?.label
                }
              </strong>
              . Kalkulator zakat nantinya akan
              otomatis mengarahkan muzaki ke
              campaign ini.
            </p>
          </div>
        )}

        {/* BUTTON */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 rounded-2xl border py-4 font-semibold transition hover:bg-gray-100"
          >
            Batal
          </button>

          <button
            type="submit"
            disabled={saving || uploading}
            className="flex-1 rounded-2xl bg-green-700 py-4 font-bold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Menyimpan..."
              : uploading
                ? "Menunggu Upload..."
                : "Simpan Campaign"}
          </button>
        </div>
      </form>
    </div>
  );
}
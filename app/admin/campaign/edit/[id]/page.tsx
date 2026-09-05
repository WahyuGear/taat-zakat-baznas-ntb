"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

export default function EditCampaignPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    async function loadCampaign() {
      try {
        const res = await fetch(`/api/campaign/${id}`);

        if (!res.ok) {
          throw new Error("Campaign tidak ditemukan");
        }

        const data = await res.json();

        setForm({
          title: data.title ?? "",
          description: data.description ?? "",
          image: data.image ?? "",
          target: String(data.target ?? ""),
          category: data.category ?? "Sedekah",
          type: data.type ?? "GENERAL",
          isActive: data.isActive ?? true,
          featured: data.featured ?? false,
        });
      } catch (error) {
        console.error(error);
        alert("Gagal mengambil data campaign");
        router.push("/admin/campaign");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadCampaign();
    }
  }, [id, router]);

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

      if (!res.ok) {
        alert(data.message || "Upload gambar gagal");
        return;
      }

      setForm((prev) => ({
        ...prev,
        image: data.url,
      }));
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
      const res = await fetch(`/api/campaign/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          image: form.image,
          target: Number(form.target),
          category: form.category,
          type: form.type,
          isActive: form.isActive,
          featured: form.featured,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Gagal update campaign");
        return;
      }

      alert("Campaign berhasil diupdate");

      router.push("/admin/campaign");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat update campaign");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-green-600" />
          <p className="mt-4 text-sm text-slate-500">
            Memuat campaign...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl bg-white shadow-xl">
      {/* HEADER */}

      <div className="bg-gradient-to-r from-green-700 to-emerald-600 p-8 text-white">
        <h1 className="text-3xl font-extrabold">
          Edit Campaign
        </h1>

        <p className="mt-2 text-green-100">
          Perbarui informasi campaign BAZNAS NTB
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-7 p-8"
      >
        {/* JUDUL */}

        <div>
          <label className="mb-2 block font-semibold text-slate-800">
            Judul Campaign
          </label>

          <input
            type="text"
            required
            value={form.title}
            onChange={(e) =>
              setForm({
                ...form,
                title: e.target.value,
              })
            }
            className="w-full rounded-2xl border border-slate-200 p-4 outline-none transition focus:border-green-600"
            placeholder="Masukkan judul campaign"
          />
        </div>

        {/* CATEGORY + TYPE */}

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block font-semibold text-slate-800">
              Kategori
            </label>

            <select
              value={form.category}
              onChange={(e) =>
                setForm({
                  ...form,
                  category: e.target.value,
                })
              }
              className="w-full rounded-2xl border border-slate-200 p-4 outline-none focus:border-green-600"
            >
              <option value="Zakat">🕌 Zakat</option>
              <option value="Sedekah">❤️ Sedekah</option>
              <option value="Infak">🤲 Infak</option>
              <option value="DSKL">🤲 DSKL</option>
<option value="Fitrah">🌙 Fitrah</option>
<option value="Fidyah">🍚 Fidyah</option>
<option value="Kafarat">🛡️ Kafarat</option>
<option value="DAM">🕋 DAM</option>
              <option value="Kemanusiaan">
                🚑 Kemanusiaan
              </option>
              <option value="Pendidikan">
                🎓 Pendidikan
              </option>
              <option value="Pemberdayaan">
                🌱 Pemberdayaan
              </option>
              <option value="Lansia">👴 Lansia</option>
              <option value="Kurban">🐄 Kurban</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block font-semibold text-slate-800">
              Jenis Campaign
            </label>

            <select
              value={form.type}
              onChange={(e) =>
                setForm({
                  ...form,
                  type: e.target.value,
                })
              }
              className="w-full rounded-2xl border border-slate-200 p-4 outline-none focus:border-green-600"
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
              Jenis campaign digunakan untuk
              menghubungkan campaign dengan kalkulator
              zakat.
            </p>
          </div>
        </div>

        {/* TARGET */}

        <div>
          <label className="mb-2 block font-semibold text-slate-800">
            Target Donasi
          </label>

          <div className="flex items-center rounded-2xl border border-slate-200 px-4 focus-within:border-green-600">
            <span className="font-semibold text-slate-400">
              Rp
            </span>

            <input
              type="number"
              min="1"
              required
              value={form.target}
              onChange={(e) =>
                setForm({
                  ...form,
                  target: e.target.value,
                })
              }
              className="w-full p-4 outline-none"
              placeholder="50000000"
            />
          </div>
        </div>

        {/* IMAGE */}

        <div>
          <label className="mb-2 block font-semibold text-slate-800">
            Banner Campaign
          </label>

          <div className="rounded-2xl border-2 border-dashed border-slate-200 p-6">
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
                ⏳ Mengupload gambar ke Cloudinary...
              </p>
            )}

            {form.image && (
              <div className="relative mt-6 h-72 overflow-hidden rounded-2xl">
                <Image
                  src={form.image}
                  alt="Preview Campaign"
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
          <label className="mb-2 block font-semibold text-slate-800">
            Deskripsi Campaign
          </label>

          <textarea
            rows={8}
            required
            value={form.description}
            onChange={(e) =>
              setForm({
                ...form,
                description: e.target.value,
              })
            }
            className="w-full rounded-2xl border border-slate-200 p-4 outline-none focus:border-green-600"
            placeholder="Tulis cerita campaign..."
          />
        </div>

        {/* SETTINGS */}

        <div className="rounded-2xl border bg-slate-50 p-6">
          <h3 className="mb-5 text-lg font-bold text-slate-900">
            Pengaturan Campaign
          </h3>

          <label className="mb-5 flex items-center justify-between">
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

        {/* INFO ZAKAT */}

        {form.type !== "GENERAL" && (
          <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
            <p className="font-bold text-green-800">
              🕌 Campaign Zakat
            </p>

            <p className="mt-1 text-sm leading-6 text-green-700">
              Campaign ini akan dikenali sistem sebagai{" "}
              <strong>
                {
                  campaignTypes.find(
                    (item) => item.value === form.type
                  )?.label
                }
              </strong>
              . Kalkulator zakat nantinya dapat
              mengarahkan muzaki ke campaign ini.
            </p>
          </div>
        )}

        {/* BUTTON */}

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 rounded-2xl border py-4 font-semibold transition hover:bg-slate-100"
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
                : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>
  );
}
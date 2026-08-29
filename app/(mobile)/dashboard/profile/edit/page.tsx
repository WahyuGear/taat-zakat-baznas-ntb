"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  User,
  Phone,
  Camera,
  ChevronLeft,
  Save,
  Loader2,
} from "lucide-react";

type Profile = {
  name: string;
  email: string;
  phone: string;
  image: string | null;
};

export default function EditProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile>({
    name: "",
    email: "",
    phone: "",
    image: null,
  });

  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
        });

        if (!response.ok) {
          router.push("/login");
          return;
        }

        const data = await response.json();

        const user = data.user || data;

        setProfile({
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          image: user.image || null,
        });

        setPreview(user.image || null);
      } catch (error) {
        console.error(error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  async function handleImageChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("File harus berupa gambar");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran foto maksimal 5 MB");
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Upload gagal");
      }

      setProfile((prev) => ({
        ...prev,
        image: data.url,
      }));

      setPreview(data.url);
    } catch (error) {
      console.error(error);

      alert("Foto gagal diupload");

      setPreview(profile.image);
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!profile.name.trim()) {
      alert("Nama wajib diisi");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: profile.name.trim(),
          phone: profile.phone.trim(),
          image: profile.image,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Gagal menyimpan perubahan");
        return;
      }

      alert("Profil berhasil diperbarui");

      router.push("/dashboard/profile");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan server");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F5F7FB] px-4 pb-28 pt-5">
        <div className="mx-auto flex min-h-[70vh] w-full max-w-[430px] items-center justify-center">
          <Loader2
            size={28}
            className="animate-spin text-green-700"
          />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5F7FB] px-4 pb-28 pt-5">
      <div className="mx-auto w-full max-w-[430px]">

        {/* HEADER */}
        <section className="rounded-[28px] bg-green-700 p-5 text-white shadow-sm">
          <div className="flex items-center gap-3">

            <Link
              href="/dashboard/profile"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10"
            >
              <ChevronLeft size={19} />
            </Link>

            <div>
              <h1 className="text-lg font-bold">
                Edit Profil
              </h1>

              <p className="mt-0.5 text-[10px] text-green-100">
                Perbarui informasi akun Anda
              </p>
            </div>

          </div>
        </section>

        <form
          onSubmit={handleSubmit}
          className="mt-4 space-y-4"
        >

          {/* FOTO */}
          <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">

            <div className="flex flex-col items-center">

              <div className="relative">

                <div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-[32px] bg-green-100">

                  {preview ? (
                    <Image
                      src={preview}
                      alt="Foto profil"
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  ) : (
                    <User
                      size={42}
                      className="text-green-700"
                    />
                  )}

                  {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <Loader2
                        size={25}
                        className="animate-spin text-white"
                      />
                    </div>
                  )}

                </div>

                <label
                  htmlFor="profile-image"
                  className="absolute -bottom-2 -right-2 flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-green-700 text-white shadow-md"
                >
                  <Camera size={18} />

                  <input
                    id="profile-image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                    disabled={uploading}
                  />
                </label>

              </div>

              <p className="mt-4 text-xs font-bold text-slate-800">
                Foto Profil
              </p>

              <p className="mt-1 text-[9px] text-slate-400">
                JPG, PNG atau WEBP • Maksimal 5 MB
              </p>

            </div>

          </section>

          {/* DATA PROFIL */}
          <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">

            <h2 className="text-sm font-bold text-slate-900">
              Informasi Pribadi
            </h2>

            <p className="mt-1 text-[9px] text-slate-400">
              Pastikan informasi Anda sudah benar
            </p>

            {/* NAMA */}
            <div className="mt-5">

              <label className="mb-2 block text-[10px] font-bold text-slate-700">
                Nama Lengkap
              </label>

              <div className="relative">

                <User
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={profile.name}
                  onChange={(event) =>
                    setProfile((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Nama lengkap"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-xs outline-none transition focus:border-green-500 focus:bg-white"
                />

              </div>

            </div>

            {/* EMAIL */}
            <div className="mt-4">

              <label className="mb-2 block text-[10px] font-bold text-slate-700">
                Email
              </label>

              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3.5 text-xs text-slate-400 outline-none"
              />

              <p className="mt-1.5 px-1 text-[8px] text-slate-400">
                Email digunakan sebagai identitas login dan tidak dapat
                diubah di sini.
              </p>

            </div>

            {/* WHATSAPP */}
            <div className="mt-4">

              <label className="mb-2 block text-[10px] font-bold text-slate-700">
                Nomor WhatsApp
              </label>

              <div className="relative">

                <Phone
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(event) =>
                    setProfile((prev) => ({
                      ...prev,
                      phone: event.target.value,
                    }))
                  }
                  placeholder="08xxxxxxxxxx"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-xs outline-none transition focus:border-green-500 focus:bg-white"
                />

              </div>

            </div>

          </section>

          {/* SAVE */}
          <button
            type="submit"
            disabled={saving || uploading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-green-700 py-3.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-green-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2
                  size={16}
                  className="animate-spin"
                />
                Menyimpan...
              </>
            ) : (
              <>
                <Save size={16} />
                Simpan Perubahan
              </>
            )}
          </button>

        </form>

        <p className="mt-6 text-center text-[8px] text-slate-400">
          BAZNAS NTB • Layanan Digital
        </p>

      </div>
    </main>
  );
}
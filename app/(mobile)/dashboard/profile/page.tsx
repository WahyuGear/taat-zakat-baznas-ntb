"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  User,
  Phone,
  Camera,
  ChevronLeft,
  Save,
  Loader2,
} from "lucide-react";

type UserData = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  image: string | null;
  npwz: string | null;
};

export default function EditProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<UserData | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          cache: "no-store",
        });
  
        const text = await response.text();
  
        let data: any = null;
  
        try {
          data = text ? JSON.parse(text) : null;
        } catch (jsonError) {
          console.error("RESPONSE BUKAN JSON:", text);
          console.error("JSON ERROR:", jsonError);
  
          throw new Error("Response server tidak valid");
        }
  
        if (!response.ok || !data?.user) {
          console.error("AUTH ME ERROR:", {
            status: response.status,
            data,
          });
  
          router.push("/login");
          return;
        }
  
        setUser(data.user);
        setName(data.user.name || "");
        setPhone(data.user.phone || "");
        setImage(data.user.image || "");
      } catch (error) {
        console.error("LOAD PROFILE ERROR:", error);
  
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }
  
    loadProfile();
  }, [router]);

  async function handleImageChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("File harus berupa gambar");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran foto maksimal 5 MB");
      return;
    }

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
        alert(data.message || "Upload foto gagal");
        return;
      }

      setImage(data.url);
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat upload foto");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!name.trim()) {
      alert("Nama wajib diisi");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          image,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Gagal menyimpan profil");
        return;
      }

      alert("Profil berhasil diperbarui");

      router.push("/dashboard");
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
        <div className="mx-auto flex w-full max-w-[430px] items-center justify-center py-20">
          <Loader2
            className="animate-spin text-green-700"
            size={28}
          />
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#F5F7FB] px-4 pb-28 pt-5">
      <div className="mx-auto w-full max-w-[430px]">

        {/* HEADER */}
        <section className="rounded-[28px] bg-green-700 p-5 text-white shadow-sm">
          <div className="flex items-center gap-3">

            <button
              type="button"
              onClick={() => router.back()}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 transition active:scale-95"
            >
              <ChevronLeft size={19} />
            </button>

            <div>
              <h1 className="text-lg font-bold">
                Edit Profil
              </h1>

              <p className="mt-0.5 text-[10px] text-green-100">
                Ubah informasi pribadi Anda
              </p>
            </div>

          </div>
        </section>

        {/* FOTO PROFIL */}
        <section className="mt-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">

          <div className="text-center">

            <p className="text-[10px] font-bold text-slate-800">
              Foto Profil
            </p>

            <p className="mt-1 text-[8px] text-slate-400">
              Gunakan foto yang jelas
            </p>

            <div className="relative mx-auto mt-5 h-28 w-28">

              <div className="relative h-28 w-28 overflow-hidden rounded-full bg-green-100 ring-4 ring-green-50">

                {image ? (
                  <Image
                    src={image}
                    alt="Foto profil"
                    fill
                    className="object-cover"
                    sizes="112px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <User
                      size={42}
                      className="text-green-700"
                    />
                  </div>
                )}

              </div>

              <label
                htmlFor="profile-image"
                className="absolute bottom-0 right-0 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-green-700 text-white shadow-lg transition active:scale-95"
              >
                {uploading ? (
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  <Camera size={16} />
                )}
              </label>

              <input
                id="profile-image"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
                disabled={uploading}
              />

            </div>

            {uploading && (
              <p className="mt-3 text-[9px] font-medium text-green-700">
                Mengupload foto...
              </p>
            )}

          </div>

        </section>

        <section className="mt-4 rounded-3xl border border-green-100 bg-green-50 p-5">
  <div className="flex items-center justify-between gap-4">
    <div>
      <p className="text-[10px] font-bold text-green-800">
        NPWZ
      </p>

      <p className="mt-1 text-base font-extrabold tracking-wide text-green-900">
        {user.npwz || "Belum tersedia"}
      </p>

      <p className="mt-1 text-[8px] leading-4 text-green-700/70">
        Nomor Pokok Wajib Zakat Anda
      </p>
    </div>

    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-green-700 shadow-sm">
      <span className="text-xs font-black">NP</span>
    </div>
  </div>
</section>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="mt-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"
        >

          {/* NAMA */}
          <div>
            <label className="mb-2 block text-[10px] font-bold text-slate-700">
              Nama Lengkap
            </label>

            <div className="relative">
              <User
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama Lengkap"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-green-500 focus:bg-white"
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
              value={user.email}
              disabled
              className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3.5 text-sm text-slate-400 outline-none"
            />

            <p className="mt-1.5 px-1 text-[8px] text-slate-400">
              Email tidak dapat diubah.
            </p>
          </div>

          {/* WHATSAPP */}
          <div className="mt-4">
            <label className="mb-2 block text-[10px] font-bold text-slate-700">
              Nomor WhatsApp
            </label>

            <div className="relative">
              <Phone
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08xxxxxxxxxx"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-green-500 focus:bg-white"
              />
            </div>
          </div>

          {/* SIMPAN */}
          <button
            type="submit"
            disabled={saving || uploading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-green-700 py-3.5 text-sm font-extrabold text-white transition hover:bg-green-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2
                  size={17}
                  className="animate-spin"
                />
                Menyimpan...
              </>
            ) : (
              <>
                <Save size={17} />
                Simpan Perubahan
              </>
            )}
          </button>

        </form>

        {/* INFO */}
        <section className="mt-4 rounded-2xl border border-green-100 bg-green-50 p-4">
          <div className="flex gap-3">

            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white">
              <User
                size={16}
                className="text-green-700"
              />
            </div>

            <div>
              <p className="text-[10px] font-bold text-green-800">
                Profil Anda
              </p>

              <p className="mt-1 text-[8px] leading-4 text-green-700/70">
                Data profil digunakan untuk memudahkan
                pengelolaan aktivitas zakat dan donasi Anda
                di BAZNAS NTB.
              </p>
            </div>

          </div>
        </section>

      </div>
    </main>
  );
}
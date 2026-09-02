"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ShieldCheck,
  Shield,
  UserPlus,
  Eye,
  EyeOff,
} from "lucide-react";

type Role = "ADMIN" | "SUPER_ADMIN";

export default function NewAdminPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("ADMIN");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");

    if (!name.trim()) {
      setError("Nama wajib diisi.");
      return;
    }

    if (!email.trim()) {
      setError("Email wajib diisi.");
      return;
    }

    if (password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          password,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Gagal membuat akun."
        );
      }

      alert(
        role === "SUPER_ADMIN"
          ? "Super Admin berhasil dibuat."
          : "Admin berhasil dibuat."
      );

      router.push("/admin/users");
      router.refresh();
    } catch (err) {
      console.error("CREATE ADMIN ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Gagal membuat akun."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* HEADER */}
      <div className="mb-6">
        <Link
          href="/admin/users"
          className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-green-700"
        >
          <ArrowLeft size={17} />
          Kembali ke Kelola Admin
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-green-700">
            <UserPlus size={23} />
          </div>

          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
              Tambah Admin
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Buat akun Admin atau Super Admin BAZNAS NTB.
            </p>
          </div>
        </div>
      </div>

      {/* FORM CARD */}
      <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium leading-relaxed text-red-700">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* NAMA */}
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-bold text-gray-700"
            >
              Nama Lengkap
            </label>

            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama lengkap admin"
              disabled={loading}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          {/* EMAIL */}
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-bold text-gray-700"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@baznasntb.com"
              autoComplete="email"
              disabled={loading}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          {/* PHONE */}
          <div>
            <label
              htmlFor="phone"
              className="mb-2 block text-sm font-bold text-gray-700"
            >
              Nomor HP
              <span className="ml-1 font-normal text-gray-400">
                (opsional)
              </span>
            </label>

            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="08xxxxxxxxxx"
              autoComplete="tel"
              disabled={loading}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-bold text-gray-700"
            >
              Password
            </label>

            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Minimal 8 karakter"
                autoComplete="new-password"
                disabled={loading}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-12 text-sm outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100 disabled:cursor-not-allowed disabled:opacity-60"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword((prev) => !prev)
                }
                disabled={loading}
                className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                aria-label={
                  showPassword
                    ? "Sembunyikan password"
                    : "Tampilkan password"
                }
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>

            <p className="mt-2 text-xs text-gray-400">
              Gunakan minimal 8 karakter.
            </p>
          </div>

          {/* ROLE */}
          <div>
            <label className="mb-3 block text-sm font-bold text-gray-700">
              Role Akun
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              {/* ADMIN */}
              <button
                type="button"
                disabled={loading}
                onClick={() => setRole("ADMIN")}
                className={`rounded-2xl border p-4 text-left transition ${
                  role === "ADMIN"
                    ? "border-green-500 bg-green-50 ring-2 ring-green-100"
                    : "border-gray-200 bg-white hover:border-green-200 hover:bg-green-50/50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      role === "ADMIN"
                        ? "bg-green-700 text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <Shield size={20} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900">
                      Admin
                    </p>

                    <p className="mt-1 text-xs leading-relaxed text-gray-500">
                      Mengelola operasional dashboard
                      sesuai akses yang diberikan.
                    </p>
                  </div>
                </div>
              </button>

              {/* SUPER ADMIN */}
              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  setRole("SUPER_ADMIN")
                }
                className={`rounded-2xl border p-4 text-left transition ${
                  role === "SUPER_ADMIN"
                    ? "border-yellow-400 bg-yellow-50 ring-2 ring-yellow-100"
                    : "border-gray-200 bg-white hover:border-yellow-200 hover:bg-yellow-50/50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      role === "SUPER_ADMIN"
                        ? "bg-yellow-500 text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <ShieldCheck size={20} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900">
                      Super Admin
                    </p>

                    <p className="mt-1 text-xs leading-relaxed text-gray-500">
                      Memiliki akses penuh termasuk
                      mengelola akun administrator.
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* INFO */}
          <div className="rounded-2xl border border-green-100 bg-green-50 p-4">
            <div className="flex gap-3">
              <ShieldCheck
                size={19}
                className="mt-0.5 shrink-0 text-green-700"
              />

              <div>
                <p className="text-sm font-bold text-green-900">
                  Keamanan akun
                </p>

                <p className="mt-1 text-xs leading-relaxed text-green-800">
                  Password akan disimpan dalam bentuk
                  terenkripsi. Akun baru otomatis aktif.
                </p>
              </div>
            </div>
          </div>

          {/* BUTTON */}
          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">
            <Link
              href="/admin/users"
              className="flex h-12 items-center justify-center rounded-xl border border-gray-200 bg-white px-6 text-sm font-bold text-gray-600 transition hover:bg-gray-50"
            >
              Batal
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-green-700 px-7 text-sm font-bold text-white shadow-lg shadow-green-700/20 transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  Buat Akun
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
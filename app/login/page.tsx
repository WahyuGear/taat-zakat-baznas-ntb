"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

    const [showPassword, setShowPassword] =
  useState(false);

  const [loading, setLoading] =
    useState(false);

  async function handleLogin(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!email || !password) {
      alert(
        "Email dan password wajib diisi"
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Login gagal"
        );
        return;
      }

      if (
  data.role === "ADMIN" ||
  data.role === "SUPER_ADMIN"
) {
  router.replace("/admin");
} else {
  router.replace("/dashboard");
}

      router.refresh();

    } catch (error) {
      console.error(error);

      alert(
        "Terjadi kesalahan server"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f8f7] px-4 py-10">

      <div className="mx-auto max-w-md">

        <div className="rounded-3xl bg-white p-7 shadow-sm">

          <div className="text-center">

          <div className="mx-auto flex h-24 w-56 items-center justify-center">
  <img
    src="/logo-baznas-ntb.png"
    alt="Logo BAZNAS NTB"
    className="h-24 w-56 object-contain"
  />
</div>

            <h1 className="mt-5 text-2xl font-extrabold">
              Selamat Datang
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Masuk ke akun BAZNAS NTB
            </p>

          </div>

          <form
            onSubmit={handleLogin}
            className="mt-7 space-y-4"
          >

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-green-500 focus:bg-white"
            />

<div className="relative">
  <input
    type={showPassword ? "text" : "password"}
    placeholder="Password"
    value={password}
    onChange={(e) =>
      setPassword(e.target.value)
    }
    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-12 text-sm outline-none focus:border-green-500 focus:bg-white"
  />

  <button
    type="button"
    onClick={() =>
      setShowPassword((prev) => !prev)
    }
    aria-label={
      showPassword
        ? "Sembunyikan password"
        : "Tampilkan password"
    }
    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-700"
  >
    {showPassword ? (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="h-5 w-5"
      >
        <path d="M3 3l18 18" />
        <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
        <path d="M9.9 4.2A10.7 10.7 0 0 1 12 4c5 0 8.5 4 9.5 6a11.5 11.5 0 0 1-3.1 3.8" />
        <path d="M6.1 6.1C4.2 7.4 2.9 9.1 2.5 10c1 2 4.5 6 9.5 6 1 0 2-.2 2.8-.5" />
      </svg>
    ) : (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="h-5 w-5"
      >
        <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
        <circle cx="12" cy="12" r="2.5" />
      </svg>
    )}
  </button>
</div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-green-700 py-3.5 text-sm font-extrabold text-white hover:bg-green-800 disabled:opacity-60"
            >
              {loading
                ? "Memproses..."
                : "Masuk"}
            </button>

          </form>

          <p className="mt-6 text-center text-sm text-slate-500">

            Belum punya akun?

            <Link
              href="/register"
              className="ml-1 font-bold text-green-700"
            >
              Daftar
            </Link>

          </p>

        </div>

      </div>

    </main>
  );
}
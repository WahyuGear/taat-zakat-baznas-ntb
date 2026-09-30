"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

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

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-2xl">
              💚
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

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-green-500 focus:bg-white"
            />

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
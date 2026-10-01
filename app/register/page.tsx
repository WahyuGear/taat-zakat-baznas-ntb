"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BottomNav from "@/components/app/bottom-nav";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

const [notice, setNotice] = useState<{
  title: string;
  message: string;
  type: "success" | "error";
} | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Nama wajib diisi");
      return;
    }

    if (!form.email.trim()) {
      alert("Email wajib diisi");
      return;
    }

    if (!form.phone.trim()) {
      alert("Nomor WhatsApp wajib diisi");
      return;
    }

    if (form.password.length < 6) {
      alert("Password minimal 6 karakter");
      return;
    }

    if (form.password !== form.confirmPassword) {
      alert("Konfirmasi password tidak sama");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Registrasi gagal");
        return;
      }

     setNotice({
  title: "Registrasi Berhasil",
  message:
    data.message ||
    "Silakan cek email untuk melakukan verifikasi akun sebelum login.",
  type: "success",
});

    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f8f7] px-4 py-8 pb-28">
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-3xl bg-white p-6 shadow-sm sm:p-7">
          {/* HEADER */}
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-2xl">
              💚
            </div>

            <h1 className="mt-5 text-2xl font-extrabold text-slate-900">
              Buat Akun
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Daftar sebagai donatur BAZNAS NTB
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <input
              type="text"
              placeholder="Nama Lengkap"
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition focus:border-green-500 focus:bg-white"
            />

            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value,
                })
              }
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition focus:border-green-500 focus:bg-white"
            />

            <input
              type="tel"
              placeholder="Nomor WhatsApp"
              value={form.phone}
              onChange={(e) =>
                setForm({
                  ...form,
                  phone: e.target.value,
                })
              }
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition focus:border-green-500 focus:bg-white"
            />

            <input
              type="password"
              placeholder="Password minimal 6 karakter"
              value={form.password}
              onChange={(e) =>
                setForm({
                  ...form,
                  password: e.target.value,
                })
              }
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition focus:border-green-500 focus:bg-white"
            />

            <input
              type="password"
              placeholder="Konfirmasi Password"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({
                  ...form,
                  confirmPassword: e.target.value,
                })
              }
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition focus:border-green-500 focus:bg-white"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-green-700 py-3.5 text-sm font-extrabold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Mendaftarkan..." : "Daftar Sekarang"}
            </button>
          </form>

          {/* LOGIN */}
          <p className="mt-6 text-center text-sm text-slate-500">
            Sudah punya akun?
            <Link
              href="/login"
              className="ml-1 font-bold text-green-700 hover:text-green-800"
            >
              Masuk
            </Link>
          </p>
        </div>
      </div>

      {/* NOTIFICATION MODAL */}
      {notice && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 px-5 backdrop-blur-sm">
          <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="px-6 pb-6 pt-7 text-center">
              <div
                className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full text-3xl ${
                  notice.type === "success"
                    ? "bg-green-100"
                    : "bg-red-100"
                }`}
              >
                {notice.type === "success" ? "✓" : "!"}
              </div>

              <h2 className="mt-5 text-xl font-extrabold text-slate-900">
                {notice.title}
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                {notice.message}
              </p>

              {notice.type === "success" && (
                <div className="mt-4 rounded-2xl bg-green-50 px-4 py-3 text-left text-xs leading-5 text-green-800">
                  💚 Cek <b>Inbox</b> atau folder <b>Spam</b> email kamu.
                  <br />
                  Link verifikasi berlaku selama <b>30 menit</b>.
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 p-4">
              <button
                type="button"
                onClick={() => {
                  if (notice.type === "success") {
                    router.push("/login");
                  } else {
                    setNotice(null);
                  }
                }}
                className="w-full rounded-2xl bg-green-700 py-3.5 text-sm font-extrabold text-white transition hover:bg-green-800"
              >
                {notice.type === "success" ? "Lanjut Login" : "Tutup"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM NAV */}
      <BottomNav />
    </main>
  );
}
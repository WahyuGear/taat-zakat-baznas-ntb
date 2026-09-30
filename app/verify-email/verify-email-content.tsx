"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<
    "loading" | "success" | "error"
  >("loading");

  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token verifikasi tidak ditemukan.");
      return;
    }

    async function verifyEmail() {
      try {
        const response = await fetch(
          `/api/auth/verify-email?token=${encodeURIComponent(token!)}`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          setStatus("error");
          setMessage(
            data.message || "Verifikasi email gagal."
          );
          return;
        }

        setStatus("success");
        setMessage(
          "Email berhasil diverifikasi. Akun Anda sekarang sudah aktif."
        );
      } catch (error) {
        console.error("VERIFY EMAIL PAGE ERROR:", error);

        setStatus("error");
        setMessage(
          "Terjadi kesalahan saat melakukan verifikasi email."
        );
      }
    }

    verifyEmail();
  }, [token]);

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-5">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-6 text-center">
        <div className="mb-5">
          <div
            className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full text-2xl ${
              status === "success"
                ? "bg-green-100"
                : status === "error"
                  ? "bg-red-100"
                  : "bg-gray-100"
            }`}
          >
            {status === "loading"
              ? "⏳"
              : status === "success"
                ? "✓"
                : "!"}
          </div>
        </div>

        <h1 className="text-xl font-bold text-gray-900">
          {status === "loading"
            ? "Memverifikasi Email..."
            : status === "success"
              ? "Email Terverifikasi"
              : "Verifikasi Gagal"}
        </h1>

        <p className="mt-3 text-sm text-gray-600">
          {message}
        </p>

        {status === "success" && (
          <Link
            href="/login"
            className="mt-6 inline-block w-full rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-700"
          >
            Login Sekarang
          </Link>
        )}

        {status === "error" && (
          <Link
            href="/login"
            className="mt-6 inline-block w-full rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Kembali ke Login
          </Link>
        )}
      </div>
    </main>
  );
}
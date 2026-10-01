"use client";

import { useState } from "react";
import { Heart, ShieldCheck } from "lucide-react";

interface Props {
  slug: string;
  initialAmount?: string;
}

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        options?: {
          onSuccess?: (result: unknown) => void;
          onPending?: (result: unknown) => void;
          onError?: (result: unknown) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}

export default function DonasiForm({
  slug,
  initialAmount,
}: Props) {
  const [form, setForm] = useState({
    donorName: "",
    email: "",
    phone: "",
    amount: initialAmount || "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  function selectAmount(amount: number) {
    setForm((prev) => ({
      ...prev,
      amount: amount.toString(),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.donorName.trim()) {
      alert("Nama lengkap wajib diisi");
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

    if (!form.amount || Number(form.amount) <= 0) {
      alert("Nominal donasi wajib diisi");
      return;
    }

    if (!window.snap) {
      alert("Sistem pembayaran belum siap. Silakan coba lagi.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/donation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          donorName: form.donorName,
          email: form.email,
          phone: form.phone,
          amount: Number(form.amount),
          message: form.message,
          campaignSlug: slug,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(
          data.message || "Gagal membuat transaksi"
        );
        return;
      }

      if (!data.token) {
        alert("Token pembayaran tidak tersedia.");
        return;
      }

      // =========================
      // BUKA MIDTRANS SNAP POPUP
      // =========================

      window.snap.pay(data.token, {
        onSuccess: (result) => {
          console.log(
            "MIDTRANS SUCCESS:",
            result
          );
        
          window.location.href = `/dashboard/pembayaran/${data.donation.id}`;
        },

        onPending: (result) => {
          console.log(
            "MIDTRANS PENDING:",
            result
          );

          alert(
            "Pembayaran masih menunggu penyelesaian."
          );
        },

        onError: (result) => {
          console.error(
            "MIDTRANS ERROR:",
            result
          );

          alert(
            "Pembayaran gagal. Silakan coba lagi."
          );
        },

        onClose: () => {
          console.log(
            "MIDTRANS POPUP DITUTUP"
          );
        },
      });
    } catch (error) {
      console.error(
        "DONATION SUBMIT ERROR:",
        error
      );

      alert(
        "Terjadi kesalahan saat memproses pembayaran"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white px-5 py-6"
    >
      <h2 className="text-lg font-extrabold text-slate-900">
        Mau berdonasi berapa?
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Pilih nominal donasi Anda
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {[25000, 50000, 100000, 250000].map(
          (amount) => {
            const active =
              Number(form.amount) === amount;

            return (
              <button
                key={amount}
                type="button"
                onClick={() =>
                  selectAmount(amount)
                }
                className={`rounded-2xl border-2 py-3 text-sm font-bold ${
                  active
                    ? "border-green-600 bg-green-50 text-green-700"
                    : "border-slate-200 text-slate-700"
                }`}
              >
                Rp{" "}
                {amount.toLocaleString("id-ID")}
              </button>
            );
          }
        )}
      </div>

      <div className="mt-4">
        <label className="mb-2 block text-sm font-bold">
          Nominal Lainnya
        </label>

        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">
            Rp
          </span>

          <input
            type="number"
            min="1000"
            placeholder="Masukkan nominal"
            value={form.amount}
            onChange={(e) =>
              setForm({
                ...form,
                amount: e.target.value,
              })
            }
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 outline-none focus:border-green-500"
          />
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-extrabold">
          Data Donatur
        </h3>

        <div className="mt-4 space-y-4">
          <input
            type="text"
            placeholder="Nama Lengkap"
            value={form.donorName}
            onChange={(e) =>
              setForm({
                ...form,
                donorName: e.target.value,
              })
            }
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none focus:border-green-500"
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
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none focus:border-green-500"
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
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none focus:border-green-500"
          />

          <textarea
            rows={4}
            placeholder="Doa atau pesan (opsional)"
            value={form.message}
            onChange={(e) =>
              setForm({
                ...form,
                message: e.target.value,
              })
            }
            className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none focus:border-green-500"
          />
        </div>
      </div>

      <div className="mt-6 flex gap-3 rounded-2xl bg-green-50 p-4">
        <ShieldCheck
          size={20}
          className="shrink-0 text-green-700"
        />

        <p className="text-xs leading-5 text-slate-600">
          Donasi Anda diproses melalui platform
          resmi BAZNAS NTB.
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-6 flex h-14 w-full items-center justify-center rounded-2xl bg-green-700 text-sm font-extrabold text-white shadow-lg shadow-green-700/20 hover:bg-green-800 disabled:opacity-60"
      >
        <Heart
          size={19}
          fill="currentColor"
          className="mr-2"
        />

        {loading
          ? "Membuat Pembayaran..."
          : "Lanjutkan Donasi"}
      </button>
    </form>
  );
}
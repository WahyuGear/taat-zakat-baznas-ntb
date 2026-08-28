import Link from "next/link";

export default function AdminSettingsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Pengaturan
        </h1>

        <p className="mt-1 text-slate-500">
          Kelola pengaturan platform BAZNAS NTB.
        </p>
      </div>

      {/* SETTINGS */}
      <div className="grid gap-5 md:grid-cols-2">
        {/* ORGANISASI */}
        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            Informasi Organisasi
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Pengaturan informasi dasar organisasi dan
            identitas platform.
          </p>

          <Link
            href="/admin/settings/organization"
            className="mt-5 inline-block rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-800"
          >
            Kelola Informasi
          </Link>
        </div>

        {/* PEMBAYARAN */}
        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            Pembayaran
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Kelola konfigurasi pembayaran dan integrasi
            Midtrans.
          </p>

          <Link
            href="/admin/Midtrans"
            className="mt-5 inline-block rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-800"
          >
            Pengaturan Pembayaran
          </Link>
        </div>

        {/* CAMPAIGN */}
        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            Campaign
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Kelola campaign donasi, campaign zakat,
            status, dan program unggulan.
          </p>

          <Link
            href="/admin/campaign"
            className="mt-5 inline-block rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-800"
          >
            Kelola Campaign
          </Link>
        </div>

        {/* LAPORAN */}
        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            Laporan
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Lihat dan kelola laporan transaksi donasi
            dan pembayaran.
          </p>

          <Link
            href="/admin/laporan"
            className="mt-5 inline-block rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-800"
          >
            Buka Laporan
          </Link>
        </div>
      </div>
    </div>
  );
}
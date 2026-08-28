"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  FileText,
  Users,
  Wallet,
  TrendingUp,
  ChevronRight,
} from "lucide-react";

type Report = {
  id: number;
  title: string;
  description: string | null;
  year: number;
  month: number | null;
  category: string;
  amount: number;
  beneficiaries: number;
  fileUrl: string | null;
  isPublished: boolean;
  createdAt: string;
};

const categoryLabels: Record<string, string> = {
  zakat: "Zakat",
  infak: "Infak",
  dskl: "DSKL",
  kurban: "Kurban",
  pendidikan: "Pendidikan",
  kesehatan: "Kesehatan",
  ekonomi: "Ekonomi",
  kemanusiaan: "Kemanusiaan",
};

function formatRupiah(value: number) {
  if (!value) return "Rp 0";

  if (value >= 1_000_000_000) {
    return `Rp ${(value / 1_000_000_000)
      .toFixed(1)
      .replace(".0", "")} M`;
  }

  if (value >= 1_000_000) {
    return `Rp ${(value / 1_000_000)
      .toFixed(1)
      .replace(".0", "")} Jt`;
  }

  if (value >= 1_000) {
    return `Rp ${(value / 1_000)
      .toFixed(0)} Rb`;
  }

  return `Rp ${value.toLocaleString("id-ID")}`;
}

export default function LaporanPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  useEffect(() => {
    async function loadReports() {
      try {
        const response = await fetch("/api/report", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Gagal mengambil laporan");
        }

        const data = await response.json();

        const publishedReports = Array.isArray(data)
          ? data.filter(
              (item: Report) => item.isPublished
            )
          : [];

        setReports(publishedReports);

        if (publishedReports.length > 0) {
          setSelectedYear(publishedReports[0].year);
        }
      } catch (error) {
        console.error("REPORT ERROR:", error);
        setReports([]);
      } finally {
        setLoading(false);
      }
    }

    loadReports();
  }, []);

  const years = useMemo(() => {
    return Array.from(
      new Set(reports.map((item) => item.year))
    ).sort((a, b) => b - a);
  }, [reports]);

  const filteredReports = useMemo(() => {
    if (!selectedYear) return reports;

    return reports.filter(
      (item) => item.year === selectedYear
    );
  }, [reports, selectedYear]);

  const totalAmount = useMemo(() => {
    return filteredReports.reduce(
      (total, item) => total + item.amount,
      0
    );
  }, [filteredReports]);

  const totalBeneficiaries = useMemo(() => {
    return filteredReports.reduce(
      (total, item) => total + item.beneficiaries,
      0
    );
  }, [filteredReports]);

  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};

    filteredReports.forEach((item) => {
      const key = item.category.toLowerCase();

      totals[key] = (totals[key] || 0) + item.amount;
    });

    return Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [filteredReports]);

  return (
    <main className="min-h-screen bg-[#F5F7FB] px-4 pb-28 pt-5">
      {/* HEADER */}
      <section className="mb-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-green-700">
              Transparansi
            </p>

            <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
              Laporan BAZNAS NTB
            </h1>

            <p className="mt-1 max-w-[280px] text-[10px] leading-4 text-slate-400">
              Informasi penghimpunan dan penyaluran
              dana BAZNAS NTB.
            </p>
          </div>

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-green-700 shadow-sm">
            <BarChart3
              size={21}
              strokeWidth={2}
              className="text-white"
            />
          </div>
        </div>
      </section>

      {/* YEAR FILTER */}
      {years.length > 0 && (
        <section className="mb-5">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {years.map((year) => (
              <button
                key={year}
                type="button"
                onClick={() => setSelectedYear(year)}
                className={`shrink-0 rounded-xl px-4 py-2 text-[10px] font-bold transition-all ${
                  selectedYear === year
                    ? "bg-green-700 text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-500"
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* LOADING */}
      {loading && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="h-28 animate-pulse rounded-2xl bg-white" />
            <div className="h-28 animate-pulse rounded-2xl bg-white" />
          </div>

          <div className="mt-3 h-24 animate-pulse rounded-2xl bg-white" />

          <div className="mt-5 h-52 animate-pulse rounded-3xl bg-white" />
        </>
      )}

      {/* CONTENT */}
      {!loading && (
        <>
          {/* SUMMARY */}
          <section className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50">
                  <Wallet
                    size={17}
                    className="text-green-700"
                  />
                </div>

                <TrendingUp
                  size={15}
                  className="text-green-600"
                />
              </div>

              <p className="mt-4 text-[9px] font-medium text-slate-400">
                Total Dana
              </p>

              <p className="mt-1 text-base font-bold text-slate-900">
                {formatRupiah(totalAmount)}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50">
                <Users
                  size={17}
                  className="text-green-700"
                />
              </div>

              <p className="mt-4 text-[9px] font-medium text-slate-400">
                Penerima Manfaat
              </p>

              <p className="mt-1 text-base font-bold text-slate-900">
                {totalBeneficiaries.toLocaleString(
                  "id-ID"
                )}
              </p>
            </div>
          </section>

          {/* CATEGORY */}
          <section className="mt-4 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Penyaluran Dana
                </h2>

                <p className="mt-0.5 text-[9px] text-slate-400">
                  Berdasarkan kategori laporan
                </p>
              </div>

              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-green-50">
                <BarChart3
                  size={15}
                  className="text-green-700"
                />
              </div>
            </div>

            {categoryTotals.length > 0 ? (
              <div className="space-y-4">
                {categoryTotals.map(
                  ([category, amount]) => {
                    const percent =
                      totalAmount > 0
                        ? Math.round(
                            (amount / totalAmount) *
                              100
                          )
                        : 0;

                    return (
                      <div key={category}>
                        <div className="mb-1.5 flex items-center justify-between">
                          <span className="text-[10px] font-semibold text-slate-700">
                            {categoryLabels[
                              category
                            ] || category}
                          </span>

                          <span className="text-[9px] font-bold text-green-700">
                            {formatRupiah(amount)}
                          </span>
                        </div>

                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-green-600 transition-all duration-500"
                            style={{
                              width: `${percent}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            ) : (
              <div className="py-6 text-center">
                <p className="text-[10px] font-semibold text-slate-500">
                  Belum ada data laporan
                </p>
              </div>
            )}
          </section>

          {/* REPORT LIST */}
          <section className="mt-5">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Laporan Terbaru
                </h2>

                <p className="mt-0.5 text-[9px] text-slate-400">
                  Data laporan BAZNAS NTB
                </p>
              </div>

              <span className="rounded-lg bg-green-50 px-2.5 py-1 text-[9px] font-bold text-green-700">
                {filteredReports.length} Data
              </span>
            </div>

            {filteredReports.length > 0 ? (
              <div className="space-y-3">
                {filteredReports.map((report) => (
                  <div
                    key={report.id}
                    className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-50">
                        <FileText
                          size={16}
                          className="text-green-700"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[11px] font-bold leading-4 text-slate-900">
                              {report.title}
                            </p>

                            <span className="mt-1 inline-block rounded-md bg-slate-100 px-1.5 py-0.5 text-[8px] font-semibold text-slate-500">
                              {categoryLabels[
                                report.category.toLowerCase()
                              ] || report.category}
                            </span>
                          </div>

                          <p className="shrink-0 text-[10px] font-bold text-green-700">
                            {formatRupiah(
                              report.amount
                            )}
                          </p>
                        </div>

                        {report.description && (
                          <p className="mt-2 line-clamp-2 text-[9px] leading-4 text-slate-400">
                            {report.description}
                          </p>
                        )}

                        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                          <span className="text-[8px] text-slate-400">
                            {report.year}
                            {report.month
                              ? ` • Bulan ${report.month}`
                              : ""}
                          </span>

                          {report.beneficiaries >
                            0 && (
                            <span className="flex items-center gap-1 text-[8px] font-semibold text-slate-500">
                              <Users size={11} />
                              {report.beneficiaries.toLocaleString(
                                "id-ID"
                              )}{" "}
                              penerima
                            </span>
                          )}
                        </div>

                        {report.fileUrl && (
                          <a
                            href={report.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 flex items-center justify-between rounded-xl bg-green-50 px-3 py-2 text-[9px] font-bold text-green-700"
                          >
                            Lihat Laporan Lengkap
                            <ChevronRight
                              size={13}
                            />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-slate-100 bg-white px-5 py-9 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
                  <FileText
                    size={24}
                    strokeWidth={1.7}
                    className="text-green-700"
                  />
                </div>

                <h3 className="mt-4 text-sm font-bold text-slate-800">
                  Belum ada laporan
                </h3>

                <p className="mx-auto mt-1 max-w-[230px] text-[9px] leading-4 text-slate-400">
                  Laporan BAZNAS NTB akan ditampilkan
                  di halaman ini setelah tersedia.
                </p>
              </div>
            )}
          </section>

          {/* TRANSPARENCY INFO */}
          <section className="mt-5 rounded-2xl border border-green-100 bg-green-50 p-4">
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white">
                <TrendingUp
                  size={15}
                  className="text-green-700"
                />
              </div>

              <div>
                <p className="text-[10px] font-bold text-green-800">
                  Komitmen Transparansi
                </p>

                <p className="mt-1 text-[9px] leading-4 text-green-700/70">
                  BAZNAS NTB berkomitmen menyampaikan
                  informasi penghimpunan dan penyaluran
                  dana secara transparan kepada masyarakat.
                </p>
              </div>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
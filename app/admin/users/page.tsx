"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  UserCheck,
  UserX,
  Trash2,
  ShieldCheck,
  Shield,
  RefreshCw,
  Users,
} from "lucide-react";

type UserRole = "ADMIN" | "SUPER_ADMIN";

type AdminUser = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  image: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    donations: number;
  };
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState<number | null>(null);

  async function loadUsers(showRefresh = false) {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await fetch("/api/admin/users", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Gagal mengambil data admin."
        );
      }

      setUsers(data.users || []);
    } catch (err) {
      console.error("LOAD ADMIN USERS ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengambil data admin."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function toggleActive(user: AdminUser) {
    const action = user.isActive ? "menonaktifkan" : "mengaktifkan";

    const confirmed = window.confirm(
      `Yakin ingin ${action} akun ${user.name}?`
    );

    if (!confirmed) return;

    try {
      setActionId(user.id);

      const response = await fetch(
        `/api/admin/users/${user.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            isActive: !user.isActive,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            `Gagal ${action} akun.`
        );
      }

      setUsers((prev) =>
        prev.map((item) =>
          item.id === user.id
            ? {
                ...item,
                isActive: !item.isActive,
              }
            : item
        )
      );
    } catch (err) {
      console.error("TOGGLE ADMIN ERROR:", err);

      alert(
        err instanceof Error
          ? err.message
          : `Gagal ${action} akun.`
      );
    } finally {
      setActionId(null);
    }
  }

  async function deleteUser(user: AdminUser) {
    if (user._count.donations > 0) {
      alert(
        "Akun ini tidak dapat dihapus karena sudah memiliki riwayat donasi. Gunakan Nonaktifkan."
      );
      return;
    }

    const confirmed = window.confirm(
      `Hapus akun ${user.name} secara permanen?\n\nAkun ini belum memiliki riwayat donasi. Tindakan ini tidak dapat dibatalkan.`
    );

    if (!confirmed) return;

    try {
      setActionId(user.id);

      const response = await fetch(
        `/api/admin/users/${user.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Gagal menghapus akun."
        );
      }

      setUsers((prev) =>
        prev.filter((item) => item.id !== user.id)
      );

      alert("Akun berhasil dihapus.");
    } catch (err) {
      console.error("DELETE ADMIN ERROR:", err);

      alert(
        err instanceof Error
          ? err.message
          : "Gagal menghapus akun."
      );
    } finally {
      setActionId(null);
    }
  }

  function formatDate(date: string) {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-700">
              <Users size={20} />
            </div>

            <span className="text-sm font-semibold text-green-700">
              Manajemen Pengguna
            </span>
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
            Kelola Admin
          </h1>

          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Kelola akun Admin dan Super Admin BAZNAS NTB.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => loadUsers(true)}
            disabled={refreshing}
            className="flex h-11 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={
                refreshing ? "animate-spin" : ""
              }
            />
            Refresh
          </button>

          <Link
            href="/admin/users/new"
            className="flex h-11 items-center gap-2 rounded-xl bg-green-700 px-4 text-sm font-bold text-white shadow-lg shadow-green-700/20 transition hover:bg-green-800"
          >
            <Plus size={18} />
            Tambah Admin
          </Link>
        </div>
      </div>

      {/* INFO */}
      <div className="rounded-2xl border border-green-100 bg-gradient-to-r from-green-50 to-yellow-50 p-4">
        <div className="flex gap-3">
          <ShieldCheck
            size={20}
            className="mt-0.5 shrink-0 text-green-700"
          />

          <div>
            <p className="text-sm font-bold text-green-900">
              Aturan keamanan akun
            </p>

            <p className="mt-1 text-xs leading-relaxed text-green-800">
              Akun yang sudah memiliki riwayat donasi tidak
              dapat dihapus. Akun tersebut hanya dapat
              dinonaktifkan agar riwayat tetap terjaga.
            </p>
          </div>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* CONTENT */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {/* DESKTOP TABLE */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                  Admin
                </th>

                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                  Role
                </th>

                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-500">
                  Status
                </th>

                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-500">
                  Donasi
                </th>

                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                  Dibuat
                </th>

                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500">
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-16 text-center"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <RefreshCw
                        size={25}
                        className="animate-spin text-green-700"
                      />

                      <p className="text-sm text-gray-500">
                        Memuat data admin...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-16 text-center"
                  >
                    <Users
                      size={35}
                      className="mx-auto text-gray-300"
                    />

                    <p className="mt-3 text-sm font-semibold text-gray-700">
                      Belum ada akun admin.
                    </p>
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const isBusy = actionId === user.id;
                  const canDelete =
                    user._count.donations === 0;

                  return (
                    <tr
                      key={user.id}
                      className="transition hover:bg-gray-50"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-100 font-bold text-green-700">
                            {user.name
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-gray-900">
                              {user.name}
                            </p>

                            <p className="truncate text-xs text-gray-500">
                              {user.email}
                            </p>

                            {user.phone && (
                              <p className="mt-0.5 text-xs text-gray-400">
                                {user.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        {user.role === "SUPER_ADMIN" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-100 px-3 py-1.5 text-xs font-bold text-yellow-800">
                            <ShieldCheck size={14} />
                            Super Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1.5 text-xs font-bold text-blue-800">
                            <Shield size={14} />
                            Admin
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-5 text-center">
                        {user.isActive ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-700">
                            <span className="h-2 w-2 rounded-full bg-green-500" />
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-500">
                            <span className="h-2 w-2 rounded-full bg-gray-400" />
                            Nonaktif
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-5 text-center">
                        <span className="font-bold text-gray-800">
                          {user._count.donations}
                        </span>

                        <span className="ml-1 text-xs text-gray-400">
                          transaksi
                        </span>
                      </td>

                      <td className="px-6 py-5 text-sm text-gray-500">
                        {formatDate(user.createdAt)}
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/users/${user.id}`}
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition hover:border-green-200 hover:bg-green-50 hover:text-green-700"
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </Link>

                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() =>
                              toggleActive(user)
                            }
                            className={`flex h-9 w-9 items-center justify-center rounded-xl border transition disabled:opacity-40 ${
                              user.isActive
                                ? "border-orange-200 text-orange-600 hover:bg-orange-50"
                                : "border-green-200 text-green-600 hover:bg-green-50"
                            }`}
                            title={
                              user.isActive
                                ? "Nonaktifkan"
                                : "Aktifkan"
                            }
                          >
                            {user.isActive ? (
                              <UserX size={16} />
                            ) : (
                              <UserCheck size={16} />
                            )}
                          </button>

                          {canDelete ? (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() =>
                                deleteUser(user)
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-200 text-red-600 transition hover:bg-red-50 disabled:opacity-40"
                              title="Hapus"
                            >
                              <Trash2 size={16} />
                            </button>
                          ) : (
                            <div
                              className="flex h-9 w-9 cursor-not-allowed items-center justify-center rounded-xl border border-gray-100 text-gray-300"
                              title="Tidak dapat dihapus karena memiliki riwayat donasi"
                            >
                              <Trash2 size={16} />
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE LIST */}
        <div className="divide-y divide-gray-100 md:hidden">
          {loading ? (
            <div className="flex flex-col items-center gap-3 px-5 py-16">
              <RefreshCw
                size={25}
                className="animate-spin text-green-700"
              />

              <p className="text-sm text-gray-500">
                Memuat data admin...
              </p>
            </div>
          ) : users.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <Users
                size={35}
                className="mx-auto text-gray-300"
              />

              <p className="mt-3 text-sm font-semibold text-gray-700">
                Belum ada akun admin.
              </p>
            </div>
          ) : (
            users.map((user) => {
              const isBusy = actionId === user.id;
              const canDelete =
                user._count.donations === 0;

              return (
                <div
                  key={user.id}
                  className="p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-100 font-bold text-green-700">
                      {user.name
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-gray-900">
                        {user.name}
                      </p>

                      <p className="truncate text-xs text-gray-500">
                        {user.email}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-2">
                        {user.role ===
                        "SUPER_ADMIN" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-1 text-[10px] font-bold text-yellow-800">
                            <ShieldCheck size={12} />
                            Super Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-bold text-blue-800">
                            <Shield size={12} />
                            Admin
                          </span>
                        )}

                        {user.isActive ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-bold text-green-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-bold text-gray-500">
                            <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                            Nonaktif
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2.5">
                    <div>
                      <p className="text-[10px] font-medium text-gray-400">
                        Riwayat Donasi
                      </p>

                      <p className="text-sm font-bold text-gray-800">
                        {user._count.donations}{" "}
                        <span className="text-xs font-normal text-gray-400">
                          transaksi
                        </span>
                      </p>
                    </div>

                    <p className="text-[10px] text-gray-400">
                      {formatDate(user.createdAt)}
                    </p>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-700 transition hover:bg-gray-50"
                    >
                      <Pencil size={15} />
                      Edit
                    </Link>

                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() =>
                        toggleActive(user)
                      }
                      className={`flex h-10 flex-1 items-center justify-center gap-2 rounded-xl text-xs font-bold transition disabled:opacity-40 ${
                        user.isActive
                          ? "bg-orange-50 text-orange-700 hover:bg-orange-100"
                          : "bg-green-50 text-green-700 hover:bg-green-100"
                      }`}
                    >
                      {user.isActive ? (
                        <>
                          <UserX size={15} />
                          Nonaktifkan
                        </>
                      ) : (
                        <>
                          <UserCheck size={15} />
                          Aktifkan
                        </>
                      )}
                    </button>

                    {canDelete && (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() =>
                          deleteUser(user)
                        }
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-200 text-red-600 transition hover:bg-red-50 disabled:opacity-40"
                        title="Hapus"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* FOOTER NOTE */}
      <div className="flex items-start gap-2 px-1 text-xs text-gray-400">
        <ShieldCheck
          size={15}
          className="mt-0.5 shrink-0"
        />

        <p>
          Penghapusan akun hanya tersedia untuk akun yang
          belum memiliki transaksi donasi. Riwayat donasi
          tidak akan dihapus.
        </p>
      </div>
    </div>
  );
}
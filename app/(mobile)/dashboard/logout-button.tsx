"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    if (loading) return;

    setLoading(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Logout gagal"
        );
      }

      // Setelah cookie dihapus
      router.replace("/login");
      router.refresh();

    } catch (error) {
      console.error(error);

      alert("Gagal keluar dari akun");

      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-white text-[10px] font-bold text-red-500 transition active:scale-[0.98] disabled:opacity-50"
    >
      <LogOut size={15} />

      {loading
        ? "Keluar..."
        : "Keluar dari Akun"}
    </button>
  );
}
"use client";

import { useRouter } from "next/navigation";

export default function DeleteButton({
  id,
}: {
  id: number;
}) {
  const router = useRouter();

  async function hapus() {

    if (!confirm("Yakin hapus campaign?")) return;

    const res = await fetch(`/api/campaign/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      router.refresh();
    } else {
      alert("Gagal menghapus.");
    }
  }

  return (
    <button
      onClick={hapus}
      className="rounded-lg bg-red-600 px-4 py-2 text-white"
    >
      Hapus
    </button>
  );
}
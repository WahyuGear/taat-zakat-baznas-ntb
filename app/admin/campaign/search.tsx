"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function SearchCampaign() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(
    searchParams.get("search") ?? ""
  );

  function handleSearch(value: string) {
    setSearch(value);

    const params = new URLSearchParams(searchParams);

    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }

    router.push(`/admin/campaign?${params.toString()}`);
  }

  return (
    <input
      className="w-80 rounded-xl border p-3"
      placeholder="Cari Campaign..."
      value={search}
      onChange={(e) => handleSearch(e.target.value)}
    />
  );
}
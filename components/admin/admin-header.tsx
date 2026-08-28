import { Bell } from "lucide-react";

export default function AdminHeader() {
  return (
    <header className="flex h-20 items-center justify-between border-b bg-white px-8">
      <div>
        <h2 className="text-2xl font-bold">
          Dashboard
        </h2>

        <p className="text-gray-500">
          Selamat datang kembali 👋
        </p>
      </div>

      <div className="flex items-center gap-5">
        <Bell />

        <div className="text-right">
          <p className="font-bold">
            Admin
          </p>

          <p className="text-sm text-gray-500">
            admin@baznasntb.id
          </p>
        </div>
      </div>
    </header>
  );
}
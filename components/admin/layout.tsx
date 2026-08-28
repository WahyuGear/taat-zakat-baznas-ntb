import AdminSidebar from "@/components/admin/admin-sidebar";
import AdminHeader from "@/components/admin/admin-header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100">

      <AdminHeader />

      <div className="mx-auto flex max-w-7xl">

        {/* Desktop Sidebar */}

        <div className="hidden lg:block">
          <AdminSidebar />
        </div>

        {/* Content */}

        <main className="min-h-screen flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>

      </div>

    </div>
  );
}
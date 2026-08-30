import TopBar from "@/components/app/top-bar";
import BottomNav from "@/components/app/bottom-nav";
import ZaviraChat from "@/components/zavira/zavira-chat";

export default function MobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen justify-center bg-[#eef2f7]">
      <div className="relative min-h-screen w-full max-w-[430px] overflow-hidden bg-white">

        <TopBar />

        <div className="pb-24">
          {children}
        </div>

        <ZaviraChat />

        <BottomNav />

      </div>
    </main>
  );
}
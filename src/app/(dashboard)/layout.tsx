import { Sidebar } from "@/components/ui/sidebar";
import { MobileNav } from "@/components/ui/mobile-nav";
import { TopBar } from "@/components/ui/top-bar";
import { QuickActionButton } from "@/components/ui/quick-action";
import { ModuleBanner } from "@/components/ui/module-banner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="p360-workspace flex h-screen bg-slate-50">
      {/* Desktop sidebar - hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main content area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <div className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <div className="p360-content w-full max-w-[1600px] mx-auto p-4 md:p-7 xl:p-9"><ModuleBanner />{children}</div>
        </div>
      </main>

      {/* Quick Action FAB */}
      <QuickActionButton />

      {/* Mobile bottom navigation */}
      <MobileNav />
    </div>
  );
}

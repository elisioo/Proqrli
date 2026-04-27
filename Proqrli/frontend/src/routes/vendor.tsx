import { createFileRoute, Outlet } from "@tanstack/react-router";
import { VendorProvider } from "@/lib/vendor-context";
import { VendorSidebar } from "@/components/vendor/VendorSidebar";
import { VendorTopbar } from "@/components/vendor/VendorTopbar";

export const Route = createFileRoute("/vendor")({
  component: VendorLayout,
});

function VendorLayout() {
  return (
    <VendorProvider>
      <div className="flex min-h-screen w-full bg-paper text-foreground">
        {/* Desktop sidebar */}
        <div className="hidden w-[260px] flex-shrink-0 md:block">
          <div className="fixed inset-y-0 w-[260px]">
            <VendorSidebar />
          </div>
        </div>
        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col">
          <VendorTopbar />
          <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </VendorProvider>
  );
}

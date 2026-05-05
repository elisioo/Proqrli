import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { BuyerProvider } from "@/lib/buyer-context";
import { BuyerSidebar } from "@/components/buyer/BuyerSidebar";
import { BuyerTopbar } from "@/components/buyer/BuyerTopbar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export const Route = createFileRoute("/buyer")({
  // ── Auth guard ─────────────────────────────────────────────────────────────
  // If neither a real session nor a mock demo session exists, redirect to /login.
  beforeLoad: () => {
    if (typeof window === "undefined") return; // SSR safety

    const hasReal = !!window.localStorage.getItem("procurli:buyer:realUser");
    const hasMock = !!window.localStorage.getItem("procurli:buyer:userId");

    if (!hasReal && !hasMock) {
      throw redirect({ to: "/login" });
    }
  },
  component: BuyerLayout,
});

function BuyerLayout() {
  return (
    <BuyerProvider>
      <SidebarProvider>
        <BuyerSidebar />
        <SidebarInset>
          <BuyerTopbar />
          <main className="flex-1 px-4 py-6 md:px-8 md:py-8 bg-paper">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </BuyerProvider>
  );
}
